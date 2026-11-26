import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { courseById } from './index.js';
import { DATASET_KAHANI, GARAGE_C3, GARAGE_C4 } from './fonctions-garage-mv.js';
import { RECAP } from '../recap.js';
import { COMP } from '../competences.js';
import { BLOCS } from '../blocs.js';
import { AUTO } from '../automatismes.js';
import { VIZ } from '../../visualizations/registry.js';
import { blocOfCourse } from '../../utils/course-helpers.js';
import { KAHANI, GARAGE_B, price, table, crossing, cheaper, fromPoints } from '../../utils/garages.js';

// Intégrité de la séquence « Les fonctions » (2P MV2, devis du garage de Kahani) :
// 4 séances en tutoriel « comment faire », câblage (bloc, récap, compétences, automatismes),
// et cohérence des corrigés avec la logique pure de $lib/utils/garages.js.
const c = courseById('fonctions-garage-mv');
const steps = c.seances.flatMap((se, n) => se.steps.map((st) => ({ ...st, n, se })));
const questions = steps.flatMap((st) => (st.q || []).map((q) => ({ ...q, step: st.t, n: st.n })));
const textOf = (x) => JSON.stringify(x);

describe('cours « Les fonctions » 2P MV2', () => {
  it('existe pour la classe 2P MV2, avec les 4 séances du plan de séquence', () => {
    expect(c).toBeTruthy();
    expect(c.classe).toBe('2P MV2');
    expect(c.seances.map((s) => s.t)).toEqual([
      'Combien coûte la réparation ?',
      'Le prix sur la courbe',
      'Deux garages, deux droites',
      'Quel garage choisir ?'
    ]);
  });

  it('chaque séance a problématique, trace écrite, quiz et fiches PDF', () => {
    for (const se of c.seances) {
      expect(se.prob && se.trace, se.t).toBeTruthy();
      expect(se.quiz.length, se.t).toBeGreaterThan(0);
      expect(se.pdf, se.t).toHaveLength(2);
    }
  });

  it('chaque séance s’ouvre par le rituel oral (5 min, sans calculatrice) du déroulé', () => {
    for (const se of c.seances) {
      expect(se.steps[0].t, se.t).toMatch(/^Rituel d’ouverture/);
      expect(se.steps[0].q.length, se.t).toBeGreaterThanOrEqual(4);
      expect(se.steps[0].apport, se.t).toBeTruthy();
      expect(se.steps[1].t, se.t).toBe('La situation');
    }
  });

  it('chaque séance commence par une situation qui annonce des nombres inventés', () => {
    for (const se of c.seances) {
      expect(se.steps[1].txt, se.t).toMatch(/inventés/);
    }
  });

  it('tutoriel « comment faire » : chaque étape numérotée explique (apport) avant ses questions', () => {
    for (const st of steps.filter((s) => /^Étape \d/.test(s.t) || /^★/.test(s.t))) {
      expect(st.apport, `${st.se.t} / ${st.t}`).toBeTruthy();
    }
    expect(c.seances[0].steps.filter((s) => /^Étape/.test(s.t))).toHaveLength(5);
    expect(c.seances[1].steps.filter((s) => /^Étape/.test(s.t))).toHaveLength(3);
    expect(c.seances[2].steps.filter((s) => /^Étape/.test(s.t))).toHaveLength(4);
    expect(c.seances[3].steps.filter((s) => /^Étape/.test(s.t))).toHaveLength(4);
  });

  it('questions ouvertes : réponses courtes bien formées, jamais de texte à trous', () => {
    expect(questions.length).toBeGreaterThan(30);
    for (const q of questions) {
      expect(q.q, q.step).toBeTruthy();
      if (q.txt) {
        expect(Array.isArray(q.a) && q.a.length > 0 && q.a.every((x) => typeof x === 'string' && x.trim()), q.q).toBe(true);
      } else {
        expect(Number.isFinite(q.a), q.q).toBe(true);
      }
      expect(q.q, q.q).not.toMatch(/_{2,}|\.{3} ?\)|\(…\)/);
    }
  });

  it('jamais le signe ÷ (fractions), ni dans le cours, ni dans le récap, ni dans les automatismes', () => {
    expect(textOf(c)).not.toMatch(/÷/);
    expect(textOf(RECAP['fonctions-garage-mv'])).not.toMatch(/÷/);
    expect(textOf(AUTO.t.fonctions_garage)).not.toMatch(/÷/);
    expect(textOf(COMP['fonctions-garage-mv/0'])).not.toMatch(/÷/);
  });

  it('les manipulations demandées existent dans le registre', () => {
    const vizs = steps.filter((s) => s.viz).map((s) => s.viz);
    expect(vizs).toEqual(expect.arrayContaining(['tarif']));
    for (const v of vizs) expect(VIZ[v], v).toBeDefined();
  });

  it('les fiches PDF référencées existent dans static/fiches/maths', () => {
    for (const se of c.seances) {
      for (const stem of se.pdf) {
        expect(existsSync(resolve(`static/fiches/${c.pdf}/${stem}.pdf`)), `${c.pdf}/${stem}.pdf`).toBe(true);
      }
    }
  });

  it('la calculatrice (séance 2) reçoit le tableau 0 h à 6 h du devis de Kahani', () => {
    const se = c.seances[1];
    const calc = se.steps.find((s) => s.calc).calc;
    expect(se.datasets[calc.dataset]).toEqual(DATASET_KAHANI);
    expect(DATASET_KAHANI).toEqual(table(KAHANI, [0, 1, 2, 3, 4, 5, 6]));
    expect(DATASET_KAHANI.map(([, p]) => p)).toEqual([15, 45, 75, 105, 135, 165, 195]);
  });
});

