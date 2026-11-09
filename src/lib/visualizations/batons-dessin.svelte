<script>
  import { Tween } from 'svelte/motion';
  import { backOut } from 'svelte/easing';
  import { onMount, onDestroy } from 'svelte';
  import '$lib/styles/stat-viz.css';

  /* « Je dessine les bâtons » — la hauteur d'un bâton est l'effectif.
   *
   * L'élève dessine lui-même le diagramme en bâtons de la série : il TOUCHE
   * (ou fait glisser, ou règle au clavier) la hauteur de chaque bâton sur la
   * grille ; les bâtons montent au ressort. Vérification au fil de l'eau : un
   * bâton juste reçoit son ✓ au lâcher, un bâton faux garde une consigne qui
   * renvoie au tableau sans donner la valeur. Quand les cinq sont justes, la
   * limite d'un agent (15 personnes) se trace et les bâtons au-dessus
   * s'allument : on peut compter les jours à plus de 15.
   *
   * Axe horizontal numérique (9 à 19) comme sur la fiche. Série de données =
   * teinte unique --g ; repère de la limite = accent --blue. Accessibilité :
   * chaque bâton est un role="slider" (flèches haut/bas), vue tableau
   * repliable, mouvement réduit respecté. Nombres inventés pour l'exercice. */

  let { vd } = $props();
  const VALUES = vd?.values || [10, 12, 14, 16, 18];
  const EFFS = vd?.effs || [2, 4, 2, 1, 1];
  const YMAX = vd?.ymax || 5;
  const XMIN = vd?.xmin ?? 9;
  const XMAX = vd?.xmax ?? 19;
  const LIMIT = vd?.limit ?? 15;
  const XLAB = vd?.xlabel || 'nombre de personnes';
  const YLAB = vd?.ylabel || 'jours';

  const W = 330;
  const H = 230;
  const L = 36;
  const R = W - 10;
  const AX = H - 44;
  const TOP = 14;
  const unit = (AX - TOP) / YMAX;
  const x = (v) => L + ((v - XMIN) / (XMAX - XMIN)) * (R - L);
  const bw = 17;

  let reduced = false;
  let timers = [];
  let svg;
  let drag = -1;
  let heights = VALUES.map(() => new Tween(0, { duration: 380, easing: backOut }));
  let target = $state(VALUES.map(() => 0)); // hauteur entière choisie
  let mark = $state(VALUES.map(() => null)); // 'ok' | 'no' | null
  let hint = $state(VALUES.map(() => ''));

  let allOk = $derived(mark.every((m) => m === 'ok'));
  let above = $derived(VALUES.map((v) => v > LIMIT));

  function setH(i, h) {
    const c = Math.max(0, Math.min(YMAX, Math.round(h)));
    if (c === target[i]) return;
    target[i] = c;
    mark[i] = null;
    hint[i] = '';
    heights[i].set(c, { duration: reduced ? 0 : 380 });
  }
  function yToH(e) {
    const r = svg.getBoundingClientRect();
    const vy = ((e.clientY - r.top) / r.height) * H;
    return (AX - vy) / unit;
  }
  function down(i, e) {
    drag = i;
    e.currentTarget.setPointerCapture(e.pointerId);
    setH(i, yToH(e));
  }
  function move(i, e) {
    if (drag === i) setH(i, yToH(e));
  }
  function up(i) {
    if (drag !== i) return;
    drag = -1;
    verify(i);
  }
  function key(i, e) {
    const d = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (d !== undefined) {
      e.preventDefault();
      setH(i, target[i] + d);
      verify(i);
    }
  }
  function verify(i) {
    if (target[i] === 0) return;
    if (target[i] === EFFS[i]) {
      mark[i] = 'ok';
      hint[i] = '';
    } else {
      mark[i] = 'no';
      hint[i] = `Le bâton du ${VALUES[i]} : combien de ${YLAB} pour ${VALUES[i]} ${vd?.unit || 'personnes'} ? Relis ton tableau.`;
    }
  }
  function reset() {
    VALUES.forEach((_, i) => {
      target[i] = 0;
      mark[i] = null;
      hint[i] = '';
      heights[i].set(0, { duration: reduced ? 0 : 300 });
    });
  }
  function showAnswer() {
    VALUES.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          target[i] = EFFS[i];
          mark[i] = 'ok';
          heights[i].set(EFFS[i], { duration: reduced ? 0 : 500 });
        }, i * 140)
      );
    });
  }
  onMount(() => (reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches));
  onDestroy(() => timers.forEach(clearTimeout));

  const firstHint = $derived(hint.find((h) => h));
</script>

