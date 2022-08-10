<script context="module" lang="ts">
	export const prerender = false
</script>

<script lang="ts">
	import Counter from '$lib/Counter.svelte'

	let isPubkeyCredsSupported = typeof window === "undefined" ? null : typeof(PublicKeyCredential) !== "undefined"
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<h1>{isPubkeyCredsSupported === null ? "Loading..." : isPubkeyCredsSupported ? "Support" : "Not support"}</h1>
</section>
