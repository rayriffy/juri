<script lang="ts">
  import { onMount } from 'svelte'

  import KeyIcon from './keyIcon.svelte'
  import PlusIcon from './plusIcon.svelte'
  import TrashIcon from './trashIcon.svelte'

  import { simplifiedFetch } from '../../../core/services/simplifiedFetch'

  import type { Authenticator } from '../@types/Authenticator'
  import type { ResponseBuilder } from '../../../core/@types/api/ResponseBuilder'

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

    <button
      type="button"
      class="inline-flex items-center px-2.5 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <PlusIcon class="w-4 h-4 -ml-1" />
      Add
    </button>
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
      <div
        class="py-3 px-4 text-xs sm:text-base flex justify-between items-center"
      >
        <span
          class="text-gray-800 font-mono truncate text-xs max-w-[14rem] sm:text-base sm:max-w-sm"
        >
          {window.btoa(authenticator.id)}
        </span>
        <TrashIcon class="w-5 h-5 text-gray-800 ml-4 flex-shrink-0" />
      </div>
    {/each}
  </div>
</section>
