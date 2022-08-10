export const simplifiedFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, init).then(async o => {
    if (o.status >= 400 && o.status < 600) {
      throw new Error((await o.json()).message)
    }

    return await o.json()
  })
