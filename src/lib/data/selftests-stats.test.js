import { describe, expect, it } from 'vitest';
import { SELFTESTS } from './selftests-stats.js';
import { checkNumeric } from '../utils/answer-check.js';

const find = (t, id) => SELFTESTS[t].questions.find((q) => q.id === id);

describe('auto-tests de statistique 2P MV2', () => {
  it('huit auto-tests (éval flash A/B, mini-évaluation A/B, standard + accessible)', () => {
    expect(Object.keys(SELFTESTS).sort()).toEqual(
      ['flash-A', 'flash-A-acc', 'flash-B', 'flash-B-acc', 'mini-A', 'mini-A-acc', 'mini-B', 'mini-B-acc'].sort()
    );
  });

  it('éval flash A : médiane 23,5, moyenne 31 — la médiane répond OUI (≤ 25)', () => {
    const r = find('flash-A', 'r1');
    expect(r.fields[0].a).toBe(23.5);
    expect(r.fields[1].a).toBe(31);
    expect(find('flash-A', 'c1').model).toMatch(/^Oui/);
  });

  it('éval flash B : médiane 44,5, moyenne 39,2 — la médiane répond NON (> 42)', () => {
    const r = find('flash-B', 'r1');
    expect(r.fields[0].a).toBe(44.5);
    expect(r.fields[1].a).toBe(39.2);
    expect(find('flash-B', 'c1').model).toMatch(/^Non/);
  });

  it('mini-évaluation A : 7 relevés → médiane 24, étendue 12, moyenne 24,1', () => {
    expect(find('mini-A', 'a1').a).toEqual([19, 20, 22, 24, 26, 27, 31]);
    expect(find('mini-A', 'a2').fields[1].a).toBe(24);
    expect(find('mini-A', 'a3').fields[0].a).toBe(12);
    expect(find('mini-A', 'a4').fields[0].a).toBe(24.1);
  });

  it('mini-évaluation A : 8ᵉ relevé → médiane 23 (pas un relevé) ; 9ᵉ → médiane 24, moyenne 30,6, la moyenne bouge le plus', () => {
    expect(find('mini-A', 'b1').fields[2].a).toBe(23);
    expect(find('mini-A', 'b2').correct).toBe(1);
    const c = find('mini-A', 'c1');
    expect(c.fields[0].a).toBe(24);
    expect(c.fields[1].a).toBe(30.6);
    expect(find('mini-A', 'c2').correct).toBe(1);
  });

  it('mini-évaluation B : médiane 44, étendue 16, moyenne 43,9 ; réponse au client NON', () => {
    expect(find('mini-B', 'a2').fields[1].a).toBe(44);
    expect(find('mini-B', 'a3').fields[0].a).toBe(16);
    expect(find('mini-B', 'a4').fields[0].a).toBe(43.9);
    expect(find('mini-B', 'd1').model).toMatch(/^Non/);
    expect(find('mini-B', 'b1').fields[2].a).toBe(45.5);
  });

  it('barèmes : éval flash sur 6, mini-évaluation sur 10 (+1 bonus), 3 compétences', () => {
    for (const id of Object.keys(SELFTESTS)) {
      const qs = SELFTESTS[id].questions.filter((q) => !q.bonus);
      const sum = qs.reduce((t, q) => t + q.pts, 0);
      expect(sum).toBe(id.startsWith('flash') ? 6 : 10);
      // somme des points de champs = points de la question
      for (const q of qs) {
        if (q.kind === 'nums') expect(q.fields.reduce((t, f) => t + (f.pts ?? 1), 0)).toBeCloseTo(q.pts, 9);
        if (q.kind === 'phrase') expect(q.phrase.parts.filter((p) => typeof p === 'object').reduce((t, s) => t + (s.w ?? 1), 0)).toBeGreaterThan(0);
      }
    }
    const a = SELFTESTS['flash-A'].questions;
    expect(['A', 'R', 'C'].map((k) => a.filter((q) => q.comp === k).reduce((t, q) => t + q.pts, 0))).toEqual([2, 2, 2]);
  });

  it('aucun signe ÷ dans les énoncés (fractions typographiques uniquement)', () => {
    expect(JSON.stringify(SELFTESTS)).not.toContain('÷');
  });

  it('les tolérances acceptent la moyenne arrondie ou non', () => {
    const f = find('mini-A', 'a4').fields[0];
    expect(checkNumeric('24,1', f.a, f.tol)).toBe(true);
    expect(checkNumeric('24,14', f.a, f.tol)).toBe(true);
    expect(checkNumeric('25', f.a, f.tol)).toBe(false);
  });
});
