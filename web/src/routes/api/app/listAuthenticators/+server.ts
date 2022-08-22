import { json } from '@sveltejs/kit'
import { PrismaClient } from '@prisma/client'
import cookie from 'cookie'

import { authenticateUserSession } from '../../../../core/services/authenticateUserSession'
import { sessionCookieName } from '../../../../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'
import type { Authenticator } from '../../../../modules/app/@types/Authenticator'

export const GET: RequestHandler = async event => {
  try {
    const authenticationCookie = cookie.parse(
      event.request.headers.get('cookie') || ''
    )[sessionCookieName]
    const session = await authenticateUserSession(authenticationCookie)

    const prisma = new PrismaClient()
    const authenticators = await prisma.authenticator.findMany({
      where: {
        uid: session.id,
      },
      select: {
        credentialId: true,
      },
    })

    const payload: Authenticator[] = authenticators.map(authenticator => ({
      id: authenticator.credentialId,
    }))

    return json({
      message: 'ok',
      data: payload as any,
    })
  } catch (e) {
    return json(
      {
        message: 'unauthorized',
      },
      {
        status: 401,
      }
    )
  }
}
