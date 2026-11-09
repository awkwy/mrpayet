<script>
  import { Tween } from 'svelte/motion';
  import { cubicOut, backOut } from 'svelte/easing';
  import { onMount } from 'svelte';
  import { frNum, toPercent, toFrequency } from '$lib/utils/freq.js';
  import { fr } from '$lib/utils/frac.js';
  import '$lib/styles/stat-viz.css';

  /* « Dans les deux sens » — fréquence ⇄ pourcentage, à faire glisser.
   *
   * Deux règles superposées : celle des fréquences (0 à 1) et celle des
   * pourcentages (0 % à 100 %). L'élève fait GLISSER le curseur jusqu'au
   * nombre donné ; au lâcher, si c'est juste le curseur s'aimante (ressort) et
   * l'autre écriture apparaît avec le calcul en fraction (part de 100, ou
   * × 100). Il choisit ensuite la bonne écriture parmi trois (les mauvaises
   * sont les erreurs classiques : virgule mal placée). Aucun signe ÷.
   * Clavier : le curseur est un role="slider" (flèches ±0,01, PgUp/PgDn ±0,1)
   * et deux boutons ± permettent un réglage fin au doigt. */

  let { vd } = $props();
  const ITEMS = vd?.items || [
    { from: 'pct', v: 35, opts: ['0,35', '3,5', '0,035'] },
    { from: 'pct', v: 5, opts: ['0,05', '0,5', '5'] },
    { from: 'pct', v: 60, opts: ['0,6', '0,06', '6'] },
    { from: 'freq', v: 0.25, opts: ['25', '2,5', '0,025'] },
    { from: 'freq', v: 0.8, opts: ['80', '8', '0,08'] },
    { from: 'freq', v: 0.07, opts: ['7', '70', '0,7'] }
  ];

  let idx = $state(0);
  let phase = $state('drag'); // drag | choose | done
  let pick = $state(null);
  let msg = $state('');
  let finished = $state(false);
  let reduced = false;
  let track;
  let dragging = false;
  const t = new Tween(0.5, { duration: 0, easing: cubicOut });

  let item = $derived(ITEMS[idx]);
  let target = $derived(item.from === 'pct' ? toFrequency(item.v) : item.v);
  let givenTxt = $derived(item.from === 'pct' ? `${frNum(item.v)} %` : frNum(item.v, 2));
  let correctTxt = $derived(item.from === 'pct' ? frNum(toFrequency(item.v), 3) : frNum(toPercent(item.v), 3));
  let live = $derived(
    item.from === 'pct' ? `${frNum(toPercent(Math.round(t.current * 100) / 100), 0)} %` : frNum(Math.round(t.current * 100) / 100, 2)
  );
  let options = $derived([...new Set([...item.opts, correctTxt])].sort((a, b) => (a < b ? -1 : 1)));

  // explication en fractions (jamais ÷)
  let explain = $derived(
    item.from === 'pct'
      ? `${frNum(item.v)}&nbsp;% = ${fr(frNum(item.v), 100)} = <b>${correctTxt}</b> &nbsp;<span class="rule">(je prends la part de 100 : la virgule recule de 2 rangs)</span>`
      : `${frNum(item.v, 2)} × 100 = <b>${correctTxt}&nbsp;%</b> &nbsp;<span class="rule">(la virgule avance de 2 rangs)</span>`
  );

  function setT(v, animate = false) {
    const c = Math.max(0, Math.min(1, Math.round(v * 100) / 100));
    t.set(c, { duration: animate && !reduced ? 450 : 0, easing: animate ? backOut : cubicOut });
  }
  function fromEvent(e) {
    const r = track.getBoundingClientRect();
    return (e.clientX - r.left) / r.width;
  }
  function down(e) {
    if (phase !== 'drag') return;
    dragging = true;
    track.setPointerCapture(e.pointerId);
    setT(fromEvent(e));
  }
  function move(e) {
    if (dragging) setT(fromEvent(e));
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    release();
  }
  function nudge(d) {
    if (phase !== 'drag') return;
    setT(t.target + d);
  }
  function key(e) {
    if (phase !== 'drag') return;
    const k = { ArrowLeft: -0.01, ArrowDown: -0.01, ArrowRight: 0.01, ArrowUp: 0.01, PageDown: -0.1, PageUp: 0.1 }[e.key];
    if (k !== undefined) {
      e.preventDefault();
      nudge(k);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      release();
    }
  }
  function release() {
    const cur = Math.round(t.target * 100) / 100;
    if (Math.abs(cur - target) < 0.005) {
      setT(target, true);
      phase = 'choose';
      msg = '';
    } else {
      const here = item.from === 'pct' ? `${frNum(toPercent(cur), 0)} %` : frNum(cur, 2);
      msg = `Tu es à ${here}. Il faut aller jusqu’à ${givenTxt.replace(' ', ' ')}.`;
    }
  }
  function choose(o) {
    pick = o;
    if (o === correctTxt) {
      phase = 'done';
      msg = '';
    } else {
      msg =
        item.from === 'pct'
          ? 'Pas tout à fait : la fréquence est la part de 100, donc un nombre entre 0 et 1. Regarde où est le curseur sur la règle du haut.'
          : 'Pas tout à fait : le pourcentage est la part de 100, donc on multiplie par 100 : la virgule avance de 2 rangs.';
    }
  }
  function next() {
    if (idx + 1 >= ITEMS.length) {
      finished = true;
      return;
    }
    idx += 1;
    phase = 'drag';
    pick = null;
    msg = '';
    setT(0.5, true);
  }
  function restart() {
    idx = 0;
    phase = 'drag';
    pick = null;
    msg = '';
    finished = false;
    setT(0.5, true);
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // arrivée douce : le curseur part du bord et se pose au milieu
    t.set(0, { duration: 0 });
    requestAnimationFrame(() => t.set(0.5, { duration: reduced ? 0 : 700, easing: backOut }));
  });
