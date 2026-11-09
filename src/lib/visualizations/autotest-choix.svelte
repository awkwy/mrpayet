<script>
  import Autotest from './autotest.svelte';
  import { SELFTESTS } from '$lib/data/selftests-stats.js';

  /* Choix de la version d'un auto-test : A ou B, version standard ou langue
   * accessible (mots à placer dans une banque, mêmes nombres). Le choix change
   * l'auto-test affiché sans quitter la page ; chaque version a son propre
   * score. vd = { sets: [{ label:'Version A', std:'flash-A', acc:'flash-A-acc' }, …] } */

  let { vd } = $props();
  const sets = vd?.sets ?? [];
  let v = $state(0);
  let acc = $state(false);
  let key = $derived(acc ? sets[v].acc : sets[v].std);
</script>

<div class="viz ch">
  <div class="vctl" role="group" aria-label="Version de l'auto-test">
    {#each sets as s, i}
      <button type="button" class:on={v === i} aria-pressed={v === i} onclick={() => (v = i)}>{s.label}</button>
    {/each}
  </div>
  <div class="vctl" role="group" aria-label="Niveau de langue">
    <button type="button" class:on={!acc} aria-pressed={!acc} onclick={() => (acc = false)}>Standard</button>
    <button type="button" class:on={acc} aria-pressed={acc} onclick={() => (acc = true)}>Langue accessible</button>
  </div>
  {#key key}
    <div class="inner"><Autotest vd={SELFTESTS[key]} /></div>
  {/key}
</div>

<style>
  .inner {
    margin: 0 -14px -14px;
  }
  .inner :global(.viz) {
    border: 0;
    border-radius: 0;
    background: transparent;
    margin: 6px 0 0;
    padding: 6px 14px 14px;
  }
</style>
