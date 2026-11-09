// Statistique à une variable — logique pure derrière l'application
// « Statistiques » de la NumWorks quand on tape V1 (valeurs) et N1 (effectifs).
// Le rendu (Stat1Shell.svelte) reste hors vitest, comme les autres écrans ;
// ce module porte l'algorithme : lecture des cases, effectif total, moyenne,
// et ce que l'élève voit selon ce qu'il a RÉELLEMENT tapé (erreurs comprises).

/** Lit une case tapée (virgule ou point). `null` si vide ou illisible. */
export function parseCell(s) {
  const t = String(s ?? '').trim().replace(',', '.');
  if (t === '') return null;
  const x = Number(t);
  return Number.isFinite(x) ? x : null;
}

/**
 * Lignes effectives d'un tableau tapé. Une ligne compte dès que V1 est un
 * nombre ; N1 vaut 1 par défaut (comme sur la calculatrice) tant qu'on n'y a
 * pas touché ; un effectif illisible ou négatif compte pour 0.
 * @param {Array<{v:string,n:string}>} rows
 * @returns {Array<{v:number,n:number}>}
 */
export function effectiveRows(rows) {
  const out = [];
  for (const r of rows) {
    const v = parseCell(r.v);
    if (v === null) continue;
    const raw = String(r.n ?? '').trim();
    const n = raw === '' ? 1 : parseCell(raw);
    out.push({ v, n: n !== null && n >= 0 ? n : 0 });
  }
  return out;
}

function rank(sorted, k) {
  // k-ième valeur (1-indexée) d'une série développée et rangée
  return sorted[Math.min(sorted.length, Math.max(1, k)) - 1];
}

/**
 * Indicateurs affichés dans l'onglet Stats. Retourne `null` s'il n'y a aucune
 * donnée. Médiane et quartiles : hors programme CAP, gardés pour la boîte
 * « pour les curieux » (la NumWorks les affiche quand même).
 */
export function statsOf(rows) {
  const eff = effectiveRows(rows).filter((r) => r.n > 0);
  const N = eff.reduce((s, r) => s + r.n, 0);
  if (N === 0) return null;
  const sum = eff.reduce((s, r) => s + r.v * r.n, 0);
  const vs = eff.map((r) => r.v);
  const min = Math.min(...vs);
  const max = Math.max(...vs);
  // série développée (effectifs entiers) pour médiane / quartiles
  const dev = [];
  for (const r of [...eff].sort((a, b) => a.v - b.v)) for (let i = 0; i < Math.round(r.n); i++) dev.push(r.v);
  const med =
    dev.length % 2 ? dev[(dev.length - 1) / 2] : (dev[dev.length / 2 - 1] + dev[dev.length / 2]) / 2;
  return {
    N,
    sum,
    mean: sum / N,
    min,
    max,
    range: max - min,
    median: med,
    q1: rank(dev, Math.ceil(dev.length / 4)),
    q3: rank(dev, Math.ceil((3 * dev.length) / 4))
  };
}

/** Compare ce que l'élève a tapé à la série attendue ; sert au contrôle
 * « mon effectif total est le même que dans mon tableau ». */
export function compareToExpected(rows, expected) {
  const got = statsOf(rows);
  const want = statsOf(expected.map(([v, n]) => ({ v: String(v), n: String(n) })));
  if (!want) return { ok: false, reason: 'no-expected', got, want };
  if (!got) return { ok: false, reason: 'empty', got, want };
  const eps = 1e-9;
  if (Math.abs(got.N - want.N) > eps) return { ok: false, reason: 'total', got, want };
  if (Math.abs(got.mean - want.mean) > 1e-6) return { ok: false, reason: 'mean', got, want };
  return { ok: true, reason: 'ok', got, want };
}

/**
 * Diagnostic de l'erreur de saisie la plus probable, d'après les symptômes
 * décrits dans la séance (effectif total trop petit / trop grand, colonnes
 * échangées, nombre oublié, ancien tableau non vidé).
 */
export function diagnose(rows, expected) {
  const cmp = compareToExpected(rows, expected);
  if (cmp.ok) return null;
  const { got, want } = cmp;
  if (!got) return 'empty';
  const eff = effectiveRows(rows);
  const expVals = expected.map(([v]) => v);
  const allOnes = eff.length > 0 && eff.every((r) => r.n === 1);
  if (allOnes && got.N < want.N) return 'n1-untouched';
  // colonnes échangées : les valeurs attendues se retrouvent dans N1
  const nVals = eff.map((r) => r.n).sort((a, b) => a - b);
  if (JSON.stringify(nVals) === JSON.stringify([...expVals].sort((a, b) => a - b))) return 'swapped';
  const stale = eff.some((r) => !expVals.includes(r.v));
  if (stale && got.N > want.N) return 'stale';
  if (got.N < want.N) return 'missing';
  return 'other';
}