<div class="viz sv">
  <p class="sv-h">Un bâton par valeur ({XLAB}) : la hauteur est l’effectif ({YLAB})</p>

  <svg bind:this={svg} viewBox="0 0 {W} {H}" class="d3viz chart" role="group" aria-label={`Zone de dessin : ${VALUES.length} bâtons à régler`}>
    {#each Array.from({ length: YMAX + 1 }, (_, k) => k) as k}
      <line x1={L} x2={R} y1={AX - k * unit} y2={AX - k * unit} class="grid" />
      <text x={L - 7} y={AX - k * unit + 3.5} text-anchor="end" class="tick">{k}</text>
    {/each}
    <text x={L} y="9" class="ax">{YLAB}</text>

    {#each Array.from({ length: XMAX - XMIN + 1 }, (_, k) => XMIN + k) as v}
      <text x={x(v)} y={AX + 15} text-anchor="middle" class="tick x" class:use={VALUES.includes(v)}>{v}</text>
    {/each}
    <text x={R} y={H - 6} text-anchor="end" class="ax">{XLAB}</text>

    {#if allOk}
      <g class="limit">
        <line x1={x(LIMIT)} x2={x(LIMIT)} y1={TOP - 4} y2={AX} />
        <text x={x(LIMIT) + 4} y={TOP + 6}>limite : {LIMIT}</text>
      </g>
    {/if}

    {#each VALUES as v, i}
      <g class="col">
        <rect
          class="bar"
          class:above={allOk && above[i]}
          x={x(v) - bw / 2}
          y={AX - heights[i].current * unit}
          width={bw}
          height={Math.max(0, heights[i].current * unit)}
          rx="4"
        />
        {#if mark[i]}
          <text x={x(v)} y={Math.max(TOP + 8, AX - heights[i].current * unit - 6)} text-anchor="middle" class={`mk ${mark[i]}`}>{mark[i] === 'ok' ? '✓' : '✕'}</text>
        {/if}
        <rect
          class="zone"
          x={x(v) - 15}
          y={TOP - 4}
          width="30"
          height={AX - TOP + 6}
          tabindex="0"
          role="slider"
          aria-label={`Bâton du ${v}`}
          aria-orientation="vertical"
          aria-valuemin="0"
          aria-valuemax={YMAX}
          aria-valuenow={target[i]}
          onpointerdown={(e) => down(i, e)}
          onpointermove={(e) => move(i, e)}
          onpointerup={() => up(i)}
          onpointercancel={() => up(i)}
          onkeydown={(e) => key(i, e)}
        />
      </g>
    {/each}
  </svg>

  {#if allOk}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Les cinq bâtons sont justes : hauteurs <b>{EFFS.join(', ')}</b>. La ligne bleue est la limite d’un agent ({LIMIT} personnes) : repère les bâtons à sa droite.</p>
  {:else if firstHint}
    <p class="sv-fb no sv-pop"><span class="ic">✕</span>{firstHint}</p>
  {:else}
    <p class="sv-fb">Touche la grille au-dessus de chaque nombre pour fixer la hauteur du bâton, ou fais-le glisser.</p>
  {/if}

  <div class="ctl">
    <button type="button" class="sv-btn gh" onclick={reset}>Effacer</button>
    <button type="button" class="sv-btn gh" onclick={showAnswer}>Me montrer les bâtons</button>
  </div>

  <details class="viz-data">
    <summary>Voir le tableau</summary>
    <table>
      <caption>Effectif de chaque valeur</caption>
      <thead><tr><th>{XLAB}</th><th>effectif ({YLAB})</th></tr></thead>
      <tbody>{#each VALUES as v, i}<tr><td>{v}</td><td>{EFFS[i]}</td></tr>{/each}</tbody>
    </table>
  </details>
</div>

<style>
  .chart {
    touch-action: none;
  }
  .grid {
    stroke: var(--line);
    stroke-width: 1;
  }
  .tick {
    fill: var(--dim2);
    font-family: var(--sm);
    font-size: 10px;
  }
  .tick.x.use {
    fill: var(--tx);
    font-weight: 700;
  }
  .ax {
    fill: var(--dim);
    font-family: var(--sm);
    font-size: 10px;
  }
  .bar {
    fill: var(--g);
    transition: fill 0.35s;
  }
  .bar.above {
    fill: var(--blue);
  }
  .zone {
    fill: transparent;
    cursor: ns-resize;
  }
  .zone:focus-visible {
    stroke: var(--g);
    stroke-width: 2;
    rx: 6;
  }
  .mk {
    font-family: var(--sm);
    font-size: 13px;
    font-weight: 700;
    animation: sv-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .mk.ok {
    fill: var(--g);
  }
  .mk.no {
    fill: var(--red);
  }
  .limit line {
    stroke: var(--blue);
    stroke-width: 1.6;
    stroke-dasharray: 5 4;
    animation: draw 0.8s ease-out both;
  }
  .limit text {
    fill: var(--blue);
    font-family: var(--sm);
    font-size: 10px;
  }
  @keyframes draw {
    from {
      stroke-dashoffset: 120;
      opacity: 0;
    }
    to {
      stroke-dashoffset: 0;
      opacity: 1;
    }
  }
  .ctl {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 12px;
  }
  @media (prefers-reduced-motion: reduce) {
    .limit line,
    .mk {
      animation: none;
    }
  }
</style>
