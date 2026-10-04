// Logique pure du jeu du pendu : normalisation des accents, choix du mot,
// état de la partie. Aucun accès au DOM — testé par pendu.test.js.
// L'état est immuable : chaque action renvoie un nouvel objet.
import { PENDU_THEMES } from '$lib/data/pendu-words.js';

export const MAX_ERRORS = 8;
export const MELANGE = 'melange';

/** Lettre de base en majuscule (é → E, ç → C), ou '' si ce n'est pas une lettre A–Z. */
export function normalizeLetter(ch) {
  if (typeof ch !== 'string' || ch.length === 0) return '';
  const base = ch.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  return /^[A-Z]$/.test(base) ? base : '';
}

export function normalizeWord(word) {
  return [...word].map(normalizeLetter).join('');
}

export function wordsForTheme(id) {
  if (id === MELANGE) return [...new Set(PENDU_THEMES.flatMap((th) => th.words))];
  const th = PENDU_THEMES.find((t) => t.id === id);
  return th ? th.words : [];
}

/** Tire un mot au hasard en évitant, si possible, ceux de `avoid`. */
export function pickWord(words, rng = Math.random, avoid = []) {
  if (words.length === 0) return '';
  const fresh = words.filter((w) => !avoid.includes(w));
  const pool = fresh.length > 0 ? fresh : words;
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
}

export function newGame(word, max = MAX_ERRORS) {
  return { word, max, guessed: [] };
}

/** Joue une lettre ; sans effet si invalide, déjà jouée ou partie terminée. */
export function guess(state, ch) {
  const l = normalizeLetter(ch);
  if (!l || state.guessed.includes(l) || status(state) !== 'playing') return state;
  return { ...state, guessed: [...state.guessed, l] };
}

export function wrongLetters(state) {
  const letters = new Set([...state.word].map(normalizeLetter));
  return state.guessed.filter((l) => !letters.has(l));
}

export function errors(state) {
  return wrongLetters(state).length;
}

export function status(state) {
  if (errors(state) >= state.max) return 'lost';
  const won = [...state.word].every((c) => state.guessed.includes(normalizeLetter(c)));
  return won ? 'won' : 'playing';
}

/** Une case par lettre du mot : `shown` si trouvée (ou révélée en fin de partie), `missed` si révélée après défaite. */
export function board(state) {
  const over = status(state) !== 'playing';
  return [...state.word].map((c) => {
    const found = state.guessed.includes(normalizeLetter(c));
    return { ch: c.toUpperCase(), shown: found || over, missed: over && !found };
  });
}

/** Lettre jouée : 'right', 'wrong' ou null si pas encore jouée. */
export function letterState(state, ch) {
  const l = normalizeLetter(ch);
  if (!state.guessed.includes(l)) return null;
  return wrongLetters(state).includes(l) ? 'wrong' : 'right';
}
