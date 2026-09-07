import { error } from '@sveltejs/kit';
import { bunslug } from '$lib/utils/course-helpers.js';

export const prerender = true;

export function entries() {
  return [{ classe: '2pmv2' }, { classe: 'tcaepe' }, { classe: 'tcapmp' }];
}

export function load({ params }) {
  const classe = bunslug(params.classe);
  if (!classe) throw error(404, 'Classe inconnue');
  return { classe, slug: params.classe };
}
