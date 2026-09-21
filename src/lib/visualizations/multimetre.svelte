<script>
  import { fr } from './shared.js';

  let { vd } = $props();
  const R = (vd && vd.r) || 10;
  const UMAX = (vd && vd.umax) || 12;

  let mode = $state('V');
  let u = $state(UMAX / 2);

  let i = $derived(u / R);
  let p = $derived(u * i);

  const MODES = [
    { k: 'V', lab: 'V', unit: 'V' },
    { k: 'A', lab: 'A', unit: 'A' },
    { k: 'W', lab: 'W', unit: 'W' }
  ];

  let reading = $derived(mode === 'V' ? u : mode === 'A' ? i : p);
  let say = $derived(
    mode === 'V'
      ? `En position <b>V</b>, le multimètre mesure directement la tension aux bornes du circuit : <b>U = ${fr(u.toFixed(1))} V</b>.`
      : mode === 'A'
        ? `En position <b>A</b>, le multimètre applique la loi d'Ohm : <b>I = U ÷ R = ${fr(u.toFixed(1))} ÷ ${R} = ${fr(i.toFixed(2))} A</b>.`
        : `En position <b>W</b>, le multimètre calcule la puissance : <b>P = U × I = ${fr(u.toFixed(1))} × ${fr(i.toFixed(2))} = ${fr(p.toFixed(2))} W</b>.`
  );

  const rep = (ch, n) => ch.repeat(n);
  const DEV = [
    rep('.', 2) + rep('b', 12) + rep('.', 2),
    rep('.', 1) + rep('b', 14) + rep('.', 1),
    rep('b', 16),
    rep('b', 3) + rep('l', 10) + rep('b', 3),
    rep('b', 3) + 'l' + rep('s', 8) + 'l' + rep('b', 3),
    rep('b', 3) + 'l' + rep('s', 8) + 'l' + rep('b', 3),
    rep('b', 3) + 'l' + rep('s', 8) + 'l' + rep('b', 3),
    rep('b', 3) + 'l' + rep('s', 8) + 'l' + rep('b', 3),
    rep('b', 3) + rep('l', 10) + rep('b', 3),
    rep('b', 16),
    rep('b', 16),
    rep('.', 1) + rep('b', 14) + rep('.', 1),
    rep('.', 2) + rep('b', 4) + rep('.', 4) + rep('b', 4) + rep('.', 2),
    rep('.', 2) + rep('r', 4) + rep('.', 4) + rep('k', 4) + rep('.', 2)
  ];
  const PAL = { b: 'var(--warn)', l: 'var(--g)', s: 'var(--bg)', r: 'var(--red)', k: 'var(--dim2)' };
  const DCOLS = DEV[0].length;

  const CIRC = [
    rep('w', 18),
    'w' + rep('.', 16) + 'w',
    'w' + rep('B', 3) + rep('.', 10) + rep('R', 3) + 'w',
    'w' + rep('B', 3) + rep('.', 10) + rep('R', 3) + 'w',
    'w' + rep('B', 3) + rep('.', 10) + rep('R', 3) + 'w',
    'w' + rep('.', 16) + 'w',
    rep('w', 18)
  ];
  const CPAL = { w: 'var(--dim)', B: 'var(--blue)', R: 'var(--warn)' };
  const CCOLS = CIRC[0].length;
</script>

<div class="viz mmviz">
  <p class="mmlabel">Multimètre — mesure sur un circuit à résistance fixe (R = {R} Ω)</p>
  <div class="mmrow">
    <svg class="mmdev" viewBox="0 0 {DCOLS} {DEV.length}" role="img" aria-label="Multimètre, position {mode}, écran affiche {fr(reading.toFixed(mode === 'V' ? 1 : 2))} {mode === 'V' ? 'V' : mode === 'A' ? 'A' : 'W'}">
      {#each DEV as row, y}
        {#each [...row] as ch, x}
          {#if ch !== '.'}
            <rect {x} {y} width="1" height="1" fill={PAL[ch]} />
          {/if}
        {/each}
      {/each}
    </svg>
    <div class="mmscreen">
      <span class="mmval">{fr(reading.toFixed(mode === 'V' ? 1 : 2))}</span>
      <span class="mmunit">{mode}</span>
    </div>
    <svg class="mmcirc" viewBox="0 0 {CCOLS} {CIRC.length}" aria-hidden="true">
      {#each CIRC as row, y}
        {#each [...row] as ch, x}
          {#if ch !== '.'}
            <rect {x} {y} width="1" height="1" fill={CPAL[ch]} />
          {/if}
        {/each}
      {/each}
    </svg>
  </div>

  <div class="vctl">
    {#each MODES as m}
      <button type="button" class:on={mode === m.k} onclick={() => (mode = m.k)}>{m.lab}</button>
    {/each}
  </div>

  <div class="vsl">
    <label><span>Tension U</span><b>{fr(u.toFixed(1))} V</b></label>
    <input type="range" min="0" max={UMAX} step="0.5" bind:value={u} />
  </div>

  <div class="say">{@html say}</div>

  <div class="viz-data">
    <details>
      <summary>Voir les trois valeurs</summary>
      <table>
        <thead><tr><th>Grandeur</th><th>Valeur</th></tr></thead>
        <tbody>
          <tr><td>Tension U</td><td>{fr(u.toFixed(1))} V</td></tr>
          <tr><td>Intensité I</td><td>{fr(i.toFixed(2))} A</td></tr>
          <tr><td>Puissance P</td><td>{fr(p.toFixed(2))} W</td></tr>
        </tbody>
      </table>
    </details>
  </div>
</div>

<style>
  .mmviz {
    padding: 14px;
  }
  .mmlabel {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-bottom: 10px;
  }
  .mmrow {
    position: relative;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    flex-wrap: wrap;
  }
  .mmdev {
    width: 140px;
    flex-shrink: 0;
    shape-rendering: crispEdges;
    image-rendering: pixelated;
  }
  .mmcirc {
    width: 160px;
    flex: 1 1 160px;
    min-width: 140px;
    shape-rendering: crispEdges;
    image-rendering: pixelated;
    margin-top: 30px;
  }
  .mmscreen {
    position: absolute;
    left: 26px;
    top: 26px;
    width: 88px;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    font-family: var(--sm);
    color: var(--g);
    text-shadow: 0 0 6px var(--g3);
  }
  .mmval {
    font-size: 17px;
    font-weight: 700;
  }
  .mmunit {
    font-size: 11px;
    color: var(--g2);
  }
</style>
