import { beforeEach, describe, expect, it, vi } from 'vitest';
import { get } from 'svelte/store';

describe('progress store', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('starts empty when localStorage is empty', async () => {
    const { done, last } = await import('./progress.js');
    expect(get(done).size).toBe(0);
    expect(get(last)).toBeNull();
  });

  it('markDone adds an id and persists it', async () => {
    const { done, markDone } = await import('./progress.js');
    markDone('c1-securite-electrique-1');
    expect(get(done).has('c1-securite-electrique-1')).toBe(true);
    expect(JSON.parse(localStorage.getItem('mrp.done'))).toEqual([
      'c1-securite-electrique-1'
    ]);
  });

  it('isDone reflects the current state', async () => {
    const { markDone, isDone } = await import('./progress.js');
    expect(isDone('c2')).toBe(false);
    markDone('c2');
    expect(isDone('c2')).toBe(true);
  });

  it('setLast persists and updates the store', async () => {
    const { last, setLast } = await import('./progress.js');
    setLast('c3');
    expect(get(last)).toBe('c3');
    expect(localStorage.getItem('mrp.last')).toBe('c3');
  });

  it('resetProgress clears both the store and localStorage', async () => {
    const { done, last, markDone, setLast, resetProgress } = await import('./progress.js');
    markDone('c4');
    setLast('c4');
    resetProgress();
    expect(get(done).size).toBe(0);
    expect(get(last)).toBeNull();
    expect(localStorage.getItem('mrp.done')).toBeNull();
    expect(localStorage.getItem('mrp.last')).toBeNull();
  });

  it('loads progress already present in localStorage on module init', async () => {
    localStorage.setItem('mrp.done', JSON.stringify(['old-chapter']));
    localStorage.setItem('mrp.last', 'old-chapter');
    const { done, last } = await import('./progress.js');
    expect(get(done).has('old-chapter')).toBe(true);
    expect(get(last)).toBe('old-chapter');
  });
});
