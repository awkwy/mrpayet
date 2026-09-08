<script>
  import { onMount, onDestroy } from 'svelte';
  import { drag } from 'd3-drag';
  import { box, readout, SM, fr, DUR } from './shared.js';
  import { dotPlot, stackDots, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « moyenne, point d'équilibre » — refaite via la procédure dataviz.
   *
   * 1. Forme  : les onze durées forment une petite distribution sur un axe
   *    gradué → nuage de points (dot-plot). La moyenne est une valeur dérivée
   *    unique → marqueur d'emphase (le pivot). choosing-a-form.md : « one series
   *    is the point, rest are context → emphasis ». Confirmé, on garde.
   * 2. Couleur : série unique = les points, teinte séquentielle du site (--g,
   *    rampe verte) ; pas de légende (le titre nomme la série). La valeur
   *    dérivée est un accent neutre (--blue) — pas --warn, jeton d'état réservé
   *    (color-formula.md « status colors are reserved »). L'identité vient de la
   *    forme (triangle vs disque) + du libellé direct, jamais de la couleur
   *    seule.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#7ec8f2"
   *    --mode dark --surface "#0f1512" → paire série/accent : CVD ΔE 15,5
   *    (deutan) / 17,1 (normal) et contraste ≥ 3:1 : PASS. Les FAIL « lightness
   *    band / chroma floor » sont une propriété du thème néon-sur-noir du site
   *    (toutes les fiches), pas corrigeable sans inventer un hex hors tokens.css.
   * 4. Marques : disques r 5 (≥ 8 px), anneau 2 px couleur surface pour rester
   *    lisibles quand ils se chevauchent (marks-and-anatomy.md « surface ring »).
   *    Axe : filet 1 px. Libellé direct sélectif : seulement le pivot.
   * 5. Interaction : glisser-déposer conservé + infobulle survol/focus (valeur
   *    de la durée) ; cible de survol 30 px > la marque.
   * 6. Accessibilité : vue tableau repliable (toutes les valeurs + indicateurs),
   *    focus clavier = survol, mouvement réduit respecté, thème sombre validé.
   *
   * Contraintes captain conservées : implémentation D3 (SVG, imports modulaires
   * d3-selection/d3-transition/d3-drag), transitions assouplies par ressort,
   * entrée décalée des points, poids léger, parité d'échelle avec les fiches
   * canvas voisines (VB_W). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUR_MOVE = RM ? 0 : 720;
    const DUR_PIVOT = RM ? 0 : 760;

    let vals = DUR.slice();
    let dragging = -1;

    const { svg, x, W, H, L, R, AX } = dotPlot(host, {
      height: 190,
      min: 10,
      max: 100,
      step: 10,
      bot: 58
    });
    svg.attr('aria-label', 'Nuage des onze durées de vidange et pivot de la moyenne');

    const svgNode = svg.node();
    const bulle = tip(host);

    const dotsG = svg.append('g').attr('class', 'dots');
    const pivotG = svg.append('g').attr('class', 'pivot');
    const tri = pivotG
      .append('path')
      .attr('d', 'M0,0 L-9,17 L9,17 Z')
      .attr('fill', 'var(--blue)');
    const label = pivotG
      .append('text')
      .attr('y', H - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--blue)')
      .attr('font-family', SM)
      .attr('font-size', 12)
      .attr('font-weight', 'bold');

    const ctl = box(host, 'vctl', `<button class="gh" id="rz">Remettre les vraies durées</button>`);
    readout(host, [
      { id: 'yM', k: 'moyenne', c: 'b' },
      { id: 'yS', k: 'somme', c: 'd' },
      { id: 'yN', k: 'effectif', c: 'd' }
    ]);
    const say = box(host, 'say', 'Fais glisser un point : le pivot suit toujours la moyenne.');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="yCap"></caption><thead><tr><th>Véhicule</th><th>Durée (min)</th></tr></thead>` +
        `<tbody id="yBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#yBody');
    const cap = dataView.querySelector('#yCap');

    const sum = () => vals.reduce((s, v) => s + v, 0);
    const mean = () => sum() / vals.length;
    const clampV = (v) => Math.max(10, Math.min(100, v));
    const labelX = (px) => Math.max(56, Math.min(W - 56, px));

    const dragBehavior = drag()
      .container(function () {
        return this.ownerSVGElement;
      })
      .on('start', (event, d) => {
        dragging = d.i;
        render(false);
      })
      .on('drag', (event, d) => {
        vals[d.i] = clampV(Math.round(x.invert(event.x)));
        render(false);
      })
      .on('end', () => {
        dragging = -1;
        render(true);
      });

    function showTip(d) {
      const p = vbToCss(host, svgNode, d.cx, d.cy);
      bulle.show(p.x, p.y, fr(d.v) + ' min', 'durée n°' + (d.i + 1));
    }

    function render(animate) {
      const layout = stackDots(vals, x, AX);
      const m = mean();

      const join = dotsG.selectAll('g.dot').data(layout, (d) => d.i);
      const enter = join
        .enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', (d) => `translate(${d.cx},${d.cy})`)
        .call(dragBehavior);
      enter
        .append('circle')
        .attr('class', 'hit')
        .attr('r', 15)
        .attr('fill', 'transparent')
        .attr('tabindex', 0)
        .style('cursor', 'grab')
        .on('mouseenter focus', (event, d) => showTip(d))
        .on('mouseleave blur', () => bulle.hide());
      enter.append('circle').attr('class', 'mark').style('pointer-events', 'none');

      const all = enter.merge(join);
      all.select('circle.hit').attr('aria-label', (d) => `Durée n°${d.i + 1} : ${d.v} minutes`);
      all
        .select('circle.mark')
        .attr('r', (d) => (d.i === dragging ? 6 : 5))
        .attr('fill', 'var(--g)')
        .attr('stroke', (d) => (d.i === dragging ? 'var(--tx)' : 'var(--surf)'))
        .attr('stroke-width', 2);

      all.each(function (d) {
        const sel = select(this);
        const t = `translate(${d.cx},${d.cy})`;
        if (animate && d.i !== dragging) {
          sel.transition('move').duration(DUR_MOVE).ease(spring).attr('transform', t);
        } else {
          sel.interrupt('move').attr('transform', t);
        }
      });

      const px = x(m);
      (animate ? tri.transition('p').duration(DUR_PIVOT).ease(spring) : tri.interrupt('p')).attr(
        'transform',
        `translate(${px},${AX + 24})`
      );
      (animate ? label.transition('p').duration(DUR_PIVOT).ease(spring) : label.interrupt('p')).attr(
        'x',
        labelX(px)
      );
      label.text('moyenne ' + fr(m.toFixed(1)));

      host.querySelector('#yM').textContent = fr(m.toFixed(2));
      host.querySelector('#yS').textContent = fr(sum().toFixed(0));
      host.querySelector('#yN').textContent = vals.length;

      const below = vals.filter((v) => v < m).length;
      say.innerHTML =
        `Somme ${sum()} ÷ ${vals.length} = <b>${fr(m.toFixed(2))} min</b>. ` +
        `<b>${below}</b> durée${below > 1 ? 's' : ''} sur ${vals.length} ${below > 1 ? 'sont' : 'est'} en dessous de la moyenne` +
        (below > vals.length * 0.7 ? ' — une seule valeur très grande a tiré le pivot vers la droite.' : '.');

      cap.textContent = `Moyenne ${fr(m.toFixed(2))} min · somme ${sum()} min · effectif ${vals.length}`;
      tbody.replaceChildren(
        ...vals.map((v, i) => {
          const tr = document.createElement('tr');
          const a = document.createElement('td');
          a.textContent = String(i + 1);
          const b = document.createElement('td');
          b.textContent = fr(v);
          tr.append(a, b);
          return tr;
        })
      );
    }

    render(false);
    // entrée animée : les points montent de l'axe vers leur pile
    if (!RM) {
      dotsG
        .selectAll('g.dot')
        .attr('transform', (d) => `translate(${d.cx},${AX})`)
        .transition('move')
        .duration(700)
        .delay((d, i) => i * 22)
        .ease(spring)
        .attr('transform', (d) => `translate(${d.cx},${d.cy})`);
    }

    ctl.querySelector('#rz').onclick = () => {
      vals = DUR.slice();
      render(true);
    };

    cleanup = () => {
      svg.selectAll('*').interrupt('move').interrupt('p');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
