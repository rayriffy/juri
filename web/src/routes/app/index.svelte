<script lang="ts">
  import Authenticators from '../../modules/app/components/authenticators.svelte'
  import Juri from '../../modules/app/components/juri.svelte'

  export let error: string
  export let uid: string
  export let username: string
</script>

{#if error !== null}
  <section>
    <h1 class="font-bold text-2xl text-gray-900">Not logged in</h1>
    <p class="font-gray-600">{error}</p>
    <div class="mt-2">
      <a
        href="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Back to home
      </a>
    </div>
  </section>
{:else}
  <section class="mb-8">
    <h1 class="font-bold text-2xl">Welcome {username}!</h1>
    <Authenticators />
    <div class="my-2">
      <a
        href="/api/logout"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </a>
    </div>
  </section>
  <Juri />
{/if}
