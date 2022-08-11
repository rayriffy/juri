import cookie from 'cookie'

import { getSession } from '../core/services/session/get'
import { sessionCookieName } from '../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'

// redirect user to /app if already authenticated
export const GET: RequestHandler = async event => {
  // read cookie
  const authenticationCookie = cookie.parse(
    event.request.headers.get('cookie') || ''
  )[sessionCookieName]

  let isAuthenticated = false
  // if there's an cookie, and it's valid then skip login
  if (authenticationCookie !== undefined && authenticationCookie.length !== 0) {
    await getSession(authenticationCookie)
      .then(() => {
        isAuthenticated = true
      })
      .catch(() => {
        isAuthenticated = false
      })
  }

  if (isAuthenticated) {
    return {
      status: 302,
      headers: {
        location: '/app',
      },
    }
  } else {
    return {
      status: 200,
    }
  }
}
