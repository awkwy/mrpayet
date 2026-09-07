import { writable, get } from 'svelte/store';

const DONE_KEY = 'mrp.done';
const LAST_KEY = 'mrp.last';

function loadDone() {
  try {
    return new Set(JSON.parse(localStorage.getItem(DONE_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function loadLast() {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

export const done = writable(loadDone());
export const last = writable(loadLast());

function persistDone(set) {
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage indisponible (navigation privée) : la progression ne
    // survivra pas au rechargement, mais la session en cours fonctionne.
  }
}

export function markDone(id) {
  done.update((set) => {
    if (set.has(id)) return set;
    const next = new Set(set).add(id);
    persistDone(next);
    return next;
  });
}

export function isDone(id) {
  return get(done).has(id);
}

export function setLast(id) {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    // idem : dégrade en silence plutôt que de casser la navigation.
  }
  last.set(id);
}

export function resetProgress() {
  try {
    localStorage.removeItem(DONE_KEY);
    localStorage.removeItem(LAST_KEY);
  } catch {
    // idem.
  }
  done.set(new Set());
  last.set(null);
}
