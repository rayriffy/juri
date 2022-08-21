import { json } from '@sveltejs/kit'

import { authenticateUserSession } from '../../../core/services/authenticateUserSession'

import type { RequestHandler } from '@sveltejs/kit'

export const POST: RequestHandler = async event => {
  try {
    const { token } = (await event.request.json())
    const session = await authenticateUserSession(token)

    return json({
      success: true,
      user: {
        id: session.id,
        username: session.username,
      }
    })
  } catch (e) {
    return json({
      success: false,
      user: null
    })
  }
}
