/* Logique pure de la séance « Combien de mètres pour s'arrêter ? » (2P MV2,
 * module Mécanique) : distance d'arrêt = distance de réaction + distance de
 * freinage. Les distances de freinage (route sèche) sont des nombres INVENTÉS
 * d'ordre de grandeur réaliste ; le temps de réaction est de 1 s.
 *
 * Source unique des corrigés du cours `mecanique-mv` (séance 5) et de ses tests.
 * Jamais de signe « ÷ » dans les textes affichés (fractions via frac). */

export const T_REACTION = 1; // s
/** [vitesse km/h, distance de freinage route sèche (m)] — nombres inventés. */
export const FREINAGE_SEC = [[36, 7], [54, 16], [72, 29], [90, 45], [108, 64]];
/** Même vitesse de 72 km/h sur route mouillée : freinage allongé (nombre inventé). */
export const FREINAGE_MOUILLE_72 = 44;

const r2 = (x) => Math.round(x * 100) / 100;

/** km/h → m/s (on divise par 3,6). */
export const toMs = (kmh) => r2(kmh / 3.6);
/** Distance de réaction (m) : d = v × t. */
export const reaction = (kmh, t = T_REACTION) => r2(toMs(kmh) * t);
/** Distance d'arrêt (m) = réaction + freinage. */
export const arret = (kmh, freinage, t = T_REACTION) => r2(reaction(kmh, t) + freinage);
/** Tableau complet : [km/h, m/s, réaction, freinage, arrêt]. */
export const tableArret = (rows = FREINAGE_SEC) =>
  rows.map(([v, f]) => [v, toMs(v), reaction(v), f, arret(v, f)]);
/** Le véhicule s'arrête-t-il avant un obstacle placé à `d` mètres ? */
export const stopsBefore = (kmh, freinage, d) => arret(kmh, freinage) < d;
