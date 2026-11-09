<script>
  import { base } from '$app/paths';
  import { blocChapters, blocLock } from '$lib/utils/course-helpers.js';
  import { done } from '$lib/stores/progress.js';
  import LockedNotice from '$lib/components/LockedNotice.svelte';
  import { AUTO } from '$lib/data/automatismes.js';

  let { data } = $props();

  // Verrou « pas encore au programme » — calculé côté client sur la semaine
  // réelle. Si verrouillé, on n'affiche rien du contenu, même en lien direct.
  let lock = $derived(blocLock(data.bloc, data.classe));

  // Un bloc partagé entre classes ne propose que les thèmes flash que la classe a (ex. `freq` : TC APMP seulement).
  let flashThemes = $derived((data.bloc.flash ?? []).filter((f) => AUTO.c[data.classe]?.o.includes(f)));
  let chapters = $derived(blocChapters(data.bloc, data.classe));
  // touching $done keeps this reactive to progress changes
  let doneSet = $derived($done);
</script>

<svelte:head>
  <title>{data.bloc.t} — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/p/{data.slug}">{data.classe}</a> / {data.bloc.dom}
  </p>
  <h1>{data.bloc.t}</h1>

  {#if lock}
    <LockedNotice {lock} quoi="Ce module" />
  {:else}
  {#if data.bloc.integre}
    <p class="note">{data.bloc.integre}</p>
  {/if}

  {#if data.bloc.appr}
    <ul class="appr">
      {#each data.bloc.appr as a}
        <li>{a}</li>
      {/each}
    </ul>
  {/if}

  {#if !chapters.length && !data.bloc.integre}
    <p class="warn">Cours à venir pour ce module.</p>
  {/if}

  {#if chapters.length}
    <div class="toc">
      {#each chapters as { co, se, i } (co.id + '/' + i)}
        <a class="row" href="{base}/c/{co.id}/{i}">
          <span class="ck" class:on={doneSet.has(co.id + '/' + i)}>{doneSet.has(co.id + '/' + i) ? '✓' : ''}</span>
          <span class="rt">{se.t}</span>
          <span class="rc">{co.titre}</span>
        </a>
      {/each}
    </div>
  {/if}

  {#if flashThemes.length}
    <div class="rtools">
      {#each flashThemes as f}
        <a href="{base}/flash/{data.slug}/{f}">Flash · {AUTO.t[f]?.t.split(' — ')[0] ?? f}</a>
      {/each}
    </div>
  {/if}
  {/if}
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
  .note {
    color: var(--dim);
    margin-top: 12px;
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .appr {
    margin-top: 16px;
    padding-left: 20px;
    color: var(--dim);
  }
  .appr li {
    margin-bottom: 4px;
  }
  .warn {
    margin-top: 16px;
    color: var(--warn);
    font-family: var(--sm);
    font-size: 13px;
  }
  .toc {
    display: grid;
    gap: 8px;
    margin-top: 20px;
  }
  .row {
    display: grid;
    grid-template-columns: 20px 1fr auto;
    align-items: center;
    gap: 10px;
    padding: 11px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .row:hover {
    border-color: var(--g3);
  }
  .ck {
    color: var(--g);
    font-weight: 700;
  }
  .rt {
    color: var(--tx);
  }
  .rc {
    color: var(--dim2);
    font-family: var(--sm);
    font-size: 12px;
  }
  .rtools {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin-top: 24px;
    font-family: var(--sm);
    font-size: 13px;
  }
  .rtools a {
    color: var(--dim);
  }
</style>
