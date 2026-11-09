<script>
  import { onMount, onDestroy } from 'svelte';
  import { slipsFromCounts, tallyGroups, frequency, toPercent, frNum, sectorAngle, clean } from '$lib/utils/freq.js';
  import { fr } from '$lib/utils/frac.js';
  import '$lib/styles/stat-viz.css';

  /* Dépouiller un questionnaire : réponses → effectifs → fréquences → graphique.
   *
   * L'élève joue le dépouillement d'un vrai questionnaire (réponses inventées) :
   * une fiche réponse s'affiche avec sa case cochée ; il TOUCHE la modalité
   * correspondante, un trait s'ajoute (traits groupés par 5) et l'effectif
   * monte. Une erreur secoue la ligne et dit où regarder. Quand toutes les
   * fiches sont comptées : effectif total (contrôle = nombre de questionnaires),
   * puis fréquences et pourcentages calculés ligne par ligne en fraction, puis
   * le diagramme — bâtons (la hauteur pousse au ressort) ou circulaire (les
   * secteurs se dessinent) selon `vd.graph`.
   *
   * Série de données = teinte unique --g ; repère de la moyenne = --blue. Aucun
   * signe ÷. Vue tableau repliable, clavier natif (boutons), mouvement réduit
   * respecté. Réponses inventées pour l'exercice (dit dans l'énoncé du cours).
   *
   * vd = { question, options:[…], counts:[…], graph:'batons'|'circulaire', unit, seed,
   *        values?:[…] (valeurs numériques des modalités, pour la moyenne), cap? } */

  let { vd } = $props();
  const OPT = vd.options;
  const COUNTS = vd.counts;
  const N = COUNTS.reduce((a, b) => a + b, 0);
  const UNIT = vd.unit || 'personnes';
  const GRAPH = vd.graph || 'batons';
  // `order` : ordre imposé des réponses (ex. les jours d'un relevé, dans l'ordre) ; sinon tirage mélangé stable.
  const slips = vd.order || slipsFromCounts(COUNTS, vd.seed || 7);
  // `only: 'tally'` : on s'arrête au tableau d'effectifs et à l'effectif total (séance qui ne parle pas encore de fréquence).
  const ONLY_TALLY = vd.only === 'tally';
  const SLIP = vd.slipLabel || 'Fiche';
  const VALUES = vd.values;
  const SHORT = vd.short || vd.options;

  let pos = $state(0);
  let counts = $state(OPT.map(() => 0));
  let phase = $state('tally'); // tally | calc | graph
  let msg = $state('');
  let shakeI = $state(-1);
  let auto = $state(false);
  let revealed = $state(0); // lignes de fréquence calculées
  let grown = $state(false);
  let reduced = false;
  let timers = [];

  let slip = $derived(slips[pos]);
  let counted = $derived(counts.reduce((a, b) => a + b, 0));
  let maxC = $derived(Math.max(...COUNTS));
  let mean = $derived(VALUES ? clean(VALUES.reduce((s, v, i) => s + v * COUNTS[i], 0) / N, 3) : null);
  let sumW = $derived(VALUES ? VALUES.reduce((s, v, i) => s + v * COUNTS[i], 0) : null);

  function answer(i) {
    if (phase !== 'tally' || auto) return;
    if (i === slip) {
      counts[i] += 1;
      msg = '';
      advance();
    } else {
      msg = vd.slipMode === 'value' ? `Relis le nombre noté pour ce jour : c’est ${OPT[slip]}.` : `Regarde la case cochée sur la fiche : c’est « ${OPT[slip]} ».`;
      shakeI = i;
      timers.push(setTimeout(() => (shakeI = -1), 450));
    }
  }
  function advance() {
    pos += 1;
    if (pos >= N) {
      timers.push(setTimeout(() => (phase = ONLY_TALLY ? 'end' : 'calc'), reduced ? 0 : 500));
    }
  }
  function autoRest() {
    auto = true;
    const left = N - pos;
    for (let k = 0; k < left; k++) {
      timers.push(
        setTimeout(() => {
          counts[slips[pos]] += 1;
          advance();
          if (k === left - 1) auto = false;
        }, reduced ? 0 : k * 55)
      );
    }
  }
  function computeAll() {
    for (let i = revealed; i < OPT.length; i++) timers.push(setTimeout(() => (revealed = i + 1), reduced ? 0 : (i - revealed) * 260));
  }
  function showGraph() {
    phase = 'graph';
    grown = false;
    timers.push(setTimeout(() => (grown = true), reduced ? 0 : 120));
  }
  function again() {
    timers.forEach(clearTimeout);
    timers = [];
    pos = 0;
    counts = OPT.map(() => 0);
    phase = 'tally';
    revealed = 0;
    grown = false;
    msg = '';
    auto = false;
  }
  onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  onDestroy(() => timers.forEach(clearTimeout));

  // diagramme circulaire (donut épais en dasharray)
  const R = 40;
  const C = 2 * Math.PI * R;
  const sectors = (() => {
    let acc = 0;
    return COUNTS.map((c) => {
      const len = (c / N) * C;
      const s = { start: acc, len, mid: ((acc + len / 2) / C) * 2 * Math.PI - Math.PI / 2 };
      acc += len;
      return s;
    });
  })();
