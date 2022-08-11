<script lang="ts">
  import TrashIcon from './trashIcon.svelte'

  import type { Authenticator } from '../@types/Authenticator'

  export let progress: boolean
  export let authenticator: Authenticator
  export let authenticatorCount: number
  export let onRemoveKey: (credId: string) => void
</script>

<div class="py-3 px-4 flex justify-between items-center">
  <span
    class="text-gray-800 font-mono truncate text-xs max-w-[14rem] sm:text-sm sm:max-w-sm"
  >
    {authenticator.id}
  </span>
  <button
    on:click={() => onRemoveKey(authenticator.id)}
    disabled={progress || authenticatorCount === 1}
    class={`text-gray-800 disabled:text-gray-500 ${
      authenticatorCount === 1
        ? 'disabled:cursor-not-allowed'
        : 'disabled:cursor-wait'
    }`}
  >
    <TrashIcon class="w-5 h-5 ml-4 flex-shrink-0" />
  </button>
</div>
