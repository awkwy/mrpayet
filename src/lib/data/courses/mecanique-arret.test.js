import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { courseById } from './index.js';
import { COMP } from '../competences.js';
import { RECAP } from '../recap.js';
import { toMs, reaction, arret, tableArret, stopsBefore, FREINAGE_SEC, FREINAGE_MOUILLE_72 } from '../../utils/arret.js';

// Séances 4 « Deux mesures, deux résultats ? » et 5 « Combien de mètres pour s'arrêter ? »
// du cours `mecanique-mv` (2P MV2) : corrigés cohérents avec $lib/utils/arret.js.
const c = courseById('mecanique-mv');
const s4 = c.seances.find((s) => s.t === 'Deux mesures, deux résultats ?');
const s5 = c.seances.find((s) => s.t === 'Combien de mètres pour s\'arrêter ?');
const qs = (se) => se.steps.flatMap((st) => st.q || []);
const ans = (se, start) => {
  const f = qs(se).filter((q) => q.q.startsWith(start));
  expect(f.length, start).toBeGreaterThan(0);
  return f[0].a;
};

describe('utils/arret', () => {
  it('conversions, réaction et distance d’arrêt', () => {
    expect(toMs(72)).toBe(20);
    expect(tableArret().map((r) => r[1])).toEqual([10, 15, 20, 25, 30]);
    expect(tableArret().map((r) => r[2])).toEqual([10, 15, 20, 25, 30]);
    expect(tableArret().map((r) => r[4])).toEqual([17, 31, 49, 70, 94]);
    expect(FREINAGE_SEC).toHaveLength(5);
  });
  it('décisions : scooter 54 km/h à 25 m, route mouillée à 55 m, voiture 90 km/h à 60 m', () => {
    expect(stopsBefore(54, 16, 25)).toBe(false);
    expect(stopsBefore(36, 7, 25)).toBe(true);
    expect(arret(72, FREINAGE_MOUILLE_72)).toBe(64);
    expect(stopsBefore(72, FREINAGE_MOUILLE_72, 55)).toBe(false);
    expect(stopsBefore(72, 29, 55)).toBe(true);
    expect(stopsBefore(90, 45, 60)).toBe(false);
    expect(reaction(108)).toBe(30);
  });
});

describe('séance 4 (variabilité) et séance 5 (distance d’arrêt)', () => {
  it('existent, avec fiches PDF présentes', () => {
    for (const se of [s4, s5]) {
      expect(se, 'séance').toBeTruthy();
      for (const stem of se.pdf) expect(existsSync(resolve(`static/fiches/${c.pdf}/${stem}.pdf`)), stem).toBe(true);
    }
    expect(c.seances.indexOf(s4)).toBe(3);
  });
  it('séance 4 : six mesures du disque, écart et moyenne', () => {
    const m = [23.9, 24.1, 24.0, 23.8, 24.0, 24.2];
    expect(ans(s4, 'Quelle est la plus petite')).toBe(Math.min(...m));
    expect(ans(s4, 'Quelle est la plus grande')).toBe(Math.max(...m));
    expect(ans(s4, 'Quel est l\'écart')).toBeCloseTo(Math.max(...m) - Math.min(...m), 5);
    expect(ans(s4, 'Moyenne des six')).toBeCloseTo(m.reduce((a, b) => a + b) / 6, 5);
    expect(ans(s4, 'Un autre disque')).toBe(21.3);
  });
  it('séance 5 : réaction, arrêt et décisions suivent arret.js', () => {
    expect(ans(s5, '72 km/h en m/s')).toBe(20);
    expect(ans(s5, 'Distance d\'arrêt à 72')).toBe(49);
    expect(ans(s5, 'Distance d\'arrêt à 36')).toBe(17);
    expect(ans(s5, 'Distance d\'arrêt à 90')).toBe(70);
    expect(ans(s5, 'Route mouillée à 72')).toBe(64);
    expect(ans(s5, 'Un scooter roule à 54')).toContain('non');
  });
  it('jamais ÷ dans les séances ajoutées, compétences et récap présents', () => {
    expect(JSON.stringify([s4, s5])).not.toMatch(/÷/);
    expect(COMP['mecanique-mv/5']).toBeTruthy();
    expect(JSON.stringify(RECAP['mecanique-mv'])).toMatch(/distance d'arrêt/i);
  });
});
