<script>
  import { base } from '$app/paths';
  import { COURSES } from '$lib/data/courses/index.js';
  import { RECAP } from '$lib/data/recap.js';
  import { CLASSES, courseLock } from '$lib/utils/course-helpers.js';

  // Verrou « pas encore au programme » — calculé côté client sur la semaine
  // réelle. Un cours verrouillé n'est pas listé (comme sur /p, /c, /bloc).
  let groups = $derived(
    CLASSES.map((c) => ({
      classe: c.n,
      courses: COURSES.filter(
        (co) => (co.classe === c.n || co.classes?.includes(c.n)) && RECAP[co.id] && !courseLock(co)
      )
    })).filter((g) => g.courses.length)
  );
</script>

<svelte:head>
  <title>Aide-mémoire — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Aide-mémoire</p>
  <h1>Fiches récap imprimables</h1>
  <p class="lead">Signal → méthode → exemple → piège, une carte par notion.</p>

  {#each groups as g}
    <section class="grp">
      <div class="ghead">
        <h2>{g.classe}</h2>
        <a class="all" href="{base}/r/{encodeURIComponent(g.classe)}">Toutes les fiches de {g.classe} →</a>
      </div>
      <div class="courses">
        {#each g.courses as co}
          <a class="ccard" href="{base}/r/{co.id}">{co.titre}</a>
        {/each}
      </div>
    </section>
  {/each}
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
  .grp {
    margin-top: 32px;
  }
  .ghead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
  }
  .all {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .courses {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }
  .ccard {
    padding: 11px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
    color: var(--tx);
  }
  .ccard:hover {
    border-color: var(--g3);
  }
</style>