</script>

<div class="viz sv">
  {#if finished}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Les six conversions sont faites. <b>Pourcentage → fréquence</b> : je prends la part de 100. <b>Fréquence → pourcentage</b> : je multiplie par 100.</p>
    <div class="ctl"><button type="button" class="sv-btn gh" onclick={restart}>Recommencer</button></div>
  {:else}
    <p class="sv-h">Conversion {idx + 1} sur {ITEMS.length}</p>
    <p class="ask">
      {#if item.from === 'pct'}Fais glisser le curseur sur <b class="given">{givenTxt}</b>, puis trouve la <b>fréquence</b>.
      {:else}Fais glisser le curseur sur la fréquence <b class="given">{givenTxt}</b>, puis trouve le <b>pourcentage</b>.{/if}
    </p>

    <div class="rules">
      <div class="scale top" class:goal={item.from === 'freq'}>
        <span class="tag">fréquence</span>
        {#each [0, 0.25, 0.5, 0.75, 1] as v}<span class="tk" style:left={`${v * 100}%`}>{frNum(v, 2)}</span>{/each}
      </div>
      <div
        class="track"
        bind:this={track}
        role="slider"
        tabindex="0"
        aria-label={item.from === 'pct' ? 'Curseur de pourcentage' : 'Curseur de fréquence'}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={Math.round(t.current * 100)}
        aria-valuetext={live}
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
        onkeydown={key}
      >
        <span class="rail"></span>
        <span class="done-rail" style:transform={`scaleX(${t.current})`}></span>
        {#each [0, 0.25, 0.5, 0.75, 1] as v}<span class="mark" style:left={`${v * 100}%`}></span>{/each}
        <span class="thumb" class:locked={phase !== 'drag'} style:left={`${t.current * 100}%`}>
          <span class="bubble">{live}</span>
        </span>
      </div>
      <div class="scale bottom" class:goal={item.from === 'pct'}>
        <span class="tag">pourcentage</span>
        {#each [0, 25, 50, 75, 100] as v}<span class="tk" style:left={`${v}%`}>{v}&nbsp;%</span>{/each}
      </div>
    </div>

    {#if phase === 'drag'}
      <div class="fine">
        <button type="button" class="sv-btn" onclick={() => nudge(-0.01)} aria-label="Reculer d’un centième">− 0,01</button>
        <button type="button" class="sv-btn" onclick={() => nudge(0.01)} aria-label="Avancer d’un centième">+ 0,01</button>
        <button type="button" class="sv-btn p" onclick={release}>C’est là</button>
      </div>
      {#if msg}<p class="sv-fb sv-pop">{msg}</p>{:else}<p class="sv-fb">Fais glisser le curseur (ou utilise − et +), puis touche « C’est là ».</p>{/if}
    {:else}
      <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Le curseur est bien sur {givenTxt}. Sur l’autre règle, il lit :</p>
      <div class="explain sv-pop">{@html explain}</div>
      <p class="sv-h q">Note le résultat :</p>
      <div class="sv-chips">
        {#each options as o}
          <button type="button" class="sv-chip" class:picked={pick === o} disabled={phase === 'done'} onclick={() => choose(o)}>
            {o}{item.from === 'pct' ? '' : ' %'}
          </button>
        {/each}
      </div>
      {#if msg}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{msg}</p>{/if}
      {#if phase === 'done'}
        <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Exact : <b>{correctTxt}{item.from === 'pct' ? '' : ' %'}</b>.</p>
        <div class="ctl"><button type="button" class="sv-btn p" onclick={next}>{idx + 1 >= ITEMS.length ? 'Terminer' : 'Conversion suivante →'}</button></div>
      {/if}
    {/if}
  {/if}
</div>

<style>
  .ask {
    margin: 0 0 18px;
    font-size: 14.5px;
    color: var(--dim);
  }
  .ask b {
    color: var(--tx);
  }
  .ask .given {
    color: var(--blue);
    font-family: var(--sm);
    font-size: 17px;
  }
  .rules {
    padding: 0 12px;
  }
  .scale {
    position: relative;
    height: 24px;
    font-family: var(--sm);
    font-size: 10.5px;
    color: var(--dim2);
  }
  .scale .tag {
    position: absolute;
    left: 0;
    top: -16px;
    font-size: 9.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--dim);
  }
  .scale .tk {
    position: absolute;
    transform: translateX(-50%);
    top: 4px;
  }
  .scale.top .tk {
    top: auto;
    bottom: 0;
  }
  .scale.goal .tag,
  .scale.goal .tk {
    color: var(--blue);
  }
  .track {
    position: relative;
    height: 46px;
    margin: 4px 0;
    touch-action: none;
    cursor: grab;
    outline-offset: 4px;
  }
  .rail,
  .done-rail {
    position: absolute;
    left: 0;
    right: 0;
    top: 21px;
    height: 5px;
    border-radius: 99px;
    background: var(--surf3);
  }
  .done-rail {
    background: var(--g3);
    transform-origin: left center;
  }
  .mark {
    position: absolute;
    top: 14px;
    width: 2px;
    height: 19px;
    margin-left: -1px;
    background: var(--line2);
  }
  .thumb {
    position: absolute;
    top: 11px;
    width: 26px;
    height: 26px;
    margin-left: -13px;
    border-radius: 50%;
    background: var(--g);
    border: 3px solid var(--bg);
    box-shadow: 0 0 0 1.5px var(--g3);
  }
  .thumb.locked {
    background: var(--blue);
    box-shadow: 0 0 0 1.5px var(--blue);
  }
  .bubble {
    position: absolute;
    bottom: 31px;
    left: 50%;
    transform: translateX(-50%);
    padding: 3px 8px;
    background: var(--surf3);
    border: 1px solid var(--line2);
    border-radius: 7px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--tx);
    white-space: nowrap;
    pointer-events: none;
  }
  .fine {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-top: 16px;
  }
  .explain {
    margin: 10px 0;
    padding: 12px 14px;
    background: var(--surf);
    border: 1px solid var(--line2);
    border-radius: 10px;
    font-family: var(--sm);
    font-size: 15px;
    color: var(--tx);
  }
  .explain :global(b) {
    color: var(--g);
  }
  .explain :global(.rule) {
    display: block;
    margin-top: 6px;
    font-family: var(--sa);
    font-size: 12.5px;
    color: var(--dim);
  }
  .q {
    margin-top: 14px;
  }
  .ctl {
    margin-top: 12px;
  }
</style>
