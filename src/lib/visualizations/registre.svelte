<script>
  import { onDestroy } from 'svelte';
  import Pict from './Pict.svelte';
  import { TYPES, SEQ, TOTAL, countsOf } from './registre-data.js';
  import '$lib/styles/stat-viz.css';

  /* « Le registre de la médiation » — effectif / effectif total.
   *
   * 20 cartes (une par situation traitée). L'élève TOUCHE les cartes une à
   * une pour les compter : les barres par type poussent au ressort, l'effectif
   * de chaque type et l'effectif total se construisent sous ses doigts. Puis
   * « Qui a raison ? » (8 ou 20) : on surligne les cartes concernées pour
   * montrer que l'effectif n'est qu'un groupe, l'effectif total est tout.
   *
   * Couleurs : une série (nombre de cartes) = teinte unique --g ; l'identité du
   * type passe par le pictogramme et le libellé, jamais par la couleur seule.
   * Accessibilité : cartes = boutons aria-pressed, totaux dans une région
   * aria-live, vue tableau repliable, mouvement réduit respecté (global.css).
   * Les nombres sont inventés pour l'exercice. */

  let { vd } = $props();
  const seq = vd?.seq || SEQ;
  const types = vd?.types || TYPES;
  const total = seq.length;
  const target = vd?.seq ? countsOf(seq, types) : countsOf();
  const maxEff = Math.max(...Object.values(target));

  let marked = $state(Array(total).fill(false));
  let hl = $state(null); // 'all' | id de type | null
  let who = $state(null);
  let auto = $state(false);
  let timers = [];

  let counts = $derived(Object.fromEntries(types.map((t) => [t.id, seq.filter((x, i) => x === t.id && marked[i]).length])));
  let counted = $derived(marked.filter(Boolean).length);
  let done = $derived(counted === total);

  function toggle(i) {
    if (auto) return;
    marked[i] = !marked[i];
  }
  function countForMe() {
    auto = true;
    seq.forEach((_, i) => {
      if (marked[i]) return;
      timers.push(
        setTimeout(() => {
          marked[i] = true;
          if (i === seq.length - 1 || marked.every(Boolean)) auto = false;
        }, i * 80)
      );
    });
    timers.push(setTimeout(() => (auto = false), seq.length * 80 + 100));
  }
  function reset() {
    timers.forEach(clearTimeout);
    timers = [];
    marked = Array(total).fill(false);
    who = null;
    hl = null;
    auto = false;
  }
  function flash(k) {
    hl = k;
    timers.push(setTimeout(() => (hl === k ? (hl = null) : null), 1800));
  }
  function choose(w) {
    who = w;
    flash(w === 'amina' ? 'dispute' : 'all');
  }
  onDestroy(() => timers.forEach(clearTimeout));

  const labelOf = (id) => types.find((t) => t.id === id)?.label;
  const lit = (i) => hl === 'all' || hl === seq[i];
</script>