</script>

<div class="viz sv">
  {#if !ONLY_TALLY}
    <ol class="steps" aria-label="Étapes">
      <li class:on={phase === 'tally'} class:done={phase !== 'tally'}>① Dépouiller</li>
      <li class:on={phase === 'calc'} class:done={phase === 'graph'}>② Fréquences</li>
      <li class:on={phase === 'graph'}>③ Graphique</li>
    </ol>
  {/if}

  <p class="q">{vd.question}</p>

  {#if phase === 'tally'}
    {#key pos}
    <div class="slip sv-pop" aria-live="polite">
      <div class="slip-h">{SLIP} n° {Math.min(pos + 1, N)} sur {N} {#if !vd.slipMode}<span>anonyme</span>{/if}</div>
      {#if vd.slipMode === 'value'}
        <div class="sl chk big">{vd.slipText || ''} <b>{OPT[slip]}</b> {UNIT}</div>
      {:else}
        {#each OPT as o, i}
          <div class="sl" class:chk={i === slip}>
            <span class="box" aria-hidden="true">{i === slip ? '☒' : '☐'}</span>
            {o}
          </div>
        {/each}
      {/if}
    </div>
    {/key}

    <p class="sv-h pick">{vd.slipMode === 'value' ? 'Dans quelle ligne fais-tu le trait ?' : 'Quelle réponse est cochée ?'}</p>
    <div class="sv-chips">
      {#each OPT as o, i}
        <button type="button" class="sv-chip" class:sv-shake={shakeI === i} disabled={auto} onclick={() => answer(i)}>{o}</button>
      {/each}
    </div>
    {#if msg}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{msg}</p>{/if}
    {#if pos >= 8 && !auto && pos < N}
      <div class="ctl"><button type="button" class="sv-btn gh" onclick={autoRest}>Dépouiller le reste pour moi</button></div>
    {/if}
  {/if}

  <table class="tally">
    <caption class="sv-h">Feuille de dépouillement</caption>
    <thead>
      <tr><th scope="col">Réponse</th><th scope="col">Je compte</th><th scope="col" class="r">Effectif</th></tr>
    </thead>
    <tbody>
      {#each OPT as o, i}
        <tr class:hit={shakeI === i}>
          <th scope="row">{o}</th>
          <td class="strokes" aria-hidden="true">
            {#each tallyGroups(counts[i]) as g}
              <span class="grp" class:five={g === 5}>
                {#each Array(Math.min(g, 4)) as _}<i></i>{/each}
              </span>
            {/each}
          </td>
          <td class="r num">{#key counts[i]}<b class:sv-bump={counts[i] > 0}>{counts[i]}</b>{/key}</td>
        </tr>
      {/each}
      <tr class="tot">
        <th scope="row">Effectif total</th>
        <td class="strokes sum">{counted === N ? OPT.map((_, i) => counts[i]).join(' + ') : ''}</td>
        <td class="r num">{#key counted}<b class="sv-bump">{counted}</b>{/key}</td>
      </tr>
    </tbody>
  </table>

  {#if phase === 'tally' && counted === 0}
    <p class="sv-fb">{vd.hintStart || `Chaque trait est un questionnaire. Quand tu as compté tous les questionnaires, l’effectif total doit être ${N}.`}</p>
  {/if}

  {#if phase === 'end'}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> {@html vd.endMsg || `Effectif total = <b>${N}</b>.`}</p>
    <div class="ctl"><button type="button" class="sv-btn gh" onclick={again}>Recommencer</button></div>
  {/if}

  {#if phase === 'calc' || phase === 'graph'}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Effectif total = <b>{N}</b> : c’est bien le nombre de {vd.slipMode === 'value' ? 'jours' : 'questionnaires rendus'}.</p>

    <table class="freq">
      <caption class="sv-h">Effectif, fréquence, pourcentage</caption>
      <thead><tr><th>Réponse</th><th class="r">Effectif</th><th class="r">Fréquence</th><th class="r">%</th></tr></thead>
      <tbody>
        {#each OPT as o, i}
          <tr class:shown={revealed > i}>
            <th scope="row">{o}</th>
            <td class="r">{COUNTS[i]}</td>
            <td class="r">
              {#if revealed > i}<span class="sv-pop">{@html fr(COUNTS[i], N)} = <b>{frNum(frequency(COUNTS[i], N), 2)}</b></span>{:else}<span class="dim">?</span>{/if}
            </td>
            <td class="r">{#if revealed > i}<b class="sv-pop">{frNum(toPercent(frequency(COUNTS[i], N)), 1)}&nbsp;%</b>{:else}<span class="dim">?</span>{/if}</td>
          </tr>
        {/each}
        <tr class="tot">
          <th scope="row">Total</th>
          <td class="r">{N}</td>
          <td class="r">{revealed >= OPT.length ? '1' : ''}</td>
          <td class="r">{revealed >= OPT.length ? '100 %' : ''}</td>
        </tr>
      </tbody>
    </table>
    {#if revealed < OPT.length}
      <div class="ctl">
        <button type="button" class="sv-btn p" onclick={() => (revealed = Math.min(OPT.length, revealed + 1))}>Calculer la ligne suivante</button>
        <button type="button" class="sv-btn gh" onclick={computeAll}>Tout calculer</button>
      </div>
    {:else}
      <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Les fréquences font <b>1</b>, les pourcentages font <b>100&nbsp;%</b> : le tableau est juste.</p>
      {#if mean !== null}
        <p class="sv-fb sv-pop">
          <b>Moyenne</b> : {@html fr(OPT.map((_, i) => `${VALUES[i]}×${COUNTS[i]}`).join(' + '), N)} = {@html fr(sumW, N)} = <b>{frNum(mean, 2)}</b>
          {vd.meanUnit || ''}
        </p>
      {/if}
      {#if phase === 'calc'}<div class="ctl"><button type="button" class="sv-btn p" onclick={showGraph}>Tracer le {GRAPH === 'batons' ? 'diagramme en bâtons' : 'diagramme circulaire'} →</button></div>{/if}
    {/if}
  {/if}

  {#if phase === 'graph'}
    {#if GRAPH === 'batons'}
      <svg viewBox="0 0 330 190" class="d3viz gr" role="img" aria-label={`Diagramme en bâtons : ${OPT.map((o, i) => `${o} : ${COUNTS[i]}`).join(', ')}`}>
        {#each [0, 0.25, 0.5, 0.75, 1] as f}
          <line x1="34" x2="322" y1={150 - f * 124} y2={150 - f * 124} class="grid" />
          <text x="28" y={153 - f * 124} text-anchor="end" class="tick">{Math.round(f * maxC)}</text>
        {/each}
        {#each OPT as o, i}
          {@const bx = 34 + (i + 0.5) * (288 / OPT.length)}
          {@const bwd = Math.min(36, (288 / OPT.length) * 0.62)}
          <rect class="b" x={bx - bwd / 2} y={150 - (COUNTS[i] / maxC) * 124} width={bwd} height={(COUNTS[i] / maxC) * 124} rx="4"
            style:transform={grown || reduced ? 'scaleY(1)' : 'scaleY(0)'} style:transition-delay={reduced ? '0ms' : `${i * 90}ms`} />
          <text x={bx} y={143 - (COUNTS[i] / maxC) * 124} text-anchor="middle" class="val" opacity={grown || reduced ? 1 : 0}>{COUNTS[i]}</text>
          <text x={bx} y="168" text-anchor="middle" class="tick x">{o}</text>
        {/each}
      </svg>
      <p class="cap">Un bâton par réponse : la hauteur est l’effectif.</p>
    {:else}
      <svg viewBox="0 0 330 230" class="d3viz gr" role="img" aria-label={`Diagramme circulaire : ${OPT.map((o, i) => `${o} : ${frNum(toPercent(frequency(COUNTS[i], N)), 1)} %`).join(', ')}`}>
        <g transform="translate(165 115) rotate(-90)">
          {#each sectors as s, i}
            <circle r={R} cx="0" cy="0" fill="none" stroke="var(--g)" stroke-width="76" class="sec"
              style:stroke-dasharray={grown || reduced ? `${Math.max(0, s.len - 1.4)} ${C}` : `0 ${C}`}
              style:stroke-dashoffset={-s.start}
              style:transition-delay={reduced ? '0ms' : `${i * 220}ms`} />
          {/each}
        </g>
        {#each sectors as s, i}
          <text x={165 + Math.cos(s.mid) * 62} y={115 + Math.sin(s.mid) * 62 + 4} text-anchor="middle" class="plab" opacity={grown || reduced ? 1 : 0}>{frNum(toPercent(frequency(COUNTS[i], N)), 0)}&nbsp;%</text>
        {/each}
        {#each sectors as s, i}
          <text x={165 + Math.cos(s.mid) * 104} y={115 + Math.sin(s.mid) * 100 + 3} text-anchor={Math.cos(s.mid) >= 0 ? 'start' : 'end'} class="tick x" opacity={grown || reduced ? 1 : 0}>{SHORT[i]}</text>
        {/each}
      </svg>
      <p class="cap">Le disque entier (360°) représente les {N} {UNIT}. <b>Angle d’un secteur = fréquence × 360°</b>.</p>
      <table class="freq">
        <caption class="sv-h">Les angles</caption>
        <thead><tr><th>Réponse</th><th class="r">Fréquence</th><th class="r">Angle</th></tr></thead>
        <tbody>
          {#each OPT as o, i}
            <tr><th scope="row">{o}</th><td class="r">{frNum(frequency(COUNTS[i], N), 2)}</td><td class="r"><b>{frNum(sectorAngle(COUNTS[i], N), 1)}°</b></td></tr>
          {/each}
          <tr class="tot"><th scope="row">Total</th><td class="r">1</td><td class="r">360°</td></tr>
        </tbody>
      </table>
    {/if}
    <div class="ctl"><button type="button" class="sv-btn gh" onclick={again}>Recommencer le dépouillement</button></div>
  {/if}
</div>

<style>
  .steps {
    display: flex;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0 0 12px;
    font-family: var(--sm);
    font-size: 10.5px;
  }
  .steps li {
    flex: 1;
    text-align: center;
    padding: 6px 4px;
    border-radius: 8px;
    border: 1px solid var(--line);
    color: var(--dim2);
    transition: color 0.3s, border-color 0.3s, background 0.3s;
  }
  .steps li.on {
    color: var(--tx);
    border-color: var(--g);
    background: color-mix(in srgb, var(--g) 8%, transparent);
  }
  .steps li.done {
    color: var(--g2);
    border-color: var(--g3);
  }
  .q {
    margin: 0 0 12px;
    font-size: 14.5px;
    color: var(--tx);
  }
  .slip {
    padding: 11px 14px;
    background: var(--surf);
    border: 1px solid var(--line2);
    border-radius: 6px 14px 14px 14px;
  }
  .slip-h {
    display: flex;
    justify-content: space-between;
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim);
    margin-bottom: 6px;
  }
  .sl {
    font-size: 14px;
    color: var(--dim);
    padding: 2px 0;
    transition: color 0.2s;
  }
  .sl.chk {
    color: var(--tx);
    font-weight: 700;
  }
  .sl.big {
    font-size: 17px;
    font-weight: 400;
    padding: 6px 0;
  }
  .sl.big b {
    color: var(--g);
    font-family: var(--sm);
    font-size: 22px;
  }
  .box {
    font-family: var(--sm);
    margin-right: 6px;
  }
  .pick {
    margin-top: 14px;
  }
  .ctl {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 14px;
    font-size: 13.5px;
  }
  caption {
    text-align: left;
  }
  th,
  td {
    padding: 6px 6px 6px 0;
    border-bottom: 1px solid var(--line);
    text-align: left;
    vertical-align: middle;
  }
  th[scope='row'] {
    font-weight: 400;
    color: var(--tx);
  }
  thead th {
    font-family: var(--sm);
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim2);
    font-weight: 400;
  }
  .r {
    text-align: right;
  }
  .num {
    font-family: var(--sm);
    font-size: 17px;
    color: var(--g);
    width: 56px;
  }
  .num b {
    display: inline-block;
  }
  .strokes {
    min-width: 90px;
    height: 30px;
  }
  .grp {
    display: inline-flex;
    gap: 3px;
    position: relative;
    margin-right: 7px;
    vertical-align: middle;
  }
  .grp i {
    display: inline-block;
    width: 2.5px;
    height: 18px;
    background: var(--tx);
    border-radius: 2px;
    animation: sv-pop 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .grp.five::after {
    content: '';
    position: absolute;
    left: -3px;
    right: -3px;
    top: 8px;
    height: 2.5px;
    background: var(--g);
    transform: rotate(-24deg);
    border-radius: 2px;
  }
  .sum {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
  }
  tr.hit th {
    color: var(--red);
  }
  tr.tot th,
  tr.tot td {
    border-top: 1px solid var(--line2);
    font-weight: 700;
  }
  .freq td {
    white-space: nowrap;
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
  }
  .freq b {
    color: var(--g);
  }
  .dim {
    color: var(--dim2);
  }
  .gr {
    margin-top: 14px;
  }
  .grid {
    stroke: var(--line);
  }
  .tick {
    fill: var(--dim2);
    font-family: var(--sm);
    font-size: 10px;
  }
  .tick.x {
    fill: var(--dim);
    font-size: 10.5px;
  }
  .val {
    fill: var(--tx);
    font-family: var(--sm);
    font-size: 12px;
    font-weight: 700;
    transition: opacity 0.4s 0.5s;
  }
  .b {
    fill: var(--g);
    transform-box: fill-box;
    transform-origin: 50% 100%;
    transition: transform 0.75s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .sec {
    transition: stroke-dasharray 0.9s cubic-bezier(0.34, 1.2, 0.64, 1);
  }
  .plab {
    fill: var(--bg);
    font-family: var(--sm);
    font-size: 11px;
    font-weight: 700;
    transition: opacity 0.4s 0.9s;
  }
  .cap {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--dim);
  }
  .cap b {
    color: var(--tx);
  }
  @media (prefers-reduced-motion: reduce) {
    .b,
    .sec,
    .grp i {
      transition: none;
      animation: none;
    }
  }
</style>
