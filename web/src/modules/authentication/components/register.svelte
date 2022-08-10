<script lang="ts">
  import { bufferEncode } from '../services/bufferEncode'
  import { createPublicKeyCredential } from '../services/createPublicKeyCredential'
  import { simplifiedFetch } from '../../../core/services/simplifiedFetch'

  import type { WebauthnResponsePayload } from '../@types/WebauthnResponsePayload'

  export let username: string
  export let error: string | null
  export let process: boolean

  const register = async () => {
    try {
      process = true
      error = null

      console.log('register')

      // todo: make sure username has not been taken by someone else

      const credential = await createPublicKeyCredential(username)

      console.log('credential', credential)

      if (credential === null) {
        return
      }

      // send creds
      const payload: WebauthnResponsePayload = {
        id: credential.id,
        rawId: bufferEncode(new Uint8Array(credential.rawId)),
        type: credential.type,
        response: {
          attestationObject: bufferEncode(
            new Uint8Array(
              (credential.response as any).attestationObject as ArrayBuffer
            )
          ),
          clientDataJSON: bufferEncode(
            new Uint8Array(credential.response.clientDataJSON)
          ),
        },
      }
      console.log('payload', payload)
      const response = await simplifiedFetch('/api/makeCredential', {
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
  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
>
  Register
</button>
