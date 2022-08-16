import { json as json$1 } from '@sveltejs/kit'
import { authenticateUserSession } from '../../../../core/services/authenticateUserSession'

import type { RequestHandler } from '@sveltejs/kit'
import { PrismaClient } from '@prisma/client'

export const DELETE: RequestHandler = async event => {
  const request = await event.request.json()

  try {
    const session = await authenticateUserSession(event)

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
