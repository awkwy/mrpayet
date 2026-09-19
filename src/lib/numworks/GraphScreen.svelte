<script>
  import { affine } from './regression.js';
  import { fmtNum } from './format.js';

  let { points, reg = 'affine' } = $props();

  const W = 300;
  const H = 200;
  const PAD = 26;

  let fit = $derived(reg === 'affine' ? affine(points) : null);

  let xs = $derived(points.map((p) => p[0]));
  let ys = $derived(points.map((p) => p[1]));
  let xMin = $derived(Math.min(...xs));
  let xMax = $derived(Math.max(...xs));
  let yMin = $derived(Math.min(0, ...ys));
  let yMax = $derived(Math.max(...ys));
  let xSpan = $derived(xMax - xMin || 1);
  let ySpan = $derived(yMax - yMin || 1);

  function sx(x) {
    return PAD + ((x - xMin) / xSpan) * (W - 2 * PAD);
  }
  function sy(y) {
    return H - PAD - ((y - yMin) / ySpan) * (H - 2 * PAD);
  }

  let line = $derived(
    fit
      ? { x1: sx(xMin), y1: sy(fit.a * xMin + fit.b), x2: sx(xMax), y2: sy(fit.a * xMax + fit.b) }
      : null
  );
</script>

<div class="gs">
  <svg viewBox="0 0 {W} {H}" role="img" aria-label="Nuage de points et droite de régression">
    <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} class="axis" />
    <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} class="axis" />
    {#if line}
      <line x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} class="fit" />
    {/if}
    {#each points as [x, y], i (i)}
      <circle cx={sx(x)} cy={sy(y)} r="3" class="pt" />
    {/each}
  </svg>
  <div class="info">
    {#if fit}
      <span class="regtype">Régression affine</span>
      <span class="eq">y = {fmtNum(fit.a, 3)}x {fit.b >= 0 ? '+' : '−'} {fmtNum(Math.abs(fit.b), 3)}</span>
    {:else}
      <span class="regtype">Pas de régression calculable</span>
    {/if}
  </div>
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
    stroke: var(--g);
    stroke-width: 1.5;
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
</style>
