<script lang="ts">
  import '../app.css'

  let isPubkeyCredsSupported =
    typeof window === 'undefined'
      ? null
      : typeof PublicKeyCredential !== 'undefined'
</script>

<header
  class="max-w-xl mx-auto py-4 px-6 mb-4 xl:mt-4 text-white bg-gradient-to-l from-sky-400 to-blue-500 xl:rounded-2xl flex justify-between items-center"
>
  <h1 class="font-bold text-xl">Minori</h1>
</header>

<main class="max-w-xl mx-auto py-4 px-2 xl:px-0">
  {#if isPubkeyCredsSupported === true}
    <slot />
  {:else if isPubkeyCredsSupported === false}
    <section
      class="aspect-[2/1] bg-red-50 border-4 border-red-600 border-dashed rounded-3xl flex items-center justify-center px-4"
    >
      <div class="text-center text-red-800">
        <h2 class="font-bold text-lg">Unsupported browser</h2>
        <p class="text-sm">
          Please update your browser to latest version before use
        </p>
      </div>
    </section>
  {/if}
</main>

<footer>
  <p>
    visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to learn SvelteKit
  </p>
</footer>
