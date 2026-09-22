import securiteElectrique from './securite-electrique.js';
import mecaniqueMv from './mecanique-mv.js';
import statsProbas from './stats-probas.js';
import deciderSousContrainte from './decider-sous-contrainte.js';
import calculsCommerciaux from './calculs-commerciaux.js';
import apConsolidation from './ap-consolidation.js';
import apConsolidationTcapmp from './ap-consolidation-tcapmp.js';
import apConsolidation2pmv2 from './ap-consolidation-2pmv2.js';
import coInterventionDevisMv2 from './co-intervention-devis-mv2.js';
import apFractions from './ap-fractions.js';
import apSignes from './ap-signes.js';
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
import stat2varMs from './stat2var-ms.js';
import probaMs from './proba-ms.js';
import suitesMs from './suites-ms.js';
import poly3Ms from './poly3-ms.js';
import expologMs from './expolog-ms.js';
import commerceMs from './commerce-ms.js';
import stat2varMcv from './stat2var-mcv.js';
import probaMcv from './proba-mcv.js';
import suitesMcv from './suites-mcv.js';
import eqineqMcv from './eqineq-mcv.js';
import poly2Mcv from './poly2-mcv.js';
import deriveeMcv from './derivee-mcv.js';
import commerceMcv from './commerce-mcv.js';
import geoMcv from './geo-mcv.js';
import stat2varMcvtle from './stat2var-mcvtle.js';
import probaMcvtle from './proba-mcvtle.js';
import suitesMcvtle from './suites-mcvtle.js';
import poly3Mcvtle from './poly3-mcvtle.js';
import expologMcvtle from './expolog-mcvtle.js';
import commerceMcvtle from './commerce-mcvtle.js';

export const COURSES = [
  securiteElectrique,
  mecaniqueMv,
  statsProbas,
  deciderSousContrainte,
  calculsCommerciaux,
  apConsolidation,
  apConsolidationTcapmp,
  apConsolidation2pmv2,
  coInterventionDevisMv2,
  apFractions,
  apSignes,
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
  geoMv,
  stat2varMs,
  probaMs,
  suitesMs,
  poly3Ms,
  expologMs,
  commerceMs,
  stat2varMcv,
  probaMcv,
  suitesMcv,
  eqineqMcv,
  poly2Mcv,
  deriveeMcv,
  commerceMcv,
  geoMcv,
  stat2varMcvtle,
  probaMcvtle,
  suitesMcvtle,
  poly3Mcvtle,
  expologMcvtle,
  commerceMcvtle
];

export function courseById(id) {
  return COURSES.find((c) => c.id === id);
}
