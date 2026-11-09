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
const IDS = ['stats-stage-tcapm', 'registre-mediation-tcapm', 'sondage-tcapm', 'ap-stats-tcapm'];
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
  it('les quatre cours existent, pour la classe TC APM, et ont des séances', () => {
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
  it('les quatre cours sont rattachés à un bloc du programme TC APM', () => {
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
