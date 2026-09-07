import { error } from '@sveltejs/kit';
import { bunslug, bslug } from '$lib/utils/course-helpers.js';
import { AUTO } from '$lib/data/automatismes.js';

export const prerender = true;

export function entries() {
  return Object.keys(AUTO.c).map((cl) => ({ classe: bslug(cl) }));
}

export function load({ params }) {
  const classe = bunslug(params.classe);
  const conf = classe ? AUTO.c[classe] : null;
  if (!conf) throw error(404, 'Classe inconnue');
  const themes = conf.o.map((id) => ({ id, t: AUTO.t[id].t, n: AUTO.t[id].i.length }));
  return { classe, slug: params.classe, themes };
}
