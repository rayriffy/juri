import { json as json$1 } from '@sveltejs/kit'
import cookie from 'cookie'

import { prisma } from '../../../../context/prisma'
import { encodeBase64 } from '../../../../core/services/encodeBase64'
import { authenticateUserSession } from '../../../../core/services/authenticateUserSession'
import { createAuthenticatorChallenge } from '../../../../modules/register/services/createAuthenticatorChallenge'
import { relyingParty } from '../../../../core/constants/relyingParty'
import { completeAuthenticatorChallenge } from '../../../../modules/register/services/completeAuthenticatorChallenge'
import { sessionCookieName } from '../../../../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'
import type { RegisterRequest } from '../../../../core/@types/api/RegisterRequest'
import type { AuthenticatorChallenge } from '../../../../core/@types/AuthenticatorChallenge'

export const GET: RequestHandler = async event => {
  try {
    const authenticationCookie = cookie.parse(
      event.request.headers.get('cookie') || ''
    )[sessionCookieName]
    const session = await authenticateUserSession(authenticationCookie)

    const challenge = await createAuthenticatorChallenge(prisma, session.id)

    // build payload
    const payload: AuthenticatorChallenge = {
      rp: relyingParty,
      uid: encodeBase64(Buffer.from(session.id)),
      challenge: challenge,
    }

    return json$1({
      message: 'ok',
      data: payload as any,
    })
  } catch (e) {
    return json$1(
      {
        message: 'unauthorized',
      },
      {
        status: 401,
      }
    )
  }
}

export const POST: RequestHandler = async event => {
  const request: RegisterRequest = await event.request.json()

  try {
    await completeAuthenticatorChallenge(
      prisma,
      request.response.clientDataJSON,
      request.response.attestationObject
    )

    return json$1({
      message: 'created',
    })
  } catch (e) {
    let errorMessage: string = (e as any).message
    switch (errorMessage) {
      case 'challenge-failed':
        errorMessage = 'challenge response does not match'
        break
    }

    return json$1(
      {
        message: errorMessage,
      },
      {
        status: 400,
      }
    )
  }
}
