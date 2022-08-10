<script lang="ts">
  import Register from './register.svelte'

  let username: string = ''
  let error: string | null = null
  let process: boolean = false

  const login = () => {
    console.log('login')
  }
</script>


<div class="mb-4">
  <label for="username" class="block text-sm font-medium text-gray-700">
    Username
  </label>
  <div class="mt-1">
    <input
      type="text"
      name="username"
      id="username"
      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
      placeholder="prayut-chan"
      bind:value={username}
    />
  </div>
</div>

<div class="flex space-x-2">
  <button
    type="button"
    on:click={login}
    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
  >
    Login
  </button>
  <Register
    username={username}
    error={error}
    process={process}
    />
</div>
