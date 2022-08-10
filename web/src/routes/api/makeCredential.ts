import cbor from 'cbor'
import crypto from 'crypto'
import { nanoid } from 'nanoid'
import { PrismaClient } from '@prisma/client'

import { decodeAuthData } from '../../core/services/decodeAuthData'
import { COSEECDHAtoPKCS } from '../../core/services/COSEECDHAtoPKCS'

import type { RequestHandler } from '@sveltejs/kit'

import type { WebauthnResponsePayload } from '../../modules/authentication/@types/WebauthnResponsePayload'
import type { ClientData } from '../../core/@types/ClientData'
import type { AttestationCredential } from '../../core/@types/AttestationCredential'

// pre-generate challenge, and user ids
export const GET: RequestHandler = async event => {
  let username = event.url.searchParams.get('username')

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
  const generatedChallenge = Buffer.from(crypto.randomBytes(32)).toString(
    'base64'
  )
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
        uid: generatedUserId,
        challenge: generatedChallenge,
      },
    },
  }
}

export const POST: RequestHandler = async event => {
  const request: WebauthnResponsePayload = await event.request.json()

  const clientData: ClientData = JSON.parse(
    Buffer.from(request.response.clientDataJSON, 'base64url').toString()
  )

  // find challenge pair
  const prisma = new PrismaClient()
  const challenge = await prisma.challenge.findFirst({
    where: {
      challenge: Buffer.from(clientData.challenge, 'base64').toString(),
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
    return {
      status: 400,
      body: {
        message: 'challenge response does not match',
      },
    }
  }

  // process attestation into readable authenticator
  const attestationBuffer = Buffer.from(
    request.response.attestationObject,
    'base64url'
  )
  const ctapMakeCredentialResponse: AttestationCredential =
    cbor.decodeAllSync(attestationBuffer)[0]

  const decodedAuthData = decodeAuthData(ctapMakeCredentialResponse.authData)
  const publicKey = COSEECDHAtoPKCS(decodedAuthData.COSEPublicKey)

  const authenticatorPayload = {
    fmt: ctapMakeCredentialResponse.fmt,
    publicKey: Buffer.from(publicKey).toString('base64url'),
    counter: decodedAuthData.counter,
    credentialId: Buffer.from(decodedAuthData.credID).toString('base64url'),
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
