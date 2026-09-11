import { error, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { COURSES, courseById } from '$lib/data/courses/index.js';

// Route de compatibilité avec les QR codes déjà générés sur les fiches
// élève imprimables (eleve/qr/<id>.svg, encodant mrpayet.com/i/<id>) —
// évite d'avoir à régénérer ces QR codes si on change un jour le schéma de
// routage de la page cours elle-même.
export const prerender = true;

export function entries() {
  return COURSES.map((c) => ({ id: c.id }));
}

export function load({ params }) {
  const course = courseById(params.id);
  // Slug inconnu (fiche pas encore en ligne, code obsolète, faute de frappe) :
  // vraie page 404, pas un renvoi silencieux vers l'accueil.
  if (!course) throw error(404, 'Fiche inconnue');
  throw redirect(307, `${base}/c/${course.id}`);
}
