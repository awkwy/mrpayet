/* Indicateurs d'une série statistique, selon la convention du lycée (fiches
 * « Quartiles et boîte à moustaches » et « L'écart type ») :
 *  - rang de Q₁ = effectif × 0,25, rang de Q₃ = effectif × 0,75 ; si ce n'est
 *    pas un entier, on arrondit au rang SUPÉRIEUR ; on lit ensuite la valeur
 *    à ce rang dans la série rangée ;
 *  - médiane = valeur centrale (effectif impair) ou milieu des deux valeurs
 *    centrales (effectif pair) ;
 *  - écart type σ de population (la ligne « σ » de la calculatrice, pas « s »).
 * Module pur, partagé par les manipulations (σ, bilan, boîtes) et testé. */

export const sortAsc = (v) => [...v].sort((a, b) => a - b);

export const mean = (v) => v.reduce((s, x) => s + x, 0) / v.length;

export function median(v) {
  const s = sortAsc(v);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
}

/** Rang (à partir de 1) d'un quartile : effectif × p, arrondi au rang supérieur. */
export function quartileRank(n, p) {
  // l'arrondi à 1e-9 évite qu'un produit comme 20 × 0,25 flotte au-dessus de 5
  return Math.ceil(Math.round(n * p * 1e9) / 1e9);
}

export function quartile(v, p) {
  const s = sortAsc(v);
  return s[quartileRank(s.length, p) - 1];
}

export function sigma(v) {
  const m = mean(v);
  return Math.sqrt(mean(v.map((x) => (x - m) ** 2)));
}

export function summary(v) {
  const s = sortAsc(v);
  const q1 = quartile(s, 0.25);
  const q3 = quartile(s, 0.75);
  return {
    n: s.length,
    mean: mean(s),
    min: s[0],
    max: s[s.length - 1],
    range: s[s.length - 1] - s[0],
    q1,
    med: median(s),
    q3,
    iqr: q3 - q1,
    sigma: sigma(s)
  };
}

/** Arrondi à `d` décimales renvoyé en nombre (pas en chaîne). */
export const round = (x, d = 0) => {
  const k = 10 ** d;
  return Math.round((x + Number.EPSILON) * k) / k;
};

/** Écriture française d'un nombre : virgule décimale, espace fine pour les milliers. */
export function nf(x, d = null) {
  const s = d === null ? String(x) : Number(x).toFixed(d);
  const [i, f] = s.split('.');
  const ent = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return f ? ent + ',' + f : ent;
}
