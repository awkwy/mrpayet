import { describe, expect, it } from 'vitest';
import { mean, median, quartile, quartileRank, sigma, summary, round, nf } from './stats-mv.js';

// Séries des fiches « bilan du chapitre » (24 vidanges par équipe)
const MATIN = [22, 25, 28, 24, 22, 24, 31, 27, 22, 26, 24, 24, 22, 19, 23, 23, 21, 25, 20, 20, 26, 23, 21, 23];
const APREM = [12, 14, 16, 17, 18, 19, 19, 20, 21, 22, 22, 23, 23, 24, 25, 26, 27, 28, 29, 29, 30, 32, 34, 35];

describe('rang des quartiles (convention du lycée)', () => {
  it('rang entier conservé', () => {
    expect(quartileRank(24, 0.25)).toBe(6);
    expect(quartileRank(24, 0.75)).toBe(18);
    expect(quartileRank(20, 0.25)).toBe(5);
  });
  it('rang non entier arrondi au rang supérieur', () => {
    expect(quartileRank(7, 0.25)).toBe(2);
    expect(quartileRank(11, 0.75)).toBe(9);
  });
});

describe('bilan matin / après-midi', () => {
  const m = summary(MATIN);
  const a = summary(APREM);
  it('même moyenne 23,5 min', () => {
    expect(m.mean).toBeCloseTo(565 / 24, 10);
    expect(a.mean).toBeCloseTo(565 / 24, 10);
    expect(round(m.mean, 1)).toBe(23.5);
  });
  it('même médiane 23 min', () => {
    expect(m.med).toBe(23);
    expect(a.med).toBe(23);
  });
  it('matin : 19 · 22 · 23 · 25 · 31, écart interquartile 3, étendue 12', () => {
    expect([m.min, m.q1, m.med, m.q3, m.max]).toEqual([19, 22, 23, 25, 31]);
    expect(m.iqr).toBe(3);
    expect(m.range).toBe(12);
  });
  it('après-midi : 12 · 19 · 23 · 28 · 35, écart interquartile 9, étendue 23', () => {
    expect([a.min, a.q1, a.med, a.q3, a.max]).toEqual([12, 19, 23, 28, 35]);
    expect(a.iqr).toBe(9);
    expect(a.range).toBe(23);
  });
  it('σ : le matin est plus régulier (≈ 2,7 contre ≈ 6,0)', () => {
    expect(round(m.sigma, 1)).toBe(2.7);
    expect(round(a.sigma, 1)).toBe(6);
  });
});

describe('garage de Kahani — Madi et Soilihi', () => {
  const madi = [20, 19, 21, 20, 20, 21, 19, 20, 20, 20];
  const soilihi = [12, 28, 15, 25, 20, 10, 30, 18, 22, 20];
  it('même moyenne 20 min', () => {
    expect(mean(madi)).toBe(20);
    expect(mean(soilihi)).toBe(20);
  });
  it('σ = 0,63 et 6,21', () => {
    expect(round(sigma(madi), 2)).toBe(0.63);
    expect(round(sigma(soilihi), 2)).toBe(6.21);
  });
  it("l'incident de 60 min : moyenne 23,6, σ 11,5, médiane 20, écart interquartile 1", () => {
    const s = summary([...madi, 60]);
    expect(round(s.mean, 1)).toBe(23.6);
    expect(round(s.sigma, 1)).toBe(11.5);
    expect(s.med).toBe(20);
    expect(s.iqr).toBe(1);
  });
  it('plaquettes : même moyenne 12,0 mm, σ = 0,12 et 0,92', () => {
    const f1 = [11.8, 12.1, 12.0, 11.9, 12.2, 12.0, 11.9, 12.1];
    const f2 = [11.0, 13.1, 12.4, 10.6, 12.9, 11.3, 13.0, 11.7];
    expect(round(mean(f1), 2)).toBe(12);
    expect(round(mean(f2), 2)).toBe(12);
    expect(round(sigma(f1), 2)).toBe(0.12);
    expect(round(sigma(f2), 2)).toBe(0.92);
  });
});

describe('médiane et formats', () => {
  it('effectif pair : milieu des deux valeurs centrales', () => {
    expect(median([3, 10, 4, 8])).toBe(6);
  });
  it('quartile du jeu de plaquettes (20 valeurs)', () => {
    const p = [2, 2.5, 3, 3, 3.5, 3.5, 4, 4, 4.5, 4.5, 5, 5, 5.5, 6, 6, 6.5, 7, 7.5, 8, 9];
    expect(quartile(p, 0.25)).toBe(3.5);
    expect(quartile(p, 0.75)).toBe(6);
  });
  it('nf : virgule décimale et espace fine des milliers', () => {
    expect(nf(1500)).toBe('1 500');
    expect(nf(0.05)).toBe('0,05');
    expect(nf(23.5, 1)).toBe('23,5');
  });
});
