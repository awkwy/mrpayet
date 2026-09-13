import securiteElectrique from './securite-electrique.js';
import statsProbas from './stats-probas.js';
import deciderSousContrainte from './decider-sous-contrainte.js';
import calculsCommerciaux from './calculs-commerciaux.js';
import apConsolidation from './ap-consolidation.js';
import apConsolidationApmp from './ap-consolidation-apmp.js';
import ficheOutils from './fiche-outils.js';
import statAepe from './stat-aepe.js';
import chimieAepe from './chimie-aepe.js';
import interetApmp from './interet-apmp.js';
import acoustiqueApmp from './acoustique-apmp.js';
import statApmp from './stat-apmp.js';
import proporAepe from './propor-aepe.js';
import probasAepe from './probas-aepe.js';
import probasApmp from './probas-apmp.js';
import fonctionsAepe from './fonctions-aepe.js';
import fonctionsApmp from './fonctions-apmp.js';
import geometrieAepe from './geometrie-aepe.js';
import thermique from './thermique.js';
import mecanique from './mecanique.js';
import optique from './optique.js';
import proporApmp from './propor-apmp.js';
import degre1Apmp from './degre1-apmp.js';
import degre1Mv from './degre1-mv.js';
import fonctionsMv from './fonctions-mv.js';
import geoMv from './geo-mv.js';

export const COURSES = [
  securiteElectrique,
  statsProbas,
  deciderSousContrainte,
  calculsCommerciaux,
  apConsolidation,
  apConsolidationApmp,
  ficheOutils,
  statAepe,
  chimieAepe,
  interetApmp,
  acoustiqueApmp,
  statApmp,
  proporAepe,
  probasAepe,
  probasApmp,
  fonctionsAepe,
  fonctionsApmp,
  geometrieAepe,
  thermique,
  mecanique,
  optique,
  proporApmp,
  degre1Apmp,
  degre1Mv,
  fonctionsMv,
  geoMv
];

export function courseById(id) {
  return COURSES.find((c) => c.id === id);
}
