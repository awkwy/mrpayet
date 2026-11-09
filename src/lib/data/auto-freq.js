// Automatismes « effectif, fréquence, pourcentage » — variantes tirées au hasard
// pour le quiz flash (thème `freq` de automatismes.js). Questions reprises du
// rituel d'automatismes TC APM : effectif total, fréquence en nombre décimal,
// × 100, fraction ↔ décimal, lire un effectif sur un diagramme en bâtons.
// Jamais le signe ÷ : on écrit « k sur n » ou une fraction a/b.
//
// Chaque item : [question, réponse, extra?] — `extra.bars` = diagramme à tracer
// sous la question (le flash l'affiche en SVG). Les réponses sont des chaînes
// à virgule décimale (le contrôle du flash accepte aussi le point).
import { frNum, toPercent, toFrequency, clean } from '$lib/utils/freq.js';

const pick = (arr, rnd) => arr[Math.floor(rnd() * arr.length)];
const int = (a, b, rnd) => a + Math.floor(rnd() * (b - a + 1));

const THINGS = ['conflits traités', 'visiteurs reçus', 'réclamations traitées', 'objets perdus déclarés', 'situations notées'];
const DAYS = ['Lundi, mardi, mercredi', 'Trois matins de suite', 'Trois jours de la semaine'];

export const FAMILIES = {
  // effectif total : somme d'effectifs
  effectifTotal(rnd) {
    const a = int(2, 9, rnd);
    const b = int(2, 9, rnd);
    const c = int(2, 9, rnd);
    return [`${pick(DAYS, rnd)} : ${a}, ${b} puis ${c} ${pick(THINGS, rnd)}. Combien en tout ?`, String(a + b + c)];
  },
  // fréquence en nombre décimal : k sur n
  frequenceDecimale(rnd) {
    const n = pick([10, 4, 5, 20, 25, 50, 100], rnd);
    const k = int(1, n - 1, rnd);
    return [`${k} situations sur ${n} : donne la fréquence, en nombre décimal.`, frNum(clean(k / n))];
  },
  // × 100
  fois100(rnd) {
    const d = pick([0.4, 0.35, 0.07, 0.6, 0.05, 0.9, 0.25, 0.8, 0.12, 0.3, 0.15, 0.02], rnd);
    return [`Combien font ${frNum(d)} fois 100 ?`, frNum(toPercent(d))];
  },
  // pourcentage → fréquence
  pourcentageVersDecimal(rnd) {
    const p = pick([50, 10, 25, 75, 20, 5, 30, 60, 80, 40, 90, 12, 35], rnd);
    return [`${p} % : donne la fréquence, en nombre décimal.`, frNum(toFrequency(p))];
  },
  // fréquence → pourcentage
  decimalVersPourcentage(rnd) {
    const d = pick([0.5, 0.1, 0.25, 0.75, 0.2, 0.05, 0.3, 0.6, 0.8, 0.45, 0.9, 0.07], rnd);
    return [`Fréquence ${frNum(d)} : donne le pourcentage.`, frNum(toPercent(d))];
  },
  // fraction → décimal
  fractionVersDecimal(rnd) {
    const [n, d] = pick([[1, 2], [1, 4], [3, 4], [1, 5], [2, 5], [3, 5], [4, 5], [1, 10], [3, 10], [7, 10], [9, 10], [3, 20], [1, 20]], rnd);
    return [`${n}/${d} en nombre décimal.`, frNum(clean(n / d))];
  },
  // décimal → fraction simple
  decimalVersFraction(rnd) {
    const [d, f] = pick([[0.5, '1/2'], [0.25, '1/4'], [0.75, '3/4'], [0.2, '1/5'], [0.1, '1/10'], [0.4, '2/5'], [0.6, '3/5'], [0.8, '4/5']], rnd);
    return [`${frNum(d)} en fraction simple.`, f];
  },
  // retrouver un effectif à partir d'un pourcentage (le « mois suivant »)
  moisSuivant(rnd) {
    const total = pick([20, 25, 40, 50, 100, 200], rnd);
    const pct = pick([10, 20, 25, 50, 5, 40].filter((p) => Number.isInteger((total * p) / 100)), rnd);
    return [`Un registre de ${total} cartes : ${pct} % sont des disputes. Combien de disputes ?`, String((total * pct) / 100)];
  },
  // lire un effectif / l'effectif total sur un diagramme en bâtons
  lireBaton(rnd) {
    const letters = pick([['A', 'B', 'C'], ['D', 'E', 'F'], ['A', 'B', 'C', 'D']], rnd);
    const bars = letters.map((l) => [l, int(1, 6, rnd)]);
    const target = pick(bars, rnd);
    return [`Sur le diagramme : quel est l’effectif du type ${target[0]} ?`, String(target[1]), { bars }];
  },
  lireTotal(rnd) {
    const letters = pick([['A', 'B', 'C'], ['D', 'E', 'F']], rnd);
    const bars = letters.map((l) => [l, int(1, 6, rnd)]);
    return ['Sur le diagramme : quel est l’effectif total ?', String(bars.reduce((s, b) => s + b[1], 0)), { bars }];
  }
};

const ORDER = Object.keys(FAMILIES);

/** `n` questions variées (une famille de chaque avant de repiocher), sans doublon de texte. */
export function freqPool(n = 8, rnd = Math.random) {
  const out = [];
  const seen = new Set();
  let guard = 0;
  // ordre des familles mélangé, puis recommencé tant qu'il manque des questions
  while (out.length < n && guard++ < 200) {
    const fams = [...ORDER].sort(() => rnd() - 0.5);
    for (const f of fams) {
      if (out.length >= n) break;
      const item = FAMILIES[f](rnd);
      const key = item[0] + (item[2] ? JSON.stringify(item[2].bars) : '');
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out;
}

/** Générateurs par thème (clé = id du thème dans automatismes.js). */
export const GENERATORS = { freq: freqPool };
