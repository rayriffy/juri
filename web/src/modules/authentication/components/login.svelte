<script lang="ts">
  import { decodeBase64 } from '../../../core/services/decodeBase64'
  import { encodeBase64 } from '../../../core/services/encodeBase64'
  import { simplifiedFetch } from '../../../core/services/simplifiedFetch'

  import type { LoginResponse } from '../../../core/@types/api/LoginResponse'
  import type { ResponseBuilder } from '../../../core/@types/api/ResponseBuilder'
  import type { LoginRequest } from '../../../core/@types/api/LoginRequest'

  export let username: string
  export let error: string | null
  export let process: boolean

  const login = async () => {
    try {
      process = true
      error = null

      console.log('login')

      // get all possible authenticator
      let urlParams = new URLSearchParams({
        username,
      })
      const {
        data: { challenge, allowedCredentials },
      } = await simplifiedFetch<ResponseBuilder<LoginResponse>>(
        `/api/login?${urlParams}`
      )

      const credential = (await navigator.credentials.get({
        publicKey: {
          challenge: decodeBase64(challenge),
          allowCredentials: allowedCredentials.map(o => ({
            ...o,
            id: decodeBase64(o.id),
          })),
          userVerification: 'preferred',
        },
      })) as PublicKeyCredential | null

      if (credential === null) {
        throw Error('failed to obtain credential')
      }

      console.log(credential)

      const loginPayload: LoginRequest = {
        id: credential.id,
        response: {
          clientDataJSON: encodeBase64(credential.response.clientDataJSON),
          authenticatorData: encodeBase64(
            (credential.response as any).authenticatorData
          ),
          signature: encodeBase64((credential.response as any).signature),
          userHandle: encodeBase64((credential.response as any).userHandle),
        },
      }

      console.log(loginPayload)

      await simplifiedFetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accepts: 'application/json',
        },
        body: JSON.stringify(loginPayload),
      })
    } catch (e) {
      error = (e as any)?.message ?? 'unexpected error occured'
    } finally {
      process = false
    }
  }
</script>

<button
  type="button"
  on:click={login}
  disabled={process || username.length === 0}
  class={`transition inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:hover:bg-blue-500 ${
    process ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'
  }`}
>
  Login
</button>
