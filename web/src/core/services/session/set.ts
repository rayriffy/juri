import Iron from '@hapi/iron'
import { env } from '$env/dynamic/private'

import { maxSessionAge } from '../../constants/maxSessionAge'

import type { User } from '../../@types/User'

// returns string to be set at cookie in the end
export const setSession = (userData: User) => {
  const createdAt = Date.now()

  const payload = { ...userData, createdAt, maxAge: maxSessionAge }
  return Iron.seal(payload, env.IRON_SECRET ?? '', Iron.defaults)
}
