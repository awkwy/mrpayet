// Progression annuelle prévue, par classe — pour l'affichage « cette semaine »
// des pages de programme. Source : les 6 documents de progression du dépôt
// cours (maths/Progression_*.md, sciences/physique/Progression_*.md et
// Physique_2PMV2_progression_BO2019.md), croisés avec le calendrier réel
// (calendrier-pronote-2026-2027.ics — vacances, stages) pour convertir les
// périodes en semaines. C'est une progression *prévue*, pas figée : le
// capitaine peut s'en écarter en cours d'année, d'où le ton « prévu » plutôt
// qu'affirmatif dans l'UI qui consomme ces données.
//
// Convention (fiche calendrier-annee) : semaine 1 = lundi 24 août 2026
// (rentrée). semaine n commence le 24 août 2026 + 7×(n−1) jours.

export const WEEK1_MONDAY = '2026-08-24';

// {classe, blocId, from: semaine, to: semaine, note?}
// `note` documente une période qui ne correspond à aucun bloc du programme
// affiché (ex. consolidation de rentrée) — affichée telle quelle si aucun
// blocId ne convient.
//
// Contrôle d'accès : un contenu dont une entrée (repérée par `blocId`) a un
// `from` situé à plus de LOOKAHEAD_WEEKS semaines de la semaine réelle
// d'aujourd'hui n'est pas encore accessible (ni listé, ni ouvrable en lien
// direct / QR). Dès que `from <= semaine + LOOKAHEAD_WEEKS`, le contenu
// devient accessible et le reste définitivement — on ne reverrouille jamais
// sur `to`. Un contenu sans aucune entrée (automatismes, révisions, flash,
// aide-mémoire, AP…) n'est jamais verrouillé. Voir futureLock() ci-dessous.

// Fenêtre d'anticipation : un contenu s'ouvre ce nombre de semaines avant sa
// semaine `from` prévue. Ajustable facilement. Rationale du capitaine : deux
// semaines d'avance visible évitent une page programme vide sans réexposer
// toute l'année.
export const LOOKAHEAD_WEEKS = 2;
export const PROGRESSION = [
  // ---------- 2P MV2 — maths (Progression_2PMV2_maths.md) ----------
  { classe: '2P MV2', from: 2, to: 3, note: 'Consolidation de rentrée' },
  { classe: '2P MV2', blocId: 'mv-stat', from: 4, to: 9 },
  { classe: '2P MV2', blocId: 'mv-proba', from: 10, to: 16 },
  { classe: '2P MV2', blocId: 'mv-degre1', from: 21, to: 23 },
  { classe: '2P MV2', blocId: 'mv-fonctions', from: 24, to: 28 },
  { classe: '2P MV2', blocId: 'mv-geo', from: 34, to: 38 },

  // ---------- 2P MV2 — physique-chimie ----------
  // Physique_2PMV2_progression_BO2019.md prévoit Mécanique, Thermique,
  // Chimie, Acoustique, Optique — mais ces modules n'ont pas encore de
  // cours ni de bloc en ligne pour 2P MV2 (seul « Sécurité électrique »,
  // mv-pc-secu, est porté ; les blocs pc-* du programme BO2019 CAP
  // couvrent TC AEPE/TC APMP, pas 2P MV2, qui suit le programme bac pro).
  // Pas d'entrée ici tant que ce contenu n'existe pas côté site — mieux
  // vaut ne rien afficher qu'un lien mort.

  // ---------- TC AEPE — maths (Progression_TCAEPE_maths.md) ----------
  { classe: 'TC AEPE', blocId: 'degre1-cap', from: 2, to: 3, note: 'déjà fait — « décider sous contrainte »' },
  { classe: 'TC AEPE', blocId: 'stat-cap', from: 4, to: 7 },
  { classe: 'TC AEPE', blocId: 'proba-cap', from: 13, to: 16 },
  { classe: 'TC AEPE', blocId: 'propor-cap', from: 21, to: 23 },
  { classe: 'TC AEPE', blocId: 'fonctions-cap', from: 24, to: 26 },
  { classe: 'TC AEPE', blocId: 'geo-cap', from: 29, to: 29 },
  { classe: 'TC AEPE', blocId: 'geo-cap', from: 34, to: 36 },

  // ---------- TC AEPE — sciences (Progression_TCAEPE_sciences.md) ----------
  { classe: 'TC AEPE', blocId: 'pc-chimie', from: 4, to: 7 },
  { classe: 'TC AEPE', blocId: 'pc-thermique', from: 13, to: 16 },
  { classe: 'TC AEPE', blocId: 'pc-meca', from: 21, to: 23 },
  { classe: 'TC AEPE', blocId: 'pc-acous', from: 24, to: 26 },
  { classe: 'TC AEPE', blocId: 'pc-optique', from: 29, to: 29 },
  { classe: 'TC AEPE', blocId: 'pc-optique', from: 34, to: 36 },

  // ---------- TC APMP — maths (Progression_TCAPMP_maths.md) ----------
  { classe: 'TC APMP', blocId: 'commerce-cap', from: 2, to: 3, note: 'déjà fait' },
  { classe: 'TC APMP', blocId: 'commerce-cap', from: 10, to: 12 },
  { classe: 'TC APMP', blocId: 'stat-cap', from: 13, to: 16 },
  { classe: 'TC APMP', blocId: 'proba-cap', from: 21, to: 23 },
  { classe: 'TC APMP', blocId: 'fonctions-cap', from: 24, to: 26 },
  { classe: 'TC APMP', blocId: 'propor-cap', from: 29, to: 29 },

  // ---------- TC APMP — sciences (Progression_TCAPMP_sciences.md) ----------
  { classe: 'TC APMP', blocId: 'pc-acous', from: 2, to: 3 },
  { classe: 'TC APMP', blocId: 'pc-chimie', from: 10, to: 16 },
  { classe: 'TC APMP', blocId: 'pc-meca', from: 24, to: 26 },
  { classe: 'TC APMP', blocId: 'pc-thermique', from: 29, to: 29 },
  { classe: 'TC APMP', blocId: 'pc-optique', from: 33, to: 36 }
];

