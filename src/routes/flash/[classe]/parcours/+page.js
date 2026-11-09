import { error } from '@sveltejs/kit';
import { bunslug, bslug } from '$lib/utils/course-helpers.js';
import { AUTO } from '$lib/data/automatismes.js';
import { withLegacyClassEntries, redirectLegacyClass } from '$lib/utils/legacy-class.js';

export const prerender = true;

export function entries() {
  return withLegacyClassEntries(Object.keys(AUTO.c).map((cl) => ({ classe: bslug(cl) })));
}

export function load({ params }) {
  redirectLegacyClass(params, (slug) => `/flash/${slug}/parcours`);
  const classe = bunslug(params.classe);
  const conf = classe ? AUTO.c[classe] : null;
  if (!conf) throw error(404, 'Classe inconnue');
  const themes = conf.o.map((id) => ({ id, t: AUTO.t[id].t }));
  return { classe, slug: params.classe, themes };
}
