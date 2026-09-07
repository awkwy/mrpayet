<script>
  import { CCF_M } from '$lib/data/ccf-methode.js';
  import QuizInput from '$lib/components/QuizInput.svelte';

  let { data } = $props();
  let revealed = $state({});

  function toggle(key) {
    revealed[key] = !revealed[key];
  }

  let sections = $derived([data.ccf.maths, data.ccf.sciences].filter(Boolean));
</script>

<svelte:head>
  <title>{data.classe} — Révisions — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="eyebrow">Révisions</p>
  <h1>{data.classe}{data.ccf.label === 'devoir commun' ? ' — devoir commun' : ' — CCF'}</h1>
  {#if data.ccf.intro}
    <p class="intro">{@html data.ccf.intro}</p>
  {/if}

  <h2 class="h2">Les cinq compétences</h2>
  <div class="methods">
    {#each CCF_M as m}
      <div class="mcard">
        <div class="mn">{m.n}</div>
        <p class="mw">{m.w}</p>
        <p class="mx">{m.x}</p>
      </div>
    {/each}
  </div>

  {#each sections as sect}
    <h2 class="h2">{sect.titre}{sect.duree ? ` · ${sect.duree}` : ''}{sect.note ? ` · ${sect.note}` : ''}</h2>
    {#each sect.taches as tache, ti}
      <div class="tache">
        <h3 class="tt">{tache.titre}</h3>
        <p class="ctx">{tache.ctx}</p>
        <div class="qs">
          {#each tache.qs as q}
            <div class="qwrap">
              <span class="comp">{q.comp}</span>
              <QuizInput question={q} />
            </div>
          {/each}
        </div>
        {#if tache.comm}
          <div class="comm">
            <p class="commlbl">Communiquer</p>
            <p class="commq">{tache.comm}</p>
            <button type="button" class="reveal" onclick={() => toggle(sect.titre + ti)}>
              {revealed[sect.titre + ti] ? 'Masquer' : 'Voir'} une réponse possible
            </button>
            {#if revealed[sect.titre + ti]}
              <p class="comma">{tache.commA}</p>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
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
    margin-top: 36px;
  }
  .methods {
    display: grid;
    gap: 10px;
    margin-top: 14px;
  }
  .mcard {
    padding: 12px 14px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .mn {
    color: var(--g);
    font-weight: 600;
  }
  .mw {
    color: var(--tx);
    margin-top: 4px;
    font-size: 14px;
  }
  .mx {
    color: var(--dim2);
    margin-top: 4px;
    font-size: 13px;
  }
  .tache {
    margin-top: 24px;
    padding: 18px 18px 20px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .tt {
    font-size: 16px;
  }
  .ctx {
    color: var(--dim);
    margin-top: 8px;
  }
  .qs {
    margin-top: 14px;
    display: grid;
    gap: 10px;
  }
  .qwrap {
    display: grid;
    gap: 4px;
  }
  .comp {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--dim2);
    text-transform: uppercase;
  }
  .comm {
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
  }
  .commlbl {
    font-family: var(--sm);
    font-size: 11px;
    color: var(--g2);
    text-transform: uppercase;
  }
  .commq {
    color: var(--tx);
    margin-top: 4px;
  }
  .reveal {
    margin-top: 10px;
    background: none;
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 6px 12px;
    color: var(--dim);
    font-family: var(--sm);
    font-size: 12px;
  }
  .comma {
    margin-top: 10px;
    color: var(--dim);
    font-style: italic;
  }
</style>
