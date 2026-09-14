import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

describe('automatismes-progress store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('starts empty when localStorage is empty', async () => {
    const { progressStore } = await import('./automatismes-progress.js');
    expect(get(progressStore('2pmv2'))).toEqual({});
  });

  it('isPassing requires at least 75% correct', async () => {
    const { isPassing } = await import('./automatismes-progress.js');
    expect(isPassing(6, 8)).toBe(true);
    expect(isPassing(5, 8)).toBe(false);
    expect(isPassing(0, 0)).toBe(false);
  });

  it('markThemeCleared does nothing below the pass ratio', async () => {
    const { markThemeCleared, progressStore } = await import('./automatismes-progress.js');
    const changed = markThemeCleared('2pmv2', 'mental', 4, 8);
    expect(changed).toBe(false);
    expect(get(progressStore('2pmv2'))).toEqual({});
    expect(localStorage.getItem('mrp.parcours.2pmv2')).toBeNull();
  });

  it('markThemeCleared persists a passing score and its star rating', async () => {
    const { markThemeCleared, progressStore, isThemeCleared } = await import('./automatismes-progress.js');
    const changed = markThemeCleared('2pmv2', 'mental', 8, 8);
    expect(changed).toBe(true);
    const data = get(progressStore('2pmv2'));
    expect(isThemeCleared(data, 'mental')).toBe(true);
    expect(data.mental).toEqual({ cleared: true, stars: 3, score: 8, total: 8 });
    expect(JSON.parse(localStorage.getItem('mrp.parcours.2pmv2'))).toEqual(data);
  });

  it('keeps the best attempt instead of downgrading on a worse replay', async () => {
    const { markThemeCleared, progressStore } = await import('./automatismes-progress.js');
    markThemeCleared('2pmv2', 'mental', 8, 8);
    markThemeCleared('2pmv2', 'mental', 6, 8);
    expect(get(progressStore('2pmv2')).mental.stars).toBe(3);
  });

  it('markDefiCleared is namespaced separately from theme ids', async () => {
    const { markDefiCleared, progressStore, isDefiCleared } = await import('./automatismes-progress.js');
    markDefiCleared('2pmv2', 7, 8);
    const data = get(progressStore('2pmv2'));
    expect(isDefiCleared(data)).toBe(true);
  });

  it('allThemesCleared checks every theme id in a class', async () => {
    const { markThemeCleared, progressStore, allThemesCleared } = await import('./automatismes-progress.js');
    markThemeCleared('2pmv2', 'mental', 8, 8);
    expect(allThemesCleared(get(progressStore('2pmv2')), ['mental', 'signes'])).toBe(false);
    markThemeCleared('2pmv2', 'signes', 8, 8);
    expect(allThemesCleared(get(progressStore('2pmv2')), ['mental', 'signes'])).toBe(true);
  });

  it('keeps different classes in separate localStorage keys', async () => {
    const { markThemeCleared, progressStore } = await import('./automatismes-progress.js');
    markThemeCleared('2pmv2', 'mental', 8, 8);
    expect(get(progressStore('tcaepe'))).toEqual({});
    markThemeCleared('tcaepe', 'signes', 8, 8);
    expect(get(progressStore('2pmv2'))).not.toHaveProperty('signes');
    expect(localStorage.getItem('mrp.parcours.2pmv2')).not.toBeNull();
    expect(localStorage.getItem('mrp.parcours.tcaepe')).not.toBeNull();
  });

  it('reloads progress already present in localStorage on module init', async () => {
    localStorage.setItem('mrp.parcours.2pmv2', JSON.stringify({ mental: { cleared: true, stars: 2, score: 6, total: 8 } }));
    const { progressStore, isThemeCleared } = await import('./automatismes-progress.js');
    expect(isThemeCleared(get(progressStore('2pmv2')), 'mental')).toBe(true);
  });
});
