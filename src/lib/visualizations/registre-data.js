// Le registre de la médiation — 20 cartes (nombres inventés pour l'exercice).
// Même répartition que la fiche imprimée registre-mediation-tcapm :
// dispute 8, insultes 6, objet perdu ou volé 4, autre 2.
export const TYPES = [
  { id: 'dispute', label: 'dispute' },
  { id: 'insultes', label: 'insultes' },
  { id: 'objet', label: 'objet perdu ou volé' },
  { id: 'autre', label: 'autre' }
];

// Ordre des 20 cartes sur la fiche (n° 1 à 20).
export const SEQ = [
  'dispute', 'insultes', 'objet', 'dispute', 'autre',
  'dispute', 'insultes', 'dispute', 'objet', 'insultes',
  'dispute', 'dispute', 'insultes', 'autre', 'objet',
  'dispute', 'insultes', 'dispute', 'objet', 'insultes'
];

export function countsOf(seq = SEQ, types = TYPES) {
  return Object.fromEntries(types.map((t) => [t.id, seq.filter((x) => x === t.id).length]));
}

export const TOTAL = SEQ.length;
