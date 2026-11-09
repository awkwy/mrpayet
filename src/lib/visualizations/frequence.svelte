<script>
  import { onMount, onDestroy } from 'svelte';
  import { Tween } from 'svelte/motion';
  import { backOut } from 'svelte/easing';
  import Pict from './Pict.svelte';
  import { TYPES, SEQ, countsOf } from './registre-data.js';
  import { frequency, toPercent, frNum } from '$lib/utils/freq.js';
  import '$lib/styles/stat-viz.css';

  /* « Construis la fréquence » — fraction effectif sur effectif total.
   *
   * Ligne 1 (dispute) : l'exemple, joué une fois pour montrer le geste. Lignes
   * suivantes : l'élève touche un nombre pour le numérateur puis un nombre pour
   * le dénominateur ; vérification au fil de l'eau (check-as-you-go) avec un
   * message qui dit QUEL côté de la fraction est faux. Quand la fraction est
   * juste : le décimal et le pourcentage « poussent » au ressort et la barre
   * montre la part du tout (la longueur totale = 1 = 100 %). En bas, la somme
   * des fréquences (1) et des pourcentages (100 %) sert de contrôle.
   * Pas de signe ÷ : la division est écrite en fraction empilée. */

  let { vd } = $props();
  const types = vd?.types || TYPES;
  const eff = vd?.eff || countsOf(vd?.seq || SEQ, types);
  const total = Object.values(eff).reduce((a, b) => a + b, 0);
  const pool = [...new Set([...Object.values(eff), total])].sort((a, b) => a - b);

  let reduced = false;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, reduced ? 0 : ms));

  // une ligne par type ; l'exemple est la première
  let rows = $state(
    types.map((t) => ({ id: t.id, label: t.label, num: null, den: null, ok: false, stage: 0, msg: '', shake: false }))
  );
  let tFreq = types.map(() => new Tween(0, { duration: 750, easing: backOut }));
  let tPct = types.map(() => new Tween(0, { duration: 750, easing: backOut }));
  let demoDone = $state(false);

  let active = $derived(rows.findIndex((r, i) => i > 0 && !r.ok));
  let allDone = $derived(rows.every((r) => r.ok));
  let sumF = $derived(rows.reduce((s, r, i) => s + (r.ok ? tFreq[i].current : 0), 0));
  let sumP = $derived(rows.reduce((s, r, i) => s + (r.ok ? tPct[i].current : 0), 0));

  function lock(i) {
    const r = rows[i];
    r.ok = true;
    r.stage = 1;
    const f = frequency(eff[r.id], total);
    tFreq[i].set(f, { duration: reduced ? 0 : 750 });
    later(() => {
      r.stage = 2;
      tPct[i].set(toPercent(f), { duration: reduced ? 0 : 750 });
    }, 700);
  }

  function playDemo() {
    const r = rows[0];
    r.num = null;
    r.den = null;
    r.ok = false;
    r.stage = 0;
    tFreq[0].set(0, { duration: 0 });
    tPct[0].set(0, { duration: 0 });
    later(() => (r.num = eff[r.id]), 500);
    later(() => (r.den = total), 1100);
    later(() => {
      lock(0);
      demoDone = true;
    }, 1700);
  }

  function place(n) {
    const i = active;
    if (i < 0) return;
    const r = rows[i];
    if (r.num === null) r.num = n;
    else if (r.den === null) r.den = n;
    else return;
    r.msg = '';
    if (r.num !== null && r.den !== null) check(i);
  }
  function clear(i, which) {
    const r = rows[i];
    if (r.ok || i === 0) return;
    r[which] = null;
    r.msg = '';
  }
  function check(i) {
    const r = rows[i];
    const e = eff[r.id];
    if (r.num === e && r.den === total) {
      lock(i);
      return;
    }
    if (r.num === total && r.den === e)
      r.msg = 'La fraction est à l’envers : l’effectif du type va au-dessus, l’effectif total en dessous. Une fréquence ne dépasse jamais 1.';
    else if (r.den !== total && r.num !== e)
      r.msg = `Ni l’un ni l’autre : au-dessus, l’effectif de « ${r.label} » ; en dessous, l’effectif total (${total}).`;
    else if (r.den !== total)
      r.msg = `En dessous, il faut l’effectif total : toutes les cartes, tous les types ensemble (${total}).`;
    else r.msg = `Au-dessus, il faut l’effectif de « ${r.label} » : combien de cartes de ce type ?`;
    r.shake = true;
    later(() => {
      r.shake = false;
      r.num = null;
      r.den = null;
    }, 1300);
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    later(playDemo, 500);
  });
  onDestroy(() => timers.forEach(clearTimeout));
</script>

