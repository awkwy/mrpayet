import { error } from '@sveltejs/kit';
import { bunslug } from '$lib/utils/course-helpers.js';
import { CCF } from '$lib/data/ccf.js';

export const prerender = true;

export function entries() {
  return Object.keys(CCF).map((cl) => ({ classe: { '2P MV2': '2pmv2', 'TC AEPE': 'tcaepe', 'TC APMP': 'tcapmp' }[cl] }));
}

export function load({ params }) {
  const classe = bunslug(params.classe);
  const ccf = classe ? CCF[classe] : null;
  if (!ccf) throw error(404, 'Révisions inconnues pour cette classe');
  return { classe, slug: params.classe, ccf };
}
