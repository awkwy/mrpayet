import { describe, expect, it } from 'vitest';
import { load } from './[id]/+page.js';
import { COURSES } from '$lib/data/courses/index.js';

// Route de compatibilité des QR codes /i/<slug> : un slug inconnu (fiche pas
// encore en ligne, code obsolète) doit lever un vrai 404, pas un redirect
// silencieux vers l'accueil. Un slug connu redirige vers /c/<id>.
describe('/i/[id] load', () => {
  it('lève un 404 « Fiche inconnue » pour un slug inconnu', () => {
    let thrown;
    try {
      load({ params: { id: 'cap-petite-enfance-2026' } });
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeDefined();
    expect(thrown.status).toBe(404);
    expect(thrown.body?.message).toBe('Fiche inconnue');
  });

  it('redirige un slug connu vers /c/<id>', () => {
    const { id } = COURSES[0];
    let thrown;
    try {
      load({ params: { id } });
    } catch (e) {
      thrown = e;
    }
    expect(thrown).toBeDefined();
    expect(thrown.status).toBe(307);
    expect(thrown.location).toBe(`/c/${id}`);
  });
});
