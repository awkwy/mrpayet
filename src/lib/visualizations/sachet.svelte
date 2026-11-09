<script>
  import { onMount } from 'svelte';
  import { Spring } from 'svelte/motion';
  import { nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';

  /* « On contrôle un lot de pièces » : le sachet de 100 jetons (15 rouges =
   * durites défectueuses), séries de 20 tirages AVEC REMISE.
   *
   * Le sachet est d'abord opaque : l'élève ne connaît pas la proportion de
   * rouges (comme le chef d'atelier ne connaît pas le taux de défauts de la
   * caisse de 500 durites). Il tire 1 jeton à la fois (le jeton se retourne,
   * on note R ou –, il est remis) ou lance une série de 20 d'un coup. Chaque
   * série ajoute un point sur l'axe des fréquences : les points s'étalent
   * alors que le sachet est le même — c'est la fluctuation d'échantillonnage.
   * « Ouvrir le sachet » révèle la vraie proportion p = 0,15 et la pose en
   * repère.
   *
   * Complète la manipulation `fluctuation` (même idée, avec un lot « abstrait »
   * et des tailles n variables) : ici on voit le tirage pièce par pièce, avec
   * le relevé papier « Relevé des tirages ».
   *
   * Couleur : fréquences observées = --g ; repère p = --blue pointillé ;
   * jeton rouge = forme « R » sur disque plein (pas seulement une teinte). Pas
   * de --warn / --red : la couleur des jetons n'est pas un état d'alerte. */

  const TOTAL = 100;
  const RED = new Set([3, 8, 17, 22, 29, 34, 41, 47, 53, 58, 64, 71, 77, 86, 93]);
  const P = RED.size / TOTAL;
  const K = 20; // tirages par série

  let open = $state(false);
  let draws = $state([]);
  let lastDraws = $state([]);
  let series = $state([]);
  let flash = $state(-1);
  let flashRed = $state(false);
  let busy = $state(false);
  let RM = false;
  let timers = [];

  let counts = $derived(series.map((s) => s.r));
  let freqs = $derived(counts.map((r) => r / K));
  let mn = $derived(freqs.length ? Math.min(...freqs) : 0);
  let mx = $derived(freqs.length ? Math.max(...freqs) : 0);
  const SPR = { stiffness: 0.12, damping: 0.45 };
  const spMin = new Spring(0, SPR);
  const spMax = new Spring(0, SPR);
  $effect(() => {
    spMin.target = mn;
    spMax.target = mx;
  });
  const AXL = 16;
  const AXW = 328;
  const ax = (f) => AXL + f * AXW;

  onMount(() => {
    RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => timers.forEach(clearTimeout);
  });

  function drawOne() {
    const idx = Math.floor(Math.random() * TOTAL);
    const red = RED.has(idx);
    flash = idx;
    flashRed = red;
    draws = [...draws, red];
    timers.push(setTimeout(() => (flash = -1), RM ? 0 : 520));
    if (draws.length === K) {
      const r = draws.filter(Boolean).length;
      series = [...series, { r }];
      lastDraws = draws;
      draws = [];
    }
  }
  function one() {
    if (busy) return;
    drawOne();
  }
  function run(n) {
    if (busy) return;
    busy = true;
    // une série complète : on termine d'abord la série en cours
    const todo = draws.length ? K - draws.length : n;
    for (let i = 0; i < todo; i++) {
      timers.push(
        setTimeout(
          () => {
            drawOne();
            if (i === todo - 1) busy = false;
          },
          RM ? 0 : i * 130
        )
      );
    }
  }
  function reset() {
    timers.forEach(clearTimeout);
    draws = [];
    lastDraws = [];
    series = [];
    flash = -1;
    busy = false;
  }
  const shown = $derived(draws.length ? draws : lastDraws);
</script>

<div class="viz sc">
  <p class="intro">Un lot de 500 durites, remplacé ici par un <b>sachet de 100 jetons</b>. Rouge = durite défectueuse. <b>Tu ne sais pas combien il y a de rouges.</b></p>

  <div class="bag" class:open aria-label="Le sachet de 100 jetons" role="group">
    {#each Array(TOTAL) as _, i}
      <span class="tk" class:red={open && RED.has(i)} class:flash={flash === i} class:rd={flash === i && flashRed} class:gd={flash === i && !flashRed}>
        {#if (open && RED.has(i)) || (flash === i && flashRed)}R{/if}
      </span>
    {/each}
  </div>

  <div class="strip" aria-live="polite">
    <span class="sl">{draws.length ? 'Série en cours' : lastDraws.length ? 'Dernière série' : 'Tes tirages'}</span>
    <span class="seq">
      {#each Array(K) as _, i}
        <i class:r={shown[i] === true} class:g={shown[i] === false} class:e={shown[i] === undefined}>{shown[i] === true ? 'R' : shown[i] === false ? '–' : '·'}</i>
      {/each}
    </span>
  </div>

  <div class="vctl">
    <button class="p" onclick={one} disabled={busy}>Tirer 1 jeton</button>
    <button class="p" onclick={() => run(K)} disabled={busy}>Série de 20 tirages</button>
    <button class="gh" onclick={() => (open = !open)}>{open ? 'Refermer le sachet' : 'Ouvrir le sachet'}</button>
    <button class="gh" onclick={reset}>Recommencer</button>
  </div>
  <p class="note">Chaque jeton tiré est remis dans le sachet avant le tirage suivant (tirage avec remise).</p>

  <svg class="d3viz plot" viewBox="0 0 360 104" role="img" aria-label="Fréquences de rouges de chaque série de 20 tirages, sur l'axe de 0 à 1">
    <line x1={AXL} x2={AXL + AXW} y1="64" y2="64" stroke="var(--line2)" />
    {#each [0, 0.25, 0.5, 0.75, 1] as t}
      <line x1={ax(t)} x2={ax(t)} y1="64" y2="69" stroke="var(--line2)" />
      <text x={ax(t)} y="82" text-anchor="middle" fill="var(--dim2)" font-size="10" font-family="var(--sm)">{nf(t)}</text>
    {/each}
    {#if open}
      <line x1={ax(P)} x2={ax(P)} y1="16" y2="64" stroke="var(--blue)" stroke-width="2" stroke-dasharray="5 4" class="in" />
      <text x={ax(P)} y="11" text-anchor="middle" fill="var(--blue)" font-size="10.5" font-weight="bold" font-family="var(--sm)">p = {nf(P)}</text>
    {/if}
    {#if series.length > 1}
      <line x1={ax(spMin.current)} x2={ax(spMax.current)} y1="72" y2="72" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" />
    {/if}
    {#each freqs as f, i}
      {@const same = freqs.slice(0, i).filter((g) => g === f).length}
      <circle class="in" cx={ax(f)} cy={55 - same * 8.5} r="4.2" fill="var(--g)" stroke="var(--surf)" stroke-width="1.4"><title>Série {i + 1} : {counts[i]} rouges sur {K}, fréquence {nf(f)}</title></circle>
    {/each}
    <text x={AXL + AXW} y="100" text-anchor="end" fill="var(--dim2)" font-size="10" font-family="var(--sm)">fréquence de rouges</text>
  </svg>

  {#if series.length}
    <div class="tw">
      <table>
        <thead><tr><th>Série</th>{#each series as _, i}<th>{i + 1}</th>{/each}</tr></thead>
        <tbody>
          <tr><th>Rouges</th>{#each counts as c}<td>{c}</td>{/each}</tr>
          <tr><th>Fréquence</th>{#each counts as c}<td>{@html frac(c, K)}<br /><small>{nf(c / K)}</small></td>{/each}</tr>
          <tr><th>En %</th>{#each counts as c}<td>{nf(Math.round((c / K) * 100))} %</td>{/each}</tr>
        </tbody>
      </table>
    </div>
  {/if}

  <p class="say" aria-live="polite">
    {#if !series.length}
      Tire une série de 20 jetons. Note combien sont rouges, puis recommence : le sachet est le même, les séries le seront-elles ?
    {:else if series.length === 1}
      Série 1 : <b>{counts[0]}</b> rouges sur {K}, soit {@html frac(counts[0], K)} = <b>{nf(freqs[0])}</b> ({nf(Math.round(freqs[0] * 100))} %). Refais une série.
    {:else}
      Tes fréquences vont de <b>{nf(Math.round(mn * 100))} %</b> à <b>{nf(Math.round(mx * 100))} %</b> avec <b>le même sachet</b> : elles sont différentes. C'est la <b>fluctuation d'échantillonnage</b>.
      {#if open}La vraie proportion de rouges est <b>{nf(Math.round(P * 100))} %</b> ({RED.size} jetons sur {TOTAL}).{:else}Ouvre le sachet pour voir la vraie proportion.{/if}
    {/if}
  </p>
</div>

<style>
  .intro {
    margin: 0 0 10px;
    color: var(--dim);
    font-size: 14.5px;
  }
  .bag {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 4px;
    padding: 8px;
    border: 1px dashed var(--line2);
    border-radius: 12px;
    background: color-mix(in srgb, var(--bg) 55%, transparent);
  }
  .tk {
    aspect-ratio: 1;
    border-radius: 50%;
    border: 1.5px solid var(--line2);
    background: var(--surf3);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--sm);
    font-size: 10px;
    font-weight: 700;
    color: var(--bg);
    transition:
      transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1),
      background 0.5s,
      border-color 0.5s;
  }
  .tk.red {
    background: var(--g);
    border-color: var(--g);
  }
  .tk.flash {
    transform: scale(1.7);
    z-index: 2;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--blue) 45%, transparent);
  }
  .tk.rd {
    background: var(--g);
    border-color: var(--g);
  }
  .tk.gd {
    background: var(--surf);
    border-color: var(--blue);
  }
  .strip {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
    flex-wrap: wrap;
  }
  .sl {
    font-family: var(--sm);
    font-size: 10.5px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--dim2);
  }
  .seq {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 2px;
  }
  .seq i {
    width: 21px;
    height: 24px;
    border-radius: 5px;
    border: 1px solid var(--line);
    font-style: normal;
    font-family: var(--sm);
    font-size: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--dim2);
    transition: background 0.3s;
  }
  .seq i.r {
    background: var(--g);
    color: var(--bg);
    border-color: var(--g);
    font-weight: 700;
  }
  .seq i.g {
    color: var(--dim);
  }
  .note {
    margin: 6px 0 0;
    font-size: 12.5px;
    color: var(--dim2);
  }
  .plot {
    margin-top: 10px;
  }
  .in {
    transform-box: fill-box;
    transform-origin: center;
    animation: pin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes pin {
    from {
      transform: scale(0);
    }
  }
  .tw {
    overflow-x: auto;
    margin-top: 8px;
  }
  table {
    border-collapse: collapse;
    font-size: 12.5px;
    min-width: 100%;
  }
  th,
  td {
    border: 1px solid var(--line);
    padding: 4px 8px;
    text-align: center;
    font-variant-numeric: tabular-nums;
  }
  th {
    color: var(--dim2);
    font-weight: 400;
    font-family: var(--sm);
    font-size: 10.5px;
    text-align: left;
  }
  small {
    color: var(--dim2);
  }
</style>
