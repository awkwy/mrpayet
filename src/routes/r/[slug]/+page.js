import { error } from '@sveltejs/kit';
import { COURSES, courseById } from '$lib/data/courses/index.js';
import { RECAP } from '$lib/data/recap.js';
import { CLASSES } from '$lib/utils/course-helpers.js';

export const prerender = true;

export function entries() {
  const coursSlugs = COURSES.filter((c) => RECAP[c.id]).map((c) => ({ slug: c.id }));
  const classeSlugs = CLASSES.map((c) => ({ slug: c.n }));
  return [...coursSlugs, ...classeSlugs];
}

export function load({ params }) {
  const asCourse = courseById(params.slug);
  if (asCourse && RECAP[asCourse.id]) {
    return { mode: 'course', course: asCourse, cards: RECAP[asCourse.id] };
  }
  const classe = CLASSES.find((c) => c.n === params.slug);
  if (classe) {
    const courses = COURSES.filter((c) => (c.classe === classe.n || c.classes?.includes(classe.n)) && RECAP[c.id]);
    return { mode: 'classe', classe: classe.n, courses };
  }
  throw error(404, 'Fiche récap introuvable');
}
