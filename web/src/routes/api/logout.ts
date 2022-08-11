import cookie from 'cookie'

import { sessionCookieName } from '../../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async event => {
  return {
    status: 303,
    headers: {
      'Set-Cookie': cookie.serialize(sessionCookieName, '', {
        path: '/',
        expires: new Date(0)
      }),
      location: '/',
    }
  }
}
