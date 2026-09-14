// Progression du « parcours par niveaux » des automatismes (une carte par
// classe, voir src/routes/flash/[classe]/parcours). Un thème est validé à
// 75 % de bonnes réponses ou plus au quiz flash lancé depuis le parcours
// (?level=1) ; une fois tous les thèmes d'une classe validés, le nœud
// « défi final » (le mélange, ?level=defi) se débloque. Persisté en
// localStorage, une clé par classe — mémoire de progression ordinaire côté
// client, dégradée en silence si indisponible (navigation privée etc.),
// comme `$lib/stores/progress.js`.
import { writable, get } from 'svelte/store';

export const PASS_RATIO = 0.75;

function keyFor(classeSlug) {
  return `mrp.parcours.${classeSlug}`;
}

function load(classeSlug) {
  try {
    const raw = localStorage.getItem(keyFor(classeSlug));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function persist(classeSlug, data) {
  try {
    localStorage.setItem(keyFor(classeSlug), JSON.stringify(data));
  } catch {
    // localStorage indisponible (navigation privée) : la progression ne
    // survivra pas au rechargement, mais la session en cours fonctionne
    // (rien n'est débloqué au prochain chargement plutôt qu'une erreur).
  }
}

const stores = new Map();

/** Store réactif de la progression d'une classe : `{ [themeId]: { cleared,
 * stars, score, total }, defi?: {...} }`. Un seul writable par slug de
 * classe, créé à la demande et mémoïsé. */
export function progressStore(classeSlug) {
  if (!stores.has(classeSlug)) {
    stores.set(classeSlug, writable(load(classeSlug)));
  }
  return stores.get(classeSlug);
}

export function isPassing(score, total) {
  return total > 0 && score / total >= PASS_RATIO;
}

function starsFor(score, total) {
  if (total <= 0) return 0;
  const ratio = score / total;
  if (ratio >= 1) return 3;
  if (ratio >= (1 + PASS_RATIO) / 2) return 2;
  return 1;
}

function markCleared(classeSlug, id, score, total) {
  if (!isPassing(score, total)) return false;
  const store = progressStore(classeSlug);
  const stars = starsFor(score, total);
  let changed = false;
  store.update((data) => {
    const prev = data[id];
    if (prev && prev.cleared && prev.stars >= stars) return data;
    changed = true;
    const next = { ...data, [id]: { cleared: true, stars, score, total } };
    persist(classeSlug, next);
    return next;
  });
  return changed;
}

/** Valide un thème (nœud du parcours) si le score atteint PASS_RATIO ; ne
 * fait rien sinon (le nœud reste tel quel, l'élève retente). Garde le
 * meilleur essai (plus d'étoiles) si déjà validé. */
export function markThemeCleared(classeSlug, themeId, score, total) {
  return markCleared(classeSlug, themeId, score, total);
}

/** Valide le défi final (mélange de tous les thèmes de la classe). */
export function markDefiCleared(classeSlug, score, total) {
  return markCleared(classeSlug, 'defi', score, total);
}

export function isThemeCleared(data, themeId) {
  return !!(data[themeId] && data[themeId].cleared);
}

export function isDefiCleared(data) {
  return isThemeCleared(data, 'defi');
}

export function allThemesCleared(data, themeIds) {
  return themeIds.every((id) => isThemeCleared(data, id));
}

/** Lit la progression courante d'une classe hors réactivité (ex. avant
 * affichage initial). */
export function currentProgress(classeSlug) {
  return get(progressStore(classeSlug));
}
