<script>
  import { onDestroy } from 'svelte';
  import { frNum, toFrequency, countFromFrequency } from '$lib/utils/freq.js';
  import { fr } from '$lib/utils/frac.js';
  import Pict from './Pict.svelte';
  import '$lib/styles/stat-viz.css';

  /* « Le mois suivant » — retrouver un effectif à partir d'un pourcentage.
   *
   * Le registre du mois suivant a 25 cartes et 20 % sont des disputes. Étape 1 :
   * quelle est la fréquence ? (0,2, pas 20 ni 2). Étape 2 : l'élève TOUCHE les
   * cartes qu'il pense être des disputes ; « Je vérifie » compare à l'effectif
   * attendu (fréquence × effectif total) et, en retour, donne la contre-épreuve
   * en fraction : cartes sur effectif total = fréquence. */

  let { vd } = $props();
  const total = vd?.total ?? 25;
  const pct = vd?.pct ?? 20;
  const freq = toFrequency(pct);
  const expected = countFromFrequency(freq, total);

  let step = $state(1);
  let pickF = $state(null);
  let msgF = $state('');
  let marked = $state(Array(total).fill(false));
  let msgC = $state('');
  let okC = $state(false);
  let reveal = $state(false);
  let timers = [];

  const OPTS = [frNum(freq), String(pct), frNum(freq / 10, 3), String(freq * 10)];
  const options = [...new Set(OPTS)].sort((a, b) => (a < b ? -1 : 1));
  let count = $derived(marked.filter(Boolean).length);

  function chooseF(o) {
    pickF = o;
    if (o === frNum(freq)) {
      msgF = '';
      timers.push(setTimeout(() => (step = 2), 700));
    } else {
      msgF =
        o === String(pct)
          ? `${pct} est le pourcentage. La fréquence est la part de 100 : un nombre entre 0 et 1.`
          : 'Une virgule mal placée. Pour passer du pourcentage à la fréquence, je prends la part de 100 : la virgule recule de 2 rangs.';
    }
  }
  function toggle(i) {
    if (okC) return;
    marked[i] = !marked[i];
    msgC = '';
  }
  function verify() {
    if (count === expected) {
      okC = true;
      msgC = '';
      timers.push(setTimeout(() => (reveal = true), 500));
      return;
    }
    msgC =
      (count > expected ? `${count} cartes, c’est trop. ` : `${count} cartes, ce n’est pas assez. `) +
      `Calcule d’abord : fréquence ${frNum(freq)} × effectif total ${total}.`;
  }
  function reset() {
    marked = Array(total).fill(false);
    okC = false;
    reveal = false;
    msgC = '';
  }
  onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="viz sv">
  <p class="ctx">
    <b>Le mois suivant</b> : le registre a <b>{total} cartes</b> et <b>{pct}&nbsp;%</b> sont des disputes.
  </p>

  <p class="sv-h">1 · Quelle est la fréquence des disputes ?</p>
  <div class="sv-chips">
    {#each options as o}
      <button type="button" class="sv-chip" class:picked={pickF === o} disabled={step > 1} onclick={() => chooseF(o)}>{o}</button>
    {/each}
  </div>
  {#if msgF}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{msgF}</p>{/if}
  {#if step > 1}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> {pct}&nbsp;% = {@html fr(pct, 100)} = <b>{frNum(freq)}</b>.</p>

    <p class="sv-h two">2 · Combien de cartes « dispute » y a-t-il ?</p>
    <p class="how">Touche les cartes que tu transformes en disputes. Rappel : <b>effectif = fréquence × effectif total</b>.</p>
    <div class="grid" role="group" aria-label={`${total} cartes. Touche les cartes dispute.`}>
      {#each marked as m, i}
        <button type="button" class="c" class:on={m} class:ok={okC && m} aria-pressed={m} aria-label={`Carte ${i + 1}${m ? ', dispute' : ''}`} onclick={() => toggle(i)}>
          {#if m}<Pict type="dispute" size={22} />{:else}<span class="n">{i + 1}</span>{/if}
        </button>
      {/each}
    </div>
    <div class="bar">
      <span>Disputes : <b class:sv-bump={count > 0}>{count}</b></span>
      <button type="button" class="sv-btn p" onclick={verify} disabled={okC || count === 0}>Je vérifie</button>
      <button type="button" class="sv-btn gh" onclick={reset}>Effacer</button>
    </div>
    {#if msgC}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{msgC}</p>{/if}
    {#if okC}
      <p class="sv-fb ok sv-pop"><span class="ic">✓</span> <b>{expected} cartes</b> : {frNum(freq)} × {total} = {expected}.</p>
    {/if}
    {#if reveal}
      <p class="sv-fb sv-pop">Contre-épreuve : {@html fr(expected, total)} = {frNum(freq)} = {pct}&nbsp;%. On retombe bien sur la fréquence de départ.</p>
    {/if}
  {/if}
</div>

<style>
  .ctx {
    margin: 0 0 14px;
    font-size: 14.5px;
    color: var(--dim);
  }
  .ctx b {
    color: var(--tx);
  }
  .two {
    margin-top: 18px;
  }
  .how {
    margin: 0 0 10px;
    font-size: 13.5px;
    color: var(--dim);
  }
  .how b {
    color: var(--tx);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 6px;
  }
  .c {
    min-height: 46px;
    border: 1.5px solid var(--line2);
    border-radius: 10px;
    background: var(--surf);
    color: var(--dim2);
    display: grid;
    place-items: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, background 0.2s;
  }
  .c .n {
    font-family: var(--sm);
    font-size: 11px;
  }
  .c:active {
    transform: scale(0.92);
  }
  .c.on {
    border-color: var(--blue);
    background: color-mix(in srgb, var(--blue) 12%, var(--surf));
    transform: scale(1.05);
  }
  .c.ok {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 12%, var(--surf));
  }
  .bar {
    display: flex;
    gap: 10px;
    align-items: center;
    flex-wrap: wrap;
    margin-top: 12px;
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
  }
  .bar b {
    display: inline-block;
    font-size: 22px;
    color: var(--blue);
  }
</style>
