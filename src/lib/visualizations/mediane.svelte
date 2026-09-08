<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr, DUR } from './shared.js';
  import { dotPlot, stackDots, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « médiane, résistance à l'extrême » — refaite via la procédure dataviz.
   *
   * 1. Forme  : mêmes onze durées en nuage de points ; deux valeurs dérivées
   *    (moyenne, médiane) en repères verticaux. Le sujet de la fiche est la
   *    médiane, la moyenne est le repoussoir → emphase (choosing-a-form.md
   *    « highlight one, gray the rest »).
   * 2. Couleur : points = série unique, teinte séquentielle --g. Médiane =
   *    accent --blue (la valeur qu'on met en avant). Moyenne = --dim, encre
   *    atténuée (le contexte qui bouge). Pas --warn (jeton d'état réservé). Les
   *    deux repères portent toujours un libellé direct → identité jamais par la
   *    couleur seule. Bandes moitié basse / haute : simple lavis --g très faible.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#7ec8f2,#8fa79b"
   *    --mode dark --surface "#0f1512" — paire série/accent CVD ΔE 15,5 / 17,1 :
   *    PASS ; contrastes sur surface 13,4 / 10,1 / 7,2 : PASS. --dim vs --blue
   *    sont deux rôles distincts (encre atténuée vs accent), tous deux
   *    étiquetés et d'épaisseur différente : ce n'est pas un couple catégoriel.
   *    FAIL « lightness band / chroma » = propriété du thème néon du site.
   * 4. Marques : repères 2 px (médiane 2,6), bouts arrondis ; disques r 5 +
   *    anneau 2 px surface ; onzième point cerné --tx (celui que le curseur
   *    déplace). Axe filet 1 px.
   * 5. Interaction : curseur conservé + infobulle survol/focus sur les points.
   * 6. Accessibilité : vue tableau repliable (série rangée + indicateurs), focus
   *    clavier = survol, mouvement réduit respecté, thème sombre validé.
   *
   * Contraintes captain conservées : D3/SVG, imports modulaires, transitions
   * ressort, entrée décalée symétrique avec moyenne.svelte, poids léger, parité
   * d'échelle (VB_W) avec les fiches canvas. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUR_T = RM ? 0 : 620;

    let ext = 95;

    const { svg, x, W, H, L, R, AX } = dotPlot(host, {
      height: 205,
      min: 0,
      max: 180,
      step: 30,
      bot: 62
    });
    svg.attr('aria-label', 'Nuage des onze durées, repères de la moyenne et de la médiane');

    const svgNode = svg.node();
    const bulle = tip(host);

    // bandes « moitié basse / moitié haute » de part et d'autre de la médiane
    const bandLo = svg
      .insert('rect', '.ax')
      .attr('y', 12)
      .attr('height', AX - 12)
      .attr('fill', 'var(--g)')
      .attr('fill-opacity', 0.06);
    const bandHi = svg
      .insert('rect', '.ax')
      .attr('y', 12)
      .attr('height', AX - 12)
      .attr('fill', 'var(--g)')
      .attr('fill-opacity', 0.03);

    const dotsG = svg.append('g').attr('class', 'dots');

    const meanLine = svg
      .append('line')
      .attr('y1', 10)
      .attr('y2', AX)
      .attr('stroke', 'var(--dim)')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round');
    const medLine = svg
      .append('line')
      .attr('y1', 10)
      .attr('y2', AX)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-width', 2.6)
      .attr('stroke-linecap', 'round');

    const meanLabel = svg
      .append('text')
      .attr('y', H - 23)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--dim)')
      .attr('font-family', SM)
      .attr('font-size', 11.5)
      .attr('font-weight', 'bold');
    const medLabel = svg
      .append('text')
      .attr('y', H - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--blue)')
      .attr('font-family', SM)
      .attr('font-size', 11.5)
      .attr('font-weight', 'bold');

    const sl = box(
      host,
      'vsl',
      `<label><span>La onzième durée (bouchon grippé)</span><b>95 min</b></label>` +
        `<input type="range" min="25" max="180" value="95" step="1" aria-label="Onzième durée en minutes">`
    );
    const inp = sl.querySelector('input');
    const out = sl.querySelector('b');

    readout(host, [
      { id: 'zM', k: 'moyenne', c: 'd' },
      { id: 'zD', k: 'médiane', c: 'b' },
      { id: 'zE', k: 'étendue', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="zCap"></caption><thead><tr><th>Rang</th><th>Durée rangée (min)</th></tr></thead>` +
        `<tbody id="zBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#zBody');
    const cap = dataView.querySelector('#zCap');

    function showTip(d) {
      const p = vbToCss(host, svgNode, d.cx, d.cy);
      bulle.show(p.x, p.y, fr(d.v) + ' min', d.i === 10 ? 'valeur extrême' : 'durée n°' + (d.i + 1));
    }

    function render(animate) {
      const vals = DUR.slice(0, 10).concat([ext]);
      const srt = vals.slice().sort((a, b) => a - b);
      const m = vals.reduce((s, v) => s + v, 0) / vals.length;
      const md = srt[5];
      const et = srt[10] - srt[0];
      const gm = x(m);
      const gd = x(md);

      const T = (sel, name) =>
        animate ? sel.transition(name).duration(DUR_T).ease(spring) : sel.interrupt(name);

      T(bandLo, 'b').attr('x', L).attr('width', Math.max(0, gd - L));
      T(bandHi, 'b').attr('x', gd).attr('width', Math.max(0, R - gd));

      const layout = stackDots(vals, x, AX);
      const join = dotsG.selectAll('g.dot').data(layout, (d) => d.i);
      const enter = join
        .enter()
        .append('g')
        .attr('class', 'dot')
        .attr('transform', (d) => `translate(${d.cx},${d.cy})`);
      enter
        .append('circle')
        .attr('class', 'hit')
        .attr('r', 15)
        .attr('fill', 'transparent')
        .attr('tabindex', 0)
        .on('mouseenter focus', (event, d) => showTip(d))
        .on('mouseleave blur', () => bulle.hide());
      enter.append('circle').attr('class', 'mark').style('pointer-events', 'none');
      const all = enter.merge(join);
      all.select('circle.hit').attr('aria-label', (d) => `Durée n°${d.i + 1} : ${d.v} minutes`);
      all
        .select('circle.mark')
        .attr('r', (d) => (d.i === 10 ? 6 : 5))
        .attr('fill', 'var(--g)')
        .attr('stroke', (d) => (d.i === 10 ? 'var(--tx)' : 'var(--surf)'))
        .attr('stroke-width', 2);
      all.each(function (d) {
        T(select(this), 'move').attr('transform', `translate(${d.cx},${d.cy})`);
      });

      T(meanLine, 'l').attr('x1', gm).attr('x2', gm);
      T(medLine, 'l').attr('x1', gd).attr('x2', gd);
      T(meanLabel, 'l').attr('x', Math.max(58, Math.min(W - 58, gm)));
      meanLabel.text('moyenne ' + fr(m.toFixed(1)));
      T(medLabel, 'l').attr('x', Math.max(52, Math.min(W - 52, gd)));
      medLabel.text('médiane ' + md);

      host.querySelector('#zM').textContent = fr(m.toFixed(1));
      host.querySelector('#zD').textContent = String(md);
      host.querySelector('#zE').textContent = String(et);

      say.innerHTML =
        `En tirant la valeur extrême jusqu'à <b>${Math.round(ext)} min</b> : la moyenne monte à <b>${fr(
          m.toFixed(1)
        )}</b>, la médiane reste à <b>${md}</b>. ` +
        `La médiane ne dépend que du <b>rang</b> des valeurs — cinq durées en dessous, cinq au-dessus, quoi qu'il arrive à la plus grande. L'étendue, elle, vaut ${et} min : elle signale que des cas très longs existent.`;

      cap.textContent = `Moyenne ${fr(m.toFixed(1))} min · médiane ${md} min · étendue ${et} min`;
      tbody.replaceChildren(
        ...srt.map((v, i) => {
          const tr = document.createElement('tr');
          if (i === 5) tr.className = 'is-median';
          const a = document.createElement('td');
          a.textContent = String(i + 1);
          const b = document.createElement('td');
          b.textContent = fr(v) + (i === 5 ? ' (médiane)' : '');
          tr.append(a, b);
          return tr;
        })
      );
    }

    inp.addEventListener('input', () => {
      ext = +inp.value;
      out.textContent = ext + ' min';
      render(true);
    });

    render(false);
    // entrée animée : les points montent de l'axe vers leur pile
    // (même révélation décalée que moyenne.svelte, pour deux vues sœurs cohérentes)
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

    cleanup = () => {
      svg.selectAll('*').interrupt('b').interrupt('l').interrupt('move');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
