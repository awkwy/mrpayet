<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM } from './shared.js';

  /* Flashcards « arrondir selon le contexte » — drill de décision, pas de calcul.
   *
   * Chaque carte pose une situation où une division ne tombe pas juste ; l'élève
   * décide seulement si on arrondit vers le haut ou vers le bas, sans poser le
   * calcul (cet atelier existe séparément). Deux boutons, feedback immédiat,
   * carte suivante. Même famille de composant que les ateliers AP existants
   * (`division.svelte`) mais dédié à cette décision précise, répétée sur un jeu
   * de cartes mélangé pour construire l'automatisme plutôt que le calcul.
   *
   * Accessibilité : boutons natifs (focus clavier natif), feedback textuel
   * (jamais couleur seule), table repliable listant toutes les cartes et leur
   * réponse pour qui préfère tout lire d'un coup. Mouvement réduit : pas
   * d'animation, seulement un changement de texte. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    const CARDS = (vd && vd.cards) || [
      { ctx: '30 enfants en sortie, 6 places par voiture : combien de voitures ?', up: true, why: 'Le dernier groupe, même incomplet, a quand même besoin d’une voiture.' },
      { ctx: '100 vis à ranger, sachets de 6 : combien de sachets complets ?', up: false, why: 'Un sachet incomplet ne compte pas comme un sachet complet.' },
      { ctx: '19 élèves, 1 adulte pour 6 : combien d’adultes faut-il ?', up: true, why: 'Il faut couvrir tout le monde, même le dernier petit groupe.' },
      { ctx: '250 vis, boîtes de 8 : combien de boîtes pleines ?', up: false, why: 'Une boîte non pleine n’est pas comptée.' }
    ];
    const TITLE = (vd && vd.title) || 'Vers le haut ou vers le bas ?';

    let order = CARDS.map((_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    let pos = 0;
    let good = 0;
    let seen = 0;
    let answered = false;

    const cardBox = box(host, 'aside', '');
    const md = box(
      host,
      'vctl',
      `<button data-d="up">▲ Vers le haut</button><button data-d="down">▼ Vers le bas</button>`
    );
    const say = box(host, 'say', 'Choisis, puis lis pourquoi.');
    const rd = readout(host, [
      { id: 'kScore', k: 'bonnes réponses', c: 'b' },
      { id: 'kVues', k: 'cartes vues', c: 'd' }
    ]);
    const nextBox = box(host, 'vctl', `<button class="p" id="next" hidden>Carte suivante →</button>`);

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir toutes les cartes</summary><table><caption>${CARDS.length} situations</caption>` +
        `<tr><th>Situation</th><th>Sens</th></tr>` +
        CARDS.map((c) => `<tr><td>${c.ctx}</td><td>${c.up ? 'Vers le haut' : 'Vers le bas'}</td></tr>`).join('') +
        `</table></details>`
    );

    function render() {
      const c = CARDS[order[pos]];
      cardBox.innerHTML = `<p><strong>${TITLE}</strong></p><p>${c.ctx}</p>`;
      say.textContent = 'Choisis, puis lis pourquoi.';
      say.style.borderLeftColor = '';
      answered = false;
      nextBox.querySelector('#next').hidden = true;
      md.querySelectorAll('button').forEach((b) => (b.disabled = false));
      rd.querySelector('#kScore').textContent = `${good} / ${seen}`;
      rd.querySelector('#kVues').textContent = `${seen} / ${CARDS.length}`;
    }

    function answer(dir) {
      if (answered) return;
      answered = true;
      seen++;
      const c = CARDS[order[pos]];
      const ok = (dir === 'up') === c.up;
      if (ok) good++;
      say.innerHTML = `${ok ? '✓ Correct.' : '✗ Pas cette fois.'} <b>${c.up ? 'Vers le haut' : 'Vers le bas'}</b> — ${c.why}`;
      say.style.borderLeftColor = ok ? 'var(--g3)' : 'var(--warn, #e0a45a)';
      md.querySelectorAll('button').forEach((b) => (b.disabled = true));
      rd.querySelector('#kScore').textContent = `${good} / ${seen}`;
      rd.querySelector('#kVues').textContent = `${seen} / ${CARDS.length}`;
      const nb = nextBox.querySelector('#next');
      nb.hidden = false;
      nb.textContent = pos + 1 < order.length ? 'Carte suivante →' : 'Recommencer le jeu ↺';
    }

    md.querySelectorAll('button').forEach((b) => {
      b.onclick = () => answer(b.dataset.d);
    });
    nextBox.querySelector('#next').onclick = () => {
      if (pos + 1 < order.length) {
        pos++;
        render();
      } else {
        order = CARDS.map((_, i) => i);
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [order[i], order[j]] = [order[j], order[i]];
        }
        pos = 0;
        good = 0;
        seen = 0;
        render();
      }
    };

    render();
    cleanup = () => {};
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
