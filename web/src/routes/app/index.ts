import { authenticateUserSession } from '../../core/services/authenticateUserSession'

import type { RequestHandler } from '@sveltejs/kit'

export const GET: RequestHandler = async event => {
  try {
    const session = await authenticateUserSession(event)

    return {
      body: {
        error: null,
        uid: session.id,
        username: session.username,
      },
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
      body: {
        error: errorMessage,
      },
    }
  }
}
