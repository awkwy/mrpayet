// Anciens slugs de classe : la classe « TC APMP » s'appelle désormais « TC APM »
// (règle du capitaine : jamais « APMP » côté élève). Les anciennes URLs
// (/p/tcapmp, /flash/tcapmp/…, /r/TC APMP…) circulent sur des QR codes et des
// favoris : elles restent prérendues et renvoient (307) vers la page actuelle.
// Même mécanisme que la route de compatibilité /i/[id].
import { redirect } from '@sveltejs/kit';
import { base } from '$app/paths';

/** ancien slug → slug actuel (paramètre `classe` des routes) */
export const LEGACY_CLASS_SLUGS = { tcapmp: 'tcapm' };
/** ancien libellé de classe → libellé actuel (paramètre `slug` de /r/[slug]) */
export const LEGACY_CLASS_NAMES = { 'TC APMP': 'TC APM' };

/** Ajoute, pour chaque entrée prérendue d'une classe renommée, la même entrée
 * sous l'ancien slug (la page y sera une redirection). */
export function withLegacyClassEntries(entries) {
  const extra = [];
  for (const [oldSlug, newSlug] of Object.entries(LEGACY_CLASS_SLUGS)) {
    for (const e of entries) if (e.classe === newSlug) extra.push({ ...e, classe: oldSlug });
  }
  return [...entries, ...extra];
}

/** À appeler en tête de `load` : si `params.classe` est un ancien slug,
 * redirige vers `path(nouveauSlug)` (chemin relatif à la base du site). */
export function redirectLegacyClass(params, path) {
  const current = LEGACY_CLASS_SLUGS[params.classe];
  if (current) throw redirect(307, `${base}${path(current)}`);
}
