<script>
  import { affine, exponential, logarithmic } from './regression.js';
  import { fmtNum } from './format.js';

  let { points, reg = 'affine' } = $props();

  const W = 300;
  const H = 200;
  const PAD = 26;
  const CURVE_SAMPLES = 40;

  const REG_LABELS = {
    affine: 'Régression affine',
    exponentielle: 'Régression exponentielle',
    logarithmique: 'Régression logarithmique'
  };

  let fitFn = $derived(
    reg === 'affine' ? affine : reg === 'exponentielle' ? exponential : reg === 'logarithmique' ? logarithmic : null
  );
  let fit = $derived(points && fitFn ? fitFn(points) : null);

  // La fonction modélisée par l'ajustement, pour tracer la courbe.
  let modelFn = $derived(
    !fit
      ? null
      : reg === 'affine'
        ? (x) => fit.a * x + fit.b
        : reg === 'exponentielle'
          ? (x) => fit.a * Math.exp(fit.b * x)
          : (x) => fit.a * Math.log(x) + fit.b
  );

  let xs = $derived(points ? points.map((p) => p[0]) : []);
  let ys = $derived(points ? points.map((p) => p[1]) : []);
  let xMin = $derived(xs.length ? Math.min(...xs) : 0);
  let xMax = $derived(xs.length ? Math.max(...xs) : 1);
  let yMin = $derived(ys.length ? Math.min(0, ...ys) : 0);
  let yMax = $derived(ys.length ? Math.max(...ys) : 1);
  let xSpan = $derived(xMax - xMin || 1);
  let ySpan = $derived(yMax - yMin || 1);

  // Logarithmique : ln(x) n'est défini que pour x > 0. Les points de données
  // sont déjà garantis positifs par regression.js (sinon `fit` est null), on
  // se contente ici de ne pas échantillonner en dessous de xMin.
  let curveStart = $derived(reg === 'logarithmique' ? Math.max(xMin, 1e-6) : xMin);

  function sx(x) {
    return PAD + ((x - xMin) / xSpan) * (W - 2 * PAD);
  }
  function sy(y) {
    return H - PAD - ((y - yMin) / ySpan) * (H - 2 * PAD);
  }

  let curvePoints = $derived.by(() => {
    if (!points || !modelFn) return '';
    const pts = [];
    for (let i = 0; i <= CURVE_SAMPLES; i++) {
      const x = curveStart + ((xMax - curveStart) * i) / CURVE_SAMPLES;
      pts.push(`${sx(x)},${sy(modelFn(x))}`);
    }
    return pts.join(' ');
  });

  let equation = $derived.by(() => {
    if (!fit) return '';
    if (reg === 'affine') {
      return `y = ${fmtNum(fit.a, 3)}x ${fit.b >= 0 ? '+' : '−'} ${fmtNum(Math.abs(fit.b), 3)}`;
    }
    if (reg === 'exponentielle') {
      return `y = ${fmtNum(fit.a, 3)} × e^(${fmtNum(fit.b, 4)}x)`;
    }
    return `y = ${fmtNum(fit.a, 3)}ln(x) ${fit.b >= 0 ? '+' : '−'} ${fmtNum(Math.abs(fit.b), 3)}`;
  });
</script>

<div class="gs">
  {#if !points}
    <p class="incomplete">Complète la saisie des données pour voir le graphique.</p>
  {:else}
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points et courbe de régression">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="axis" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="axis" />
    {#if curvePoints}
      <polyline points={curvePoints} class="fit" />
    {/if}
    {#each points as [x, y], i (i)}
      <circle cx={sx(x)} cy={sy(y)} r="3" class="pt" />
    {/each}
  </svg>
  <div class="info">
    {#if fit}
      <span class="regtype">{REG_LABELS[reg]}</span>
      <span class="eq">{equation}</span>
    {:else}
      <span class="regtype">Pas de régression calculable</span>
    {/if}
  </div>
  {/if}
</div>

<style>
  .gs {
    display: grid;
    gap: 8px;
  }
  svg {
    width: 100%;
    height: auto;
    background: var(--surf);
    border: 1px solid var(--line);
    border-radius: 6px;
  }
  .axis {
    stroke: var(--line2);
    stroke-width: 1;
  }
  .fit {
    fill: none;
    stroke: var(--g);
    stroke-width: 1.5;
    stroke-linejoin: round;
  }
  .pt {
    fill: var(--blue);
  }
  .info {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 6px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .regtype {
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--g2);
  }
  .eq {
    color: var(--tx);
  }
  .incomplete {
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
    text-align: center;
    padding: 24px 8px;
  }
</style>
