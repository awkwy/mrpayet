import { error } from '@sveltejs/kit';
import { COURSES, courseById } from '$lib/data/courses/index.js';

export const prerender = true;

export function entries() {
  return COURSES.map((c) => ({ id: c.id }));
}

export function load({ params }) {
  const course = courseById(params.id);
  if (!course) throw error(404, 'Cours inconnu');
  return { course };
}
