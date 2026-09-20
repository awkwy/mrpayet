<script>
  import DataScreen from './DataScreen.svelte';
  import GraphScreen from './GraphScreen.svelte';
  import StatsScreen from './StatsScreen.svelte';
  import { buildEntryState, entryComplete } from './entry-state.js';

  let { calc, points } = $props();

  let screen = $state('data');
  let typed = $state(points.map(() => ['', '']));

  let entryState = $derived(buildEntryState(points, typed));
  let complete = $derived(entryComplete(entryState));

  function onedit(row, col, value) {
    typed[row][col] = value;
  }
</script>

<div class="nw-shell">
  <div class="nw-tabs">
    <button type="button" class:on={screen === 'data'} onclick={() => (screen = 'data')}>
      Données
    </button>
    <button type="button" class:on={screen === 'graph'} onclick={() => (screen = 'graph')}>
      Graphique
    </button>
    {#if calc.stats}
      <button type="button" class:on={screen === 'stats'} onclick={() => (screen = 'stats')}>
        Stats
      </button>
    {/if}
  </div>
  <div class="nw-screen">
    {#if screen === 'data'}
      <DataScreen {entryState} {typed} cols={calc.cols} {onedit} />
    {:else if screen === 'stats'}
      <StatsScreen points={complete ? points : undefined} reg={calc.reg} />
    {:else}
      <GraphScreen points={complete ? points : undefined} reg={calc.reg} />
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
  .nw-tabs {
    display: flex;
  }
  .nw-tabs button {
    flex: 1;
    padding: 8px 14px;
    background: var(--surf3);
    color: var(--dim);
    border: none;
    border-bottom: 1px solid var(--line);
    font-family: var(--sm);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
  }
  .nw-tabs button.on {
    color: var(--tx);
    background: var(--surf2);
    border-bottom-color: var(--g);
  }
  .nw-tabs button:focus-visible {
    outline: 1px solid var(--g);
    outline-offset: -1px;
  }
  .nw-screen {
    padding: 14px;
  }
</style>
