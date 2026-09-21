<script>
  import { base } from '$app/paths';
  import { CCF_JOUR, CCF_SCALE } from '$lib/data/ccf-format.js';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.classe} — CCF — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">CCF</p>
  <h1>{data.classe} — le contrôle en cours de formation</h1>
  {#if data.ccf.intro}
    <p class="intro">{@html data.ccf.intro}</p>
  {/if}

  <h2 class="h2">L'épreuve, en pratique</h2>
  <div class="fmt">
    {#each data.ccf.format.situations as s}
      <div class="frow">
        <div class="fmat">{s.mat}</div>
        <div class="fdet">{s.duree} · {s.note}</div>
        {#if s.quand}<div class="fq">{s.quand}</div>{/if}
      </div>
    {/each}
  </div>
  {#if data.ccf.format.quand}
    <p class="fnote">{data.ccf.format.quand}</p>
  {/if}
  {#if data.ccf.format.note}
    <p class="fnote">{data.ccf.format.note}</p>
  {/if}

  <h2 class="h2">Le jour de l'épreuve</h2>
  <p class="txt">{@html CCF_JOUR}</p>

  <h2 class="h2">Comment c'est noté</h2>
  <p class="txt">Chaque compétence mobilisée est appréciée sur cette échelle, puis tout se combine dans la note finale.</p>
  <div class="scale">
    {#each CCF_SCALE as s}
      <div class="srow">
        <div class="sn">{s.n}</div>
        <div class="sw">{s.w}</div>
        <div class="sx">{s.x}</div>
      </div>
    {/each}
  </div>

  <a class="cta" href="{base}/revisions/{data.slug}">S'entraîner avec des situations types →</a>
</div>

<style>
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  .eyebrow {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .intro {
    color: var(--dim);
    margin-top: 10px;
  }
  .h2 {
    font-size: 15px;
    color: var(--g2);
    font-family: var(--sm);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 32px;
  }
  .fmt {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }
  .frow {
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
    display: grid;
    gap: 3px;
  }
  .fmat {
    color: var(--tx);
    font-weight: 600;
  }
  .fdet {
    color: var(--dim);
    font-size: 14px;
  }
  .fq {
    color: var(--dim2);
    font-size: 13px;
  }
  .fnote {
    color: var(--dim2);
    font-size: 13px;
    margin-top: 10px;
    font-style: italic;
  }
  .txt {
    color: var(--dim);
    margin-top: 10px;
  }
  .scale {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }
  .srow {
    padding: 10px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
    display: grid;
    grid-template-columns: 40px 1fr;
    gap: 2px 12px;
  }
  .sn {
    color: var(--g);
    font-weight: 700;
    font-family: var(--sm);
  }
  .sw {
    color: var(--tx);
    font-weight: 600;
  }
  .sx {
    grid-column: 2;
    color: var(--dim2);
    font-size: 13px;
  }
  .cta {
    display: inline-block;
    margin-top: 32px;
    padding: 12px 18px;
    border: 1px solid var(--g3);
    border-radius: var(--r);
    color: var(--g);
    font-family: var(--sm);
    font-size: 14px;
  }
  .cta:hover {
    border-color: var(--g);
  }
</style>
