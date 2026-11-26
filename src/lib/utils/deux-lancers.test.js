import { describe, expect, it } from 'vitest';
import { PAIRES, THEORIE, freq, pair, randint12, tally } from './deux-lancers.js';

// générateur déterministe (mulberry32) pour des tests reproductibles
function seeded(a) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('deux lancers', () => {
  it('randint12 ne donne que 1 ou 2', () => {
    const r = seeded(1);
    for (let i = 0; i < 200; i++) expect([1, 2]).toContain(randint12(r));
  });
  it('une paire est l’un des 4 résultats du tableau', () => {
    const r = seeded(2);
    for (let i = 0; i < 200; i++) expect(PAIRES).toContain(pair(r));
  });
  it('tally range chaque paire dans une des trois sortes (total conservé)', () => {
    const t = tally(['SS', 'SL', 'LS', 'LL', 'SL']);
    expect(t).toEqual({ ss: 1, mix: 3, ll: 1, total: 5 });
  });
  it('freq : 4 sur 20 = 0,2 ; rien lancé = 0', () => {
    expect(freq(4, 20)).toBe(0.2);
    expect(freq(0, 0)).toBe(0);
  });
  it('les probabilités théoriques font 1', () => {
    expect(THEORIE.ss + THEORIE.mix + THEORIE.ll).toBe(1);
  });
  it('sur 2000 paires, les fréquences se calment près de 0,25 / 0,5 / 0,25', () => {
    const r = seeded(7);
    const ps = Array.from({ length: 2000 }, () => pair(r));
    const t = tally(ps);
    expect(Math.abs(freq(t.ss, t.total) - 0.25)).toBeLessThan(0.04);
    expect(Math.abs(freq(t.mix, t.total) - 0.5)).toBeLessThan(0.04);
    expect(Math.abs(freq(t.ll, t.total) - 0.25)).toBeLessThan(0.04);
  });
});
