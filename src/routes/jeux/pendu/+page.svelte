<script>
  import { onMount } from 'svelte';
  import { base } from '$app/paths';
  import { PENDU_THEMES } from '$lib/data/pendu-words.js';
  import {
    MELANGE, wordsForTheme, pickWord, newGame, guess, errors, status, board, letterState,
    normalizeLetter
  } from '$lib/utils/pendu.js';

  const ALPHABET = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  const THEMES = [...PENDU_THEMES.map((t) => ({ id: t.id, t: t.t })), { id: MELANGE, t: 'Mélange' }];

  let theme = $state(MELANGE);
  let game = $state(null);
  let recent = [];
  let wins = $state(0);
  let losses = $state(0);
  let announce = $state('');
  let bump = $state(false);

  let st = $derived(game ? status(game) : 'playing');
  let nErr = $derived(game ? errors(game) : 0);
  let cells = $derived(game ? board(game) : []);
  let themeLabel = $derived(THEMES.find((t) => t.id === theme)?.t ?? '');

  function spoken(g) {
    return board(g)
      .map((c) => (c.shown ? c.ch : 'lettre cachée'))
      .join(', ');
  }

  function start() {
    const word = pickWord(wordsForTheme(theme), Math.random, recent);
    recent = [...recent, word].slice(-8);
    game = newGame(word);
    announce = `Nouvelle partie, thème ${themeLabel}. Mot de ${word.length} lettres. 0 erreur sur ${game.max}.`;
  }

  function play(ch) {
    if (!game) return;
    const l = normalizeLetter(ch);
    if (!l) return;
    const before = game;
    const next = guess(game, l);
    if (next === before) return;
    game = next;
    const s = status(next);
    const e = errors(next);
    const ok = e === errors(before);
    if (!ok) {
      bump = false;
      requestAnimationFrame(() => (bump = true));
    }
    let msg = ok ? `${l} : bonne lettre.` : `${l} : absente du mot.`;
    msg += ` ${e} erreur${e > 1 ? 's' : ''} sur ${next.max}.`;
    if (s === 'won') {
      wins += 1;
      msg += ` Gagné ! Le mot était ${next.word}.`;
    } else if (s === 'lost') {
      losses += 1;
      msg += ` Perdu. Le mot était ${next.word}.`;
    } else {
      msg += ` Mot : ${spoken(next)}.`;
    }
    announce = msg;
  }

  function onKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key.length !== 1) return;
    const t = e.target;
    if (t instanceof HTMLElement && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    if (normalizeLetter(e.key)) {
      e.preventDefault();
      play(e.key);
    }
  }

  function chooseTheme(id) {
    theme = id;
    start();
  }

  onMount(start);

  // Parties du dessin, dans l'ordre d'apparition (une par erreur, 8 au total).
  const PARTS = [
    'M18 206 H122',
    'M50 206 V20',
    'M50 20 H130 M130 20 V44',
    null, // tête (cercle)
    'M130 76 V136',
    'M130 90 L106 116',
    'M130 90 L154 116',
    'M130 136 L111 176 M130 136 L149 176'
  ];
</script>

<svelte:window onkeydown={onKey} />

