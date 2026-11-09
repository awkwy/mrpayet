import { error } from '@sveltejs/kit';
import { bslug, bunslug } from '$lib/utils/course-helpers.js';
import { CCF } from '$lib/data/ccf.js';
import { withLegacyClassEntries, redirectLegacyClass } from '$lib/utils/legacy-class.js';

export const prerender = true;

export function entries() {
  return withLegacyClassEntries(
    Object.keys(CCF)
      .filter((cl) => CCF[cl].format)
      .map((cl) => ({ classe: bslug(cl) }))
  );
}

export function load({ params }) {
  redirectLegacyClass(params, (slug) => `/ccf/${slug}`);
  const classe = bunslug(params.classe);
  const ccf = classe ? CCF[classe] : null;
  if (!ccf || !ccf.format) throw error(404, 'CCF inconnu pour cette classe');
  return { classe, slug: params.classe, ccf };
}
