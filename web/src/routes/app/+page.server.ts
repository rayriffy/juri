import cookie from 'cookie'

import { sessionCookieName } from '../../core/constants/sessionCookieName'
import { authenticateUserSession } from '../../core/services/authenticateUserSession'

import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async event => {
  try {
    const authenticationCookie = cookie.parse(
      event.request.headers.get('cookie') || ''
    )[sessionCookieName]

    const session = await authenticateUserSession(authenticationCookie)

    return {
      error: null,
      uid: session.id,
      username: session.username,
    }
  } catch (e) {
    let errorMessage: string = (e as any).message
    switch (errorMessage) {
      case 'not-authenticated':
        errorMessage = 'User has not been authenticated'
        break
      case 'session-expired':
        errorMessage = 'User session has expired'
        break
    }

    return {
      error: errorMessage,
    }
  }
}
