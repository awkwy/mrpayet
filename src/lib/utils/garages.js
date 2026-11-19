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
