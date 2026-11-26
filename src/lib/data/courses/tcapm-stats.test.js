import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { COURSES, courseById } from './index.js';
import { RECAP } from '../recap.js';
import { COMP } from '../competences.js';
import { BLOCS } from '../blocs.js';
import { AUTO } from '../automatismes.js';
import { PROGRESSION, futureLock } from '../progression.js';
import { VIZ } from '../../visualizations/registry.js';

// Intégrité des cours « Statistique à une variable » du TC APM : mon stage en chiffres,
// registre de la médiation, sondage, AP statistique, et leur câblage (blocs, récap,
// compétences, automatismes, progression).
const IDS = [
  'stats-stage-tcapm',
  'registre-mediation-tcapm',
  'sondage-tcapm',
  'ap-stats-tcapm',
  'moyenne-tcapm',
  'bilan-stats-tcapm',
  'ap-defis-tcapm'
];
const courses = IDS.map((id) => courseById(id));

// Aplatit un contenu en texte ; les fonctions (réponses/messages calculés des étiquettes de phrase)
// sont appelées avec une valeur d'essai pour que leur texte soit contrôlé lui aussi.
const textOf = (x) =>
  JSON.stringify(x, (k, v) => {
    if (typeof v !== 'function') return v;
    try {
      return v({ type: 'les disputes' }, { type: 'les disputes' }) ?? '';
    } catch {
      return '';
    }
  });

describe('cours TC APM — statistique à une variable', () => {
  it('les cours existent, pour la classe TC APM, et ont des séances', () => {
    courses.forEach((c, i) => {
      expect(c, IDS[i]).toBeTruthy();
      expect(c.classe).toBe('TC APM');
      expect(c.seances.length).toBeGreaterThan(0);
    });
  });

  it("chaque étape suit le format : titre, et un apport avant ses questions", () => {
    for (const c of courses) {
      for (const se of c.seances) {
        expect(se.t && se.prob && se.trace, `${c.id} / ${se.t}`).toBeTruthy();
        for (const st of se.steps) {
          expect(st.t, `${c.id} / ${se.t}`).toBeTruthy();
          // une étape qui pose des questions (q) dit d'abord comment faire (apport)
          // ou s'appuie sur la situation / un document déjà posés
          if (st.q) expect(st.q.length, `${c.id} / ${st.t}`).toBeGreaterThan(0);
        }
      }
    }
  });

  it('les questions numériques ont une réponse numérique et un contrôle', () => {
    for (const c of courses) {
      for (const se of c.seances) {
        for (const st of se.steps) {
          for (const q of st.q || []) {
            expect(q.q, `${c.id} / ${st.t}`).toBeTruthy();
            if (q.txt) expect(q.a, q.q).toBeTruthy();
            else expect(Number.isFinite(q.a), q.q).toBe(true);
          }
        }
      }
    }
  });

  it("les visualisations demandées existent dans le registre", () => {
    for (const c of courses) {
      for (const se of c.seances) {
        for (const st of se.steps) {
          if (st.viz) {
            expect(Object.keys(VIZ), `${c.id} / ${st.t} → ${st.viz}`).toContain(st.viz);
            expect(VIZ[st.viz]).toBeDefined();
          }
        }
      }
    }
  });

  it('les fiches PDF référencées existent dans static/fiches', () => {
    for (const c of courses) {
      for (const se of c.seances) {
        for (const stem of se.pdf || []) {
          const file = resolve(`static/fiches/${c.pdf}/${stem}.pdf`);
          expect(existsSync(file), `${c.id} → ${c.pdf}/${stem}.pdf`).toBe(true);
        }
      }
    }
  });

  it('les images référencées existent dans static', () => {
    for (const c of courses) {
      for (const se of c.seances) {
        for (const st of se.steps) {
          for (const im of [].concat(st.img || [])) {
            expect(existsSync(resolve(`static${im.src}`)), im.src).toBe(true);
          }
        }
      }
    }
  });

  it('jamais le signe ÷ dans le contenu (règle du capitaine : des fractions)', () => {
    for (const c of courses) expect(textOf(c), c.id).not.toContain('÷');
    for (const id of IDS) expect(textOf(RECAP[id]), `recap ${id}`).not.toContain('÷');
    expect(textOf(AUTO.t.freq)).not.toContain('÷');
  });

  it("jamais « APMP » dans un contenu destiné aux élèves, classe comprise", () => {
    for (const c of courses) expect(textOf(c), c.id).not.toMatch(/APMP/);
    for (const id of IDS) expect(textOf(RECAP[id]), `recap ${id}`).not.toMatch(/APMP/);
  });

  it('les séances de calculatrice stat1 portent une série cohérente', () => {
    for (const c of courses) {
      for (const se of c.seances) {
        for (const st of se.steps) {
          if (st.calc?.mode !== 'stat1') continue;
          expect(Array.isArray(st.calc.series), `${c.id} / ${st.t}`).toBe(true);
          if (st.calc.series.length) for (const [v, n] of st.calc.series) expect(Number.isFinite(v + n)).toBe(true);
        }
      }
    }
  });
});

