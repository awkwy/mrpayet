import { select } from 'd3-selection';
import 'd3-transition';
import { SM } from './shared.js';

/* Socle D3 partagé — pilote pour moyenne/médiane.
 *
 * Choix : imports modulaires (d3-selection, d3-transition, d3-drag)
 * plutôt que le bundle `d3` complet, pour tenir la contrainte « mobile
 * d'abord / poids léger » du site (voir src/lib/styles/). d3-scale est
 * volontairement écarté : une échelle linéaire tient en trois lignes ici et
 * n'aurait justifié ni d3-array ni d3-interpolate/format/time. Le rendu
 * passe de <canvas> + requestAnimationFrame à du <svg> animé par les
 * transitions D3, dont l'assouplissement (`springEase`) est le vrai but de la
 * bascule : des changements de valeur amortis, jamais des sauts mécaniques.
 *
 * Volontairement minimal : juste ce dont les deux fiches ont besoin en commun
 * (échafaudage SVG, axe gradué, empilement des points, easing ressort). */

/** Largeur de la zone de dessin en unités viewBox. Le SVG est mis à
 * l'échelle en largeur:100 % par la CSS, donc ces unités sont indépendantes
 * de la résolution (bonus du SVG sur le canvas). On garde la largeur logique
 * du canvas historique (`cvs()` plafonne à 620) : traits, polices, rayons et
 * l'empilement des points (`stackDots`, pas de 9 u) rendent alors à la même
 * échelle visuelle que les ~22 autres manipulations canvas du même écran. */
export const VB_W = 620;

/** Easing « ressort » : intègre un oscillateur masse-ressort-amortisseur puis
 * le normalise sur [0, 1]. Donne un léger dépassement + stabilisation
 * organiques au lieu d'une rampe raide. Utilisable comme `.ease()` de
 * n'importe quelle transition D3. `damping` sous la valeur critique
 * (≈ 2·√stiffness) => rebond visible ; au-dessus => arrivée douce sans
 * dépassement. */
export function springEase({
  stiffness = 170,
  damping = 24,
  mass = 1,
  duration = 1.4,
  samples = 240
} = {}) {
  const dt = duration / samples;
  const ys = new Float64Array(samples + 1);
  let x = 0;
  let v = 0;
  for (let i = 0; i <= samples; i++) {
    ys[i] = x;
    const a = (-stiffness * (x - 1) - damping * v) / mass;
    v += a * dt;
    x += v * dt;
  }
  return (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    const p = t * samples;
    const i = Math.floor(p);
    return ys[i] + (ys[i + 1] - ys[i]) * (p - i);
  };
}

/** Assouplissement par défaut, partagé par les deux fiches pour une identité
 * de mouvement cohérente. */
export const spring = springEase();

/** Échelle linéaire minimale (l'API `d3-scale` en réduction : `x(v)` mappe le
 * domaine vers la plage, `x.invert(px)` fait l'inverse). */
export function linScale([d0, d1], [r0, r1]) {
  const fn = (v) => r0 + ((v - d0) / (d1 - d0)) * (r1 - r0);
  fn.invert = (px) => d0 + ((px - r0) / (r1 - r0)) * (d1 - d0);
  return fn;
}

/** Échafaudage d'un nuage de points sur axe gradué (équivalent SVG du
 * `dotplot` canvas de shared.js). Retourne le <svg>, l'échelle horizontale
 * et la géométrie. */
export function dotPlot(host, { height, min, max, step, bot }) {
  const W = VB_W;
  const L = 30;
  const R = W - 18;
  const AX = height - bot;
  const x = linScale([min, max], [L, R]);

  const svg = select(host)
    .append('svg')
    .attr('class', 'd3viz')
    .attr('viewBox', `0 0 ${W} ${height}`)
    .attr('role', 'img')
    .attr('preserveAspectRatio', 'xMidYMid meet');

  const ax = svg.append('g').attr('class', 'ax');
  ax.append('line')
    .attr('x1', L)
    .attr('x2', R)
    .attr('y1', AX)
    .attr('y2', AX)
    .attr('stroke', 'rgba(255,255,255,.2)')
    .attr('stroke-width', 1);

  for (let v = min; v <= max + 1e-9; v += step) {
    ax.append('line')
      .attr('x1', x(v))
      .attr('x2', x(v))
      .attr('y1', AX)
      .attr('y2', AX + 5)
      .attr('stroke', 'rgba(255,255,255,.2)')
      .attr('stroke-width', 1);
    ax.append('text')
      .attr('x', x(v))
      .attr('y', AX + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', '#63776d')
      .attr('font-family', SM)
      .attr('font-size', 11)
      .text(String(v));
  }

  return { svg, x, W, H: height, L, R, AX };
}

/** Empile les points qui tombent dans la même colonne (port fidèle du
 * binning de `dots` dans shared.js) et renvoie leurs positions. */
export function stackDots(vals, x, AX) {
  const bucket = {};
  return vals.map((v, i) => {
    const key = Math.round(x(v) / 9);
    bucket[key] = (bucket[key] || 0) + 1;
    const cy = Math.max(12, AX - 11 - (bucket[key] - 1) * 11);
    return { i, v, cx: x(v), cy };
  });
}

export { select };
