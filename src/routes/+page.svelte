<script>
  import { base } from '$app/paths';
  import { courseById } from '$lib/data/courses/index.js';
  import { CLASSES, bslug } from '$lib/utils/course-helpers.js';
  import { last as lastStore } from '$lib/stores/progress.js';

  let resume = $derived.by(() => {
    if (!$lastStore) return null;
    const [cid, n] = $lastStore.split('/');
    const c = courseById(cid);
    if (!c) return null;
    return { course: c, n: +n };
  });
</script>

<svelte:head>
  <title>MrPayet — Maths et physique-chimie, Kahani</title>
</svelte:head>

<div class="wrap">
  <section class="hero">
    <span class="tag">Lycée de Kahani · 2026-2027</span>
    <h1>Les cours, à emporter<br />et à manipuler.</h1>
    <p class="sub">
      Chaque chapitre se lit, s'entraîne et se termine par une manipulation : on fait bouger
      les nombres pour voir ce qu'ils font.
    </p>
    {#if resume}
      <a class="resume" href="{base}/c/{resume.course.id}/{resume.n}">
        <div class="k">Reprendre</div>
        <div class="v">{resume.course.titre} — {resume.course.seances[resume.n]?.t || ''}</div>
      </a>
    {/if}
    <div class="classes">
      {#each CLASSES as c}
        <a class="ccard" href="{base}/p/{bslug(c.n)}">
          <div class="cn">{c.n}</div>
          <div class="cd">{c.d}</div>
          <div class="cm">{c.m}</div>
        </a>
      {/each}
    </div>
  </section>
  <hr class="hr" />
  <section class="sect" style="padding-top:0">
    <p class="eyebrow">Accès direct</p>
    <h2 style="margin-top:8px">Accompagnement personnalisé (AP)</h2>
    <p class="lead" style="margin-top:8px">
      Le kit de consolidation des outils de base, un accès direct par classe — sans passer par
      le programme.
    </p>
    <div class="apgrid">
      <a class="ccard" href="{base}/c/ap-consolidation">
        <div class="cn">TC AEPE</div>
        <div class="cd">Division, arrondi, tableau, proportionnalité, pourcentage</div>
      </a>
      <a class="ccard" href="{base}/c/ap-consolidation-tcapmp">
        <div class="cn">TC APMP</div>
        <div class="cd">HT/TVA/TTC, coefficient, remise, répartition, arrondi</div>
      </a>
      <a class="ccard" href="{base}/c/ap-consolidation-2pmv2">
        <div class="cn">2P MV2</div>
        <div class="cd">Division, arrondi, tableau, proportionnalité, pourcentage</div>
      </a>
    </div>
  </section>
  <hr class="hr" />
  <section class="sect" style="padding-top:0">
    <p class="eyebrow">Le rituel</p>
    <h2 style="margin-top:8px">Questions flash</h2>
    <p class="lead" style="margin-top:8px">
      Le rituel des 5 premières minutes : calcul mental chronométré, autocorrigé, un thème à la
      fois ou en mélange.
    </p>
    <a class="ccard wide" href="{base}/flash">
      <div class="cn">Commencer une série</div>
      <div class="cd">3 classes · plusieurs thèmes · questions tirées au hasard</div>
    </a>
  </section>
</div>

<style>
  .wrap {
    max-width: var(--w);
    margin: 0 auto;
    padding: 40px 20px 80px;
  }
  .tag {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  h1 {
    margin-top: 10px;
  }
  .sub {
    color: var(--dim);
    max-width: 52ch;
  }
  .resume {
    display: block;
    margin: 20px 0;
    padding: 14px 16px;
    border: 1px solid var(--g3);
    border-radius: var(--r);
    background: var(--surf2);
  }
  .resume .k {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--g);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .resume .v {
    color: var(--tx);
    margin-top: 4px;
  }
  .classes {
    display: grid;
    gap: 11px;
    margin-top: 24px;
  }
  .apgrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 11px;
    margin-top: 16px;
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
  .hr {
    border: none;
    border-top: 1px solid var(--line);
    margin: 40px 0;
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
  }
  .wide {
    margin-top: 16px;
    border-color: var(--g3);
  }
</style>
