import cookie from 'cookie'

import { sessionCookieName } from '../../core/constants/sessionCookieName'
import { getSession } from '../../core/services/session/get'

import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async event => {
  // read cookie
  const authenticationCookie = cookie.parse(event.request.headers.get('cookie') || '')[sessionCookieName]

  if (authenticationCookie === undefined || authenticationCookie === null) {
    return {
      body: {
        error: 'User has not been authenticated'
      }
    }
  }

  // decrypt cookie
  try {
    const session = await getSession(authenticationCookie)

    return {
      body: {
        error: null,
        uid: session.id,
        username: session.username,
      }
    }
  } catch (e) {
    return {
      body: {
        // i'm so sorry
        // @ts-ignore
        error: e.message === 'session-expired' ? 'User session has expired' : e.message
      }
    }
  }
}
