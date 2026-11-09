<script>
  import { onMount } from 'svelte';
  import { nf } from '$lib/utils/stats-mv.js';
  import { frac } from '$lib/utils/fr.js';

  /* Convertisseurs du garage de Kahani : heures ⇄ minutes, puis cm³ ⇄ cL ⇄ L ⇄ m³.
   *
   * 1. Forme  : une règle graduée horizontale que l'on fait glisser (poignée à
   *    tirer ou touches fléchées). Mode « temps » : règle linéaire 0 – 2,5 h,
   *    repères tous les quarts d'heure. Mode « volumes » : règle LOGARITHMIQUE
   *    de 1 cm³ à 100 000 L, parce que de la cylindrée du scooter à la citerne
   *    on passe de 50 cm³ à 20 000 L ; des repères familiers (canette, bouteille,
   *    bidon, plein, citerne) donnent l'ordre de grandeur.
   * 2. Couleur : valeur choisie = --g ; unité de départ mise en avant --blue ;
   *    repères d'objets = --dim. Jamais --warn / --red.
   * 3. Mouvement : la poignée et les nombres suivent par ressort (Spring) ;
   *    les valeurs des quatre unités se mettent à jour en glissant, jamais en
   *    sautant. Mouvement réduit : valeurs posées sans animation.
   * 4. Accessibilité : la poignée est un slider (role="slider", flèches,
   *    Début/Fin), les valeurs sont écrites en toutes lettres, la
   *    multiplication / division est annoncée par une fraction typographique
   *    (jamais « ÷ ») ;  les objets de comparaison sont des boutons. */

  let { vd } = $props();

  const TIME_PRESETS = [
    ['Vidange du scooter', 0.3],
    ['Plaquettes de la moto', 0.8],
    ['Vidange de la voiture', 0.4],
    ['Courroie de la voiture', 1.5],
    ['Révision du pick-up', 2.25],
    ["Piège : 1,3 h", 1.3]
  ];
  // volumes, exprimés en cm³ (unité de base)
  const UNITS = [
    { u: 'cm³', f: 1 },
    { u: 'cL', f: 10 },
    { u: 'L', f: 1000 },
    { u: 'm³', f: 1e6 }
  ];
  const VOL_PRESETS = [
    ['Scooter 50 cm³', 50],
    ['Moto 125 cm³', 125],
    ['Voiture 1 500 cm³', 1500],
    ['Pick-up 2 400 cm³', 2400],
    ['Canette 33 cL', 330],
    ['Bouteille 1,5 L', 1500],
    ['Bidon 5 L', 5000],
    ['Plein 40 L', 40000],
    ['Citerne 20 m³', 2e7]
  ];

  let mode = $state(vd?.mode ?? 'time');
  let hours = $state(0.3);
  let vol = $state(50); // en cm³
  let from = $state(0); // index de l'unité de départ
  let shownH = $state(0.3);
  let shownV = $state(50);
  let trackW = $state(300);
  let dragging = $state(false);
  let RM = false;

  const HMAX = 2.5;
  const VMIN = 0; // log10(cm³)
  const VMAX = 8; // 100 000 L
  const posT = (h) => Math.max(0, Math.min(1, h / HMAX));
  const posV = (cm3) => Math.max(0, Math.min(1, (Math.log10(Math.max(1, cm3)) - VMIN) / (VMAX - VMIN)));
  let pos = $derived(mode === 'time' ? posT(shownH) : posV(shownV));

  // ressort sur les valeurs affichées
  let raf = 0;
  let vH = 0;
  let vV = 0;
  function animate() {
    cancelAnimationFrame(raf);
    if (RM) {
      shownH = hours;
      shownV = vol;
      return;
    }
    let last = performance.now();
    const step = (t) => {
      const dt = Math.min(0.04, (t - last) / 1000);
      last = t;
      const k = 190;
      const d = 22;
      vH += (-k * (shownH - hours) - d * vH) * dt;
      shownH += vH * dt;
      // volumes : le ressort travaille sur le logarithme (mouvement régulier sur la règle)
      const lg = Math.log10(Math.max(1e-6, shownV));
      const lt = Math.log10(Math.max(1e-6, vol));
      vV += (-k * (lg - lt) - d * vV) * dt;
      shownV = 10 ** (lg + vV * dt);
      const settled = Math.abs(shownH - hours) < 1e-4 && Math.abs(vH) < 1e-3 && Math.abs(Math.log10(shownV) - lt) < 1e-4 && Math.abs(vV) < 1e-3;
      if (settled) {
        shownH = hours;
        shownV = vol;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  onMount(() => {
    RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return () => cancelAnimationFrame(raf);
  });

  function setHours(h) {
    hours = Math.max(0, Math.min(HMAX, Math.round(h * 100) / 100));
    animate();
  }
  function round2sig(v) {
    const e = Math.floor(Math.log10(v));
    const m = 10 ** (e - 1);
    return Math.round(v / m) * m;
  }
  function setVol(v) {
    vol = Math.max(1, Math.min(1e8, round2sig(v)));
    animate();
  }
  function fromPointer(ev, el) {
    const r = el.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
    if (mode === 'time') setHours(Math.round((p * HMAX) / 0.05) * 0.05);
    else setVol(10 ** (VMIN + p * (VMAX - VMIN)));
  }
  function down(ev) {
    dragging = true;
    ev.currentTarget.setPointerCapture(ev.pointerId);
    fromPointer(ev, ev.currentTarget);
  }
  function move(ev) {
    if (dragging) fromPointer(ev, ev.currentTarget);
  }
  function up() {
    dragging = false;
  }
  function key(ev) {
    const big = ev.shiftKey;
    let dir = 0;
    if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') dir = 1;
    else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') dir = -1;
    else return;
    ev.preventDefault();
    if (mode === 'time') setHours(hours + dir * (big ? 0.25 : 0.05));
    else setVol(vol * (dir > 0 ? (big ? 10 : 1.25) : big ? 0.1 : 0.8));
  }

  // lecture « h min »
  let hm = $derived.by(() => {
    const m = Math.round(shownH * 60);
    return { h: Math.floor(m / 60), m: m % 60, tot: m };
  });
  let targetMin = $derived(Math.round(hours * 60));
  const fmtH = (h) => nf(+h.toFixed(2));
  const fmtVol = (cm3, i) => {
    const x = cm3 / UNITS[i].f;
    if (x >= 1000) return nf(Math.round(x));
    if (x >= 10) return nf(+x.toFixed(1));
    if (x >= 1) return nf(+x.toFixed(2));
    if (x >= 0.01) return nf(+x.toFixed(3));
    return nf(+x.toPrecision(2));
  };
  const exact = (cm3, i) => {
    // valeur exacte « propre » pour l'annonce (on évite les artefacts de ressort)
    const x = cm3 / UNITS[i].f;
    return Number.isInteger(x * 1e6) ? nf(+x.toFixed(6)) : nf(+x.toPrecision(4));
  };

  let rule = $derived.by(() => {
    const f = UNITS[from];
    // règle illustrative de l'unité de départ vers L
    if (f.u === 'L') return `1 L = 100 cL = 1 000 cm³. Vers cL : multiplier par 100. Vers m³ : diviser par 1 000, soit ${frac('V', '1 000')}.`;
    if (f.u === 'cL') return `1 cL = 10 cm³. Vers cm³ : multiplier par 10. Vers L : diviser par 100, soit ${frac('V', 100)}.`;
    if (f.u === 'cm³') return `cm³ → cL : diviser par 10, soit ${frac('V', 10)}. cm³ → L : diviser par 1 000, soit ${frac('V', '1 000')}.`;
    return `1 m³ = 1 000 L. Vers L : multiplier par 1 000. Vers cm³ : multiplier par 1 000 000.`;
  });

  const REFS = [
    ['canette', 330],
    ['bouteille', 1500],
    ['bidon', 5000],
    ['plein', 40000],
    ['citerne', 2e7]
  ];
</script>

<div class="viz cv">
  <div class="vctl" role="tablist" aria-label="Type de conversion">
    <button role="tab" aria-selected={mode === 'time'} class:on={mode === 'time'} onclick={() => (mode = 'time')}>Heures ⇄ minutes</button>
    <button role="tab" aria-selected={mode === 'vol'} class:on={mode === 'vol'} onclick={() => (mode = 'vol')}>cm³ · cL · L · m³</button>
  </div>

  <div class="presets" role="group" aria-label="Valeurs du garage">
    {#each mode === 'time' ? TIME_PRESETS : VOL_PRESETS as [lab, v]}
      <button type="button" class="pre" onclick={() => (mode === 'time' ? setHours(v) : setVol(v))}>{lab}</button>
    {/each}
  </div>

  <!-- règle à tirer -->
  <div
    class="ruler"
    role="slider"
    tabindex="0"
    aria-label={mode === 'time' ? 'Durée en heures' : 'Volume (échelle logarithmique)'}
    aria-valuemin="0"
    aria-valuemax={mode === 'time' ? HMAX : 1e8}
    aria-valuenow={mode === 'time' ? hours : vol}
    aria-valuetext={mode === 'time' ? `${fmtH(hours)} heure, soit ${targetMin} minutes` : `${exact(vol, 2)} litres`}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    onkeydown={key}
    bind:clientWidth={trackW}
  >
    <div class="rail"></div>
    <div class="fill" style="width:{pos * 100}%"></div>
    {#if mode === 'time'}
      {#each [0, 0.5, 1, 1.5, 2, 2.5] as t}
        <span class="tick" style="left:{posT(t) * 100}%"><i></i><em>{nf(t)} h</em></span>
      {/each}
    {:else}
      {#each REFS as [lab, v], ri}
        <span class="tick ref" class:up={ri % 2 === 1} style="left:{posV(v) * 100}%"><i></i><em>{lab}</em></span>
      {/each}
    {/if}
    <span class="knob" class:drag={dragging} style="left:{pos * 100}%"></span>
  </div>

  {#if mode === 'time'}
    <div class="cards two">
      <div class="card main">
        <span class="k">en heures</span>
        <span class="v">{fmtH(shownH)} h</span>
      </div>
      <div class="card">
        <span class="k">en minutes</span>
        <span class="v">{nf(Math.round(shownH * 60))} min</span>
      </div>
    </div>
    <p class="say" aria-live="polite">
      Heures → minutes : multiplier par 60. {fmtH(hours)} × 60 = <b>{nf(targetMin)} min</b>.<br />
      Minutes → heures : diviser par 60. {@html frac(nf(targetMin), 60)} = <b>{fmtH(hours)} h</b>.<br />
      {#if hours >= 1}
        Attention : <b>{fmtH(hours)} h = {Math.floor(targetMin / 60)} h {targetMin % 60} min</b>, pas {Math.floor(targetMin / 60)} h {Math.round((hours % 1) * 100)} min. Les minutes ne sont pas des centièmes d'heure.
      {:else}
        {fmtH(hours)} h = <b>{targetMin} min</b>.
      {/if}
    </p>
  {:else}
    <div class="cards four">
      {#each UNITS as U, i}
        <button type="button" class="card" class:main={from === i} onclick={() => (from = i)} aria-pressed={from === i} aria-label="Unité de départ {U.u}">
          <span class="k">{U.u}</span>
          <span class="v">{fmtVol(shownV, i)}</span>
        </button>
      {/each}
    </div>
    <p class="say" aria-live="polite">
      <b>{exact(vol, 0)} cm³</b> = <b>{exact(vol, 1)} cL</b> = <b>{exact(vol, 2)} L</b> = <b>{exact(vol, 3)} m³</b>.<br />
      {@html rule}
    </p>
  {/if}
</div>

<style>
  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 12px 0 0;
  }
  .pre {
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid var(--g3);
    background: var(--surf3);
    color: var(--g);
    font-size: 12.5px;
  }
  .pre:active {
    transform: scale(0.95);
  }
  .ruler {
    position: relative;
    height: 74px;
    margin: 16px 8px 4px;
    touch-action: none;
    cursor: ew-resize;
    outline-offset: 6px;
  }
  .rail {
    position: absolute;
    left: 0;
    right: 0;
    top: 26px;
    height: 8px;
    border-radius: 999px;
    background: var(--surf3);
  }
  .fill {
    position: absolute;
    left: 0;
    top: 26px;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--g3), var(--g));
  }
  .tick {
    position: absolute;
    top: 22px;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
  }
  .tick i {
    width: 2px;
    height: 16px;
    background: var(--line2);
    border-radius: 1px;
  }
  .tick em {
    margin-top: 22px;
    font-style: normal;
    font-family: var(--sm);
    font-size: 10px;
    color: var(--dim2);
    white-space: nowrap;
  }
  .tick.ref em {
    margin-top: 6px;
  }
  /* repères d'objets : un sur deux au-dessus de la règle pour ne pas se chevaucher */
  .tick.ref.up {
    top: auto;
    bottom: 36px;
    flex-direction: column-reverse;
  }
  .tick.ref.up em {
    margin-top: 0;
    margin-bottom: 4px;
  }
  .knob {
    position: absolute;
    top: 20px;
    width: 22px;
    height: 22px;
    margin-left: -11px;
    border-radius: 50%;
    background: var(--g);
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 1.5px var(--g3);
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    pointer-events: none;
  }
  .knob.drag {
    transform: scale(1.3);
  }
  .ruler:focus-visible .knob {
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--blue) 50%, transparent);
  }
  .cards {
    display: grid;
    gap: 8px;
    margin-top: 10px;
  }
  .cards.two {
    grid-template-columns: 1fr 1fr;
  }
  .cards.four {
    grid-template-columns: 1fr 1fr;
  }
  @media (min-width: 560px) {
    .cards.four {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .card {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 11px;
    border: 1px solid var(--line2);
    border-radius: 10px;
    background: var(--surf);
    text-align: left;
    min-width: 0;
  }
  .card.main {
    border-color: var(--blue);
    background: color-mix(in srgb, var(--blue) 9%, var(--surf));
  }
  .card .k {
    font-family: var(--sm);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--dim2);
  }
  .card .v {
    font-family: var(--sm);
    font-size: 19px;
    font-weight: 700;
    color: var(--g);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }
  .card.main .v {
    color: var(--blue);
  }
</style>
