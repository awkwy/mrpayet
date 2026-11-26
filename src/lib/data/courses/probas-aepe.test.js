import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import probas from './probas-aepe.js';
import ap from './ap-chances-aepe.js';
import { VIZ } from '../../visualizations/registry.js';

// Séances 4-5 (jeton soleil-lune, bilan) et AP « chances » : règles du capitaine
// (jamais ÷), fiches PDF présentes, manipulations enregistrées.
const nouvelles = [...probas.seances.slice(3), ...ap.seances];
const texte = (o) => JSON.stringify(o);

describe('probabilités TC AEPE — séances 3 et 4 de la séquence et AP', () => {
  it('la séquence compte 5 séances (3 existantes + jeton + bilan)', () => {
    expect(probas.seances).toHaveLength(5);
    expect(ap.seances).toHaveLength(2);
  });
  it('jamais le signe ÷ dans le contenu récent', () => {
    for (const se of nouvelles) expect(texte(se)).not.toContain('÷');
  });
  it('chaque fiche PDF référencée existe dans static/fiches', () => {
    for (const c of [probas, ap])
      for (const se of c.seances)
        for (const f of se.pdf || []) expect(existsSync(`static/fiches/${c.pdf}/${f}.pdf`), f).toBe(true);
  });
  it('les manipulations utilisées sont enregistrées', () => {
    for (const se of nouvelles) for (const st of se.steps) if (st.viz) expect(VIZ[st.viz], st.viz).toBeDefined();
  });
  it('chaque séance a une problématique, un quiz et une trace', () => {
    for (const se of nouvelles) {
      expect(se.prob).toBeTruthy();
      expect(se.quiz.length).toBeGreaterThan(0);
      expect(se.trace).toBeTruthy();
    }
  });
});
