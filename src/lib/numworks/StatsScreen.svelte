<script>
  import { affine, exponential, logarithmic, pearsonStats } from './regression.js';
  import { fmtNum } from './format.js';

  let { points, reg = 'affine' } = $props();

  let fitFn = $derived(
    reg === 'affine' ? affine : reg === 'exponentielle' ? exponential : reg === 'logarithmique' ? logarithmic : null
  );
  let fit = $derived(points && fitFn ? fitFn(points) : null);
  let stats = $derived(points ? pearsonStats(points) : null);
</script>

<div class="ss">
  {#if !stats}
    <p class="incomplete">Complète la saisie des données pour voir les statistiques.</p>
  {:else}
    <div class="row"><span class="lbl">Nbre de points</span><span class="sym">N</span><span class="val">{stats.n}</span></div>
    <div class="row"><span class="lbl">Moyenne de x</span><span class="sym">x̄</span><span class="val">{fmtNum(stats.xbar, 3)}</span></div>
    <div class="row"><span class="lbl">Moyenne de y</span><span class="sym">ȳ</span><span class="val">{fmtNum(stats.ybar, 3)}</span></div>
    <div class="row"><span class="lbl">Somme des produits</span><span class="sym">Σxy</span><span class="val">{fmtNum(stats.sxy, 3)}</span></div>
    <div class="row"><span class="lbl">Covariance</span><span class="sym">cov</span><span class="val">{fmtNum(stats.cov, 3)}</span></div>
    {#if fit}
      <div class="row hl"><span class="lbl">Coefficient a</span><span class="sym">a</span><span class="val">{fmtNum(fit.a, 4)}</span></div>
      <div class="row hl"><span class="lbl">Coefficient b</span><span class="sym">b</span><span class="val">{fmtNum(fit.b, 4)}</span></div>
    {/if}
    {#if stats.r !== null}
      <div class="row hl"><span class="lbl">Coeff. corrélation</span><span class="sym">r</span><span class="val">{fmtNum(stats.r, 4)}</span></div>
      <div class="row hl"><span class="lbl">Coeff. détermination</span><span class="sym">r²</span><span class="val">{fmtNum(stats.r2, 4)}</span></div>
    {/if}
  {/if}
</div>

<style>
  .ss {
    display: grid;
    gap: 2px;
    font-family: var(--sm);
    font-size: 12.5px;
  }
  .row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px;
    align-items: center;
    padding: 4px 6px;
    border-radius: 4px;
  }
  .row.hl {
    background: var(--surf3);
  }
  .lbl {
    color: var(--tx);
  }
  .sym {
    color: var(--dim);
    font-style: italic;
  }
  .val {
    color: var(--g2);
    font-weight: 600;
    text-align: right;
    min-width: 4.5em;
  }
  .incomplete {
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
    text-align: center;
    padding: 24px 8px;
  }
</style>
