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
 * (échafaudage SVG, axe gradué, empilement des points, easing ressort,
 * infobulle survol/focus).
 *
 * Couleurs : tout est tiré de src/lib/styles/tokens.css via var(--…) — jamais
 * de hex en dur ici. Suivi de la procédure « dataviz » : les onze durées sont
 * une série unique (pas de légende) peinte dans la teinte séquentielle du site
 * (rampe verte --g/--g2/--g3) ; la valeur dérivée (moyenne / médiane) est un
 * accent neutre --blue — surtout pas --warn, qui est un jeton d'état réservé.
 * Axe et graduations : filet 1 px --line2, discret. */

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
 * `dotplot` canvas d'origine, site-mrpayet/index.html lignes 3075-3099).
 * Retourne le <svg>, l'échelle horizontale et la géométrie. */
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
  // Ligne de base : filet plein discret, une marche au-dessus de la surface
  // (marks-and-anatomy.md « gridlines/axes : hairline 1px solid, recessive »).
  ax.append('line')
    .attr('x1', L)
    .attr('x2', R)
    .attr('y1', AX)
    .attr('y2', AX)
    .attr('stroke', 'var(--line2)')
    .attr('stroke-width', 1);

  for (let v = min; v <= max + 1e-9; v += step) {
    ax.append('line')
      .attr('x1', x(v))
      .attr('x2', x(v))
      .attr('y1', AX)
      .attr('y2', AX + 5)
      .attr('stroke', 'var(--line2)')
      .attr('stroke-width', 1);
    ax.append('text')
      .attr('x', x(v))
      .attr('y', AX + 15)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--dim2)')
      .attr('font-family', SM)
      .attr('font-size', 11)
      .text(String(v));
  }

  return { svg, x, W, H: height, L, R, AX };
}

/** Infobulle survol/focus partagée (interaction.md : « an HTML chart is
 * interactive by default »). Un <div> positionné en pixels CSS au-dessus du
 * point visé ; la valeur mène, le libellé suit. Insertion par `textContent`
 * uniquement. `host` doit être `position: relative`. */
export function tip(host) {
  const el = document.createElement('div');
  el.className = 'vtip';
  el.hidden = true;
  const v = document.createElement('span');
  v.className = 'tv';
  const k = document.createElement('span');
  k.className = 'tk';
  el.append(v, k);
  host.appendChild(el);

  return {
    /** `cx`,`cy` en pixels CSS relatifs à `host` (haut-gauche). */
    show(cx, cy, value, key) {
      v.textContent = value;
      k.textContent = key || '';
      el.style.left = cx + 'px';
      el.style.top = cy + 'px';
      el.hidden = false;
    },
    hide() {
      el.hidden = true;
    },
    remove() {
      el.remove();
    }
  };
}

/** Convertit un point du repère viewBox (`vx`,`vy`) en pixels CSS relatifs au
 * conteneur `host`, en tenant compte de la mise à l'échelle largeur:100 % du
 * <svg>. */
export function vbToCss(host, svgNode, vx, vy) {
  const r = svgNode.getBoundingClientRect();
  const hr = host.getBoundingClientRect();
  const s = r.width / VB_W;
  return { x: r.left - hr.left + vx * s, y: r.top - hr.top + vy * s };
}

/** Empile les points qui tombent dans la même colonne (port fidèle du
 * binning `dots` du canvas d'origine, site-mrpayet/index.html) et renvoie
 * leurs positions. */
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
