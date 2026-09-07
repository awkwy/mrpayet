import { describe, expect, it } from 'vitest';
import { PROGRESSION, weekOf, weekMonday, futureLock } from './progression.js';
import {
  blocLock,
  courseLock,
  chapterLock
} from '$lib/utils/course-helpers.js';
import { BLOCS } from './blocs.js';
import { courseById } from './courses/index.js';

describe('weekMonday', () => {
  it('semaine 1 = lundi 24 août 2026', () => {
    expect(weekMonday(1).toISOString().slice(0, 10)).toBe('2026-08-24');
  });
  it('semaine 4 = 3 semaines plus tard', () => {
    expect(weekMonday(4).toISOString().slice(0, 10)).toBe('2026-09-14');
  });
});

describe('futureLock', () => {
  it('aucune entrée -> jamais verrouillé', () => {
    expect(futureLock([], 3)).toBeNull();
    expect(futureLock(undefined, 3)).toBeNull();
  });
  it('fenêtre ouverte -> accessible', () => {
    expect(futureLock([{ from: 2, to: 3 }], 3)).toBeNull();
  });
  it('fenêtre passée -> reste accessible (pas de reverrouillage sur to)', () => {
    expect(futureLock([{ from: 2, to: 3 }], 20)).toBeNull();
  });
  it('fenêtre future -> verrouillé, renvoie la plus proche', () => {
    const l = futureLock([{ from: 10 }, { from: 4 }], 3);
    expect(l.from).toBe(4);
    expect(l.monday.toISOString().slice(0, 10)).toBe('2026-09-14');
  });
  it('plusieurs entrées, une seule ouverte -> accessible', () => {
    expect(futureLock([{ from: 4 }, { from: 20 }], 5)).toBeNull();
  });
});

describe('gating sur les données réelles (semaine 3)', () => {
  const week = 3;

  it('un cours sans entrée de progression est toujours accessible', () => {
    // securite-electrique : bloc mv-pc-secu, aucune entrée PROGRESSION
    expect(courseLock(courseById('securite-electrique'), week)).toBeNull();
  });

  it('un cours transversal (AP) reste accessible', () => {
    expect(courseLock(courseById('ap-consolidation'), week)).toBeNull();
  });

  it('stats-probas est verrouillé en semaine 3 (mv-stat, from 4)', () => {
    const l = courseLock(courseById('stats-probas'), week);
    expect(l).not.toBeNull();
    expect(l.monday.toISOString().slice(0, 10)).toBe('2026-09-14');
  });

  it('acoustique-apmp est accessible : ouvert pour TC APMP (from 2) même si TC AEPE est plus tard', () => {
    expect(courseLock(courseById('acoustique-apmp'), week)).toBeNull();
  });

  it('un chapitre de la partie proba de stats-probas est verrouillé jusqu’à la semaine 10', () => {
    // mv-proba couvre ch [2,3,4,5], from 10
    const l = chapterLock(courseById('stats-probas'), 3, week);
    expect(l.monday.toISOString().slice(0, 10)).toBe('2026-10-26');
  });

  it('decider-sous-contrainte est accessible (degre1-cap, from 2)', () => {
    expect(courseLock(courseById('decider-sous-contrainte'), week)).toBeNull();
  });

  it('blocLock verrouille mv-stat mais pas mv-pc-secu', () => {
    const mvStat = BLOCS.find((b) => b.id === 'mv-stat');
    const mvSecu = BLOCS.find((b) => b.id === 'mv-pc-secu');
    expect(blocLock(mvStat, '2P MV2', week)).not.toBeNull();
    expect(blocLock(mvSecu, '2P MV2', week)).toBeNull();
  });
});

describe('la note de rentrée 2P MV2 ne référence plus l’évaluation nationale', () => {
  it('aucune note ne mentionne « nationale »', () => {
    for (const p of PROGRESSION) {
      if (p.note) expect(p.note.toLowerCase()).not.toContain('national');
    }
  });
});
