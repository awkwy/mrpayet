<script>
  import { base } from '$app/paths';
  import { RECAP } from '$lib/data/recap.js';
  import RecapCard from '$lib/components/RecapCard.svelte';
  import { courseLock } from '$lib/utils/course-helpers.js';

  let { data } = $props();

  // Verrou « pas encore au programme » — calculé côté client sur la semaine
  // réelle. Un cours verrouillé n'affiche pas ses fiches et n'est pas listé.
  let courseLocked = $derived(data.mode === 'course' && !!courseLock(data.course));
  let openCourses = $derived(data.mode === 'classe' ? data.courses.filter((co) => !courseLock(co)) : []);
</script>

<svelte:head>
  <title>{data.mode === 'course' ? data.course.titre : data.classe} — Aide-mémoire — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb no-print">
    <a href="{base}/r">Aide-mémoire</a>
    {#if data.mode === 'course'}
      / <a href="{base}/c/{data.course.id}">{data.course.titre}</a>
    {/if}
  </p>

  {#if data.mode === 'course'}
    <h1>{data.course.titre}</h1>
    {#if courseLocked}
      <p class="soon">Les fiches récap s'afficheront à mesure que les chapitres s'ouvrent.</p>
    {:else}
      <button type="button" class="print no-print" onclick={() => window.print()}>Imprimer</button>
      <div class="cards">
        {#each data.cards as r}
          <RecapCard {r} />
        {/each}
      </div>
    {/if}
  {:else}
    <h1>{data.classe} — aide-mémoire complet</h1>
    {#if !openCourses.length}
      <p class="soon">Les fiches récap s'afficheront à mesure que les chapitres s'ouvrent.</p>
    {:else}
      <button type="button" class="print no-print" onclick={() => window.print()}>Imprimer</button>
      {#each openCourses as co}
        <section class="csect">
          <h2>{co.titre}</h2>
          <div class="cards">
            {#each RECAP[co.id] as r}
              <RecapCard {r} />
            {/each}
          </div>
        </section>
      {/each}
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
  .print {
    margin: 14px 0 20px;
    background: none;
    border: 1px solid var(--g3);
    border-radius: 6px;
    padding: 7px 14px;
    color: var(--g);
    font-family: var(--sm);
    font-size: 12px;
  }
  .cards {
    display: grid;
    gap: 10px;
  }
  .soon {
    margin-top: 14px;
    color: var(--dim);
    font-family: var(--sm);
    font-size: 13px;
  }
  .csect {
    margin-top: 28px;
  }
  .csect h2 {
    font-size: 15px;
    color: var(--g2);
  }
  .csect .cards {
    margin-top: 10px;
  }
  @media print {
    :global(nav),
    .no-print {
      display: none !important;
    }
  }
</style>