/** Numéro de semaine (convention calendrier-annee) pour une date donnée. */
export function weekOf(date = new Date()) {
  const monday = new Date(WEEK1_MONDAY + 'T00:00:00');
  const days = Math.floor((date - monday) / 86400000);
  return Math.floor(days / 7) + 1;
}

/** Entrées de progression actives pour une classe à une semaine donnée
 * (généralement 0 ou 1, parfois 2 quand maths et sciences se recouvrent). */
export function progressionAt(classe, week) {
  return PROGRESSION.filter((p) => p.classe === classe && week >= p.from && week <= p.to);
}

/** Lundi (Date) du début de la semaine n (convention calendrier-annee).
 * Arithmétique en UTC pour rester juste au passage heure d'été/hiver. */
export function weekMonday(week) {
  const [y, m, d] = WEEK1_MONDAY.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d) + 7 * (week - 1) * 86400000);
}

/**
 * Étant donné les entrées de progression qui pilotent l'accès à un contenu
 * (déjà filtrées par classe + blocId par l'appelant), indique si ce contenu
 * est encore verrouillé parce qu'aucune de ses fenêtres n'a commencé.
 *
 *  - aucune entrée                          -> `null` (contenu transversal,
 *                                              sans semaine attachée : jamais
 *                                              verrouillé)
 *  - au moins un `from <= week + LOOKAHEAD_WEEKS` -> `null` (fenêtre ouverte
 *                                              ou à portée d'anticipation :
 *                                              accessible définitivement,
 *                                              même une fois passée — on ne
 *                                              verrouille jamais sur `to`)
 *  - toutes les fenêtres au-delà            -> `{ from, monday }` de la plus
 *                                              proche ; `from`/`monday`
 *                                              restent la vraie semaine
 *                                              prévue, non décalée par
 *                                              l'anticipation
 *
 * `week` par défaut = semaine réelle d'aujourd'hui.
 */
export function futureLock(entries, week = weekOf()) {
  if (!entries || !entries.length) return null;
  if (entries.some((e) => e.from <= week + LOOKAHEAD_WEEKS)) return null;
  const soonest = entries.reduce((a, b) => (b.from < a.from ? b : a));
  return { from: soonest.from, monday: weekMonday(soonest.from) };
}