describe('corrigés cohérents avec les prix', () => {
  const ans = (start) => {
    const found = questions.filter((q) => q.q.startsWith(start));
    expect(found.length, start).toBeGreaterThan(0);
    return found.map((q) => q.a);
  };

  it('rituels d’ouverture : 30 × 4, 15 + 60, 3 vidanges, 30 × 5, 15 + 150, 1 h, +30 €', () => {
    expect([ans('30 fois 4')[0], ans('15 plus 60')[0], ans('Une vidange')[0]]).toEqual([120, 75, 120]);
    expect([ans('30 fois 5')[0], ans('15 plus 150')[0], ans('Sur notre graphique')[0], ans('Quand j’ajoute une heure')[0]]).toEqual([150, 165, price(KAHANI, 1), KAHANI.heure]);
    expect(ans('Un point est écrit')[0]).toContain('bas');
  });

  it('séance 1 : prix pour 2 h à 5 h, lectures 2 h 30 / 105 € / 150 €', () => {
    expect([ans('Prix pour 2 h')[0], ans('Prix pour 3 h')[0], ans('Prix pour 4 h')[0], ans('Prix pour 5 h')[0]]).toEqual([75, 105, 135, 165]);
    expect(ans('a) Combien paie')[0]).toBe(price(KAHANI, 2.5));
    expect(ans('b) Il n’a que 105')[0]).toBe(3);
    expect(ans('c) Et s’il a 150')[0]).toBe(4.5);
    expect(ans('★ Un deuxième scooter')[0]).toBe(price(KAHANI, 3.5));
  });

  it('séance 2 : images, antécédents et formule P(h)', () => {
    expect(ans('Quelle est l’image de 4 h')[0]).toBe(price(KAHANI, 4));
    expect(ans('Quelle est l’image de 0 h')[0]).toBe(15);
    expect(ans('Quel est l’antécédent de 75')[0]).toBe(2);
    expect(ans('Quel est l’antécédent de 150')[0]).toBe(4.5);
    expect(ans('P(2)')[0]).toBe(price(KAHANI, 2));
    expect(ans('P(6)')[0]).toBe(price(KAHANI, 6));
    expect(ans('P(10)')[0]).toBe(price(KAHANI, 10));
    expect(ans('Un client a 195')[0]).toBe(6);
  });
});

