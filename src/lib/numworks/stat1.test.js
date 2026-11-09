import { describe, it, expect } from 'vitest';
import { parseCell, effectiveRows, statsOf, compareToExpected, diagnose } from './stat1.js';

// Série du cours « Mon stage en chiffres » : 12, 14, 10, 12, 18, 12, 10, 14, 12, 16
const SERIE = [[10, 2], [12, 4], [14, 2], [16, 1], [18, 1]];
const rows = (pairs) => pairs.map(([v, n]) => ({ v: String(v), n: String(n) }));

describe('parseCell', () => {
  it('lit la virgule et le point', () => {
    expect(parseCell('0,4')).toBe(0.4);
    expect(parseCell('0.4')).toBe(0.4);
  });
  it('renvoie null pour une case vide ou illisible', () => {
    expect(parseCell('')).toBeNull();
    expect(parseCell('abc')).toBeNull();
  });
});

describe('statsOf', () => {
  it('donne effectif total 10 et moyenne 13 pour la série du stage', () => {
    const s = statsOf(rows(SERIE));
    expect(s.N).toBe(10);
    expect(s.sum).toBe(130);
    expect(s.mean).toBe(13);
    expect(s.min).toBe(10);
    expect(s.max).toBe(18);
    expect(s.range).toBe(8);
  });
  it('calcule médiane et quartiles (hors programme) comme la fiche prof', () => {
    const s = statsOf(rows(SERIE));
    expect(s.median).toBe(12);
    expect(s.q1).toBe(12);
    expect(s.q3).toBe(14);
  });
  it('N1 vide compte 1, comme la calculatrice', () => {
    const s = statsOf([{ v: '10', n: '' }, { v: '12', n: '' }]);
    expect(s.N).toBe(2);
    expect(s.mean).toBe(11);
  });
  it('renvoie null sans donnée', () => {
    expect(statsOf([{ v: '', n: '' }])).toBeNull();
  });
});

describe('erreurs de saisie vues dans l\'atelier', () => {
  it('N1 non modifié : effectif total 5, moyenne 14', () => {
    const typed = rows(SERIE.map(([v]) => [v, 1]));
    const s = statsOf(typed);
    expect(s.N).toBe(5);
    expect(s.mean).toBe(14);
    expect(diagnose(typed, SERIE)).toBe('n1-untouched');
  });
  it('colonnes échangées : effectif total 70', () => {
    const typed = rows(SERIE.map(([v, n]) => [n, v]));
    expect(statsOf(typed).N).toBe(70);
    expect(diagnose(typed, SERIE)).toBe('swapped');
  });
  it('un 14 oublié : effectif total 9, moyenne ≈ 12,89', () => {
    const typed = rows([[10, 2], [12, 4], [14, 1], [16, 1], [18, 1]]);
    const s = statsOf(typed);
    expect(s.N).toBe(9);
    expect(Math.round(s.mean * 100) / 100).toBe(12.89);
    expect(diagnose(typed, SERIE)).toBe('missing');
  });
  it('ancien tableau non vidé : effectif total trop grand', () => {
    const typed = rows([[3, 1], [7, 1], [9, 1], ...SERIE]);
    expect(statsOf(typed).N).toBe(13);
    expect(diagnose(typed, SERIE)).toBe('stale');
  });
  it('tableau juste : aucun diagnostic', () => {
    expect(compareToExpected(rows(SERIE), SERIE).ok).toBe(true);
    expect(diagnose(rows(SERIE), SERIE)).toBeNull();
  });
});

describe('effectiveRows', () => {
  it('ignore les lignes sans valeur', () => {
    expect(effectiveRows([{ v: '', n: '3' }, { v: '5', n: '2' }])).toEqual([{ v: 5, n: 2 }]);
  });
});
