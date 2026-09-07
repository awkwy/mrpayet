<script>
  import { base } from '$app/paths';
  import { CLASSES, bslug } from '$lib/utils/course-helpers.js';
</script>

<svelte:head>
  <title>Le programme — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Le programme</p>
  <h1>Choisir une classe</h1>
  <p class="lead">Chaque classe a son programme découpé comme dans le bulletin officiel.</p>
  <div class="classes">
    {#each CLASSES as c}
      <a class="ccard" href="{base}/p/{bslug(c.n)}">
        <div class="cn">{c.n}</div>
        <div class="cd">{c.d}</div>
        <div class="cm">{c.m}</div>
      </a>
    {/each}
  </div>
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
  .lead {
    color: var(--dim);
    margin-top: 6px;
  }
  .classes {
    display: grid;
    gap: 11px;
    margin-top: 24px;
  }
  .ccard {
    display: block;
    padding: 16px 18px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .ccard:hover {
    border-color: var(--g3);
  }
  .cn {
    color: var(--tx);
    font-weight: 600;
  }
  .cd {
    color: var(--dim);
    font-size: 14px;
    margin-top: 4px;
  }
  .cm {
    color: var(--dim2);
    font-family: var(--sm);
    font-size: 12px;
    margin-top: 6px;
  }
</style>
