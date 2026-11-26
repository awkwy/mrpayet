/* Logique pure de la séquence « Les fonctions » (2P MV2) : les devis de garages
 * (diagnostic + tarif horaire) sont des fonctions affines P(h) = fixe + heure × h.
 * Les nombres sont INVENTÉS pour l'exercice (annoncé dans la situation).
 *
 * Source unique des prix du cours `fonctions-garage-mv` et de ses tests.
 * Jamais de signe « ÷ » dans les textes affichés (on utilise des fractions). */

export const KAHANI = { id: 'kahani', nom: 'garage de Kahani', court: 'Kahani', fixe: 15, heure: 30 };

/** Prix (€) pour h heures de travail. */
export const price = (g, h) => g.fixe + g.heure * h;

/** Tableau de valeurs : [[h, prix], …]. */
export const table = (g, hs) => hs.map((h) => [h, price(g, h)]);

/** Garage B (fictif) : 40 € par heure, sans diagnostic (séances 3 et 4). */
export const GARAGE_B = { id: 'b', nom: 'garage B', court: 'B', fixe: 0, heure: 40 };

/** Droite par deux points (h0 ; p0) et (h1 ; p1) : { fixe (ordonnée à l'origine), heure (coefficient directeur) }. */
export const fromPoints = ([h0, p0], [h1, p1]) => {
  const heure = (p1 - p0) / (h1 - h0);
  return { fixe: p0 - heure * h0, heure };
};

/** Nombre d'heures où deux garages coûtent le même prix (null si parallèles). */
export const crossing = (a, b) => (a.heure === b.heure ? null : (a.fixe - b.fixe) / (b.heure - a.heure));

/** Le garage le moins cher pour h heures ('egal' si égalité). */
export const cheaper = (a, b, h) => (price(a, h) === price(b, h) ? 'egal' : price(a, h) < price(b, h) ? a : b);
