<script lang="ts">
  import { onMount } from 'svelte'

  import AddAuthenticatorButton from './addAuthenticator.svelte'
  import AuthenticatorCard from './authenticator.svelte'
  import KeyIcon from './keyIcon.svelte'

  import { simplifiedFetch } from '../../../core/services/simplifiedFetch'

  import type { Authenticator } from '../@types/Authenticator'
  import type { ResponseBuilder } from '../../../core/@types/api/ResponseBuilder'

  export let username: string

  let progress: boolean = true
  let authenticators: Authenticator[] = []

  const refresh = async () => {
    progress = true
    const { data } = await simplifiedFetch<ResponseBuilder<Authenticator[]>>(
      '/api/app/listAuthenticators'
    )
    authenticators = data
    progress = false
  }

  const onRemoveKey = async (credentialId: string) => {
    progress = true

    await simplifiedFetch<ResponseBuilder>(
      '/api/app/removeAuthenticator',
      {
        method: 'DELETE',
        body: JSON.stringify({
          credentialId
        })
      }
    )

    refresh()
  }

  onMount(() => {
    refresh()
  })
</script>

<section class="my-4">
  <div class="flex justify-between">
    <h1 class="flex font-semibold text-xl items-center space-x-1 text-gray-900">
      <KeyIcon class="w-6 h-6" />
      <span>Authenticators</span>
    </h1>

    <AddAuthenticatorButton onRefresh={refresh} bind:username bind:progress />
  </div>
  <div class="bg-white border rounded-xl shadow mt-2 divide-y">
    {#if authenticators.length === 0 && progress}
      <div
        class="py-3 px-4 text-xs sm:text-base flex justify-between items-center animate-pulse"
      >
        <span
          class="text-gray-800 bg-gray-800 select-none font-mono truncate w-full max-w-[14rem] sm:max-w-sm h-4 sm:h-6 rounded-md"
        />
      </div>
    {/if}
    {#each authenticators as authenticator}
      <AuthenticatorCard
        onRemoveKey={onRemoveKey}
        authenticatorCount={authenticators.length}
        bind:progress
        bind:authenticator
      />
    {/each}
  </div>
</section>
