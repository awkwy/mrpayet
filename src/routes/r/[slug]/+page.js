import { error, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import { LEGACY_CLASS_NAMES } from '$lib/utils/legacy-class.js';
import { COURSES, courseById } from '$lib/data/courses/index.js';
import { RECAP } from '$lib/data/recap.js';
import { CLASSES } from '$lib/utils/course-helpers.js';

export const prerender = true;

export function entries() {
  const coursSlugs = COURSES.filter((c) => RECAP[c.id]).map((c) => ({ slug: c.id }));
  const classeSlugs = CLASSES.map((c) => ({ slug: c.n }));
  // anciens libellés de classe (ex. « TC APMP ») : redirection prérendue
  const legacy = Object.keys(LEGACY_CLASS_NAMES).map((slug) => ({ slug }));
  return [...coursSlugs, ...classeSlugs, ...legacy];
}

export function load({ params }) {
  const current = LEGACY_CLASS_NAMES[params.slug];
  if (current) throw redirect(307, `${base}/r/${encodeURIComponent(current)}`);
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
