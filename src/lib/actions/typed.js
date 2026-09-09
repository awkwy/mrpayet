/* Effet « machine à écrire » — adaptation de la démo « Typed header » de Liam
 * Egan (CodePen shubniggurath/WbGyRKO) en action Svelte.
 *
 * Le texte de l'élément est révélé lettre par lettre derrière un curseur
 * clignotant. Mode « glitch » optionnel : chaque lettre défile à travers des
 * symboles avant de se fixer. `prefers-reduced-motion` désactive tout — le
 * texte reste affiché tel quel, et le rendu serveur (sans JS) l'affiche aussi.
 *
 * Toutes les lettres sont posées dès le départ (en `opacity: 0`) : la boîte de
 * l'élément garde sa taille finale, donc aucun reflux pendant l'animation, y
 * compris sur plusieurs lignes. Le texte original est conservé pour les
 * lecteurs d'écran ; l'animation est masquée par `aria-hidden`.
 *
 * Usage : <h1 use:typed={{ glitch: true, delay: 500 }}>404</h1>
 *
 * Options :
 *   speed          ms par lettre (défaut 35)
 *   delay          ms avant de démarrer — sert à échelonner plusieurs éléments
 *   glitch         active le défilement de symboles (défaut false)
 *   glitchChance   probabilité qu'une lettre donnée glitche (défaut 0.4)
 *   glitchCycles   itérations de défilement par lettre (défaut aléatoire 2-4)
 *   glitchInterval ms entre deux symboles (défaut 35)
 *   symbolsStart   jeu de symboles au début du défilement
 *   symbolsEnd     jeu de symboles vers la fin du défilement
 */

const DEFAULT_SYMBOLS = '!<>-_\\/[]{}—=+*^?#_@';

export function typed(node, opts = {}) {
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return {};

  const {
    speed = 35,
    delay = 0,
    glitch = false,
    glitchChance = 0.4,
    glitchCycles,
    glitchInterval = 35,
    symbolsStart = DEFAULT_SYMBOLS,
    symbolsEnd = DEFAULT_SYMBOLS
  } = opts;

  const fullText = node.textContent;
  node.textContent = '';

  // Copie lue par les lecteurs d'écran.
  const sr = document.createElement('span');
  sr.className = 'typed-sr';
  sr.textContent = fullText;
  node.appendChild(sr);

  // Conteneur d'animation, ignoré par les lecteurs d'écran.
  const anim = document.createElement('span');
  anim.setAttribute('aria-hidden', 'true');
  node.appendChild(anim);

  const spans = [...fullText].map((ch) => {
    const s = document.createElement('span');
    s.textContent = ch;
    s.className = 'typed-char';
    anim.appendChild(s);
    return s;
  });

  const caret = document.createElement('span');
  caret.className = 'typed-caret';
  caret.setAttribute('aria-hidden', 'true');
  anim.insertBefore(caret, spans[0] ?? null);

  const timers = new Set();
  const later = (fn, ms) => {
    const id = setTimeout(() => {
      timers.delete(id);
      fn();
    }, ms);
    timers.add(id);
    return id;
  };

  let i = 0;
  function typeNext() {
    if (i >= spans.length) {
      caret.remove();
      return;
    }
    const span = spans[i];
    anim.insertBefore(caret, span.nextSibling);
    span.classList.add('is-visible');

    if (glitch && span.textContent !== ' ' && Math.random() < glitchChance) {
      const real = span.textContent;
      const max = Number.isFinite(glitchCycles)
        ? glitchCycles
        : Math.floor(Math.random() * 3) + 2;
      let n = 0;
      const gid = setInterval(() => {
        const progress = n / max;
        const set = Math.random() < progress ? symbolsEnd : symbolsStart;
        span.textContent = set[Math.floor(Math.random() * set.length)] || real;
        if (++n >= max) {
          clearInterval(gid);
          timers.delete(gid);
          span.textContent = real;
        }
      }, glitchInterval);
      timers.add(gid);
    }

    i++;
    later(typeNext, speed);
  }

  later(typeNext, delay);

  return {
    destroy() {
      timers.forEach((id) => {
        clearTimeout(id);
        clearInterval(id);
      });
      timers.clear();
    }
  };
}