<div class="viz sv">
  <p class="sv-h">Le registre du mois : {total} cartes, une par situation traitée</p>

  <div class="legend">
    {#each types as t}
      <span class="lg"><Pict type={t.id} size={22} /> {t.label}</span>
    {/each}
  </div>

  <div class="grid" role="group" aria-label="Les {total} cartes du registre. Touche une carte pour la compter.">
    {#each seq as t, i}
      <button
        type="button"
        class="card"
        class:on={marked[i]}
        class:lit={lit(i)}
        style:--i={i}
        aria-pressed={marked[i]}
        aria-label={`Carte ${i + 1}, ${labelOf(t)}${marked[i] ? ', comptée' : ''}`}
        onclick={() => toggle(i)}
      >
        <Pict type={t} size={30} />
        <span class="n">n° {i + 1}</span>
        <span class="tick" aria-hidden="true">✓</span>
      </button>
    {/each}
  </div>

  <div class="ctl">
    <button type="button" class="sv-btn p" onclick={countForMe} disabled={auto || done}>Compter pour moi</button>
    <button type="button" class="sv-btn gh" onclick={reset}>Recommencer</button>
  </div>

  <table class="tally" aria-live="polite">
    <caption class="sv-h">Je compte : l’effectif de chaque type</caption>
    <tbody>
      {#each types as t}
        <tr class:flash={hl === t.id}>
          <th scope="row"><Pict type={t.id} size={22} /> {t.label}</th>
          <td class="bar">
            <span class="fill" style:transform={`scaleX(${counts[t.id] / maxEff})`}></span>
          </td>
          <td class="num">
            {#key counts[t.id]}<b class:sv-bump={counts[t.id] > 0}>{counts[t.id]}</b>{/key}
          </td>
        </tr>
      {/each}
      <tr class="totr" class:flash={hl === 'all'} class:done>
        <th scope="row">Effectif total</th>
        <td class="bar sum">{types.map((t) => counts[t.id]).join(' + ')}</td>
        <td class="num">{#key counted}<b class="sv-bump">{counted}</b>{/key}</td>
      </tr>
    </tbody>
  </table>

  <div class="defs">
    <button type="button" class="def" onclick={() => flash('dispute')}>
      <b>Effectif</b> = combien dans <u>un seul</u> type
    </button>
    <button type="button" class="def" onclick={() => flash('all')}>
      <b>Effectif total</b> = combien <u>en tout</u>
    </button>
  </div>

  {#if !done}
    <p class="sv-fb">Touche les cartes, ou « Compter pour moi ». Quand les {total} cartes sont comptées, l’effectif total doit être égal au nombre de cartes du registre.</p>
  {:else}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Effectif total = {types.map((t) => counts[t.id]).join(' + ')} = <b>{counted}</b> : c’est bien le nombre de cartes du registre.</p>

    <div class="who sv-pop">
      <p class="sv-h">Qui a raison ?</p>
      <div class="saylist">
        <button type="button" class="speech" class:picked={who === 'amina'} class:bad={who === 'amina'} onclick={() => choose('amina')}>
          <span class="who-n">Amina</span> « Il y a <b>{target.dispute}</b> situations en tout. »
        </button>
        <button type="button" class="speech" class:picked={who === 'soilihi'} class:good={who === 'soilihi'} onclick={() => choose('soilihi')}>
          <span class="who-n">Soilihi</span> « Il y a <b>{total}</b> situations en tout. »
        </button>
      </div>
      {#if who === 'amina'}
        <p class="sv-fb no sv-pop"><span class="ic">✕</span> Amina a donné <b>{target.dispute}</b> : c’est l’<b>effectif</b> des disputes, un seul type. « En tout », il faut compter <b>toutes</b> les cartes.</p>
      {:else if who === 'soilihi'}
        <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Soilihi a raison : <b>{total}</b> est l’<b>effectif total</b>, tous les types ensemble. <b>{target.dispute}</b> est seulement l’<b>effectif</b> des disputes.</p>
      {/if}
    </div>
  {/if}

  <details class="viz-data">
    <summary>Voir les données</summary>
    <table>
      <caption>Effectifs du registre</caption>
      <thead><tr><th>Type</th><th>Effectif</th></tr></thead>
      <tbody>
        {#each types as t}<tr><td>{t.label}</td><td>{target[t.id]}</td></tr>{/each}
        <tr><td>Effectif total</td><td>{total}</td></tr>
      </tbody>
    </table>
  </details>
</div>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 14px;
    font-size: 12.5px;
    color: var(--dim);
    margin-bottom: 12px;
  }
  .lg {
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 7px;
  }
  .card {
    position: relative;
    display: grid;
    justify-items: center;
    gap: 2px;
    padding: 7px 2px 5px;
    min-height: 62px;
    background: var(--surf);
    border: 1.5px solid var(--line2);
    border-radius: 11px;
    color: var(--dim);
    animation: sv-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    animation-delay: calc(var(--i) * 22ms);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.25s, background 0.25s, box-shadow 0.3s;
  }
  .card:active {
    transform: scale(0.93);
  }
  .card .n {
    font-family: var(--sm);
    font-size: 9.5px;
  }
  .card .tick {
    position: absolute;
    top: 3px;
    right: 5px;
    font-family: var(--sm);
    font-size: 12px;
    font-weight: 700;
    color: var(--g);
    opacity: 0;
    transform: scale(0.3);
    transition: opacity 0.2s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .card.on {
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 10%, var(--surf));
    transform: scale(1.04);
  }
  .card.on .tick {
    opacity: 1;
    transform: none;
  }
  .card.lit {
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 70%, transparent);
    border-color: var(--blue);
    transform: scale(1.08);
  }
  .ctl {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin: 12px 0 4px;
  }
  .tally {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 13.5px;
  }
  .tally caption {
    text-align: left;
  }
  .tally th {
    text-align: left;
    font-weight: 400;
    color: var(--tx);
    padding: 6px 8px 6px 0;
    white-space: nowrap;
  }
  .tally th :global(svg) {
    display: inline-block;
    vertical-align: middle;
  }
  .tally td {
    padding: 6px 0;
  }
  .tally .bar {
    width: 100%;
    background: linear-gradient(var(--surf3), var(--surf3)) center / 100% 8px no-repeat;
    border-radius: 99px;
    position: relative;
  }
  .fill {
    display: block;
    height: 8px;
    border-radius: 99px;
    background: var(--g);
    transform-origin: left center;
    transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .tally .sum {
    background: none;
    font-family: var(--sm);
    font-size: 11.5px;
    color: var(--dim);
    padding-left: 4px;
  }
  .num {
    text-align: right;
    width: 44px;
    font-family: var(--sm);
    font-size: 19px;
    color: var(--g);
  }
  .num b {
    display: inline-block;
  }
  .flash th,
  .flash .num {
    color: var(--blue);
  }
  .totr th,
  .totr .num {
    border-top: 1px solid var(--line2);
    font-weight: 700;
  }
  .totr.done .num {
    color: var(--g);
  }
  .defs {
    display: grid;
    gap: 7px;
    margin-top: 12px;
  }
  .def {
    text-align: left;
    padding: 9px 12px;
    border: 1px dashed var(--line2);
    border-radius: 9px;
    background: transparent;
    color: var(--dim);
    font-size: 13.5px;
    min-height: 42px;
  }
  .def b {
    color: var(--tx);
  }
  .who {
    margin-top: 16px;
  }
  .saylist {
    display: grid;
    gap: 8px;
  }
  .speech {
    text-align: left;
    padding: 11px 13px;
    border: 1.5px solid var(--line2);
    border-radius: 14px 14px 14px 4px;
    background: var(--surf3);
    color: var(--tx);
    font-size: 14.5px;
    min-height: 48px;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.25s;
  }
  .speech:active {
    transform: scale(0.98);
  }
  .speech.bad {
    border-color: var(--red);
  }
  .speech.good {
    border-color: var(--g);
  }
  .who-n {
    display: block;
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
  }
</style>
