import cbor from 'cbor'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
import { PrismaClient } from '@prisma/client'

import { decodeRegisterAuthData } from '../../modules/register/services/decodeRegisterAuthData'
import { encodeBase64 } from '../../core/services/encodeBase64'
import { decodeBase64 } from '../../core/services/decodeBase64'
import { COSEECDHAtoPKCS } from '../../modules/register/services/COSEECDHAtoPKCS'

import type { RequestHandler } from '@sveltejs/kit'
import type { RegisterRequest } from '../../core/@types/api/RegisterRequest'
import type { ClientData } from '../../core/@types/ClientData'
import type { AttestationCredential } from '../../core/@types/AttestationCredential'

// pre-generate challenge, and user ids
export const GET: RequestHandler = async event => {
  const username = event.url.searchParams.get('username')

  // if no username is provided, then dead
  if (username === null) {
    return {
      status: 400,
      body: {
        message: 'no username provided',
      },
    }
  }

  // check if there're any existing records for this username
  const prisma = new PrismaClient()
  const user = await prisma.user.findFirst({
    where: {
      username: username.toLowerCase(),
    },
  })

  // if user already completed registration, then dead
  if (user?.registered) {
    return {
      status: 400,
      body: {
        message: 'username has already been taken',
      },
    }
  }

  // generate random challenge
  const generatedChallenge = encodeBase64(crypto.randomBytes(32))
  const generatedUserId = user?.uid ?? nanoid()

  // if user not found then create a new one
  if (user === null) {
    await prisma.user.create({
      data: {
        uid: generatedUserId,
        username: username.toLowerCase(),
      },
    })
  }

  // push challenge to temporary bin
  await prisma.challenge.upsert({
    where: {
      uid: generatedUserId,
    },
    update: {
      challenge: generatedChallenge,
      createdAt: new Date(),
    },
    create: {
      uid: generatedUserId,
      challenge: generatedChallenge,
    },
  })

  // terminate connection
  await prisma.$disconnect()
  return {
    status: 200,
    body: {
      message: 'ok',
      data: {
        rp: {
          name: process.env.NODE_ENV === 'development' ? 'RAYRIFFY' : 'みのり',
          id: process.env.NODE_ENV === 'development' ? 'localhost' : 'minori.rayriffy.com',
        }, 
        uid: encodeBase64(Buffer.from(generatedUserId)),
        challenge: generatedChallenge,
      },
    },
  }
}

// verify challenge result, and register user if success
export const POST: RequestHandler = async event => {
  const request: RegisterRequest = await event.request.json()

  const clientData: ClientData = JSON.parse(
    Buffer.from(decodeBase64(request.response.clientDataJSON)).toString()
  )

  // even clientData.challenge is decoded from base64 above, somehow browser navigator sent back as base64url
  const encodedChallenge = encodeBase64(Buffer.from(clientData.challenge, 'base64url'))

  // find challenge pair
  const prisma = new PrismaClient()
  const challenge = await prisma.challenge.findFirst({
    where: {
      challenge: encodedChallenge,
      user: {
        registered: false,
      },
    },
    include: {
      user: {
        select: {
          uid: true,
        },
      },
    },
  })

  // if challenge of **non registered user** does not match, it's means that user already completed regis or challenge response are incorrect
  if (challenge === null) {
    await prisma.$disconnect()
    return {
      status: 400,
      body: {
        message: 'challenge response does not match',
      },
    }
  }

  // process attestation into readable authenticator
  const attestationBuffer = Buffer.from(
    decodeBase64(request.response.attestationObject)
  )
  const ctapMakeCredentialResponse: AttestationCredential =
    cbor.decodeAllSync(attestationBuffer)[0]

  const decodedAuthData = decodeRegisterAuthData(ctapMakeCredentialResponse.authData)
  const publicKey = COSEECDHAtoPKCS(decodedAuthData.COSEPublicKey)

  const authenticatorPayload = {
    fmt: ctapMakeCredentialResponse.fmt,
    publicKey: encodeBase64(publicKey),
    counter: decodedAuthData.counter,
    credentialId: encodeBase64(decodedAuthData.credID),
  }

  // push authenticator to database
  await prisma.authenticator.create({
    data: {
      uid: challenge.user.uid,
      ...authenticatorPayload,
    },
  })

  // allow user to be registered
  await prisma.user.update({
    where: {
      uid: challenge.user.uid,
    },
    data: {
      registered: true,
    },
  })

  // delete challenge from temporary bin
  await prisma.challenge.delete({
    where: {
      uid: challenge.user.uid,
    },
  })

  await prisma.$disconnect()
  return {
    status: 200,
    body: {
      message: 'ok',
    },
  }
}
