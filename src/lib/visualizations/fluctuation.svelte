<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr, createLoop } from './shared.js';
  import { dotPlot, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « fluctuation d'échantillonnage » — portée sur D3 via la procédure
   * dataviz.
   *
   * 1. Forme  : la fréquence de chaque échantillon est une valeur sur [0 ; 1] →
   *    nuage de points (dot-plot) sur axe gradué. La proportion théorique p est
   *    un repère fixe ; l'étendue observée est le message.
   * 2. Couleur : une seule série (les fréquences observées) → teinte
   *    séquentielle unique `--g`. Le repère p et le crochet d'étendue sont des
   *    accents neutres `--blue` — jamais `--warn` (jeton d'état réservé). Lors
   *    d'un « Prélever 1 », la barre de proportion de l'échantillon (part
   *    défectueuse) est en `--g` sur fond `--surf3`, aucune couleur d'état ;
   *    sa fraction verte s'aligne sur l'abscisse où le point va se poser.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#7ec8f2"
   *    --mode dark --surface "#0f1512" → série/accent CVD ΔE 15,5 (deutan) /
   *    17,1 (normal), contraste ≥ 3:1 : PASS. FAIL band/chroma = thème néon du
   *    site.
   * 4. Marques : disques r 3,4, axe filet 1 u, repère p filet 2 u pointillé,
   *    crochet d'étendue 2 u à bouts arrondis, barre d'échantillon sous l'axe.
   * 5. Interaction : boutons de taille d'échantillon et de prélèvement
   *    conservés + infobulle survol/focus sur les points.
   * 6. Accessibilité : vue tableau repliable (nombre d'échantillons, étendue,
   *    dernières fréquences), focus clavier = survol, mouvement réduit
   *    respecté, thème sombre validé.
   *
   * Contraintes captain conservées : D3/SVG, imports modulaires, transitions
   * ressort (entrée des points), poids léger, parité d'échelle (VB_W). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};
  const loop = createLoop();

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const P = 0.2;
    let n = 10;
    let fs = [];
    let anim = null;
    let gen = 0;

    function stopFill() {
      gen++;
      sampFill.interrupt('fill');
      sampG.interrupt().attr('opacity', 0);
      anim = null;
    }

    const { svg, x, L, R, AX } = dotPlot(host, {
      height: 190,
      min: 0,
      max: 1,
      step: 0.25,
      bot: 66
    });
    svg.attr('aria-label', `Nuage des fréquences d'échantillons et repère de la proportion p = ${fr(P.toFixed(2))}`);
    const svgNode = svg.node();
    const bulle = tip(host);

    // repère p (proportion théorique)
    const pLine = svg
      .append('line')
      .attr('x1', x(P))
      .attr('x2', x(P))
      .attr('y1', 14)
      .attr('y2', AX)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4');
    svg
      .append('text')
      .attr('x', x(P))
      .attr('y', 10)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--blue)')
      .attr('font-family', SM)
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .text(`p = ${fr(P.toFixed(2))}`);

    const rangeG = svg.append('g').attr('class', 'range');
    const rangeBar = rangeG
      .append('line')
      .attr('y1', AX)
      .attr('y2', AX)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-width', 2)
      .attr('stroke-linecap', 'round');
    const capL = rangeG.append('line').attr('stroke', 'var(--blue)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
    const capR = rangeG.append('line').attr('stroke', 'var(--blue)').attr('stroke-width', 2).attr('stroke-linecap', 'round');

    const dotsG = svg.append('g').attr('class', 'dots');

    // barre de proportion d'un échantillon (mode « Prélever 1 ») : sous l'axe,
    // jamais par-dessus le nuage. Sa fraction verte = part défectueuse de
    // l'échantillon, alignée horizontalement sur l'abscisse du futur point.
    const SB_Y = AX + 36;
    const sampG = svg.append('g').attr('class', 'samp').attr('opacity', 0);
    sampG
      .append('rect')
      .attr('x', L)
      .attr('y', SB_Y)
      .attr('width', R - L)
      .attr('height', 9)
      .attr('rx', 4)
      .attr('fill', 'var(--surf3)');
    const sampFill = sampG
      .append('rect')
      .attr('x', L)
      .attr('y', SB_Y)
      .attr('height', 9)
      .attr('rx', 4)
      .attr('fill', 'var(--g)');
    const sampTxt = sampG
      .append('text')
      .attr('x', L)
      .attr('y', SB_Y - 5)
      .attr('fill', 'var(--dim)')
      .attr('font-family', SM)
      .attr('font-size', 10.5);

    const nb = box(
      host,
      'vctl',
      [10, 30, 100, 1000].map((v) => `<button data-n="${v}"${v === 10 ? ' class="on"' : ''}>n = ${v}</button>`).join('')
    );
    const ctl = box(
      host,
      'vctl',
      `<button class="p" id="o1">Prélever 1</button><button class="p" id="o20">Prélever 20</button><button class="gh" id="rz">Recommencer</button>`
    );
    readout(host, [
      { id: 'fE', k: 'étendue des fréquences', c: 'b' },
      { id: 'fN', k: 'échantillons', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="fCap"></caption><thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>` +
        `<tbody id="fBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#fBody');
    const cap = dataView.querySelector('#fCap');

    // empilement local : plus serré que stackDots (beaucoup de points possibles)
    function stack(vals) {
      const bucket = {};
      return vals.map((v, i) => {
        const key = Math.round(x(v) / 7);
        bucket[key] = (bucket[key] || 0) + 1;
        const cy = Math.max(14, AX - 8 - (bucket[key] - 1) * 6.5);
        return { i, v, cx: x(v), cy };
      });
    }

    function showTip(d) {
      const p = vbToCss(host, svgNode, d.cx, d.cy);
      bulle.show(p.x, p.y, fr(d.v.toFixed(2)), `échantillon n°${d.i + 1}`);
    }

    function render(animate) {
      const layout = stack(fs);
      const join = dotsG.selectAll('circle.mark').data(layout, (d) => d.i);
      const enter = join
        .enter()
        .append('circle')
        .attr('class', 'mark')
        .attr('r', 3.4)
        .attr('fill', 'var(--g)')
        .attr('stroke', 'var(--surf)')
        .attr('stroke-width', 1.5)
        .attr('cx', (d) => d.cx)
        .attr('cy', AX)
        .attr('tabindex', 0)
        .on('mouseenter focus', (event, d) => showTip(d))
        .on('mouseleave blur', () => bulle.hide());
      enter.append('title');

      const all = enter.merge(join);
      all.select('title').text((d) => `Échantillon n°${d.i + 1} : fréquence ${fr(d.v.toFixed(2))}`);
      all.attr('aria-label', (d) => `Échantillon n°${d.i + 1} : fréquence ${fr(d.v.toFixed(2))}`);
      all.each(function (d) {
        const sel = select(this);
        if (animate && !RM) {
          sel.transition('in').duration(420).ease(spring).attr('cx', d.cx).attr('cy', d.cy);
        } else {
          sel.interrupt('in').attr('cx', d.cx).attr('cy', d.cy);
        }
      });
      join.exit().remove();

      if (fs.length > 1) {
        const mn = Math.min(...fs);
        const mx = Math.max(...fs);
        rangeG.attr('opacity', 1);
        rangeBar.attr('x1', x(mn)).attr('x2', x(mx));
        capL.attr('x1', x(mn)).attr('x2', x(mn)).attr('y1', AX - 5).attr('y2', AX + 5);
        capR.attr('x1', x(mx)).attr('x2', x(mx)).attr('y1', AX - 5).attr('y2', AX + 5);
      } else {
        rangeG.attr('opacity', 0);
      }

      host.querySelector('#fN').textContent = fs.length;
      if (fs.length > 1) {
        const e = Math.max(...fs) - Math.min(...fs);
        host.querySelector('#fE').textContent = fr(e.toFixed(3));
        say.innerHTML =
          `Sur ${fs.length} échantillons de <b>n = ${n}</b>, les fréquences vont de ` +
          `<b>${fr(Math.min(...fs).toFixed(2))}</b> à <b>${fr(Math.max(...fs).toFixed(2))}</b> : ` +
          `l'étendue vaut <b>${fr(e.toFixed(3))}</b>. ` +
          (n >= 100
            ? 'Avec un grand n, les fréquences se resserrent autour de p.'
            : 'Passe à n = 100 puis n = 1000 : regarde le nuage se resserrer.');
      } else if (fs.length === 1) {
        host.querySelector('#fE').textContent = '—';
        say.innerHTML = `Fréquence de cet échantillon : <b>${fr(fs[0].toFixed(2))}</b>. Il en faut plusieurs pour parler d'étendue.`;
      } else {
        host.querySelector('#fE').textContent = '—';
        say.textContent = 'Prélève un échantillon.';
      }

      const e = fs.length > 1 ? Math.max(...fs) - Math.min(...fs) : null;
      cap.textContent = `${fs.length} échantillon${fs.length > 1 ? 's' : ''} de n = ${n}` + (e != null ? ` · étendue ${fr(e.toFixed(3))}` : '');
      const rows = [
        ['Taille d’échantillon n', String(n)],
        ['Nombre d’échantillons', String(fs.length)],
        ['Proportion théorique p', fr(P.toFixed(2))]
      ];
      if (fs.length >= 1) rows.push(['Fréquence min / max', `${fr(Math.min(...fs).toFixed(2))} / ${fr(Math.max(...fs).toFixed(2))}`]);
      if (e != null) rows.push(['Étendue des fréquences', fr(e.toFixed(3))]);
      tbody.replaceChildren(
        ...rows.map(([k, v]) => {
          const tr = document.createElement('tr');
          const a = document.createElement('td');
          a.textContent = k;
          const b = document.createElement('td');
          b.textContent = v;
          tr.append(a, b);
          return tr;
        })
      );
    }

    const sample = () => {
      let bad = 0;
      for (let i = 0; i < n; i++) if (Math.random() < P) bad++;
      return bad;
    };

    function prelever1() {
      if (anim) return;
      anim = true;
      const bad = sample();
      const frac = bad / n;
      sampTxt.text(`cet échantillon : ${bad} défectueux sur ${n} → ${fr(frac.toFixed(2))}`);
      sampG.interrupt().attr('opacity', 1);
      const g = gen;
      const land = () => {
        if (g !== gen) return;
        fs.push(frac);
        render(true);
        sampG.transition().delay(500).duration(300).attr('opacity', 0);
        anim = null;
      };
      if (RM) {
        sampFill.attr('width', frac * (R - L));
        land();
      } else {
        sampFill
          .attr('width', 0)
          .transition('fill')
          .duration(700)
          .ease(spring)
          .attr('width', frac * (R - L))
          .on('end', land);
      }
    }

    function prelever(k) {
      if (anim) return;
      let i = 0;
      const step = () => {
        fs.push(sample() / n);
        render(true);
        if (++i < k) loop.raf(step);
      };
      step();
    }

    ctl.querySelector('#o1').onclick = () => prelever1();
    ctl.querySelector('#o20').onclick = () => prelever(20);
    ctl.querySelector('#rz').onclick = () => {
      fs = [];
      stopFill();
      render(false);
    };
    nb.querySelectorAll('[data-n]').forEach((b) => {
      b.onclick = () => {
        n = +b.dataset.n;
        fs = [];
        stopFill();
        nb.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        render(false);
        say.innerHTML = `Taille d'échantillon <b>n = ${n}</b>. Prélève plusieurs échantillons et regarde l'étendue.`;
      };
    });

    for (let i = 0; i < 12; i++) fs.push(sample() / n);
    render(false);
    if (!RM) {
      dotsG
        .selectAll('circle.mark')
        .attr('cy', AX)
        .transition('in')
        .duration(560)
        .delay((d, i) => i * 24)
        .ease(spring)
        .attr('cy', (d) => stack(fs)[d.i].cy);
    }

    cleanup = () => {
      loop.stop();
      stopFill();
      svg.selectAll('*').interrupt('in');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
