<script lang="ts">
  import PlusIcon from './plusIcon.svelte'

  import { encodeBase64 } from '../../../core/services/encodeBase64';
  import { simplifiedFetch } from '../../../core/services/simplifiedFetch';
  import { createPublicKeyCredential } from '../../authentication/services/createPublicKeyCredential'

  import type { RegisterRequest } from '../../../core/@types/api/RegisterRequest';

  export let username: string
  export let progress: boolean
  export let onRefresh = () => {}

  const onAdd = async () => {
    try {
      progress = true

      const credential = await createPublicKeyCredential(username, '/api/app/addNewAuthenticator')

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

      await simplifiedFetch('/api/app/addNewAuthenticator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accepts: 'application/json',
        },
        body: JSON.stringify(payload),
      })

      onRefresh()
    } catch (e) {
      console.error(e)
    } finally {
      progress = false
    }
  }
</script>

<button
  type="button"
  on:click={onAdd}
  disabled={progress}
  class="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:hover:bg-blue-500 disabled:cursor-wait transition"
>
  <PlusIcon class="w-4 h-4 -ml-1" />
  Add
</button>
