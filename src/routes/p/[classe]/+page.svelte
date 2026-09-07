<script>
  import { base } from '$app/paths';
  import { blocsOf, blocState, blocById } from '$lib/utils/course-helpers.js';
  import { weekOf, progressionAt } from '$lib/data/progression.js';

  let { data } = $props();

  // Recalculé côté client (l'heure de build n'est pas la vôtre) : la
  // progression prévue par le capitaine, croisée avec la semaine réelle
  // d'aujourd'hui — voir $lib/data/progression.js pour la source.
  let semaine = $state(weekOf());
  let cetteSemaine = $derived(
    progressionAt(data.classe, semaine)
      .map((p) => ({ ...p, bloc: p.blocId ? blocById(p.blocId) : null }))
      .filter((p) => !p.blocId || p.bloc)
  );

  let domaines = $derived.by(() => {
    const blocs = blocsOf(data.classe);
    const byDom = new Map();
    blocs.forEach((b) => {
      if (!byDom.has(b.dom)) byDom.set(b.dom, []);
      byDom.get(b.dom).push(b);
    });
    return [...byDom.entries()].map(([dom, list]) => ({ dom, list }));
  });

  function badge(b) {
    const st = blocState(b, data.classe);
    if (b.integre) return { label: 'intégré', cls: 'muted' };
    if (!st.tot) return { label: 'à venir', cls: 'muted' };
    if (b.transversal) return { label: 'transversal', cls: 'muted' };
    if (st.done === st.tot) return { label: 'terminé', cls: 'ok' };
    return { label: `${st.done}/${st.tot} terminé(s)`, cls: '' };
  }
</script>

<svelte:head>
  <title>{data.classe} — Programme — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb"><a href="{base}/cours">Programme</a> / {data.classe}</p>
  <h1>{data.classe}</h1>

  <section class="now">
    <p class="eyebrow">Cette semaine</p>
    {#if cetteSemaine.length}
      <div class="nowlist">
        {#each cetteSemaine as p}
          {#if p.bloc}
            {@const bd = badge(p.bloc)}
            <a class="nowcard" href="{base}/bloc/{data.slug}/{p.bloc.id}">
              <div class="bt">{p.bloc.t}{p.note ? ` — ${p.note}` : ''}</div>
              <div class="bb {bd.cls}">{bd.label}</div>
            </a>
          {:else}
            <div class="nowcard plain">
              <div class="bt">{p.note}</div>
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <p class="nowempty">Rien de prévu cette semaine dans la progression (vacances, stage, ou période de révisions) — le programme complet reste ci-dessous.</p>
    {/if}
    <p class="nowfoot">D'après la progression prévue — l'ordre réel peut varier.</p>
  </section>

  <p class="alltitle">Tout le programme, par thème</p>

  {#each domaines as d}
    <section class="dom">
      <h2>{d.dom}</h2>
      <div class="blocs">
        {#each d.list as b}
          {@const bd = badge(b)}
          <a class="bcard" href="{base}/bloc/{data.slug}/{b.id}">
            <div class="bt">{b.t}</div>
            <div class="bb {bd.cls}">{bd.label}</div>
          </a>
        {/each}
      </div>
    </section>
  {/each}

  <hr class="hr" />
  <div class="rtools">
    <a href="{base}/revisions/{data.slug}">Révisions / devoir commun</a>
    <a href="{base}/r/{encodeURIComponent(data.classe)}">Aide-mémoire</a>
    <a href="{base}/flash/{data.slug}">Questions flash</a>
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
  .now {
    margin-top: 24px;
    padding: 18px 18px 16px;
    border: 1px solid var(--g3);
    border-radius: var(--r);
    background: var(--surf2);
  }
  .eyebrow {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--g2);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .nowlist {
    display: grid;
    gap: 8px;
    margin-top: 12px;
  }
  .nowcard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid var(--line2);
    border-radius: 8px;
    background: var(--surf);
  }
  .nowcard:hover {
    border-color: var(--g);
  }
  .nowcard.plain {
    color: var(--dim);
    font-size: 14px;
  }
  .nowempty {
    margin-top: 10px;
    color: var(--dim);
    font-size: 14px;
  }
  .nowfoot {
    margin-top: 12px;
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
  }
  .alltitle {
    margin-top: 36px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .dom {
    margin-top: 32px;
  }
  .dom h2 {
    font-size: 15px;
    color: var(--g2);
    font-family: var(--sm);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .blocs {
    display: grid;
    gap: 9px;
    margin-top: 12px;
  }
  .bcard {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 13px 16px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .bcard:hover {
    border-color: var(--g3);
  }
  .bt {
    color: var(--tx);
  }
  .bb {
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
    white-space: nowrap;
  }
  .bb.ok {
    color: var(--g);
  }
  .bb.muted {
    color: var(--dim2);
  }
  .hr {
    border: none;
    border-top: 1px solid var(--line);
    margin: 40px 0 20px;
  }
  .rtools {
    display: flex;
    gap: 18px;
    font-family: var(--sm);
    font-size: 13px;
  }
  .rtools a {
    color: var(--dim);
  }
</style>
