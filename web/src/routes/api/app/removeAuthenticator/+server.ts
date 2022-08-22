import { json as json$1 } from '@sveltejs/kit'
import cookie from 'cookie'

import { authenticateUserSession } from '../../../../core/services/authenticateUserSession'
import { sessionCookieName } from '../../../../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'
import { PrismaClient } from '@prisma/client'

export const DELETE: RequestHandler = async event => {
  const request = await event.request.json()

  try {
    const authenticationCookie = cookie.parse(
      event.request.headers.get('cookie') || ''
    )[sessionCookieName]
    const session = await authenticateUserSession(authenticationCookie)

    const prisma = new PrismaClient()

    // list authenticators again
    const authenticators = await prisma.authenticator.findMany({
      where: {
        uid: session.id,
      },
    })

    /**
     * MAKE SURE THAT USER WILL HAVE AT LEAST ONE AUTHENTICATOR LEFT AFTER REMOVE
     * THIS IS SERIOUS OTHERWISE USER WILL LOSE ACCESS TO AN ACCOUNT
     */
    if (authenticators.length <= 1) {
      await prisma.$disconnect()
      return json$1(
        {
          message: 'user only have one key left',
        },
        {
          status: 400,
        }
      )
    }

    await prisma.authenticator.deleteMany({
      where: {
        credentialId: request.credentialId,
      },
    })
    await prisma.$disconnect()

    return json$1({
      message: 'ok',
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