<svelte:head>
  <title>Jeu du pendu — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb"><a href="{base}/">Accueil</a> / Jeux</p>
  <h1>Jeu du pendu</h1>
  <p class="lead">Retrouve le mot du cours avant les {game?.max ?? 8} erreurs. Les accents ne comptent pas : E vaut aussi pour é, è, ê.</p>

  <div class="themes" role="group" aria-label="Thème des mots">
    {#each THEMES as th}
      <button type="button" class="chip" class:on={theme === th.id} aria-pressed={theme === th.id} onclick={() => chooseTheme(th.id)}>
        {th.t}
      </button>
    {/each}
  </div>

  <div class="board" class:won={st === 'won'} class:lost={st === 'lost'}>
    <svg class="gallows" viewBox="0 0 200 220" role="img" aria-label="Dessin du pendu : {nErr} partie{nErr > 1 ? 's' : ''} sur 8 tracée{nErr > 1 ? 's' : ''}">
      <g class="frame">
        {#each PARTS.slice(0, 3) as d, i}
          <path {d} pathLength="1" class="part" class:shown={nErr > i} />
        {/each}
      </g>
      <g class="man" class:swing={st === 'lost'} class:bump>
        <circle cx="130" cy="60" r="16" pathLength="1" class="part" class:shown={nErr > 3} />
        {#each PARTS.slice(4) as d, i}
          <path {d} pathLength="1" class="part" class:shown={nErr > i + 4} />
        {/each}
        {#if nErr > 3}
          {#if st === 'lost'}
            <path class="face" d="M122 54 l6 6 m0 -6 l-6 6 M132 54 l6 6 m0 -6 l-6 6" />
          {:else}
            <circle class="eye" cx="124" cy="57" r="1.8" />
            <circle class="eye" cx="136" cy="57" r="1.8" />
            <path class="face" d={st === 'won' ? 'M123 65 Q130 72 137 65' : 'M124 67 H136'} />
          {/if}
        {/if}
      </g>
    </svg>

    <div class="play">
      <p class="meta">
        <span>Thème : {themeLabel}</span>
        <span class="count" class:danger={nErr >= 6}>Erreurs : {nErr} / {game?.max ?? 8}</span>
      </p>

      <div class="word" aria-hidden="true">
        {#each cells as c}
          <span class="cell" class:missed={c.missed} class:filled={c.shown}>{c.shown ? c.ch : ''}</span>
        {:else}
          <span class="loading">Chargement…</span>
        {/each}
      </div>

      {#if st !== 'playing'}
        <div class="result" class:ok={st === 'won'} class:ko={st === 'lost'}>
          <p>
            {#if st === 'won'}
              <span aria-hidden="true">✓</span> Bravo, tu as trouvé « {game.word} » !
            {:else}
              <span aria-hidden="true">✗</span> Perdu… Le mot était « {game.word} ».
            {/if}
          </p>
          <button type="button" class="again" onclick={start}>Rejouer</button>
        </div>
      {/if}
    </div>
  </div>

  <p class="sr" role="status" aria-live="polite" aria-atomic="true">{announce}</p>

  <div class="kbd" role="group" aria-label="Clavier : choisis une lettre">
    {#each ALPHABET as l}
      {@const s = game ? letterState(game, l) : null}
      <button
        type="button"
        class="key"
        class:right={s === 'right'}
        class:wrong={s === 'wrong'}
        aria-label={s === 'right' ? `Lettre ${l}, juste` : s === 'wrong' ? `Lettre ${l}, fausse` : `Lettre ${l}`}
        aria-disabled={s !== null || st !== 'playing'}
        onclick={() => play(l)}
      >
        {l}
      </button>
    {/each}
  </div>

  <p class="score">Cette session : {wins} gagnée{wins > 1 ? 's' : ''} · {losses} perdue{losses > 1 ? 's' : ''}</p>
  {#if st === 'playing' && game}
    <button type="button" class="skip" onclick={start}>Changer de mot</button>
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
  .lead {
    color: var(--dim);
    margin-top: 6px;
  }
  .themes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 20px;
  }
  .chip {
    min-height: 40px;
    padding: 8px 14px;
    font-family: var(--sm);
    font-size: 12.5px;
    color: var(--dim);
    background: var(--surf);
    border: 1px solid var(--line2);
    border-radius: 999px;
    cursor: pointer;
  }
  .chip:hover {
    border-color: var(--g3);
    color: var(--g);
  }
  .chip.on {
    color: var(--g);
    border-color: var(--g2);
    background: var(--surf3);
  }
  .board {
    display: grid;
    grid-template-columns: minmax(0, 220px) minmax(0, 1fr);
    gap: 20px;
    align-items: center;
    margin-top: 22px;
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: var(--r);
    background: var(--surf);
    transition: border-color 0.4s ease;
  }
  .board.won {
    border-color: var(--g2);
  }
  .board.lost {
    border-color: var(--red);
  }
  .gallows {
    width: 100%;
    height: auto;
    max-height: 260px;
  }
  .part {
    fill: none;
    stroke: var(--g);
    stroke-width: 5;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 1;
    stroke-dashoffset: 1;
    opacity: 0;
    transition:
      stroke-dashoffset 0.55s cubic-bezier(0.3, 0.8, 0.3, 1),
      opacity 0.1s linear;
  }
  .frame .part {
    stroke: var(--g3);
  }
  .part.shown {
    stroke-dashoffset: 0;
    opacity: 1;
  }
  .man {
    transform-box: view-box;
    transform-origin: 130px 20px;
  }
  .man.bump {
    animation: bump 0.7s ease-out;
  }
  .man.swing {
    animation: swing 2.6s ease-in-out infinite;
  }
  .man .part {
    stroke: var(--tx);
  }
  .board.lost .man .part {
    stroke: var(--red);
  }
  .eye {
    fill: var(--tx);
  }
  .face {
    fill: none;
    stroke: var(--tx);
    stroke-width: 2.4;
    stroke-linecap: round;
  }
  .board.lost .face {
    stroke: var(--red);
  }
  @keyframes bump {
    0% { transform: rotate(0); }
    25% { transform: rotate(-6deg); }
    55% { transform: rotate(4deg); }
    80% { transform: rotate(-1.5deg); }
    100% { transform: rotate(0); }
  }
  @keyframes swing {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg); }
  }
  .meta {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 4px 12px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim);
  }
  .count.danger {
    color: var(--warn);
  }
  .word {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
    min-height: 44px;
  }
  .cell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(22px, 7vw, 34px);
    height: clamp(30px, 9vw, 42px);
    border-bottom: 3px solid var(--g3);
    font-family: var(--sm);
    font-size: clamp(16px, 5vw, 24px);
    font-weight: 700;
    color: var(--g);
  }
  .cell.filled {
    animation: pop 0.35s cubic-bezier(0.3, 1.4, 0.5, 1);
  }
  .cell.missed {
    color: var(--red);
    border-color: var(--red);
    animation: none;
  }
  @keyframes pop {
    from { transform: translateY(6px); opacity: 0; }
    to { transform: none; opacity: 1; }
  }
  .loading {
    color: var(--dim2);
    font-size: 14px;
  }
  .result {
    margin-top: 16px;
    padding: 12px 14px;
    border: 1px solid var(--line2);
    border-radius: var(--r);
    background: var(--surf2);
  }
  .result.ok {
    border-color: var(--g2);
    color: var(--g);
  }
  .result.ko {
    border-color: var(--red);
    color: var(--red);
  }
  .result p {
    font-weight: 600;
  }
  .again {
    margin-top: 10px;
    min-height: 44px;
    padding: 10px 20px;
    font-family: var(--sm);
    font-size: 14px;
    font-weight: 700;
    color: var(--bg);
    background: var(--g);
    border: none;
    border-radius: 8px;
    cursor: pointer;
  }
  .kbd {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 6px;
    margin-top: 20px;
  }
  .key {
    min-height: 46px;
    font-family: var(--sm);
    font-size: 16px;
    font-weight: 700;
    color: var(--tx);
    background: var(--surf2);
    border: 1px solid var(--line2);
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.12s ease;
    touch-action: manipulation;
  }
  .key:hover:not([aria-disabled='true']) {
    border-color: var(--g2);
  }
  .key:active:not([aria-disabled='true']) {
    transform: scale(0.94);
  }
  .key[aria-disabled='true'] {
    cursor: default;
  }
  .key.right {
    color: var(--g);
    border-color: var(--g3);
    background: var(--surf3);
  }
  .key.wrong {
    color: var(--dim2);
    text-decoration: line-through;
    background: var(--bg);
  }
  .key[aria-disabled='true']:not(.right):not(.wrong) {
    opacity: 0.5;
  }
  .score {
    margin-top: 16px;
    font-family: var(--sm);
    font-size: 12px;
    color: var(--dim2);
  }
  .skip {
    margin-top: 8px;
    min-height: 40px;
    padding: 8px 14px;
    font-family: var(--sm);
    font-size: 12.5px;
    color: var(--dim);
    background: none;
    border: 1px solid var(--line2);
    border-radius: 6px;
    cursor: pointer;
  }
  .skip:hover {
    color: var(--g);
    border-color: var(--g3);
  }
  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  button:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }
  @media (max-width: 560px) {
    .board {
      grid-template-columns: minmax(0, 1fr);
      justify-items: stretch;
    }
    .gallows {
      order: 2;
      max-width: 150px;
      justify-self: center;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .part,
    .key,
    .board {
      transition: none;
    }
    .man.bump,
    .man.swing,
    .cell.filled {
      animation: none;
    }
  }
</style>
