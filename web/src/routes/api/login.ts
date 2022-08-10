import crypto from 'crypto'
import { PrismaClient } from '@prisma/client'

import { decodeBase64 } from '../../modules/authentication/services/decodeBase64'
import { encodeBase64 } from '../../modules/authentication/services/encodeBase64'
import { decodeLoginAuthData } from '../../core/services/decodeLoginAuthData'
import { getSha256Hash } from '../../core/services/getSha256Hash'
import { verifySignature } from '../../core/services/verifySignature'
import { ASN1toPEM } from '../../core/services/ASN1toPEM'

import type { RequestHandler } from '@sveltejs/kit'
import type { LoginResponse } from '../../core/@types/api/LoginResponse'
import type { LoginRequest } from '../../core/@types/api/LoginRequest'
import type { ClientData } from '../../core/@types/ClientData'

export const GET: RequestHandler = async event => {
  const username = event.url.searchParams.get('username') ?? ''

  // locate all authenticators for this user
  const prisma = new PrismaClient()
  const authenticators = await prisma.authenticator.findMany({
    where: {
      user: {
        username: username.toLowerCase(),
        registered: true,
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

  // if array is 0, means there's no user registered yet
  if (authenticators.length === 0) {
    await prisma.$disconnect()
    return {
      status: 400,
      body: {
        message: 'this username has not been registered yet',
      },
    }
  }

  // generate random challenge
  const generatedChallenge = encodeBase64(crypto.randomBytes(32))

  // push chalenge to temporary bin
  await prisma.challenge.upsert({
    where: {
      uid: authenticators[0].user.uid,
    },
    update: {
      challenge: generatedChallenge,
      createdAt: new Date(),
    },
    create: {
      uid: authenticators[0].user.uid,
      challenge: generatedChallenge,
    },
  })

  // build payload
  const payload: LoginResponse = {
    challenge: generatedChallenge,
    allowedCredentials: authenticators.map(authenticator => ({
      type: 'public-key',
      id: authenticator.credentialId,
    })),
  }

  await prisma.$disconnect()
  return {
    status: 200,
    body: {
      message: 'ok',
      data: payload as any,
    },
  }
}

export const POST: RequestHandler = async event => {
  const { id, response } = (await event.request.json()) as LoginRequest

  const decodedRequest = {
    authenticatorData: decodeBase64(response.authenticatorData),
    clientDataJSON: decodeBase64(response.clientDataJSON),
    signature: decodeBase64(response.signature),
    userHandle: decodeBase64(response.userHandle),
  }

  const clientData: ClientData = JSON.parse(
    Buffer.from(decodedRequest.clientDataJSON).toString()
  )

  // even clientData.challenge is decoded from base64 above, somehow browser navigator sent back as base64url
  const encodedChallenge = encodeBase64(
    Buffer.from(clientData.challenge, 'base64url')
  )

  // find challenge pair
  const prisma = new PrismaClient()

  const authenticatorPromise = await prisma.authenticator.findFirst({
    where: {
      credentialId: encodeBase64(Buffer.from(id, 'base64url')),
    },
  })
  const challengePromise = await prisma.challenge.findFirst({
    where: {
      challenge: encodedChallenge,
      user: {
        registered: true,
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

  const [authenticator, challenge] = await Promise.all([
    authenticatorPromise,
    challengePromise,
  ])

  await prisma.$disconnect()

  if (challenge === null) {
    return {
      status: 400,
      body: {
        message: 'challenge response does not match',
      }
    }
  } else if (authenticator === null) {
    return {
      status: 400,
      body: {
        message: 'authenticator not found',
      }
    }
  }

  const decodedAuthData = decodeLoginAuthData(
    Buffer.from(decodedRequest.authenticatorData)
  )

  const clientDataHash = getSha256Hash(
    Buffer.from(decodedRequest.clientDataJSON)
  )
  const signatureBase = Buffer.concat([
    decodedAuthData.rpIdHash,
    decodedAuthData.flagsBuf,
    decodedAuthData.counterBuf,
    clientDataHash,
  ])
  const publicKey = ASN1toPEM(Buffer.from(decodeBase64(authenticator.publicKey)))
  const signature = Buffer.from(decodedRequest.signature)

  const verified = verifySignature(signature, signatureBase, publicKey)

  if (!verified) {
    return {
      status: 400,
      body: {
        message: 'signature of authenticator cannot be verified'
      }
    }
  }

  return {
    status: 200,
    body: {
      message: 'ok',
    },
  }
}
