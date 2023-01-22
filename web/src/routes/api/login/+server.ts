import { json as json$1 } from '@sveltejs/kit'
import crypto from 'crypto'
import cookie from 'cookie'

import { prisma } from '../../../context/prisma'
import { decodeBase64 } from '../../../core/services/decodeBase64'
import { encodeBase64 } from '../../../core/services/encodeBase64'
import { setSession } from '../../../core/services/session/set'
import { decodeLoginAuthData } from '../../../modules/login/services/decodeLoginAuthData'
import { getSha256Hash } from '../../../modules/login/services/getSha256Hash'
import { verifySignature } from '../../../modules/login/services/verifySignature'
import { ASN1toPEM } from '../../../modules/login/services/ASN1toPEM'
import { sessionCookieName } from '../../../core/constants/sessionCookieName'
import { maxSessionAge } from '../../../core/constants/maxSessionAge'

import type { RequestHandler } from '@sveltejs/kit'
import type { LoginResponse } from '../../../core/@types/api/LoginResponse'
import type { LoginRequest } from '../../../core/@types/api/LoginRequest'
import type { ClientData } from '../../../core/@types/ClientData'

export const GET: RequestHandler = async event => {
  const username = event.url.searchParams.get('username') ?? ''

  // locate all authenticators for this user
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
    return json$1(
      {
        message: 'this username has not been registered yet',
      },
      {
        status: 400,
      }
    )
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
  return json$1({
    message: 'ok',
    data: payload as any,
  })
}

export const POST: RequestHandler = async event => {
  const { id, response } = (await event.request.json()) as LoginRequest

  const decodedRequest = {
    authenticatorData: decodeBase64(response.authenticatorData),
    clientDataJSON: decodeBase64(response.clientDataJSON),
    signature: decodeBase64(response.signature),
  }

  const clientData: ClientData = JSON.parse(
    Buffer.from(decodedRequest.clientDataJSON).toString()
  )

  // even clientData.challenge is decoded from base64 above, somehow browser navigator sent back as base64url
  const encodedChallenge = encodeBase64(
    Buffer.from(clientData.challenge, 'base64url')
  )

  // find challenge pair
  const authenticatorPromise = await prisma.authenticator.findFirst({
    where: {
      credentialId: encodeBase64(Buffer.from(id, 'base64url')),
    },
    include: {
      user: {
        select: {
          uid: true,
          username: true,
        },
      },
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

  if (challenge === null) {
    return json$1(
      {
        message: 'challenge response does not match',
      },
      {
        status: 400,
      }
    )
  } else if (authenticator === null) {
    return json$1(
      {
        message: 'authenticator not found',
      },
      {
        status: 400,
      }
    )
  } else if (authenticator.uid !== challenge.uid) {
    return json$1(
      {
        message: 'authenticator and challenge do not match',
      },
      {
        status: 400,
      }
    )
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
  const publicKey = ASN1toPEM(
    Buffer.from(decodeBase64(authenticator.publicKey))
  )
  const signature = Buffer.from(decodedRequest.signature)

  const verified = verifySignature(signature, signatureBase, publicKey)

  if (!verified) {
    return json$1(
      {
        message: 'signature of authenticator cannot be verified',
      },
      {
        status: 400,
      }
    )
  }

  // issue user token
  const authenticatedToken = await setSession({
    id: authenticator.user.uid,
    username: authenticator.user.username,
  })

  return json$1(
    {
      message: 'ok',
      data: authenticatedToken,
    },
    {
      headers: {
        'Set-Cookie': cookie.serialize(sessionCookieName, authenticatedToken, {
          path: '/',
          httpOnly: true,
          sameSite: 'strict',
          secure: process.env.NODE_ENV === 'production',
          maxAge: maxSessionAge,
        }),
      },
    }
  )
}
