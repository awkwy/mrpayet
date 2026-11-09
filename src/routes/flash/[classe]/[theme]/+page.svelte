<script>
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { afterNavigate } from '$app/navigation';
  import { checkText } from '$lib/utils/answer-check.js';
  import { AUTO } from '$lib/data/automatismes.js';
  import { GENERATORS } from '$lib/data/auto-freq.js';
  import {
    PASS_RATIO,
    isPassing,
    markThemeCleared,
    markDefiCleared,
    currentProgress,
    isThemeCleared,
    allThemesCleared
  } from '$lib/stores/automatismes-progress.js';
  import '$lib/styles/pixel.css';

  let { data } = $props();

  // Lancé depuis le parcours par niveaux (?level=1 pour un thème, ?level=defi
  // pour le mélange final) : le quiz existant sert alors aussi de défi de
  // validation de nœud, voir src/routes/flash/[classe]/parcours. Cette page
  // est prérendue statiquement : `page.url.searchParams` est interdit au
  // build (SvelteKit ne connaît pas la query string d'une page statique), on
  // lit donc `location.search` côté navigateur uniquement, mis à jour à
  // chaque navigation (y compris un changement de query sur la même route).
  let level = $state(null);
  function readLevel() {
    if (browser) level = new URLSearchParams(window.location.search).get('level');
  }
  readLevel();
  afterNavigate(() => readLevel());

  let pool = $state([]);
  let idx = $state(0);
  let value = $state('');
  let results = $state([]);
  let timeLeft = $state(300);
  let finished = $state(false);
  let restartKey = $state(0);
  let awarded = $state(false);

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  $effect(() => {
    void data.slug;
    void data.theme;
    void restartKey;
    // thème à variantes tirées au hasard (ex. `freq`) : un nouveau tirage à chaque partie
    const gen = GENERATORS[data.theme];
    pool = gen ? gen(8) : shuffle(data.items).slice(0, 8);
    idx = 0;
    value = '';
    results = [];
    timeLeft = 300;
    finished = false;
    awarded = false;
    const id = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        timeLeft = 0;
        clearInterval(id);
        finished = true;
      }
    }, 1000);
    return () => clearInterval(id);
  });

  function submit(skip) {
    if (finished || !pool.length) return;
    const [q, a] = pool[idx];
    const ok = !skip && checkText(value, a);
    results = [...results, { q, a, given: skip ? '' : value, ok, skipped: skip }];
    value = '';
    if (idx + 1 >= pool.length) {
      finished = true;
    } else {
      idx += 1;
    }
  }

  function fmtTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  let score = $derived(results.filter((r) => r.ok).length);
  let passed = $derived(isPassing(score, results.length));
  let needed = $derived(Math.ceil(PASS_RATIO * results.length));
  let levelTitle = $derived(level === 'defi' ? 'Défi final' : data.title);

  $effect(() => {
    if (!finished || !level || awarded || !results.length) return;
    awarded = true;
    // Le parcours n'affiche un nœud comme jouable qu'une fois son
    // prérequis validé (voir parcours/+page.svelte) ; on retrouve la même
    // règle ici pour qu'une arrivée directe sur l'URL (lien partagé,
    // retour navigateur) ne puisse pas valider un nœud hors séquence.
    const order = AUTO.c[data.classe]?.o ?? [];
    const progress = currentProgress(data.slug);
    if (level === 'defi') {
      if (allThemesCleared(progress, order)) markDefiCleared(data.slug, score, results.length);
    } else {
      const i = order.indexOf(data.theme);
      const unlocked = i <= 0 || isThemeCleared(progress, order[i - 1]);
      if (unlocked) markThemeCleared(data.slug, data.theme, score, results.length);
    }
  });
</script>

