import Iron from '@hapi/iron'
import { env } from '$env/dynamic/private'

interface DecodedSession {
  id: string
  username: string
  createdAt: number
  maxAge: number
}

// recieve encrypted token, return user session
export const getSession = async (token: string | undefined) => {
  if (!token) {
    throw new Error('empty-token')
  }

  const session: DecodedSession = await Iron.unseal(
    token,
    env.IRON_SECRET ?? '',
    Iron.defaults
  )
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error('session-expired')
  }

  return session
}
