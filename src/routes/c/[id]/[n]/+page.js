import { error } from '@sveltejs/kit';
import { COURSES, courseById } from '$lib/data/courses/index.js';
import { COMP } from '$lib/data/competences.js';

export const prerender = true;

export function entries() {
  return COURSES.flatMap((c) => c.seances.map((_, n) => ({ id: c.id, n: String(n) })));
}

export function load({ params }) {
  const course = courseById(params.id);
  const n = +params.n;
  if (!course || !Number.isInteger(n) || n < 0 || n >= course.seances.length) {
    throw error(404, 'Chapitre inconnu');
  }
  const seance = course.seances[n];
  const comp = COMP[course.id + '/' + n] || null;
  return { course, n, seance, comp };
}
