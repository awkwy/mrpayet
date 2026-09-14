<script>
  import { base } from '$app/paths';
  import PixelIcon from '$lib/components/pixel/PixelIcon.svelte';
  import { PLAY } from '$lib/pixel/sprites.js';
  import '$lib/styles/pixel.css';

  let { data } = $props();
</script>

<svelte:head>
  <title>{data.classe} — Questions flash — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb"><a href="{base}/flash">Flash</a> / {data.classe}</p>
  <h1>Choisir un thème</h1>

  <a class="parcours-cta" href="{base}/flash/{data.slug}/parcours">
    <PixelIcon bitmap={PLAY} ink="var(--blue)" size={24} label="" />
    <div>
      <div class="pn">Parcours par niveaux</div>
      <div class="pd">Débloque les thèmes un par un, façon jeu vidéo</div>
    </div>
  </a>

  <a class="mix" href="{base}/flash/{data.slug}/melange">
    <div class="mn">Mélange</div>
    <div class="md">Un peu de chaque thème, au hasard</div>
  </a>

  <div class="themes">
    {#each data.themes as th}
      <div class="tcard">
        <div class="tinfo">
          <div class="tt">{th.t}</div>
          <div class="tn">{th.n} questions</div>
        </div>
        <div class="tactions">
          <a class="tbtn" href="{base}/flash/{data.slug}/{th.id}">Flash</a>
          <a class="tbtn pixel-btn" href="{base}/flash/{data.slug}/{th.id}/cartes">Cartes</a>
        </div>
      </div>
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
  .parcours-cta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    padding: 14px 16px;
    border: 2px solid var(--blue);
    background: var(--surf3);
    box-shadow: 4px 4px 0 var(--g3);
  }
  .parcours-cta:active {
    transform: translate(3px, 3px);
    box-shadow: 1px 1px 0 var(--g3);
  }
  .pn {
    color: var(--blue);
    font-weight: 600;
  }
  .pd {
    color: var(--dim);
    font-size: 13px;
    margin-top: 3px;
  }
  .mix {
    display: block;
    margin-top: 12px;
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
  .tactions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }
  .tbtn {
    padding: 7px 12px;
    font-family: var(--sm);
    font-size: 12.5px;
    color: var(--dim);
    border: 1px solid var(--line2);
    border-radius: 6px;
    white-space: nowrap;
  }
  .tbtn:hover {
    border-color: var(--g3);
    color: var(--g);
  }
  /* La 2ᵉ action (cartes à associer) porte le chrome pixel-art des deux
     nouveaux mécanismes ; la 1ʳᵉ (quiz flash existant) garde le chrome
     habituel du site. */
  .tbtn.pixel-btn {
    padding: 7px 12px;
    font-size: 12.5px;
    border-color: var(--g3);
    color: var(--g);
    box-shadow: 2px 2px 0 var(--g3);
  }
</style>
