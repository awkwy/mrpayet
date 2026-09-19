<script>
  import DataScreen from './DataScreen.svelte';
  import GraphScreen from './GraphScreen.svelte';

  let { calc, points } = $props();

  const TITLES = { data: 'Statistiques — Données', graph: 'Statistiques — Régression' };
  let title = $derived(TITLES[calc.screen] || 'Calculatrice');
</script>

<div class="nw-shell">
  <div class="nw-bar">{title}</div>
  <div class="nw-screen">
    {#if calc.screen === 'data'}
      <DataScreen {points} cols={calc.cols} />
    {:else if calc.screen === 'graph'}
      <GraphScreen {points} reg={calc.reg} />
    {/if}
  </div>
</div>

<style>
  .nw-shell {
    max-width: 360px;
    margin: 14px auto 0;
    border: 1px solid var(--line2);
    border-radius: 14px;
    background: var(--surf2);
    overflow: hidden;
  }
  .nw-bar {
    padding: 8px 14px;
    background: var(--surf3);
    color: var(--dim);
    font-family: var(--sm);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--line);
  }
  .nw-screen {
    padding: 14px;
  }
</style>
