import type { RequestEvent } from '@sveltejs/kit'

export const getClientAddress = (event: RequestEvent) => {
  return (
    event.request.headers.get('X-Forwarded-For') ??
    event.request.headers.get('CF-Connecting-IP') ??
    event.getClientAddress()
  )
}
