<script>
  import { base } from '$app/paths';
  import { blocOfCourse, bslug } from '$lib/utils/course-helpers.js';
  import { RECAP } from '$lib/data/recap.js';
  import ProgressBar from '$lib/components/ProgressBar.svelte';
  import { done } from '$lib/stores/progress.js';

  let { data } = $props();
  let c = $derived(data.course);
  let bloc = $derived(blocOfCourse(c.id, c.classe));
  let doneSet = $derived($done);
  let nDone = $derived(c.seances.filter((_, i) => doneSet.has(c.id + '/' + i)).length);
</script>

<svelte:head>
  <title>{c.titre} — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/p/{bslug(c.classe)}">{c.classe}</a>
    {#if bloc}
      / <a href="{base}/bloc/{bslug(c.classe)}/{bloc.id}">{bloc.t}</a>
    {/if}
  </p>

  <div class="pills">
    <span class="pill">{c.classe}</span>
    <span class="pill">{c.mat}</span>
  </div>
  <h1>{c.titre}</h1>
  <p class="desc">{c.desc}</p>

  <ProgressBar done={nDone} total={c.seances.length} />

  {#if c.obj?.length}
    <h2 class="h2">Objectifs</h2>
    <ul class="obj">
      {#each c.obj as o}
        <li>{o}</li>
      {/each}
    </ul>
  {/if}

  <div class="rtools">
    {#if RECAP[c.id]}
      <a href="{base}/r/{c.id}">Fiche récap</a>
    {/if}
    <a href="{base}/revisions/{bslug(c.classe)}">Révisions</a>
  </div>

  <h2 class="h2">Chapitres</h2>
  <div class="toc">
    {#each c.seances as se, i}
      <a class="row" href="{base}/c/{c.id}/{i}">
        <span class="ck" class:on={doneSet.has(c.id + '/' + i)}>{doneSet.has(c.id + '/' + i) ? '✓' : i + 1}</span>
        <span class="rt">{se.t}</span>
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
  .pills {
    display: flex;
    gap: 8px;
    margin-top: 16px;
  }
  .pill {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--g2);
    border: 1px solid var(--g3);
    border-radius: 20px;
    padding: 2px 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  h1 {
    margin-top: 10px;
  }
  .desc {
    color: var(--dim);
  }
  .h2 {
    font-size: 15px;
    color: var(--g2);
    font-family: var(--sm);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 32px;
  }
  .obj {
    margin-top: 12px;
    padding-left: 20px;
    color: var(--dim);
  }
  .obj li {
    margin-bottom: 4px;
  }
  .rtools {
    display: flex;
    gap: 18px;
    margin-top: 24px;
    font-family: var(--sm);
    font-size: 13px;
  }
  .rtools a {
    color: var(--dim);
  }
  .toc {
    display: grid;
    gap: 8px;
    margin-top: 14px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .row:hover {
    border-color: var(--g3);
  }
  .ck {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    border: 1px solid var(--line2);
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim);
  }
  .ck.on {
    color: var(--g);
    border-color: var(--g3);
  }
  .rt {
    color: var(--tx);
  }
</style>
