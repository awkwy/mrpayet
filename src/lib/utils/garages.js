/* Logique pure de la séquence « Les fonctions » (2P MV2) : les devis de garages
 * (diagnostic + tarif horaire) sont des fonctions affines P(h) = fixe + heure × h.
 * Les nombres sont INVENTÉS pour l'exercice (annoncé dans la situation).
 *
 * Utilisé par la manipulation `garages.svelte` et par les tests : une seule
 * source pour les prix, le point de croisement et le garage le moins cher,
 * de sorte que la figure et les corrigés des questions ne peuvent pas diverger.
 * Jamais de signe « ÷ » dans les textes affichés (on utilise des fractions). */

export const KAHANI = { id: 'kahani', nom: 'garage de Kahani', court: 'Kahani', fixe: 15, heure: 30 };
export const GARAGE_B = { id: 'b', nom: 'garage B', court: 'B', fixe: 0, heure: 40 };
// Garage C de la mini-évaluation (séance 4) : 30 € à 0 h, 50 € à 1 h.
export const GARAGE_C = { id: 'c', nom: 'garage C', court: 'C', fixe: 30, heure: 20 };
// Garage C de l'étape « pour aller plus loin » (séance 3) : 20 € à 0 h, 45 € à 1 h.
export const GARAGE_C_BONUS = { id: 'c2', nom: 'garage C', court: 'C', fixe: 20, heure: 25 };

const EPS = 1e-9;

/** Prix (€) pour h heures de travail. */
export const price = (g, h) => g.fixe + g.heure * h;

/** Tableau de valeurs : [[h, prix], …]. */
export const table = (g, hs) => hs.map((h) => [h, price(g, h)]);

/** Droite passant par deux points : { a: coefficient directeur, b: ordonnée à l'origine }. */
export function lineFrom([x0, y0], [x1, y1]) {
  const a = (y1 - y0) / (x1 - x0);
  return { a, b: y0 - a * x0 };
}

/** Nombre d'heures qu'on peut payer avec `budget` € (antécédent), ou null si le
 * budget ne couvre même pas le diagnostic (aucun antécédent). */
export function hoursFor(g, budget) {
  if (g.heure === 0) return null;
  const h = (budget - g.fixe) / g.heure;
  return h < -EPS ? null : Math.max(0, h);
}

/** Point où les deux prix sont égaux : { h, prix }, ou null (droites parallèles). */
export function crossing(g1, g2) {
  if (g1.heure === g2.heure) return null;
  const h = (g2.fixe - g1.fixe) / (g1.heure - g2.heure);
  return { h, prix: price(g1, h) };
}

/** Garage le moins cher pour h heures : 'a' (g1), 'b' (g2) ou 'egal'. */
export function cheaper(g1, g2, h) {
  const d = price(g1, h) - price(g2, h);
  return Math.abs(d) < EPS ? 'egal' : d < 0 ? 'a' : 'b';
}

/** Écriture française d'un nombre (virgule décimale), sans zéros inutiles. */
export const fr = (n) => String(+n.toFixed(2)).replace('.', ',');

/** Heures lisibles : 1,5 → « 1 h 30 ». */
export function hm(h) {
  const total = Math.round(h * 60);
  const hh = Math.floor(total / 60);
  const mm = total % 60;
  return mm === 0 ? `${hh} h` : `${hh} h ${String(mm).padStart(2, '0')}`;
}

/** Phrase de décision pour h heures (même texte à l'écran et dans le tableau accessible). */
export function verdict(g1, g2, h) {
  const c = cheaper(g1, g2, h);
  const p1 = price(g1, h);
  const p2 = price(g2, h);
  if (c === 'egal') return `Même prix dans les deux garages : ${fr(p1)} €.`;
  const [moins, plus, pm, pp] = c === 'a' ? [g1, g2, p1, p2] : [g2, g1, p2, p1];
  return `Le garage ${moins.court} est moins cher : ${fr(pm)} € contre ${fr(pp)} € pour ${plus.court} (${fr(pp - pm)} € de moins).`;
}
