import { error } from '@sveltejs/kit';
import { bunslug } from '$lib/utils/course-helpers.js';
import { withLegacyClassEntries, redirectLegacyClass } from '$lib/utils/legacy-class.js';

export const prerender = true;

export function entries() {
  return withLegacyClassEntries([
    { classe: '2pmv2' },
    { classe: 'tcaepe' },
    { classe: 'tcapm' },
    { classe: 'bacproms' },
    { classe: 'bacpromcv' }
  ]);
}

export function load({ params }) {
  redirectLegacyClass(params, (slug) => `/p/${slug}`);
  const classe = bunslug(params.classe);
  if (!classe) throw error(404, 'Classe inconnue');
  return { classe, slug: params.classe };
}