<svelte:head>
  <title>{levelTitle} — {data.classe} — Flash — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/flash/{data.slug}">{data.classe}</a>
    {#if level}
      / <a href="{base}/flash/{data.slug}/parcours">Parcours</a>
    {/if}
    / {levelTitle}
  </p>

  {#if !finished && pool.length}
    <div class="bar">
      <span class="prog">Question {idx + 1}/{pool.length}</span>
      <span class="time" class:low={timeLeft <= 30}>{fmtTime(timeLeft)}</span>
    </div>

    <div class="qcard">
      <div class="qt">{pool[idx][0]}</div>
      {#if pool[idx][2]?.bars}
        {@const bars = pool[idx][2].bars}
        {#key idx}
          <svg class="mini" viewBox="0 0 220 120" role="img" aria-label={`Diagramme en bâtons : ${bars.map((b) => `type ${b[0]}, ${b[1]}`).join(' ; ')}`}>
            {#each [0, 1, 2, 3, 4, 5, 6] as g}
              <line x1="22" x2="214" y1={100 - g * 14} y2={100 - g * 14} class="mg" />
              <text x="16" y={103 - g * 14} text-anchor="end" class="mt">{g}</text>
            {/each}
            {#each bars as b, i}
              {@const bx = 22 + (i + 0.5) * (192 / bars.length)}
              <rect class="mb" x={bx - 12} y={100 - b[1] * 14} width="24" height={b[1] * 14} rx="3" style:animation-delay={`${i * 90}ms`} />
              <text x={bx} y="115" text-anchor="middle" class="mt x">{b[0]}</text>
            {/each}
          </svg>
        {/key}
      {/if}
      <div class="qin">
        <input
          type="text"
          autocomplete="off"
          bind:value
          onkeydown={(e) => e.key === 'Enter' && submit(false)}
        />
        <button type="button" class="btn ok" onclick={() => submit(false)}>Valider</button>
        <button type="button" class="btn skip" onclick={() => submit(true)}>Passer</button>
      </div>
    </div>
  {:else}
    <div class="results">
      <h1>Score : {score}/{results.length}</h1>
      {#if level}
        <div class="pixel-panel level-result" class:g={passed} class:w={!passed} role="status">
          {#if passed}
            🏆 Niveau validé !
          {:else}
            Pas encore validé — il faut au moins {needed}/{results.length} bonnes réponses. Retente le niveau !
          {/if}
        </div>
      {/if}
      <div class="rows">
        {#each results as r}
          <div class="rrow" class:ok={r.ok} class:skip={r.skipped}>
            <span class="rq">{r.q}</span>
            <span class="ra">
              {#if r.skipped}
                passé — réponse : {r.a}
              {:else if r.ok}
                {r.given} ✓
              {:else}
                {r.given} — attendu : {r.a}
              {/if}
            </span>
          </div>
        {/each}
      </div>
      <div class="actions">
        <button type="button" class="btn ok" onclick={() => (restartKey += 1)}>Recommencer</button>
        {#if level}
          <a class="pixel-btn" class:g={passed} href="{base}/flash/{data.slug}/parcours">Retour au parcours</a>
        {:else}
          <a class="btn skip" href="{base}/flash/{data.slug}">Changer de thème</a>
        {/if}
      </div>
    </div>
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
  .bar {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-top: 20px;
    font-family: var(--sm);
  }
  .prog {
    color: var(--dim);
    font-size: 13px;
  }
  .time {
    font-size: 18px;
    color: var(--g);
  }
  .time.low {
    color: var(--red);
  }
  .qcard {
    margin-top: 20px;
    padding: 24px 20px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
  }
  .mini {
    display: block;
    width: 100%;
    max-width: 300px;
    margin: 14px auto 0;
  }
  .mg {
    stroke: var(--line);
  }
  .mt {
    fill: var(--dim2);
    font-family: var(--sm);
    font-size: 9px;
  }
  .mt.x {
    fill: var(--tx);
    font-size: 12px;
    font-weight: 700;
  }
  .mb {
    fill: var(--g);
    transform-box: fill-box;
    transform-origin: 50% 100%;
    animation: mgrow 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes mgrow {
    from {
      transform: scaleY(0);
    }
    to {
      transform: scaleY(1);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .mb {
      animation: none;
    }
  }
  .qt {
    font-size: 20px;
    color: var(--tx);
  }
  .qin {
    display: flex;
    gap: 8px;
    margin-top: 18px;
    flex-wrap: wrap;
  }
  input {
    flex: 1;
    min-width: 140px;
    background: var(--bg);
    border: 1px solid var(--line2);
    border-radius: 6px;
    padding: 9px 12px;
    color: var(--tx);
    font-family: var(--sm);
    font-size: 15px;
  }
  input:focus-visible {
    border-color: var(--g);
  }
  .btn {
    border-radius: 6px;
    padding: 9px 14px;
    font-family: var(--sm);
    font-size: 13px;
    border: 1px solid var(--line2);
    background: none;
    color: var(--dim);
  }
  .btn.ok {
    border-color: var(--g3);
    color: var(--g);
  }
  .btn.skip {
    color: var(--dim);
  }
  .results h1 {
    font-size: 22px;
  }
  .rows {
    display: grid;
    gap: 8px;
    margin-top: 18px;
  }
  .rrow {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 14px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surf);
    font-size: 14px;
  }
  .rrow.ok {
    border-color: var(--g3);
  }
  .rrow.skip {
    opacity: 0.7;
  }
  .rq {
    color: var(--tx);
  }
  .ra {
    color: var(--dim);
    white-space: nowrap;
    font-family: var(--sm);
    font-size: 12px;
  }
  .rrow.ok .ra {
    color: var(--g);
  }
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 24px;
    flex-wrap: wrap;
  }
  .level-result {
    margin-top: 10px;
    padding: 10px 14px;
    font-family: var(--sm);
    font-size: 13px;
  }
  .level-result.g {
    color: var(--g);
    border-color: var(--g3);
  }
  .level-result.w {
    color: var(--warn);
    border-color: var(--warn);
  }
</style>
