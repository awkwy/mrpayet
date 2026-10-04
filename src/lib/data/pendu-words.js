// Vocabulaire du jeu du pendu, par thème de cours. Un seul mot par entrée
// (lettres uniquement, accents autorisés, pas de ligature œ ni de tiret) :
// la forme accentuée est celle affichée à la révélation, la comparaison se
// fait sur la lettre de base (voir $lib/utils/pendu.js).
export const PENDU_THEMES = [
  {
    id: 'maths',
    t: 'Nombres et géométrie',
    words: [
      'fraction', 'pourcentage', 'proportionnalité', 'équation', 'coefficient', 'périmètre',
      'diagonale', 'hypoténuse', 'théorème', 'parallélogramme', 'puissance', 'racine', 'angle',
      'rectangle', 'triangle', 'symétrie', 'volume', 'relatif', 'décimal', 'numérateur',
      'dénominateur', 'arrondi', 'inconnue', 'cylindre', 'médiatrice', 'parallèle',
      'perpendiculaire', 'échelle', 'facteur'
    ]
  },
  {
    id: 'stats',
    t: 'Statistiques et probabilités',
    words: [
      'moyenne', 'médiane', 'quartile', 'effectif', 'fréquence', 'variance', 'étendue',
      'histogramme', 'probabilité', 'hasard', 'aléatoire', 'événement', 'échantillon',
      'fluctuation', 'diagramme', 'série', 'valeur', 'indépendant', 'population', 'sondage',
      'dispersion', 'arbre', 'issue', 'expérience'
    ]
  },
  {
    id: 'fonctions',
    t: 'Fonctions',
    words: [
      'fonction', 'affine', 'linéaire', 'antécédent', 'image', 'abscisse', 'ordonnée',
      'croissante', 'décroissante', 'parabole', 'dérivée', 'tangente', 'courbe', 'pente',
      'variation', 'maximum', 'minimum', 'logarithme', 'exponentielle', 'inéquation',
      'intervalle', 'repère', 'tableau', 'représentation'
    ]
  },
  {
    id: 'electricite',
    t: 'Électricité',
    words: [
      'tension', 'intensité', 'résistance', 'ampèremètre', 'voltmètre', 'multimètre', 'fusible',
      'disjoncteur', 'conducteur', 'isolant', 'courant', 'alternatif', 'continu', 'ampère',
      'énergie', 'lampe', 'dipôle', 'circuit', 'câble', 'surintensité', 'électrocution',
      'habilitation', 'interrupteur', 'générateur', 'dérivation', 'terre'
    ]
  },
  {
    id: 'chimie',
    t: 'Chimie',
    words: [
      'atome', 'molécule', 'électron', 'proton', 'neutron', 'acide', 'basique', 'neutre',
      'solution', 'solvant', 'soluté', 'dilution', 'concentration', 'mélange', 'réaction',
      'combustion', 'oxydation', 'corrosion', 'indicateur', 'titrage', 'détergent',
      'désinfectant', 'éprouvette', 'pipette', 'bécher', 'filtration', 'distillation',
      'produit', 'réactif'
    ]
  },
  {
    id: 'commerce',
    t: 'Commerce et calculs commerciaux',
    words: [
      'remise', 'bénéfice', 'marge', 'devis', 'facture', 'hausse', 'baisse', 'intérêt',
      'capital', 'taux', 'prix', 'solde', 'ristourne', 'rabais', 'acompte', 'commande',
      'client', 'fournisseur', 'catalogue', 'stock'
    ]
  }
];
