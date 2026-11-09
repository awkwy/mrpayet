import { error } from '@sveltejs/kit';
import { bunslug, bslug } from '$lib/utils/course-helpers.js';
import { AUTO } from '$lib/data/automatismes.js';
import { withLegacyClassEntries, redirectLegacyClass } from '$lib/utils/legacy-class.js';

export const prerender = true;

// Le mélange (« Mélange ») n'a pas d'équivalent cartes : il resterait ici,
// non gaté par le parcours (voir +page.js du parcours), donc uniquement les
// vrais thèmes d'une classe.
export function entries() {
  return withLegacyClassEntries(
    Object.keys(AUTO.c).flatMap((cl) => AUTO.c[cl].o.map((theme) => ({ classe: bslug(cl), theme })))
  );
}

export function load({ params }) {
  redirectLegacyClass(params, (slug) => `/flash/${slug}/${params.theme}/cartes`);
  const classe = bunslug(params.classe);
  const conf = classe ? AUTO.c[classe] : null;
  if (!conf || !conf.o.includes(params.theme) || !AUTO.t[params.theme]) throw error(404, 'Thème inconnu');

  return {
    classe,
    slug: params.classe,
    theme: params.theme,
    title: AUTO.t[params.theme].t,
    items: AUTO.t[params.theme].i
  };
}