<div class="viz sv">
  <p class="sv-h">Fréquence = effectif sur effectif total</p>
  <p class="how">
    Pour chaque type : touche le nombre du <b>haut</b> (l’effectif du type), puis celui du <b>bas</b> (l’effectif total).
  </p>

  {#each rows as r, i}
    <div class="row" class:ok={r.ok} class:on={i === active} class:shake={r.shake}>
      <div class="lab"><Pict type={r.id} size={26} /><span>{r.label}{i === 0 ? ' (exemple)' : ''}</span></div>

      <div class="frac" aria-label={`Fraction ${r.num ?? '?'} sur ${r.den ?? '?'}`}>
        <button type="button" class="slot" class:full={r.num !== null} onclick={() => clear(i, 'num')} disabled={r.ok || i === 0}>
          {r.num ?? '?'}
        </button>
        <span class="bar"></span>
        <button type="button" class="slot" class:full={r.den !== null} onclick={() => clear(i, 'den')} disabled={r.ok || i === 0}>
          {r.den ?? '?'}
        </button>
      </div>

      <div class="res">
        {#if r.stage >= 1}
          <span class="eq">=</span>
          <b class="dec">{frNum(tFreq[i].current, 2)}</b>
        {/if}
        {#if r.stage >= 2}
          <span class="x100">× 100</span>
          <b class="pct">{frNum(tPct[i].current, 0)}&nbsp;%</b>
        {/if}
      </div>

      <div class="track" aria-hidden="true"><span class="fillbar" style:transform={`scaleX(${r.ok ? tFreq[i].current : 0})`}></span></div>
      {#if r.msg}<p class="sv-fb no sv-pop"><span class="ic">✕</span>{r.msg}</p>{/if}
    </div>
  {/each}

  <div class="chips" role="group" aria-label="Nombres à placer">
    <div class="sv-chips">
      {#each pool as n}
        <button type="button" class="sv-chip" disabled={active < 0} onclick={() => place(n)}>{n}</button>
      {/each}
    </div>
  </div>

  <div class="sums" class:done={allDone}>
    <div><span class="k">Somme des fréquences</span><b>{allDone ? frNum(sumF, 2) : '…'}</b></div>
    <div><span class="k">Somme des pourcentages</span><b>{allDone ? `${frNum(sumP, 0)} %` : '…'}</b></div>
  </div>

  {#if allDone}
    <p class="sv-fb ok sv-pop"><span class="ic">✓</span> Les fréquences font <b>1</b> ensemble, les pourcentages font <b>100&nbsp;%</b> : c’est le contrôle qui ne trompe pas. Si tu ne trouves pas 1, recompte.</p>
  {:else if !demoDone}
    <p class="sv-fb">Regarde l’exemple de la première ligne…</p>
  {:else}
    <p class="sv-fb">À toi pour « {rows[active]?.label} ».</p>
  {/if}
</div>

<style>
  .how {
    font-size: 13.5px;
    color: var(--dim);
    margin: 0 0 12px;
  }
  .how b {
    color: var(--tx);
  }
  .row {
    display: grid;
    grid-template-columns: 112px 52px 1fr;
    grid-template-areas: 'lab frac res' 'track track track' 'msg msg msg';
    align-items: center;
    gap: 6px 10px;
    padding: 10px 11px;
    margin-bottom: 8px;
    background: var(--surf);
    border: 1.5px solid var(--line);
    border-radius: 12px;
    transition: border-color 0.3s, background 0.3s;
  }
  .row.on {
    border-color: var(--blue);
  }
  .row.ok {
    border-color: var(--g3);
    background: color-mix(in srgb, var(--g) 5%, var(--surf));
  }
  .row.shake {
    animation: sv-shake 0.4s;
  }
  .lab {
    grid-area: lab;
    display: flex;
    gap: 8px;
    align-items: center;
    font-size: 12.5px;
    color: var(--tx);
    line-height: 1.25;
  }
  .frac {
    grid-area: frac;
    display: grid;
    justify-items: center;
    gap: 3px;
  }
  .bar {
    width: 38px;
    height: 2px;
    background: var(--tx);
    border-radius: 2px;
  }
  .slot {
    min-width: 40px;
    min-height: 34px;
    border: 1.5px dashed var(--line2);
    border-radius: 8px;
    background: transparent;
    color: var(--dim2);
    font-family: var(--sm);
    font-size: 16px;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.2s, color 0.2s;
  }
  .slot.full {
    border-style: solid;
    border-color: var(--blue);
    color: var(--tx);
    transform: scale(1.06);
  }
  .row.ok .slot {
    border-color: var(--g3);
    color: var(--g);
  }
  .res {
    grid-area: res;
    display: flex;
    gap: 8px;
    align-items: baseline;
    flex-wrap: wrap;
    font-family: var(--sm);
    min-height: 28px;
  }
  .eq {
    color: var(--dim);
  }
  .dec {
    color: var(--g);
    font-size: 20px;
    font-variant-numeric: tabular-nums;
  }
  .x100 {
    color: var(--dim2);
    font-size: 11.5px;
    animation: sv-pop 0.4s both;
  }
  .pct {
    color: var(--tx);
    font-size: 17px;
    font-variant-numeric: tabular-nums;
  }
  .track {
    grid-area: track;
    height: 6px;
    border-radius: 99px;
    background: var(--surf3);
    overflow: hidden;
  }
  .fillbar {
    display: block;
    height: 100%;
    background: var(--g);
    border-radius: 99px;
    transform-origin: left center;
  }
  .row :global(.sv-fb) {
    grid-area: msg;
    margin: 4px 0 0;
  }
  .chips {
    margin-top: 12px;
  }
  .sums {
    display: flex;
    gap: 22px;
    flex-wrap: wrap;
    margin-top: 14px;
    font-family: var(--sm);
  }
  .sums .k {
    display: block;
    font-size: 10px;
    letter-spacing: 1.1px;
    text-transform: uppercase;
    color: var(--dim2);
  }
  .sums b {
    font-size: 21px;
    color: var(--dim);
    transition: color 0.3s;
  }
  .sums.done b {
    color: var(--g);
  }
</style>
