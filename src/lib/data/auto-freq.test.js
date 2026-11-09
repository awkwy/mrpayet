import { describe, it, expect } from 'vitest';
import { FAMILIES, freqPool, GENERATORS } from './auto-freq.js';
import { rng } from '$lib/utils/freq.js';

const num = (s) => Number(String(s).replace(',', '.'));

describe('automatismes fréquences — variantes aléatoires', () => {
  it('chaque famille produit une question et une réponse sans signe ÷', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      for (const [name, fn] of Object.entries(FAMILIES)) {
        const [q, a] = fn(rng(seed * 31));
        expect(typeof q, name).toBe('string');
        expect(typeof a, name).toBe('string');
        expect(q + a, name).not.toContain('÷');
        expect(a.length, name).toBeGreaterThan(0);
      }
    }
  });

  it('effectif total = somme des trois effectifs dits', () => {
    for (let s = 1; s < 30; s++) {
      const [q, a] = FAMILIES.effectifTotal(rng(s));
      const nums = q.match(/\d+/g).map(Number);
      expect(num(a)).toBe(nums.reduce((x, y) => x + y, 0));
    }
  });

  it('fréquence décimale : k sur n vaut k / n', () => {
    for (let s = 1; s < 40; s++) {
      const [q, a] = FAMILIES.frequenceDecimale(rng(s));
      const [k, n] = q.match(/\d+/g).map(Number);
      expect(k).toBeLessThan(n);
      expect(num(a)).toBeCloseTo(k / n, 6);
    }
  });

  it('× 100 : la virgule avance de deux rangs', () => {
    for (let s = 1; s < 40; s++) {
      const [q, a] = FAMILIES.fois100(rng(s));
      const d = num(q.match(/[\d,]+/)[0]);
      expect(num(a)).toBeCloseTo(d * 100, 6);
    }
  });

  it('mois suivant : l\'effectif est toujours un entier', () => {
    for (let s = 1; s < 60; s++) {
      const [q, a] = FAMILIES.moisSuivant(rng(s));
      const [total, pct] = q.match(/\d+/g).map(Number);
      expect(num(a)).toBe((total * pct) / 100);
      expect(Number.isInteger(num(a))).toBe(true);
    }
  });

  it('lecture de bâton : la réponse est bien lue sur le diagramme', () => {
    for (let s = 1; s < 30; s++) {
      const [q, a, extra] = FAMILIES.lireBaton(rng(s));
      const type = q.match(/type (\w)/)[1];
      expect(num(a)).toBe(extra.bars.find((b) => b[0] === type)[1]);
      const [, at, bt] = FAMILIES.lireTotal(rng(s));
      expect(num(at)).toBe(bt.bars.reduce((x, b) => x + b[1], 0));
    }
  });

  it('le pool tiré n\'a pas de doublon et varie d\'un tirage à l\'autre', () => {
    const p1 = freqPool(8, rng(1));
    const p2 = freqPool(8, rng(2));
    expect(p1).toHaveLength(8);
    expect(new Set(p1.map((i) => i[0] + JSON.stringify(i[2]?.bars ?? ''))).size).toBe(8);
    expect(JSON.stringify(p1)).not.toBe(JSON.stringify(p2));
  });

  it('le générateur est enregistré pour le thème freq', () => {
    expect(GENERATORS.freq).toBe(freqPool);
  });
});
