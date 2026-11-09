import { describe, it, expect } from 'vitest';
import { SEQ, TYPES, countsOf, TOTAL } from './registre-data.js';

describe('registre de la médiation', () => {
  it('20 cartes : dispute 8, insultes 6, objet 4, autre 2', () => {
    expect(TOTAL).toBe(20);
    expect(countsOf()).toEqual({ dispute: 8, insultes: 6, objet: 4, autre: 2 });
  });
  it('chaque carte a un type connu', () => {
    const ids = TYPES.map((t) => t.id);
    expect(SEQ.every((t) => ids.includes(t))).toBe(true);
  });
  it('la somme des effectifs est l\'effectif total', () => {
    expect(Object.values(countsOf()).reduce((a, b) => a + b, 0)).toBe(TOTAL);
  });
});
