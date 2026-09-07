import { COURSES, courseById } from '$lib/data/courses/index.js';
import { BLOCS } from '$lib/data/blocs.js';
import { isDone } from '$lib/stores/progress.js';
import { PROGRESSION, futureLock } from '$lib/data/progression.js';

export const CLASSES = [
  { n: '2P MV2', d: '2de bac pro Maintenance des véhicules', m: 'Maths · Physique-chimie' },
  { n: 'TC AEPE', d: 'Terminale CAP Accompagnant éducatif petite enfance', m: 'Maths · Sciences · AP' },
  { n: 'TC APMP', d: 'Terminale CAP Agent de prévention et de médiation', m: 'Maths · Sciences' }
];

const SLUGS = { '2P MV2': '2pmv2', 'TC AEPE': 'tcaepe', 'TC APMP': 'tcapmp' };
const UNSLUGS = { '2pmv2': '2P MV2', tcaepe: 'TC AEPE', tcapmp: 'TC APMP' };

export function bslug(classe) {
  return SLUGS[classe];
}

export function bunslug(slug) {
  return UNSLUGS[slug];
}

export function chapterKey(course, n) {
  return course.id + '/' + n;
}

export function doneCount(course) {
  return course.seances.filter((_, i) => isDone(chapterKey(course, i))).length;
}

export function courseIdsOf(classe) {
  return COURSES.filter((c) => c.classe === classe || (c.classes && c.classes.includes(classe))).map((c) => c.id);
}

export function blocsOf(classe) {
  return BLOCS.filter((b) => b.cls.includes(classe));
}

export function blocById(id) {
  return BLOCS.find((b) => b.id === id);
}

export function blocCours(bloc, classe) {
  return (bloc.cours && bloc.cours[classe]) || [];
}

export function blocOfCourse(id, classe) {
  return BLOCS.find((b) => blocCours(b, classe).includes(id));
}

export function blocChapters(bloc, classe) {
  const out = [];
  const ids = blocCours(bloc, classe);
  ids.forEach((cid) => {
    const co = courseById(cid);
    if (!co) return;
    co.seances.forEach((se, i) => {
      if (bloc.ch && ids.length === 1 && !bloc.ch.includes(i)) return;
      out.push({ co, se, i });
    });
  });
  return out;
}

// ---------- contrôle d'accès « pas encore au programme » ----------
// Un contenu est verrouillé tant qu'aucune de ses fenêtres de progression
// n'a commencé (voir futureLock dans progression.js). Le calcul se fait
// toujours côté client, à partir de la semaine réelle d'aujourd'hui —
// l'heure du build n'est pas celle de l'élève.

/** Entrées de progression qui pilotent l'accès à un bloc pour une classe. */
export function blocProgression(blocId, classe) {
  return PROGRESSION.filter((p) => p.blocId === blocId && p.classe === classe);
}

/** Verrou d'un bloc pour une classe : `null` si accessible, sinon
 * `{ from, monday }` de la fenêtre la plus proche. */
export function blocLock(bloc, classe, week) {
  return futureLock(blocProgression(bloc.id, classe), week);
}

/** Toutes les classes servies par un cours (`classes` ou `classe` seul). */
function courseClasses(course) {
  return course.classes && course.classes.length ? course.classes : [course.classe];
}

/** Entrées de progression concernant un cours (tous blocs / classes qui le
 * portent). Si `n` est fourni, on restreint aux blocs qui couvrent ce
 * chapitre (`bloc.ch`) quand une telle découpe existe. */
function courseProgression(course, n) {
  const entries = [];
  for (const cl of courseClasses(course)) {
    for (const b of BLOCS) {
      if (!blocCours(b, cl).includes(course.id)) continue;
      if (Number.isInteger(n) && b.ch && !b.ch.includes(n)) continue;
      entries.push(...blocProgression(b.id, cl));
    }
  }
  return entries;
}

/** Verrou d'un cours : `null` si accessible pour au moins une de ses
 * classes (ou s'il n'a aucune entrée de progression). */
export function courseLock(course, week) {
  return futureLock(courseProgression(course), week);
}

/** Verrou d'un chapitre précis d'un cours. */
export function chapterLock(course, n, week) {
  return futureLock(courseProgression(course, n), week);
}

export function blocState(bloc, classe) {
  const chs = blocChapters(bloc, classe);
  if (!chs.length) return { tot: 0, done: 0, averir: !bloc.integre };
  const done = chs.filter((x) => isDone(chapterKey(x.co, x.i))).length;
  return { tot: chs.length, done };
}
