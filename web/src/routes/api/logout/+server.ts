import cookie from 'cookie'

import { sessionCookieName } from '../../../core/constants/sessionCookieName'

import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async event => {
  throw new Error(
    '@migration task: Migrate this return statement (https://github.com/sveltejs/kit/discussions/5774#discussioncomment-3292701)'
  )
  return {
    status: 303,
    headers: {
      'Set-Cookie': cookie.serialize(sessionCookieName, '', {
        path: '/',
        expires: new Date(0),
      }),
      location: '/',
    },
  }
}