describe('séances 3 et 4 : deux garages, deux droites', () => {
  const ans = (start) => {
    const found = questions.filter((q) => q.n >= 2 && q.q.startsWith(start));
    expect(found.length, start).toBeGreaterThan(0);
    return found.map((q) => q.a);
  };
  it('garage B : 40 € par heure sans diagnostic ; point de croisement 1,5 h = 60 €', () => {
    expect(GARAGE_B).toMatchObject({ fixe: 0, heure: 40 });
    expect(table(GARAGE_B, [0, 1, 2, 3, 4, 5]).map(([, p]) => p)).toEqual([0, 40, 80, 120, 160, 200]);
    expect(crossing(KAHANI, GARAGE_B)).toBe(1.5);
    expect(price(KAHANI, 1.5)).toBe(60);
    expect(price(GARAGE_B, 1.5)).toBe(60);
    expect(cheaper(KAHANI, GARAGE_B, 1)).toBe(GARAGE_B);
    expect(cheaper(KAHANI, GARAGE_B, 3)).toBe(KAHANI);
    expect(cheaper(KAHANI, GARAGE_B, 1.5)).toBe('egal');
  });
  it('séance 3 : tableau du garage B, coefficient directeur, ordonnée à l’origine', () => {
    expect([1, 2, 3, 4, 5].map((h) => ans(`Garage B, prix pour ${h} h`)[0])).toEqual([40, 80, 120, 160, 200]);
    expect(ans('Garage de Kahani : coefficient directeur')[0]).toBe(30);
    expect(ans('Garage de Kahani : ordonnée')[0]).toBe(15);
    expect(ans('Garage B : coefficient directeur')[0]).toBe(40);
    expect(ans('Garage B : ordonnée')[0]).toBe(0);
    expect(ans('Garage B : Q(h) = 40 × h. Calcule Q(3)')[0]).toBe(120);
  });
  it('séance 3 : garage C (0 h → 20 €, 1 h → 45 €)', () => {
    expect(GARAGE_C3).toEqual({ fixe: 20, heure: 25 });
    expect(ans('Un garage C annonce')[0]).toBe(25);
    expect(ans('Son ordonnée')[0]).toBe(20);
  });
  it('séance 3 : les choix de garage suivent les prix (1 h → B, 3 h → Kahani)', () => {
    const q1 = questions.find((q) => q.q.startsWith('Avant de calculer, donne ton idée : pour 1 heure'));
    expect(q1.a).toContain('b');
    const q3 = questions.find((q) => q.q.startsWith('Un client veut 3 heures'));
    expect(q3.a).toContain('kahani');
    const near = questions.find((q) => q.q.startsWith('Entre les deux garages'));
    expect(Math.abs(near.a - crossing(KAHANI, GARAGE_B))).toBeLessThanOrEqual(near.tol);
  });
  it('séance 4 : lecture du croisement, vérification, décision et bilan du garage C', () => {
    expect(ans('Lis à peu près le point de croisement')[0]).toBe(crossing(KAHANI, GARAGE_B));
    expect(ans('Et quel prix à peu près')[0]).toBe(price(KAHANI, 1.5));
    expect(ans('Calcule P(1,5)')[0]).toBe(60);
    expect(ans('Calcule Q(1,5)')[0]).toBe(60);
    expect(ans('Pour quelle valeur de h')[0]).toBe(crossing(KAHANI, GARAGE_B));
    expect(ans('Client 2')[0]).toBe(60);
    expect(ans('Combien le client 3 économise')[0]).toBe(price(GARAGE_B, 3) - price(KAHANI, 3));
    expect(GARAGE_C4).toEqual({ fixe: 30, heure: 20 });
    expect(fromPoints([0, 30], [1, 50])).toEqual(GARAGE_C4);
    expect(ans('Garage C : coefficient directeur')[0]).toBe(20);
    expect(ans('Garage C : ordonnée')[0]).toBe(30);
    expect(ans('Écris l’expression R(h)')[0]).toBe(110);
    expect(ans('Un client a 130')[0]).toBe(5);
  });
  it('le tableau de la calculatrice de l’étape 3 de la séance 4 est exact', () => {
    const st = c.seances[3].steps.find((s) => /^Étape 3/.test(s.t));
    const hs = [0.5, 1, 1.5, 2, 2.5, 3];
    expect(st.doc.r[0].slice(1)).toEqual(hs.map((h) => String(price(KAHANI, h))));
    expect(st.doc.r[1].slice(1)).toEqual(hs.map((h) => String(price(GARAGE_B, h))));
  });
  it('la figure du tarif affiche les deux garages (vd.sansAutre absent)', () => {
    for (const n of [2, 3]) {
      const v = c.seances[n].steps.find((s) => s.viz === 'tarif');
      expect(v, c.seances[n].t).toBeTruthy();
      expect(v.vd?.sansAutre).toBeFalsy();
    }
  });
});

