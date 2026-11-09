import { error } from '@sveltejs/kit';
import { bunslug, bslug } from '$lib/utils/course-helpers.js';
import { AUTO } from '$lib/data/automatismes.js';
import { withLegacyClassEntries, redirectLegacyClass } from '$lib/utils/legacy-class.js';

export const prerender = true;

export function entries() {
  return withLegacyClassEntries(
    Object.keys(AUTO.c).flatMap((cl) => [...AUTO.c[cl].o, 'melange'].map((theme) => ({ classe: bslug(cl), theme })))
  );
}

export function load({ params }) {
  redirectLegacyClass(params, (slug) => `/flash/${slug}/${params.theme}`);
  const classe = bunslug(params.classe);
  const conf = classe ? AUTO.c[classe] : null;
  if (!conf) throw error(404, 'Classe inconnue');

  let items;
  let title;
  if (params.theme === 'melange') {
    items = conf.o.flatMap((id) => AUTO.t[id].i);
    title = 'Mélange';
  } else if (conf.o.includes(params.theme) && AUTO.t[params.theme]) {
    items = AUTO.t[params.theme].i;
    title = AUTO.t[params.theme].t;
  } else {
    throw error(404, 'Thème inconnu');
  }

  return { classe, slug: params.classe, theme: params.theme, title, items };
}
