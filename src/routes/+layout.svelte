<script>
  import '$lib/styles/tokens.css';
  import '$lib/styles/global.css';
  import NavBar from '$lib/components/NavBar.svelte';
  let { children } = $props();
</script>

<NavBar />
{@render children()}
