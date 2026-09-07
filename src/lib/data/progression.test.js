import { describe, expect, it } from 'vitest';
import { weekMonday, futureLock, progressionAt, LOOKAHEAD_WEEKS } from './progression.js';
import {
  blocLock,
  courseLock,
  chapterLock
} from '$lib/utils/course-helpers.js';
import { BLOCS } from './blocs.js';
import { COURSES, courseById } from './courses/index.js';
import { RECAP } from './recap.js';

describe('weekMonday', () => {
  it('semaine 1 = lundi 24 août 2026', () => {
    expect(weekMonday(1).toISOString().slice(0, 10)).toBe('2026-08-24');
  });
  it('semaine 4 = 3 semaines plus tard', () => {
    expect(weekMonday(4).toISOString().slice(0, 10)).toBe('2026-09-14');
  });
  it('semaine 10 = lundi 26 octobre 2026', () => {
    expect(weekMonday(10).toISOString().slice(0, 10)).toBe('2026-10-26');
  });
});

describe('futureLock', () => {
  it('aucune entrée -> jamais verrouillé', () => {
    expect(futureLock([], 3)).toBeNull();
    expect(futureLock(undefined, 3)).toBeNull();
  });
  it('fenêtre déjà ouverte -> accessible', () => {
    expect(futureLock([{ from: 2, to: 3 }], 3)).toBeNull();
  });
  it('fenêtre passée -> reste accessible (pas de reverrouillage sur to)', () => {
    expect(futureLock([{ from: 2, to: 3 }], 20)).toBeNull();
  });
  it('permanence : une fenêtre très ancienne reste ouverte', () => {
    expect(futureLock([{ from: 1 }], 200)).toBeNull();
  });
  it('fenêtre lointaine -> verrouillé, renvoie la plus proche (semaine réelle, non décalée)', () => {
    const l = futureLock([{ from: 16 }, { from: 10 }], 3);
    expect(l.from).toBe(10);
    expect(l.monday.toISOString().slice(0, 10)).toBe('2026-10-26');
  });
  it('plusieurs entrées, une seule à portée -> accessible', () => {
    expect(futureLock([{ from: 5 }, { from: 20 }], 3)).toBeNull();
  });
});

describe('LOOKAHEAD_WEEKS (fenêtre d’anticipation)', () => {
  it('vaut 2', () => {
    expect(LOOKAHEAD_WEEKS).toBe(2);
  });
  it('un contenu s’ouvre exactement LOOKAHEAD_WEEKS semaines avant son from', () => {
    const week = 3;
    expect(futureLock([{ from: week + LOOKAHEAD_WEEKS }], week)).toBeNull();
    const l = futureLock([{ from: week + LOOKAHEAD_WEEKS + 1 }], week);
    expect(l).not.toBeNull();
    expect(l.from).toBe(week + LOOKAHEAD_WEEKS + 1);
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

  it('stats-probas (cours) est accessible en semaine 3 : mv-stat from 4 est à portée d’anticipation', () => {
    expect(courseLock(courseById('stats-probas'), week)).toBeNull();
  });

  it('acoustique-apmp est accessible : ouvert pour TC APMP (from 2) même si TC AEPE est plus tard', () => {
    expect(courseLock(courseById('acoustique-apmp'), week)).toBeNull();
  });

  it('les chapitres de la partie proba de stats-probas restent verrouillés (mv-proba, from 10)', () => {
    // mv-proba couvre ch [2,3,4,5], from 10 : hors de la fenêtre d’anticipation
    const l = chapterLock(courseById('stats-probas'), 3, week);
    expect(l).not.toBeNull();
    expect(l.monday.toISOString().slice(0, 10)).toBe('2026-10-26');
  });

  it('decider-sous-contrainte est accessible (degre1-cap, from 2)', () => {
    expect(courseLock(courseById('decider-sous-contrainte'), week)).toBeNull();
  });

  it('blocLock verrouille mv-proba mais pas mv-pc-secu', () => {
    const mvProba = BLOCS.find((b) => b.id === 'mv-proba');
    const mvSecu = BLOCS.find((b) => b.id === 'mv-pc-secu');
    expect(blocLock(mvProba, '2P MV2', week)).not.toBeNull();
    expect(blocLock(mvSecu, '2P MV2', week)).toBeNull();
  });
});

describe('aide-mémoire (/r) : les cours verrouillés ne sont pas listés', () => {
  const week = 3;

  // Réplique du filtre appliqué dans src/routes/r/+page.svelte et
  // src/routes/r/[slug]/+page.svelte : cours de la classe ayant une fiche
  // RECAP et dont le verrou de progression est levé.
  function recapCoursesFor(classe) {
    return COURSES.filter(
      (co) =>
        (co.classe === classe || co.classes?.includes(classe)) && RECAP[co.id] && !courseLock(co, week)
    ).map((co) => co.id);
  }

  it('2P MV2 : stats-probas et securite-electrique listés, pas les modules lointains', () => {
    const ids = recapCoursesFor('2P MV2');
    expect(ids).toContain('stats-probas');
    expect(ids).toContain('securite-electrique');
    expect(ids).not.toContain('degre1-mv');
    expect(ids).not.toContain('fonctions-mv');
    expect(ids).not.toContain('geo-mv');
  });
});

describe('la note de rentrée 2P MV2 ne référence plus l’évaluation nationale', () => {
  // /p/[classe]/+page.svelte affiche telle quelle la `note` de l'entrée
  // renvoyée par progressionAt(classe, semaine). Pour 2P MV2, la fenêtre de
  // rentrée (semaines 2-3) doit afficher exactement « Consolidation de
  // rentrée » — pas de renvoi au test national de positionnement.
  for (const week of [2, 3]) {
    it(`semaine ${week} : la note affichée est « Consolidation de rentrée »`, () => {
      const notes = progressionAt('2P MV2', week)
        .map((p) => p.note)
        .filter(Boolean);
      expect(notes).toContain('Consolidation de rentrée');
      for (const note of notes) {
        expect(note).not.toMatch(/national|positionnement|évaluation nationale/i);
      }
    });
  }
});
