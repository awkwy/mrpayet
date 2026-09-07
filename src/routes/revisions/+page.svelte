<script>
  import { base } from '$app/paths';
  import { CLASSES, bslug } from '$lib/utils/course-helpers.js';
  import { CCF } from '$lib/data/ccf.js';
</script>

<svelte:head>
  <title>Révisions — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Révisions</p>
  <h1>CCF et devoir commun</h1>
  <p class="lead">Les cinq compétences évaluées, et des tâches types classées comme le jour de l'épreuve.</p>
  <div class="classes">
    {#each CLASSES as c}
      {#if CCF[c.n]}
        <a class="ccard" href="{base}/revisions/{bslug(c.n)}">
          <div class="cn">{c.n}</div>
          <div class="cd">{CCF[c.n].label === 'devoir commun' ? 'Devoir commun' : 'CCF maths-sciences'}</div>
        </a>
      {/if}
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
</style>
