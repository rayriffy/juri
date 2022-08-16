import cookie from 'cookie'

import { sessionCookieName } from '../constants/sessionCookieName'
import { getSession } from './session/get'

import type { RequestEvent } from '@sveltejs/kit'

export const authenticateUserSession = async (
  event: RequestEvent<Record<string, string>>
) => {
  // read cookie
  const authenticationCookie = cookie.parse(
    event.request.headers.get('cookie') || ''
  )[sessionCookieName]

  if (authenticationCookie === undefined || authenticationCookie === null) {
    throw new Error('not-authenticated')
  }

  // decode encrypted cookie
  return getSession(authenticationCookie)
}
