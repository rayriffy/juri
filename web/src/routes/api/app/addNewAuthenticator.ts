import { PrismaClient } from '@prisma/client'

import { encodeBase64 } from '../../../core/services/encodeBase64'
import { authenticateUserSession } from '../../../core/services/authenticateUserSession'
import { createAuthenticatorChallenge } from '../../../modules/register/services/createAuthenticatorChallenge'
import { relyingParty } from '../../../core/constants/relyingParty'
import { completeAuthenticatorChallenge } from '../../../modules/register/services/completeAuthenticatorChallenge'

import type { RequestHandler } from '@sveltejs/kit'
import type { RegisterRequest } from '../../../core/@types/api/RegisterRequest'
import type { AuthenticatorChallenge } from '../../../core/@types/AuthenticatorChallenge'

export const GET: RequestHandler = async event => {
  const prisma = new PrismaClient()

  try {
    const session = await authenticateUserSession(event)

    const challenge = await createAuthenticatorChallenge(prisma, session.id)
    await prisma.$disconnect()

    // build payload
    const payload: AuthenticatorChallenge = {
      rp: relyingParty,
      uid: encodeBase64(Buffer.from(session.id)),
      challenge: challenge,
    }

    return {
      status: 200,
      body: {
        message: 'ok',
        data: payload as any,
      },
    }
  } catch (e) {
    await prisma.$disconnect()
    return {
      status: 401,
      body: {
        message: 'unauthorized',
      },
    }
  }
}

export const POST: RequestHandler = async event => {
  const request: RegisterRequest = await event.request.json()

  const prisma = new PrismaClient()

  try {
    await completeAuthenticatorChallenge(
      prisma,
      request.response.clientDataJSON,
      request.response.attestationObject
    )
    await prisma.$disconnect()

    return {
      status: 200,
      body: {
        message: 'created',
      },
    }
  } catch (e) {
    let errorMessage: string = (e as any).message
    switch (errorMessage) {
      case 'challenge-failed':
        errorMessage = 'challenge response does not match'
        break
    }

    return {
      status: 400,
      body: {
        message: errorMessage,
      },
    }
  }
}
