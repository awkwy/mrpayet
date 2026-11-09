import { describe, it, expect } from 'vitest';
import {
  frequency, toPercent, toFrequency, frNum, frPct, countFromFrequency,
  shuffled, slipsFromCounts, tallyGroups, sectorAngle
} from './freq.js';

describe('fréquence et pourcentage', () => {
  it('8 sur 20 : 0,4 puis 40 %', () => {
    expect(frequency(8, 20)).toBe(0.4);
    expect(toPercent(0.4)).toBe(40);
  });
  it('efface les restes binaires', () => {
    expect(toPercent(0.07)).toBe(7);
    expect(toFrequency(7)).toBe(0.07);
    expect(frequency(7, 20)).toBe(0.35);
  });
  it('les deux sens : 35 % ↔ 0,35', () => {
    expect(toFrequency(35)).toBe(0.35);
    expect(toPercent(0.25)).toBe(25);
    expect(toPercent(0.8)).toBe(80);
  });
  it('mois suivant : 20 % de 25 cartes = 5', () => {
    expect(countFromFrequency(toFrequency(20), 25)).toBe(5);
  });
  it('registre : 8 + 6 + 4 + 2 = 20 et les fréquences font 1', () => {
    const eff = [8, 6, 4, 2];
    const total = eff.reduce((a, b) => a + b, 0);
    expect(total).toBe(20);
    expect(eff.map((e) => frequency(e, total))).toEqual([0.4, 0.3, 0.2, 0.1]);
    expect(eff.map((e) => toPercent(frequency(e, total))).reduce((a, b) => a + b, 0)).toBe(100);
  });
});

describe('mise en forme', () => {
  it('virgule décimale', () => {
    expect(frNum(0.4)).toBe('0,4');
    expect(frNum(40)).toBe('40');
    expect(frPct(40)).toBe('40 %');
  });
});

describe('dépouillement', () => {
  it('slipsFromCounts redonne exactement les effectifs', () => {
    const counts = [11, 16, 12, 7, 4];
    const slips = slipsFromCounts(counts);
    expect(slips).toHaveLength(50);
    counts.forEach((n, i) => expect(slips.filter((s) => s === i)).toHaveLength(n));
  });
  it('mélange déterministe', () => {
    expect(shuffled([1, 2, 3, 4, 5, 6], 3)).toEqual(shuffled([1, 2, 3, 4, 5, 6], 3));
  });
  it('traits groupés par 5', () => {
    expect(tallyGroups(13)).toEqual([5, 5, 3]);
    expect(tallyGroups(0)).toEqual([]);
  });
  it('angle d\'un secteur : fréquence × 360°', () => {
    expect(sectorAngle(13, 50)).toBe(93.6);
    expect(sectorAngle(17, 50)).toBe(122.4);
    expect(sectorAngle(20, 50)).toBe(144);
  });
});
