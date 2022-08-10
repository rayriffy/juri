<script lang="ts">
  import Login from './login.svelte'
  import Register from './register.svelte'
  import ErrorPanel from './errorPanel.svelte'


  let username: string = ''
  let error: string | null = null
  let process: boolean = false
</script>

{#if error !== null}
  <div class="mb-4 -mt-2">
    <ErrorPanel error={error} />
  </div>
{/if}

<div class="mb-4">
  <label for="username" class="block text-sm font-medium text-gray-700">
    Username
  </label>
  <div class="mt-1">
    <input
      type="text"
      name="username"
      id="username"
      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 transition"
      placeholder="prayut-chan"
      disabled={process}
      bind:value={username}
    />
  </div>
</div>

<div class="flex space-x-2">
  <Login
    bind:username={username}
    bind:error={error}
    bind:process={process}
  />
  <Register
    bind:username={username}
    bind:error={error}
    bind:process={process}
  />
</div>
