<script>
  import { base } from '$app/paths';
  import PixelIcon from '$lib/components/pixel/PixelIcon.svelte';
  import { LOCK, STAR, PLAY, TROPHY } from '$lib/pixel/sprites.js';
  import { progressStore, allThemesCleared, isThemeCleared, isDefiCleared } from '$lib/stores/automatismes-progress.js';
  import '$lib/styles/pixel.css';

  let { data } = $props();

  const progress = progressStore(data.slug);

  let themeIds = $derived(data.themes.map((t) => t.id));
  let nodes = $derived(
    data.themes.map((th, i) => {
      const cleared = isThemeCleared($progress, th.id);
      const unlocked = i === 0 || isThemeCleared($progress, data.themes[i - 1].id);
      return { ...th, cleared, unlocked, stars: $progress[th.id]?.stars || 0 };
    })
  );
  let defiUnlocked = $derived(allThemesCleared($progress, themeIds));
  let defiCleared = $derived(isDefiCleared($progress));
</script>

<svelte:head>
  <title>{data.classe} — Parcours par niveaux — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb"><a href="{base}/flash/{data.slug}">{data.classe}</a> / Parcours</p>
  <h1>Parcours par niveaux</h1>
  <p class="lead">
    Chaque thème réussi débloque le suivant. Valide les {data.themes.length} thèmes pour ouvrir le défi final.
  </p>

  <div class="steps">
    {#each nodes as node, i}
      <div class="step">
        <div class="rail">
          {#if node.unlocked}
            <div class="dot" class:cleared={node.cleared}>
              <PixelIcon
                bitmap={node.cleared ? STAR : PLAY}
                ink={node.cleared ? 'var(--g)' : 'var(--blue)'}
                size={26}
                label={node.cleared ? 'Réussi' : 'Disponible'}
              />
            </div>
          {:else}
            <div class="dot locked">
              <PixelIcon bitmap={LOCK} ink="var(--dim2)" accent="var(--line2)" size={26} label="Verrouillé" />
            </div>
          {/if}
          <div class="line" class:on={node.cleared}></div>
        </div>
        <div class="label">
          {#if node.unlocked}
            <a class="pixel-btn" class:g={node.cleared} class:b={!node.cleared} href="{base}/flash/{data.slug}/{node.id}?level=1&from=parcours">
              {node.t}
            </a>
            {#if node.cleared}
              <span class="ns" aria-hidden="true">{'★'.repeat(node.stars)}{'☆'.repeat(3 - node.stars)}</span>
            {/if}
          {:else}
            <span class="pixel-btn" aria-disabled="true">{node.t}</span>
          {/if}
        </div>
      </div>
    {/each}

    <div class="step final">
      <div class="rail">
        {#if defiUnlocked}
          <div class="dot" class:cleared={defiCleared}>
            <PixelIcon bitmap={TROPHY} ink={defiCleared ? 'var(--g)' : 'var(--warn)'} size={30} label={defiCleared ? 'Défi réussi' : 'Défi disponible'} />
          </div>
        {:else}
          <div class="dot locked">
            <PixelIcon bitmap={LOCK} ink="var(--dim2)" accent="var(--line2)" size={30} label="Verrouillé" />
          </div>
        {/if}
      </div>
      <div class="label">
        {#if defiUnlocked}
          <a class="pixel-btn" class:g={defiCleared} class:w={!defiCleared} href="{base}/flash/{data.slug}/melange?level=defi&from=parcours">
            Défi final
          </a>
        {:else}
          <span class="pixel-btn" aria-disabled="true">Défi final</span>
        {/if}
      </div>
    </div>
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
  .lead {
    color: var(--dim);
    margin-top: 6px;
  }
  .steps {
    margin-top: 26px;
  }
  .step {
    display: flex;
    gap: 14px;
  }
  .rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 46px;
    flex-shrink: 0;
  }
  .dot {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--blue);
    background: var(--surf3);
    box-shadow: 3px 3px 0 var(--g3);
  }
  .dot.cleared {
    border-color: var(--g3);
    background: var(--surf2);
  }
  .dot.locked {
    border-color: var(--line2);
    box-shadow: 3px 3px 0 var(--line);
  }
  .line {
    width: 4px;
    flex: 1;
    min-height: 22px;
    background: var(--line2);
  }
  .line.on {
    background: var(--g3);
  }
  .step.final .line {
    display: none;
  }
  .label {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 4px;
    padding-bottom: 22px;
  }
  .label .pixel-btn {
    width: 100%;
    max-width: 260px;
    justify-content: flex-start;
  }
  .ns {
    color: var(--g);
    font-size: 12px;
    font-family: var(--sm);
  }
</style>
