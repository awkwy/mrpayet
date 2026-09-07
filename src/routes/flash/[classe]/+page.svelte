<script>
  import { base } from '$app/paths';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.classe} — Questions flash — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb"><a href="{base}/flash">Flash</a> / {data.classe}</p>
  <h1>Choisir un thème</h1>

  <a class="mix" href="{base}/flash/{data.slug}/melange">
    <div class="mn">Mélange</div>
    <div class="md">Un peu de chaque thème, au hasard</div>
  </a>

  <div class="themes">
    {#each data.themes as th}
      <a class="tcard" href="{base}/flash/{data.slug}/{th.id}">
        <div class="tt">{th.t}</div>
        <div class="tn">{th.n} questions</div>
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
  .crumb {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
  }
  .crumb a {
    color: var(--dim);
  }
  .mix {
    display: block;
    margin-top: 20px;
    padding: 16px 18px;
    border: 1px solid var(--g3);
    border-radius: var(--r);
    background: var(--surf2);
  }
  .mn {
    color: var(--g);
    font-weight: 600;
  }
  .md {
    color: var(--dim);
    font-size: 13px;
    margin-top: 3px;
  }
  .themes {
    display: grid;
    gap: 9px;
    margin-top: 14px;
  }
  .tcard {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    padding: 13px 16px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .tcard:hover {
    border-color: var(--g3);
  }
  .tt {
    color: var(--tx);
  }
  .tn {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
    white-space: nowrap;
  }
</style>
