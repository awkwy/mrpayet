// Effectif, effectif total, fréquence, pourcentage — logique pure partagée par
// les manipulations « registre de la médiation », « dépouillement » et le
// drill d'automatismes. Jamais de signe ÷ dans les textes produits : les
// consommateurs affichent des fractions (voir frac.js).

/** Arrondi qui efface les restes binaires (0,07 × 100 = 7,000000000000001). */
export function clean(x, digits = 6) {
  const f = 10 ** digits;
  return Math.round(x * f) / f;
}

/** Fréquence = effectif sur effectif total. */
export function frequency(eff, total) {
  if (!total) return 0;
  return clean(eff / total);
}

/** Fréquence (0 à 1) → pourcentage (0 à 100) : on multiplie par 100. */
export function toPercent(f) {
  return clean(f * 100);
}

/** Pourcentage → fréquence : on prend la part de 100. */
export function toFrequency(p) {
  return clean(p / 100);
}

/** Nombre à la française : virgule décimale, sans zéros inutiles. */
export function frNum(x, max = 3) {
  return String(clean(x, max)).replace('.', ',');
}

/** « 40 % » (espace insécable avant le signe pourcent). */
export function frPct(p) {
  return `${frNum(p)} %`;
}

/** Nombre d'individus pour une fréquence donnée sur un effectif total. */
export function countFromFrequency(f, total) {
  return clean(f * total, 4);
}

/** Générateur pseudo-aléatoire déterministe (mulberry32) — pour un ordre de
 * dépouillement stable d'un rendu à l'autre. */
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange déterministe (Fisher-Yates) d'une copie du tableau. */
export function shuffled(arr, seed = 1) {
  const r = rng(seed);
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Séquence des réponses d'un questionnaire à partir des effectifs par
 * modalité : counts [11,16,12,7,4] → 50 indices de modalité, mélangés. */
export function slipsFromCounts(counts, seed = 7) {
  const flat = counts.flatMap((n, i) => Array(n).fill(i));
  return shuffled(flat, seed);
}

/** Barres d'un trait groupées par 5 (|||| barré) : 13 → [5,5,3]. */
export function tallyGroups(n) {
  const out = [];
  let left = n;
  while (left > 0) {
    out.push(Math.min(5, left));
    left -= 5;
  }
  return out;
}

/** Angle d'un secteur : fréquence × 360°. */
export function sectorAngle(eff, total) {
  return clean((eff / total) * 360, 2);
}
