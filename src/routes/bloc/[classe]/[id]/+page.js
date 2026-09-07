import { error } from '@sveltejs/kit';
import { BLOCS } from '$lib/data/blocs.js';
import { bunslug, bslug } from '$lib/utils/course-helpers.js';

export const prerender = true;

export function entries() {
  return BLOCS.flatMap((b) => b.cls.map((cls) => ({ classe: bslug(cls), id: b.id })));
}

export function load({ params }) {
  const classe = bunslug(params.classe);
  const bloc = BLOCS.find((b) => b.id === params.id);
  if (!classe || !bloc || !bloc.cls.includes(classe)) throw error(404, 'Bloc inconnu');
  return { classe, slug: params.classe, bloc };
}
