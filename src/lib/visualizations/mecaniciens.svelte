<script>
  import { onMount } from 'svelte';
  import { Spring } from 'svelte/motion';
  import { nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';

  /* Six mécaniciens, 10 bougies chacun, tirées AVEC REMISE dans le bac
   * (6 usées sur 20 : P = 0,3). Fluctuation d'échantillonnage, puis
   * stabilisation quand on regroupe et qu'on ajoute des tirages.
   *
   * 1. Relevé de la classe (2, 4, 3, 5, 3 et 2 usées) : six lignes de 10
   *    pastilles ○ / ✕ ; la fréquence de chacun est un nuage de points sur
   *    l'axe 0 → 1 avec le repère p = 0,3 et l'étendue des fréquences.
   * 2. « Rejouer » refait les 60 tirages au hasard : les pastilles se
   *    retournent en cascade, les points glissent en ressort.
   * 3. « Regrouper » : 60 tirages d'un coup, fréquence 19 sur 60 ≈ 0,32 pour
   *    le relevé de la classe — plus proche de 0,3 qu'aucun mécanicien seul.
   * 4. « Ajouter des tirages » : la fréquence cumulée trace sa courbe sur une
   *    échelle logarithmique du nombre de tirages et se resserre autour de p.
   *
   * Couleur : fréquences observées = --g ; repère théorique p = --blue
   * pointillé ; fréquence regroupée = --g cerclée --tx. Pas de --warn/--red.
   * Les pastilles ont une forme (○ neuve, ✕ usée), pas seulement une couleur. */

  const P = 0.3;
  const NAMES = ['Madi', 'Soilihi', 'Anzali', 'Fatima', 'Ali', 'Nadia'];
  const KLASS = [2, 4, 3, 5, 3, 2];
  const ORDER = [1, 4, 7, 2, 9, 5, 0, 8, 3, 6];
  const preset = () => KLASS.map((k) => Array.from({ length: 10 }, (_, i) => ORDER.slice(0, k).includes(i)));

  let rows = $state(preset());
  let gen = $state(0); // incrémenté pour rejouer l'animation des pastilles
  let pooled = $state(false);
  let hist = $state([]);
  let RM = false;
  let timers = [];
  let isClass = $state(true);

  let counts = $derived(rows.map((r) => r.filter(Boolean).length));
  let freqs = $derived(counts.map((c) => c / 10));
  let total = $derived(counts.reduce((a, b) => a + b, 0));
  let fMin = $derived(Math.min(...freqs));
  let fMax = $derived(Math.max(...freqs));
  let pf = $derived(total / 60);
  let nearest = $derived(Math.max(...freqs.map((f) => Math.abs(f - P))));

  // positions animées en ressort (les points glissent, ils ne sautent pas)
  const SP = { stiffness: 0.1, damping: 0.42 };
  const fs = NAMES.map((_, i) => new Spring(KLASS[i] / 10, SP));
  const sMin = new Spring(0.2, SP);
  const sMax = new Spring(0.5, SP);
  const sPool = new Spring(19 / 60, SP);
  $effect(() => {
    const f = freqs;
    f.forEach((v, i) => {
      fs[i].target = v;
    });
    sMin.target = fMin;
    sMax.target = fMax;
    sPool.target = pf;
  });

  // courbe de stabilisation
  const CW = 360;
  const CH = 176;
  const CL = 34;
  const CR = CW - 12;
  const D0 = 1.5;
  const D1 = 5;
  const cx = (n) => CL + ((Math.log10(Math.max(10, n)) - D0) / (D1 - D0)) * (CR - CL);
  // ordonnées : de 0,1 à 0,5 (la zone utile autour de p = 0,3), bornées pour rester visibles
  const cy = (f) => CH - 36 - (Math.max(0.1, Math.min(0.5, f)) - 0.1) * ((CH - 36 - 12) / 0.4);
  let path = $derived(hist.map((h, i) => `${i ? 'L' : 'M'}${cx(h.n).toFixed(1)},${cy(h.f).toFixed(1)}`).join(' '));
  let last = $derived(hist.length ? hist[hist.length - 1] : null);

  onMount(() => {
    RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => timers.forEach(clearTimeout);
  });

  function replay() {
    timers.forEach(clearTimeout);
    isClass = false;
    pooled = false;
    hist = [];
    const next = rows.map(() => Array.from({ length: 10 }, () => Math.random() < P));
    rows = rows.map((r) => r.map(() => false));
    gen += 1;
    next.forEach((r, ri) => {
      timers.push(
        setTimeout(
          () => {
            rows[ri] = r;
          },
          RM ? 0 : ri * 220
        )
      );
    });
  }
  function back() {
    timers.forEach(clearTimeout);
    rows = preset();
    gen += 1;
    isClass = true;
    pooled = false;
    hist = [];
  }
  function pool() {
    pooled = true;
    if (!hist.length) hist = [{ n: 60, k: total, f: total / 60 }];
  }
  function add(m) {
    if (!pooled) pool();
    const h = hist[hist.length - 1];
    let k = 0;
    for (let i = 0; i < m; i++) if (Math.random() < P) k++;
    const n2 = h.n + m;
    const k2 = h.k + k;
    hist = [...hist, { n: n2, k: k2, f: k2 / n2 }];
  }
</script>

<div class="viz mc">
  <p class="intro">Le bac a toujours 6 bougies usées sur 20 : <b>P = 0,3</b>. Six mécaniciens tirent chacun <b>10 bougies avec remise</b> et comptent les usées.</p>

  <div class="tab" role="table" aria-label="Relevé des six mécaniciens">
    {#each NAMES as nm, ri}
      <div class="line" role="row">
        <span class="who" role="cell">{nm}</span>
        <span class="dots" role="cell" aria-label="{counts[ri]} bougies usées sur 10">
          {#key gen}
            {#each rows[ri] as u, ci}
              <i class="d" class:u style="animation-delay:{RM ? 0 : (ri * 10 + ci) * 6}ms">{u ? '✕' : '○'}</i>
            {/each}
          {/key}
        </span>
        <span class="cnt" role="cell"><b>{counts[ri]}</b> sur 10 = {nf(freqs[ri])}</span>
      </div>
    {/each}
  </div>

  <svg class="d3viz plot" viewBox="0 0 360 96" role="img" aria-label="Fréquences des six mécaniciens sur l'axe de 0 à 1, repère p = 0,3">
    <line x1="18" x2="342" y1="58" y2="58" stroke="var(--line2)" />
    {#each [0, 0.2, 0.4, 0.6, 0.8, 1] as t}
      <line x1={18 + t * 324} x2={18 + t * 324} y1="58" y2="63" stroke="var(--line2)" />
      <text x={18 + t * 324} y="76" text-anchor="middle" fill="var(--dim2)" font-size="10" font-family="var(--sm)">{nf(t)}</text>
    {/each}
    <line x1={18 + P * 324} x2={18 + P * 324} y1="14" y2="58" stroke="var(--blue)" stroke-width="2" stroke-dasharray="5 4" />
    <text x={18 + P * 324} y="10" text-anchor="middle" fill="var(--blue)" font-size="10.5" font-weight="bold" font-family="var(--sm)">p = 0,3</text>
    <line x1={18 + sMin.current * 324} x2={18 + sMax.current * 324} y1="66" y2="66" stroke="var(--blue)" stroke-width="2" stroke-linecap="round" />
    {#each freqs as f, i}
      {@const same = freqs.slice(0, i).filter((g) => g === f).length}
      <circle cx={18 + fs[i].current * 324} cy={50 - same * 9} r="4.4" fill="var(--g)" stroke="var(--surf)" stroke-width="1.5"><title>{NAMES[i]} : {nf(f)}</title></circle>
    {/each}
    {#if pooled}
      <circle class="in" cx={18 + sPool.current * 324} cy="30" r="7" fill="var(--g)" stroke="var(--tx)" stroke-width="2"><title>60 tirages regroupés : {nf(+pf.toFixed(2))}</title></circle>
      <text x={18 + sPool.current * 324 + 11} y="34" fill="var(--g)" font-size="10" font-weight="bold" font-family="var(--sm)">les 60 tirages</text>
    {/if}
  </svg>

  <p class="say" aria-live="polite">
    Les fréquences vont de <b>{nf(fMin)}</b> à <b>{nf(fMax)}</b> : étendue <b>{nf(+(fMax - fMin).toFixed(2))}</b>, alors que le bac n'a pas changé.
    {#if isClass}Ce sont les relevés de la classe.{:else}Ce sont des tirages simulés : rejoue, ils changent.{/if}
    {#if pooled}
      <br />Regroupés : <b>{total}</b> usées sur 60 tirages, {@html frac(total, 60)} ≈ <b>{nf(+pf.toFixed(2))}</b>, {Math.abs(pf - P) <= nearest ? 'plus proche de 0,3 que le mécanicien le plus éloigné' : 'proche de 0,3'} (l'écart le plus grand d'un mécanicien seul est <b>{nf(+nearest.toFixed(2))}</b>).
    {/if}
  </p>

  <div class="vctl">
    <button class="p" onclick={replay}>Rejouer les tirages</button>
    <button class="gh" onclick={back}>Relevé de la classe</button>
    <button class="gh" onclick={pool}>Regrouper les 60 tirages</button>
  </div>

  {#if pooled}
    <h4 class="sub">Et si on ajoutait des tirages ?</h4>
    <svg class="d3viz chart" viewBox="0 0 {CW} {CH}" role="img" aria-label="Fréquence cumulée des bougies usées selon le nombre de tirages">
      <line x1={CL} x2={CR} y1={CH - 36} y2={CH - 36} stroke="var(--line2)" />
      {#each [0.1, 0.3, 0.5] as f}
        <text x={CL - 5} y={cy(f) + 3.5} text-anchor="end" fill="var(--dim2)" font-size="10" font-family="var(--sm)">{nf(f)}</text>
        <line x1={CL} x2={CR} y1={cy(f)} y2={cy(f)} stroke="var(--line)" stroke-width="0.7" />
      {/each}
      {#each [100, 1000, 10000, 100000] as n}
        <text x={cx(n)} y={CH - 22} text-anchor={n === 100000 ? 'end' : 'middle'} fill="var(--dim2)" font-size="10" font-family="var(--sm)">{nf(n)}</text>
      {/each}
      <text x={CR} y={CH - 6} text-anchor="end" fill="var(--dim2)" font-size="10" font-family="var(--sm)">nombre de tirages (échelle ×10)</text>
      <line x1={CL} x2={CR} y1={cy(P)} y2={cy(P)} stroke="var(--blue)" stroke-width="2" stroke-dasharray="5 4" />
      <path d={path} fill="none" stroke="var(--g)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" class="trace" />
      {#each hist as h}
        <circle class="in" cx={cx(h.n)} cy={cy(h.f)} r="3.6" fill="var(--g)" stroke="var(--surf)" stroke-width="1.4"><title>{nf(h.n)} tirages : {nf(+h.f.toFixed(3))}</title></circle>
      {/each}
    </svg>
    <p class="say" aria-live="polite">
      {#if last}Après <b>{nf(last.n)}</b> tirages : {@html frac(nf(last.k), nf(last.n))} ≈ <b>{nf(+last.f.toFixed(3))}</b>. Plus on tire, plus la fréquence se rapproche de <b>0,3</b> : elle <b>se stabilise</b>.{/if}
    </p>
    <div class="vctl">
      <button class="p" onclick={() => add(60)}>+ 60 tirages</button>
      <button class="p" onclick={() => add(600)}>+ 600</button>
      <button class="p" onclick={() => add(6000)}>+ 6 000</button>
      <button class="gh" onclick={() => (hist = [{ n: 60, k: total, f: total / 60 }])}>Repartir de 60</button>
    </div>
  {/if}
</div>

<style>
  .intro {
    margin: 0 0 10px;
    color: var(--dim);
    font-size: 14.5px;
  }
  .tab {
    display: grid;
    gap: 4px;
  }
  .line {
    display: grid;
    grid-template-columns: 3.9em auto 1fr;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }
  .who {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--tx);
  }
  .dots {
    display: inline-flex;
    gap: 1px;
  }
  .d {
    display: inline-block;
    width: 15px;
    text-align: center;
    font-style: normal;
    font-size: 12.5px;
    color: var(--g);
    animation: flip 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  .d.u {
    color: var(--dim);
    font-weight: 700;
  }
  @keyframes flip {
    from {
      transform: scale(0.2) rotate(-60deg);
      opacity: 0;
    }
  }
  .cnt {
    font-size: 11.5px;
    color: var(--dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .cnt b {
    color: var(--g);
    font-family: var(--sm);
  }
  .plot,
  .chart {
    margin-top: 12px;
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
  .sub {
    font-family: var(--sm);
    font-size: 12px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--g2);
    margin: 18px 0 4px;
  }
</style>
