<script lang="ts">
  import { createPublicKeyCredential } from '../services/createPublicKeyCredential'
  import { simplifiedFetch } from '../../../core/services/simplifiedFetch'
  import { encodeBase64 } from '../../../core/services/encodeBase64'

  import type { RegisterRequest } from '../../../core/@types/api/RegisterRequest'

  export let username: string
  export let error: string | null
  export let process: boolean

  const register = async () => {
    try {
      process = true
      error = null

      console.log('register')

      const credential = await createPublicKeyCredential(username)

      console.log('credential', credential)

      if (credential === null) {
        throw Error('credential creation failed')
      }

      // send creds
      const payload: RegisterRequest = {
        id: credential.id,
        rawId: encodeBase64(credential.rawId),
        type: credential.type,
        response: {
          attestationObject: encodeBase64(
            (credential.response as any).attestationObject as ArrayBuffer
          ),
          clientDataJSON: encodeBase64(credential.response.clientDataJSON),
        },
      }

      await simplifiedFetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accepts: 'application/json',
        },
        body: JSON.stringify(payload),
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
  on:click={register}
  disabled={process || username.length === 0}
  class={`transition inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-50 disabled:hover:bg-blue-100 ${
    process ? 'disabled:cursor-wait' : 'disabled:cursor-not-allowed'
  }`}
>
  Register
</button>
