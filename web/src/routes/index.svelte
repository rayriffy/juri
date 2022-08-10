<script context="module" lang="ts">
  export const prerender = false
</script>

<script lang="ts">
	import AuthenticationCard from '../modules/authentication/components/authenticationCard.svelte'
</script>

<svelte:head>
  <title>Home</title>
  <meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
  <AuthenticationCard />
</section>
