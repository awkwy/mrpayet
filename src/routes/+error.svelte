<script>
  import { base } from '$app/paths';
  import { typed } from '$lib/actions/typed.js';
  // Page d'erreur volontairement mono-thème (sombre) : identité visuelle fixe
  // du site ("Tornado Cash" - vert, fond sombre, sobriété), pas un choix
  // clair/sombre à faire pencher selon le visiteur.
  //
  // Le texte se compose à la machine à écrire (action `typed`, adaptée du
  // CodePen shubniggurath/WbGyRKO) : le tag puis le "404" en glitch de blocs
  // puis les deux phrases, échelonnés. `prefers-reduced-motion` = tout affiché
  // d'emblée ; le rendu serveur affiche déjà le texte brut.

  const BLOCKS = '█▓▒░▄▀■▚▞';
  const DIGITS = '0123456789';
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<main>
  <span class="tag" use:typed={{ delay: 200, speed: 40 }}>ERREUR 404</span>

  <svg
    class="invader"
    viewBox="0 0 11 8"
    role="img"
    aria-label="Petit envahisseur pixel-art, façon Space Invaders"
  >
    <g fill="currentColor">
      <rect x="2" y="0" width="1" height="1" /><rect x="8" y="0" width="1" height="1" />
      <rect x="3" y="1" width="1" height="1" /><rect x="7" y="1" width="1" height="1" />
      <rect x="2" y="2" width="1" height="1" /><rect x="3" y="2" width="1" height="1" /><rect x="4" y="2" width="1" height="1" /><rect x="5" y="2" width="1" height="1" /><rect x="6" y="2" width="1" height="1" /><rect x="7" y="2" width="1" height="1" /><rect x="8" y="2" width="1" height="1" />
      <rect x="1" y="3" width="1" height="1" /><rect x="2" y="3" width="1" height="1" /><rect x="4" y="3" width="1" height="1" /><rect x="5" y="3" width="1" height="1" /><rect x="6" y="3" width="1" height="1" /><rect x="8" y="3" width="1" height="1" /><rect x="9" y="3" width="1" height="1" />
      <rect x="0" y="4" width="1" height="1" /><rect x="1" y="4" width="1" height="1" /><rect x="2" y="4" width="1" height="1" /><rect x="3" y="4" width="1" height="1" /><rect x="4" y="4" width="1" height="1" /><rect x="5" y="4" width="1" height="1" /><rect x="6" y="4" width="1" height="1" /><rect x="7" y="4" width="1" height="1" /><rect x="8" y="4" width="1" height="1" /><rect x="9" y="4" width="1" height="1" /><rect x="10" y="4" width="1" height="1" />
      <rect x="0" y="5" width="1" height="1" /><rect x="2" y="5" width="1" height="1" /><rect x="3" y="5" width="1" height="1" /><rect x="4" y="5" width="1" height="1" /><rect x="5" y="5" width="1" height="1" /><rect x="6" y="5" width="1" height="1" /><rect x="7" y="5" width="1" height="1" /><rect x="8" y="5" width="1" height="1" /><rect x="10" y="5" width="1" height="1" />
      <rect x="0" y="6" width="1" height="1" /><rect x="2" y="6" width="1" height="1" /><rect x="8" y="6" width="1" height="1" /><rect x="10" y="6" width="1" height="1" />
      <rect x="3" y="7" width="1" height="1" /><rect x="4" y="7" width="1" height="1" /><rect x="6" y="7" width="1" height="1" /><rect x="7" y="7" width="1" height="1" />
    </g>
  </svg>

  <h1
    use:typed={{
      delay: 650,
      speed: 90,
      glitch: true,
      glitchChance: 1,
      glitchCycles: 12,
      glitchInterval: 55,
      symbolsStart: BLOCKS,
      symbolsEnd: DIGITS
    }}
  >404</h1>

  <p use:typed={{ delay: 1500, speed: 28 }}>Cette page est introuvable.</p>
  <p class="sub" use:typed={{ delay: 2350, speed: 22 }}>
    L'envahisseur l'a peut-être emportée avant l'atterrissage.
  </p>

  <a class="retour" href="{base}/">Retour à l'accueil</a>
</main>

<style>
  main {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    gap: 28px;
    padding: 8vh 20px;
  }

  .tag {
    font-family: 'Press Start 2P', 'Atkinson Hyperlegible', monospace;
    font-size: 10px;
    letter-spacing: 0.12em;
    color: var(--g2);
    background: var(--surf2);
    border: 1px solid var(--line);
    padding: 8px 14px;
    border-radius: 2px;
  }

  .invader {
    width: 132px;
    height: 96px;
    color: var(--g);
    filter: drop-shadow(0 0 14px rgba(126, 242, 176, 0.35));
    animation: bob 2.4s ease-in-out infinite;
  }
  .invader rect {
    shape-rendering: crispEdges;
  }

  @keyframes bob {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-8px);
    }
  }

  h1 {
    font-family: 'Press Start 2P', monospace;
    font-size: clamp(40px, 12vw, 64px);
    line-height: 1;
    margin: 0;
    color: var(--g);
    text-shadow: 0 0 24px rgba(126, 242, 176, 0.3);
  }

  p {
    margin: 0;
    font-size: 17px;
    line-height: 1.6;
    max-width: 38ch;
  }
  p.sub {
    font-size: 14px;
    color: var(--dim2);
  }

  a.retour {
    font-family: 'Press Start 2P', monospace;
    font-size: 11px;
    color: var(--bg);
    background: var(--g);
    text-decoration: none;
    padding: 14px 22px;
    border-radius: 3px;
    border: 1px solid var(--g);
    transition:
      background 0.15s ease,
      box-shadow 0.15s ease;
  }
  a.retour:hover,
  a.retour:focus-visible {
    background: var(--warn);
    border-color: var(--warn);
    box-shadow: 0 0 0 4px rgba(255, 209, 102, 0.2);
  }
  a.retour:focus-visible {
    outline: 2px solid var(--tx);
    outline-offset: 3px;
  }

  /* Éléments créés par l'action `typed` (hors scope Svelte). */
  main :global(.typed-sr) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  main :global(.typed-char) {
    opacity: 0;
    transition: opacity 0.18s ease-in;
  }
  main :global(.typed-char.is-visible) {
    opacity: 1;
  }
  main :global(.typed-caret) {
    display: inline-block;
    width: 0;
    height: 1em;
    vertical-align: baseline;
    border-right: 0.14em solid currentColor;
    margin-right: -0.14em;
    animation: typed-blink 0.75s step-end infinite;
  }
  @keyframes typed-blink {
    from,
    to {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .invader {
      animation: none;
    }
    main :global(.typed-caret) {
      display: none;
    }
  }
</style>