describe('câblage du module Fonctions (2P MV2)', () => {
  it('le bloc mv-fonctions porte la séquence ; la suite a son propre bloc', () => {
    const b = BLOCS.find((x) => x.id === 'mv-fonctions');
    expect(b.t).toBe('Fonctions'); // titre du module dans le BO 2019
    expect(b.cours['2P MV2']).toEqual(['fonctions-garage-mv']);
    expect(blocOfCourse('fonctions-garage-mv', '2P MV2').id).toBe('mv-fonctions');
    expect(blocOfCourse('fonctions-mv', '2P MV2').id).toBe('mv-fonctions-suite');
  });

  it('thème d’automatismes disponible pour la classe et pour le bloc', () => {
    expect(AUTO.c['2P MV2'].o).toContain('fonctions_garage');
    expect(AUTO.t.fonctions_garage.i.length).toBeGreaterThanOrEqual(8);
    expect(BLOCS.find((x) => x.id === 'mv-fonctions').flash).toContain('fonctions_garage');
  });

  it('automatismes : réponses cohérentes avec les prix', () => {
    const exp = {
      'Prix pour 2 h': price(KAHANI, 2),
      'Prix pour 0 h': price(KAHANI, 0),
      'Prix pour 4 h': price(KAHANI, 4),
      'Calcule P(3)': price(KAHANI, 3),
      'Calcule P(10)': price(KAHANI, 10),
      'Antécédent de 105': 3
    };
    const items = AUTO.t.fonctions_garage.i;
    for (const [k, v] of Object.entries(exp)) {
      const hit = items.filter(([q]) => q.includes(k));
      expect(hit.length, k).toBeGreaterThan(0);
      expect(hit.map(([, a]) => Number(a)), k).toContain(v);
    }
  });

  it('chaque séance a ses compétences et ses fiches d’aide-mémoire', () => {
    c.seances.forEach((_, n) => {
      const k = COMP[`fonctions-garage-mv/${n}`];
      expect(k, `fonctions-garage-mv/${n}`).toBeTruthy();
      expect(k.c.length).toBeGreaterThan(0);
      expect(k.comm && k.commA).toBeTruthy();
    });
    expect(RECAP['fonctions-garage-mv'].length).toBeGreaterThanOrEqual(5);
  });

  it('la suite du module garde des compétences alignées sur ses 4 séances (pneu, affine, variations, carré)', () => {
    const suite = courseById('fonctions-mv');
    expect(suite.seances).toHaveLength(4);
    suite.seances.forEach((_, n) => expect(COMP[`fonctions-mv/${n}`], `fonctions-mv/${n}`).toBeTruthy());
    expect(COMP['fonctions-mv/4']).toBeUndefined();
  });
});