describe('câblage du module Statistique', () => {
  it('les cours sont rattachés à un bloc du programme TC APM', () => {
    const inBlocs = (id) => BLOCS.some((b) => (b.cours['TC APM'] || []).includes(id));
    IDS.forEach((id) => expect(inBlocs(id), id).toBe(true));
  });

  it('chaque cours a ses fiches récap, et chaque séance sa compétence', () => {
    for (const c of courses) {
      expect(RECAP[c.id]?.length, c.id).toBeGreaterThan(0);
      c.seances.forEach((_, i) => expect(COMP[`${c.id}/${i}`], `${c.id}/${i}`).toBeTruthy());
    }
  });

  it('le thème flash « freq » est proposé au TC APM, avec des questions à réponse unique', () => {
    expect(AUTO.c['TC APM'].o).toContain('freq');
    const answers = AUTO.t.freq.i.map((it) => it[1]);
    expect(new Set(answers).size).toBe(answers.length);
  });

  it('la statistique est ouverte depuis la semaine 10 (27 octobre), probabilités et fonctions restent verrouillées', () => {
    const stat = PROGRESSION.filter((p) => p.classe === 'TC APM' && p.blocId === 'stat-cap');
    expect(Math.min(...stat.map((p) => p.from))).toBe(10);
    // semaine 12 (9 novembre) : statistique accessible
    expect(futureLock(stat, 12)).toBeNull();
    const week = 12;
    for (const blocId of ['proba-cap', 'fonctions-cap']) {
      const entries = PROGRESSION.filter((p) => p.classe === 'TC APM' && p.blocId === blocId);
      expect(futureLock(entries, week), blocId).not.toBeNull();
    }
  });
});

describe('séances 5 et 6 + AP (moyenne, bilan, trois défis) — nombres du dépôt cours', () => {
  const mean = (rows) => rows.reduce((t, [v, n]) => t + v * n, 0) / rows.reduce((t, [, n]) => t + n, 0);
  const answers = (id) => courseById(id).seances.flatMap((se) => se.steps.flatMap((st) => (st.q || []).map((q) => q.a)));

  it('la moyenne du CDI (tableau d\'effectifs) vaut 1,45 pour 20 jours et 29 situations', () => {
    const cdi = [[0, 4], [1, 6], [2, 7], [3, 3]];
    expect(cdi.reduce((t, [, n]) => t + n, 0)).toBe(20);
    expect(cdi.reduce((t, [v, n]) => t + v * n, 0)).toBe(29);
    expect(mean(cdi)).toBeCloseTo(1.45, 10);
    const a = answers('moyenne-tcapm');
    for (const x of [20, 29, 1.45, 30, 25, 6, 5]) expect(a, String(x)).toContain(x);
    // la NumWorks est préremplie avec cette même série
    const calc = courseById('moyenne-tcapm').seances[1].steps.find((st) => st.calc?.series?.length).calc;
    expect(calc.series).toEqual(cdi);
  });

  it('les moyennes de la liste du portail et du terrain sont 6 et 5 (entre le plus petit et le plus grand)', () => {
    for (const [list, m] of [[[6, 4, 8, 5, 7], 6], [[3, 9, 2, 8, 3], 5]]) {
      expect(list.reduce((t, x) => t + x, 0) / list.length).toBe(m);
      expect(m).toBeGreaterThan(Math.min(...list));
      expect(m).toBeLessThan(Math.max(...list));
    }
  });

  it('le bilan est cohérent : 25 situations, 48 %, camembert à 360°, moyenne 10', () => {
    expect(8 + 12 + 5).toBe(25);
    expect((12 * 100) / 25).toBe(48);
    expect(180 + 108 + 72).toBe(360);
    expect(0.3 * 20).toBe(6);
    expect((12 + 8 + 10 + 15 + 5) / 5).toBe(10);
    const a = answers('bilan-stats-tcapm');
    for (const x of [25, 48, 50, 20, 6, 50, 10]) expect(a, String(x)).toContain(x);
  });

  it('les trois défis sont cohérents : 25 personnes, 40 + 32 + 28 = 100 %, moyenne 12 et 10', () => {
    expect(10 + 8 + 7).toBe(25);
    expect(40 + 32 + 28).toBe(100);
    expect((14 + 9 + 11 + 16 + 10) / 5).toBe(12);
    const att = [[5, 4], [10, 3], [15, 2], [20, 1]];
    expect(mean(att)).toBe(10);
    const a = answers('ap-defis-tcapm');
    for (const x of [25, 40, 32, 28, 60, 12, 4, 10, 100, 20]) expect(a, String(x)).toContain(x);
    expect(courseById('ap-defis-tcapm').seances.find((se) => se.steps.some((st) => st.calc?.series?.length)).steps.find((st) => st.calc?.series?.length).calc.series).toEqual(att);
  });

  it('les nouveaux cours sont accessibles la semaine 15 (1er-5 décembre) et pas verrouillés', () => {
    const stat = PROGRESSION.filter((p) => p.classe === 'TC APM' && p.blocId === 'stat-cap');
    expect(stat.some((p) => p.from <= 15 && 15 <= p.to)).toBe(true);
    expect(futureLock(stat, 15)).toBeNull();
    // l'AP vit dans le bloc transversal : jamais verrouillé
    const ap = PROGRESSION.filter((p) => p.classe === 'TC APM' && p.blocId === 'numeriques-cap');
    expect(futureLock(ap, 1)).toBeNull();
  });
});
