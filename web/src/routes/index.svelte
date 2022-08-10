<script context="module" lang="ts">
  export const prerender = false
</script>

<script lang="ts">
	import AuthenticationCard from '../modules/authentication/components/authenticationCard.svelte'
</script>

<svelte:head>
  <title>みのり</title>
  <meta name="description" content="WebAuthn full-stack demo application" />
</svelte:head>

<section class="my-4">
  <AuthenticationCard />
</section>
