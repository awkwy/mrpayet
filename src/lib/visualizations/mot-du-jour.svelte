<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM } from './shared.js';

  /* « Mot du jour » — devinette façon Wordle sur le vocabulaire de la fiche.
   *
   * Un mot du deck (déjà utilisé dans les tableaux « mots du jour » des
   * fiches accessibles) à deviner en 6 essais. Comparaison insensible aux
   * accents (le joueur tape sans chercher les lettres accentuées) ; la
   * graphie exacte est révélée à la fin, avec la définition déjà connue de
   * la fiche — le jeu réutilise du vocabulaire déjà enseigné, il n'en
   * introduit pas de nouveau.
   *
   * Couleurs : vert (--g3, déjà le jeton "correct" du site) / orange
   * (--warn, déjà le jeton "attention") / gris (--dim2, atténué) — aucune
   * teinte nouvelle, jamais l'information par la couleur seule (chaque case
   * porte aussi une lettre, l'état final est aussi en texte).
   * Accessibilité : formulaire natif (label + input + bouton), focus
   * clavier natif, table repliable listant tout le deck. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  const norm = (s) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toUpperCase();

  onMount(() => {
    const WORDS = (vd && vd.words) || [
      { word: 'effectif', def: 'le nombre de personnes' },
      { word: 'echelle', def: 'le nombre que représente une case du quadrillage' },
      { word: 'mediane', def: 'la valeur du milieu, série rangée' },
      { word: 'etendue', def: 'le plus grand nombre moins le plus petit' }
    ];
    const MAX = 6;

    let target, guesses, done;

    const cardBox = box(host, 'aside', '');
    const grid = box(host, 'mdj-grid', '');
    const formBox = box(
      host,
      'vctl',
      `<input type="text" id="mdj-in" autocomplete="off" spellcheck="false" placeholder="ton mot…" style="text-transform:uppercase">` +
        `<button class="p" id="mdj-go">Valider</button>`
    );
    const say = box(host, 'say', '');
    const rd = readout(host, [{ id: 'kEssais', k: 'essais restants', c: 'b' }]);
    const nextBox = box(host, 'vctl', `<button class="p" id="mdj-next" hidden>Nouveau mot →</button>`);
    box(
      host,
      'viz-data',
      `<details><summary>Voir tout le deck</summary><table><caption>${WORDS.length} mots</caption>` +
        `<tr><th>Mot</th><th>Définition</th></tr>` +
        WORDS.map((w) => `<tr><td>${w.word}</td><td>${w.def}</td></tr>`).join('') +
        `</table></details>`
    );

    const input = formBox.querySelector('#mdj-in');
    const goBtn = formBox.querySelector('#mdj-go');
    const nextBtn = nextBox.querySelector('#mdj-next');

    function pick() {
      target = WORDS[Math.floor(Math.random() * WORDS.length)];
      guesses = [];
      done = false;
      cardBox.innerHTML = `<p><strong>Mot du jour.</strong> Devine le mot en ${MAX} essais : ${target.def}.</p>`;
      say.textContent = '';
      input.value = '';
      input.disabled = false;
      goBtn.disabled = false;
      nextBtn.hidden = true;
      renderGrid();
      rd.querySelector('#kEssais').textContent = `${MAX - guesses.length}`;
    }

    function renderGrid() {
      const len = norm(target.word).length;
      const rows = [];
      for (let r = 0; r < MAX; r++) {
        const g = guesses[r];
        const cells = [];
        for (let c = 0; c < len; c++) {
          if (!g) {
            cells.push(`<span class="mdj-c mdj-empty"></span>`);
          } else {
            cells.push(`<span class="mdj-c mdj-${g.status[c]}">${g.letters[c]}</span>`);
          }
        }
        rows.push(`<div class="mdj-row">${cells.join('')}</div>`);
      }
      grid.innerHTML = rows.join('');
    }

    function evaluate(guessWord) {
      const t = norm(target.word).split('');
      const g = norm(guessWord).split('');
      const status = new Array(g.length).fill('absent');
      const used = new Array(t.length).fill(false);
      for (let i = 0; i < g.length; i++) {
        if (g[i] === t[i]) {
          status[i] = 'correct';
          used[i] = true;
        }
      }
      for (let i = 0; i < g.length; i++) {
        if (status[i] === 'correct') continue;
        const j = t.findIndex((ch, k) => !used[k] && ch === g[i]);
        if (j !== -1) {
          status[i] = 'present';
          used[j] = true;
        }
      }
      return { letters: g, status };
    }

    function submit() {
      if (done) return;
      const raw = input.value.trim();
      const tlen = norm(target.word).length;
      if (norm(raw).length !== tlen) {
        say.textContent = `Ton mot doit avoir ${tlen} lettres.`;
        return;
      }
      const g = evaluate(raw);
      guesses.push(g);
      input.value = '';
      renderGrid();
      rd.querySelector('#kEssais').textContent = `${Math.max(0, MAX - guesses.length)}`;
      const win = g.status.every((s) => s === 'correct');
      if (win) {
        done = true;
        say.innerHTML = `✓ Trouvé ! <b>${target.word.toUpperCase()}</b> — ${target.def}`;
        input.disabled = true;
        goBtn.disabled = true;
        nextBtn.hidden = false;
      } else if (guesses.length >= MAX) {
        done = true;
        say.innerHTML = `Le mot était <b>${target.word.toUpperCase()}</b> — ${target.def}`;
        input.disabled = true;
        goBtn.disabled = true;
        nextBtn.hidden = false;
      } else {
        say.textContent = 'Encore un essai.';
      }
    }

    goBtn.onclick = submit;
    input.onkeydown = (e) => {
      if (e.key === 'Enter') submit();
    };
    nextBtn.onclick = pick;

    pick();
    cleanup = () => {};
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>

<style>
  :global(.mdj-grid) {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin: 10px 0;
  }
  :global(.mdj-row) {
    display: flex;
    gap: 5px;
  }
  :global(.mdj-c) {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--sm);
    font-size: 14px;
    font-weight: 700;
    border-radius: 5px;
    border: 1.5px solid var(--line2);
    color: var(--tx);
  }
  :global(.mdj-empty) {
    background: transparent;
  }
  :global(.mdj-correct) {
    background: var(--g3);
    border-color: var(--g3);
    color: #0a1410;
  }
  :global(.mdj-present) {
    background: var(--warn, #e0a45a);
    border-color: var(--warn, #e0a45a);
    color: #221604;
  }
  :global(.mdj-absent) {
    background: var(--surf3);
    border-color: var(--line2);
    color: var(--dim2);
  }
</style>
