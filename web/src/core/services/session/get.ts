import Iron from '@hapi/iron'

const { IRON_SECRET } = process.env

// recieve encrypted token, return user session
export const getSession = async (token: string | undefined) => {
  if (!token) return

  const session = await Iron.unseal(token, IRON_SECRET ?? '', Iron.defaults)
  const expiresAt = session.createdAt + session.maxAge * 1000

  // Validate the expiration date of the session
  if (Date.now() > expiresAt) {
    throw new Error('session-expired')
  }

  return session
}
