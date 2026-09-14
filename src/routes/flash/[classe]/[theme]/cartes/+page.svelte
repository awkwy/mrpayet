<script>
  import { base } from '$app/paths';
  import PixelIcon from '$lib/components/pixel/PixelIcon.svelte';
  import { CARD_BACK, STAR, TROPHY } from '$lib/pixel/sprites.js';
  import '$lib/styles/pixel.css';

  let { data } = $props();

  const ROUND_SIZE = 6;
  const MISMATCH_DELAY = 1100;

  function normalize(s) {
    return String(s).trim().toLowerCase();
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Écarte les items dont la réponse est ambiguë dans ce thème (deux
  // questions partageant le même libellé de réponse) : sinon une carte
  // « réponse » pourrait sembler valider une question qui n'est pas la
  // sienne. Voir le brief — jamais deux correspondances possibles.
  function dedupedItems(items) {
    const seen = new Set();
    const out = [];
    for (const item of items) {
      const k = normalize(item[1]);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(item);
    }
    return out;
  }

  function newRound() {
    const pool = shuffle(dedupedItems(data.items)).slice(0, ROUND_SIZE);
    const cards = pool.flatMap((item, i) => [
      { id: `q${i}`, pair: i, kind: 'q', text: item[0], flipped: false, matched: false },
      { id: `a${i}`, pair: i, kind: 'a', text: item[1], flipped: false, matched: false }
    ]);
    return { pool, cards: shuffle(cards) };
  }

  let round = $state(newRound());
  let flippedIds = $state([]);
  let moves = $state(0);
  let matched = $state(0);
  let locked = $state(false);
  let feedback = $state(null);

  let finished = $derived(round.pool.length > 0 && matched === round.pool.length);
  let starCount = $derived.by(() => {
    const par = round.pool.length;
    if (moves <= par + 2) return 3;
    if (moves <= par * 2) return 2;
    return 1;
  });

  function cardAt(id) {
    return round.cards.find((c) => c.id === id);
  }

  function flip(id) {
    if (locked || finished) return;
    const card = cardAt(id);
    if (!card || card.flipped || card.matched) return;
    card.flipped = true;
    flippedIds = [...flippedIds, id];
    if (flippedIds.length < 2) return;

    moves += 1;
    const [aId, bId] = flippedIds;
    const a = cardAt(aId);
    const b = cardAt(bId);
    if (a.pair === b.pair) {
      a.matched = true;
      b.matched = true;
      matched += 1;
      flippedIds = [];
    } else {
      locked = true;
      const question = a.kind === 'q' ? a : b;
      feedback = { question: question.text, answer: round.pool[question.pair][1] };
      setTimeout(() => {
        a.flipped = false;
        b.flipped = false;
        flippedIds = [];
        feedback = null;
        locked = false;
      }, MISMATCH_DELAY);
    }
  }

  function restart() {
    round = newRound();
    flippedIds = [];
    moves = 0;
    matched = 0;
    locked = false;
    feedback = null;
  }
</script>

<svelte:head>
  <title>{data.title} — Cartes — {data.classe} — MrPayet</title>
</svelte:head>

<div class="wrap">
  <p class="crumb">
    <a href="{base}/flash/{data.slug}">{data.classe}</a> / {data.title} / Cartes à associer
  </p>

  {#if !finished}
    <div class="bar">
      <span>Paires trouvées : {matched}/{round.pool.length}</span>
      <span>Coups : {moves}</span>
    </div>
    <div class="pixel-bar" style="--n:{round.pool.length}; --done:{matched}">
      {#each round.pool as _, i}
        <span class:on={i < matched}></span>
      {/each}
    </div>

    <div class="grid" aria-label="Grille de {round.cards.length} cartes à associer">
      {#each round.cards as card (card.id)}
        <button
          type="button"
          class="card"
          class:flipped={card.flipped || card.matched}
          class:matched={card.matched}
          disabled={card.matched}
          onclick={() => flip(card.id)}
          aria-label={card.matched
            ? `Paire trouvée : ${card.text}`
            : card.flipped
              ? card.text
              : 'Carte cachée'}
        >
          <span class="face back" aria-hidden="true">
            <PixelIcon bitmap={CARD_BACK} ink="var(--g3)" size={22} />
          </span>
          <span class="face front">{card.text}</span>
          {#if card.matched}<span class="ok" aria-hidden="true">✓</span>{/if}
        </button>
      {/each}
    </div>

    {#if feedback}
      <div class="pixel-panel feedback" role="status">
        <span aria-hidden="true">✗</span>
        « {feedback.question} » → <strong>{feedback.answer}</strong>
      </div>
    {/if}
  {:else}
    <div class="pixel-panel done">
      <PixelIcon bitmap={TROPHY} ink="var(--warn)" size={48} label="Bien joué" />
      <h1>Toutes les paires trouvées !</h1>
      <p class="stat">{moves} coups pour {round.pool.length} paires</p>
      <div class="stars" aria-label="{starCount} étoiles sur 3">
        {#each [1, 2, 3] as n}
          <PixelIcon bitmap={STAR} ink={n <= starCount ? 'var(--g)' : 'var(--line2)'} size={26} />
        {/each}
      </div>
      <div class="actions">
        <button type="button" class="pixel-btn g" onclick={restart}>Rejouer</button>
        <a class="pixel-btn" href="{base}/flash/{data.slug}">Changer de thème</a>
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
    margin-top: 20px;
    font-family: var(--sm);
    font-size: 13px;
    color: var(--dim);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-top: 14px;
  }
  @media (min-width: 480px) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
  .card {
    position: relative;
    min-height: 84px;
    padding: 8px 6px;
    border: 2px solid var(--line2);
    background: var(--surf3);
    color: var(--tx);
    font-family: var(--sa);
    font-size: clamp(10px, 2.6vw, 12.5px);
    line-height: 1.25;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 3px 3px 0 var(--line2);
  }
  .card:active:not(:disabled) {
    transform: translate(2px, 2px);
    box-shadow: 1px 1px 0 var(--line2);
  }
  .card .face {
    display: none;
  }
  .card .face.back {
    display: flex;
  }
  .card.flipped .face.back {
    display: none;
  }
  .card.flipped .face.front {
    display: block;
  }
  .card.matched {
    border-color: var(--g3);
    background: var(--surf2);
    color: var(--g);
    box-shadow: 3px 3px 0 var(--g3);
  }
  .card .ok {
    position: absolute;
    top: 2px;
    right: 5px;
    color: var(--g);
    font-size: 12px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .card {
      transition: transform 0.05s linear;
    }
  }
  .feedback {
    margin-top: 14px;
    padding: 10px 12px;
    font-family: var(--sm);
    font-size: 13px;
    color: var(--red);
  }
  .feedback strong {
    color: var(--tx);
  }
  .done {
    margin-top: 24px;
    padding: 28px 20px;
    text-align: center;
    display: grid;
    justify-items: center;
    gap: 10px;
  }
  .done h1 {
    font-size: 19px;
  }
  .stat {
    color: var(--dim);
    font-family: var(--sm);
    font-size: 13px;
  }
  .stars {
    display: flex;
    gap: 6px;
  }
  .actions {
    display: flex;
    gap: 10px;
    margin-top: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }
</style>
