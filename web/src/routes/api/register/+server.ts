import { json as json$1 } from '@sveltejs/kit'
import cookie from 'cookie'
import { nanoid } from 'nanoid'

import { prisma } from '../../../context/prisma'
import { encodeBase64 } from '../../../core/services/encodeBase64'
import { setSession } from '../../../core/services/session/set'
import { sessionCookieName } from '../../../core/constants/sessionCookieName'
import { maxSessionAge } from '../../../core/constants/maxSessionAge'
import { completeAuthenticatorChallenge } from '../../../modules/register/services/completeAuthenticatorChallenge'
import { createAuthenticatorChallenge } from '../../../modules/register/services/createAuthenticatorChallenge'
import { relyingParty } from '../../../core/constants/relyingParty'

import type { RequestHandler } from '@sveltejs/kit'
import type { RegisterRequest } from '../../../core/@types/api/RegisterRequest'
import type { AuthenticatorChallenge } from '../../../core/@types/AuthenticatorChallenge'

// pre-generate challenge, and user ids
export const GET: RequestHandler = async event => {
  const username = event.url.searchParams.get('username')

  // if no username is provided, then dead
  if (username === null) {
    return json$1(
      {
        message: 'no username provided',
      },
      {
        status: 400,
      }
    )
  }

  // check if there're any existing records for this username
  const user = await prisma.user.findFirst({
    where: {
      username: username.toLowerCase(),
    },
  })

  // if user already completed registration, then dead
  if (user?.registered) {
    return json$1(
      {
        message: 'username has already been taken',
      },
      {
        status: 400,
      }
    )
  }

  const generatedUserId = user?.uid ?? nanoid()

  // if user not found then create a new one
  if (user === null) {
    await prisma.user.create({
      data: {
        uid: generatedUserId,
        username: username.toLowerCase(),
        lastCalledAddress: event.getClientAddress(),
      },
    })
  }

  const challenge = await createAuthenticatorChallenge(prisma, generatedUserId)

  // build payload
  const payload: AuthenticatorChallenge = {
    rp: relyingParty,
    uid: encodeBase64(Buffer.from(generatedUserId)),
    challenge: challenge,
  }

  return json$1({
    message: 'ok',
    data: payload as any,
  })
}

// verify challenge result, and register user if success
export const POST: RequestHandler = async event => {
  const request: RegisterRequest = await event.request.json()

  try {
    const completedChallenge = await completeAuthenticatorChallenge(
      prisma,
      request.response.clientDataJSON,
      request.response.attestationObject
    )

    // allow user to be registered
    await prisma.user.update({
      where: {
        uid: completedChallenge.uid,
      },
      data: {
        registered: true,
        lastCalledAddress: event.getClientAddress(),
      },
    })

    // issue user token
    const authenticatedToken = await setSession({
      id: completedChallenge.uid,
      username: completedChallenge.username,
    })

    return json$1(
      {
        message: 'ok',
        data: authenticatedToken,
      },
      {
        headers: {
          'Set-Cookie': cookie.serialize(
            sessionCookieName,
            authenticatedToken,
            {
              path: '/',
              httpOnly: true,
              sameSite: 'strict',
              secure: process.env.NODE_ENV === 'production',
              maxAge: maxSessionAge,
            }
          ),
        },
      }
    )
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
