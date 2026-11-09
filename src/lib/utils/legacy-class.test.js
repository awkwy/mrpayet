import { describe, it, expect } from 'vitest';
import { LEGACY_CLASS_SLUGS, LEGACY_CLASS_NAMES, withLegacyClassEntries, redirectLegacyClass } from './legacy-class.js';
import { CLASSES, bslug, bunslug } from './course-helpers.js';

describe('classe TC APM (ancien libellé TC APMP)', () => {
  it('la classe et son slug actuels', () => {
    expect(CLASSES.map((c) => c.n)).toContain('TC APM');
    expect(bslug('TC APM')).toBe('tcapm');
    expect(bunslug('tcapm')).toBe('TC APM');
  });

  it("« APMP » n'apparaît plus dans les libellés de classe", () => {
    for (const c of CLASSES) expect(`${c.n} ${c.d} ${bslug(c.n)}`).not.toMatch(/apmp/i);
  });

  it("l'ancien slug n'est plus un slug de classe (la route le redirige)", () => {
    expect(bunslug('tcapmp')).toBeUndefined();
    expect(LEGACY_CLASS_SLUGS.tcapmp).toBe('tcapm');
    expect(LEGACY_CLASS_NAMES['TC APMP']).toBe('TC APM');
  });
});

describe('withLegacyClassEntries', () => {
  it('double les entrées de la classe renommée sous son ancien slug, sans toucher aux autres', () => {
    const out = withLegacyClassEntries([
      { classe: 'tcaepe', theme: 'mental' },
      { classe: 'tcapm', theme: 'freq' }
    ]);
    expect(out).toEqual([
      { classe: 'tcaepe', theme: 'mental' },
      { classe: 'tcapm', theme: 'freq' },
      { classe: 'tcapmp', theme: 'freq' }
    ]);
  });
});

describe('redirectLegacyClass', () => {
  it('redirige un ancien slug vers la page actuelle (307)', () => {
    try {
      redirectLegacyClass({ classe: 'tcapmp', theme: 'freq' }, (slug) => `/flash/${slug}/freq`);
      throw new Error('aucune redirection');
    } catch (e) {
      expect(e.status).toBe(307);
      expect(e.location).toMatch(/\/flash\/tcapm\/freq$/);
    }
  });

  it('ne fait rien pour un slug actuel', () => {
    expect(() => redirectLegacyClass({ classe: 'tcapm' }, (s) => `/p/${s}`)).not.toThrow();
  });
});
