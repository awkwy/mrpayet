<script>
  import { onMount, onDestroy } from 'svelte';
  import { select } from 'd3-selection';
  import { drag } from 'd3-drag';
  import 'd3-transition';
  import { springEase, linScale } from './d3.js';
  import { nf } from '$lib/utils/stats-mv.js';

  /* « Combien coûte la réparation ? » : le prix d'une réparation (diagnostic
   * 15 € une fois + 30 € par heure) est une FONCTION du nombre d'heures.
   *
   * 1. Je place les points : cinq pastilles (0 h, 1 h, 2 h, 3 h, 4 h) sont posées
   *    sur l'axe des heures, au prix 0. L'élève les tire vers le haut jusqu'au
   *    bon prix (pas de 5 €) ; près de la bonne valeur la pastille s'aimante
   *    en ressort et s'allume. Quand les cinq sont posées, la droite se trace
   *    d'un trait (stroke-dashoffset) et la marche « + 30 € par heure » apparaît.
   * 2. Je lis le graphique : un curseur glisse sur la droite. Mode « image »
   *    (je donne les heures, je lis le prix) ou « antécédent » (je donne le
   *    prix, je lis les heures), avec les traits de lecture en pointillé.
   * 3. ★ L'autre garage (40 € par heure, sans diagnostic) : deuxième droite,
   *    point de croisement à 1,5 h = 60 €.
   *
   * Couleur : garage de Kahani (série) = --g ; autre garage = --blue (paire
   * série / accent validée, libellés directs au bout des droites) ; traits de
   * lecture = --dim pointillé. Pas de --warn / --red.
   * Accessibilité : pastilles et curseur = sliders au clavier ; tableau
   * repliable ; mouvement réduit respecté. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  const FIXE = vd?.fixe ?? 15;
  const HOUR = vd?.heure ?? 30;
  const OTHER = vd?.autre ?? 40; // € par heure, sans diagnostic
  const price = (h) => FIXE + HOUR * h;
  const HS = [0, 1, 2, 3, 4];

  onMount(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spring = springEase({ stiffness: 160, damping: 17, duration: 1.1 });
    const W = 360;
    const H = 300;
    const L = 36;
    const R = W - 14;
    const T = 16;
    const B = H - 36;
    const XM = 4.5;
    const YM = 150;
    const x = linScale([0, XM], [L, R]);
    const y = linScale([0, YM], [B, T]);

    host.style.position = 'relative';
    const placed = HS.map(() => false);
    const val = HS.map(() => 0);
    let allPlaced = false;
    let mode = 'image'; // image | ante
    let cursorH = 2.5;
    let showOther = false;

    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'group')
      .attr('aria-label', 'Graphique du prix de la réparation selon le nombre d’heures')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const grid = svg.append('g');
    for (let h = 0; h <= XM + 1e-9; h += 0.5) {
      grid.append('line').attr('x1', x(h)).attr('x2', x(h)).attr('y1', T).attr('y2', B).attr('stroke', Number.isInteger(h) ? 'var(--line2)' : 'var(--line)').attr('stroke-width', Number.isInteger(h) ? 0.9 : 0.5);
      if (Number.isInteger(h)) grid.append('text').attr('x', x(h)).attr('y', B + 14).attr('text-anchor', 'middle').attr('fill', 'var(--dim2)').attr('font-size', 10.5).attr('font-family', 'var(--sm)').text(h);
    }
    for (let p = 0; p <= YM; p += 15) {
      grid.append('line').attr('x1', L).attr('x2', R).attr('y1', y(p)).attr('y2', y(p)).attr('stroke', p % 30 === 0 ? 'var(--line2)' : 'var(--line)').attr('stroke-width', p % 30 === 0 ? 0.9 : 0.5);
      if (p % 30 === 0) grid.append('text').attr('x', L - 5).attr('y', y(p) + 3.5).attr('text-anchor', 'end').attr('fill', 'var(--dim2)').attr('font-size', 10.5).attr('font-family', 'var(--sm)').text(p);
    }
    grid.append('text').attr('x', R).attr('y', B + 29).attr('text-anchor', 'end').attr('fill', 'var(--dim2)').attr('font-size', 10).attr('font-family', 'var(--sm)').text('heures de travail');
    grid.append('text').attr('x', 6).attr('y', 10).attr('fill', 'var(--dim2)').attr('font-size', 10).attr('font-family', 'var(--sm)').text('prix (€)');

    // droite de l'autre garage (sous la droite de Kahani)
    const oLine = svg.append('line').attr('x1', x(0)).attr('y1', y(0)).attr('x2', x(XM)).attr('y2', y(OTHER * XM)).attr('stroke', 'var(--blue)').attr('stroke-width', 2.4).attr('stroke-linecap', 'round').attr('opacity', 0);
    const oLab = svg.append('text').attr('x', x(3.15)).attr('y', y(OTHER * 3.15) + 14).attr('fill', 'var(--blue)').attr('font-size', 10).attr('font-weight', 'bold').attr('font-family', 'var(--sm)').attr('opacity', 0).text(`autre garage : ${OTHER} € par heure`);
    const cross = svg.append('circle').attr('cx', x(1.5)).attr('cy', y(60)).attr('r', 6).attr('fill', 'none').attr('stroke', 'var(--tx)').attr('stroke-width', 2).attr('opacity', 0);
    const crossT = svg.append('text').attr('x', x(1.5) + 9).attr('y', y(60) + 16).attr('fill', 'var(--tx)').attr('font-size', 10).attr('font-family', 'var(--sm)').attr('opacity', 0).text('même prix : 1,5 h, 60 €');

    // droite de Kahani (tracée une fois les points posés)
    const kLine = svg.append('line').attr('x1', x(0)).attr('y1', y(price(0))).attr('x2', x(XM)).attr('y2', y(price(XM))).attr('stroke', 'var(--g)').attr('stroke-width', 2.8).attr('stroke-linecap', 'round');
    const kLen = Math.hypot(x(XM) - x(0), y(price(XM)) - y(price(0)));
    kLine.attr('stroke-dasharray', kLen).attr('stroke-dashoffset', kLen);
    const kLab = svg.append('text').attr('x', L + 8).attr('y', T + 14).attr('fill', 'var(--g)').attr('font-size', 10).attr('font-weight', 'bold').attr('font-family', 'var(--sm)').attr('opacity', 0).text(`garage de Kahani : ${FIXE} € + ${HOUR} € par heure`);
    // marche « + 30 € par heure »
    const stair = svg.append('g').attr('opacity', 0);
    stair.append('path').attr('d', `M${x(2)},${y(75)} H${x(3)} V${y(105)}`).attr('fill', 'none').attr('stroke', 'var(--dim)').attr('stroke-width', 1.6).attr('stroke-dasharray', '4 3');
    stair.append('text').attr('x', x(2.5)).attr('y', y(75) + 13).attr('text-anchor', 'middle').attr('fill', 'var(--dim)').attr('font-size', 10).attr('font-family', 'var(--sm)').text('+ 1 h');
    stair.append('text').attr('x', x(3) + 5).attr('y', y(90) + 4).attr('fill', 'var(--dim)').attr('font-size', 10).attr('font-family', 'var(--sm)').text(`+ ${HOUR} €`);

    // traits de lecture
    const gx = svg.append('line').attr('stroke', 'var(--dim)').attr('stroke-width', 1.6).attr('stroke-dasharray', '4 3').attr('opacity', 0);
    const gy = svg.append('line').attr('stroke', 'var(--dim)').attr('stroke-width', 1.6).attr('stroke-dasharray', '4 3').attr('opacity', 0);
    const cur = svg.append('g').attr('class', 'cur').attr('tabindex', 0).attr('role', 'slider').attr('aria-label', 'Curseur de lecture sur la droite').style('cursor', 'grab').style('outline', 'none').attr('opacity', 0);
    cur.append('circle').attr('r', 20).attr('fill', 'transparent');
    const curDot = cur.append('circle').attr('r', 7).attr('fill', 'var(--surf)').attr('stroke', 'var(--tx)').attr('stroke-width', 2.4);
    const lx = svg.append('text').attr('text-anchor', 'middle').attr('fill', 'var(--tx)').attr('font-size', 10.5).attr('font-weight', 'bold').attr('font-family', 'var(--sm)').attr('opacity', 0);
    const ly = svg.append('text').attr('text-anchor', 'end').attr('fill', 'var(--tx)').attr('font-size', 10.5).attr('font-weight', 'bold').attr('font-family', 'var(--sm)').attr('opacity', 0);

    // pastilles à placer
    const pins = HS.map((h, i) => {
      const g = svg
        .append('g')
        .attr('class', 'pin')
        .attr('tabindex', 0)
        .attr('role', 'slider')
        .attr('aria-orientation', 'vertical')
        .attr('aria-valuemin', 0)
        .attr('aria-valuemax', YM)
        .attr('aria-label', `Point pour ${h} heure${h > 1 ? 's' : ''}, prix en euros`)
        .style('cursor', 'grab')
        .style('outline', 'none');
      g.append('circle').attr('r', 20).attr('fill', 'transparent');
      const dot = g.append('circle').attr('r', 8.5).attr('fill', 'var(--surf)').attr('stroke', 'var(--g)').attr('stroke-width', 2.4);
      const lab = g.append('text').attr('x', i === 0 ? 12 : -12).attr('y', i === 0 ? 18 : -9).attr('text-anchor', i === 0 ? 'start' : 'end').attr('fill', 'var(--dim)').attr('font-size', 10).attr('font-family', 'var(--sm)').style('pointer-events', 'none');
      // flèche d'invite : « tire vers le haut »
      const arrow = g.append('text').attr('y', -14).attr('text-anchor', 'middle').attr('fill', 'var(--g)').attr('font-size', 13).style('pointer-events', 'none').text('↑');
      return { g, dot, lab, arrow };
    });

    const ctl = document.createElement('div');
    ctl.className = 'vctl';
    ctl.innerHTML =
      '<button class="gh" data-a="img">Image : heures → prix</button><button class="gh" data-a="ant">Antécédent : prix → heures</button><button class="gh" data-a="oth">★ Autre garage</button><button class="gh" data-a="help">Place les points pour moi</button><button class="gh" data-a="rz">Recommencer</button>';
    const say = document.createElement('div');
    say.className = 'say';
    say.setAttribute('aria-live', 'polite');
    const dv = document.createElement('div');
    dv.className = 'viz-data';
    dv.innerHTML = '<details><summary>Voir le tableau de valeurs</summary><table><thead><tr><th>Heures</th>' + HS.map((h) => `<th>${h} h</th>`).join('') + '</tr></thead><tbody><tr><th>Prix (€)</th>' + HS.map((h) => `<td>${price(h)}</td>`).join('') + '</tr></tbody></table></details>';
    host.append(ctl, say, dv);
    const btn = (a) => ctl.querySelector(`[data-a=${a}]`);

    function posPins(animate) {
      pins.forEach((p, i) => {
        const t = p.g;
        const tx = animate && !RM ? t.transition('mv').duration(700).ease(spring) : t.interrupt('mv');
        tx.attr('transform', `translate(${x(HS[i])},${y(val[i])})`);
        p.dot.attr('fill', placed[i] ? 'var(--g)' : 'var(--surf)');
        p.lab.text(placed[i] || val[i] > 0 ? `(${HS[i]} h ; ${val[i]} €)` : '');
        p.arrow.attr('opacity', placed[i] || val[i] > 0 ? 0 : 1);
        p.g.attr('aria-valuenow', val[i]);
      });
    }

    function updateCursor(animate) {
      const hh = Math.max(0, Math.min(XM, cursorH));
      const pp = price(hh);
      const T2 = (s) => (animate && !RM ? s.transition('c').duration(650).ease(spring) : s.interrupt('c'));
      T2(cur).attr('transform', `translate(${x(hh)},${y(pp)})`);
      T2(gx).attr('x1', x(hh)).attr('x2', x(hh)).attr('y1', y(pp)).attr('y2', B);
      T2(gy).attr('x1', L).attr('x2', x(hh)).attr('y1', y(pp)).attr('y2', y(pp));
      T2(lx).attr('x', x(hh)).attr('y', B - 5);
      T2(ly).attr('x', L + 38).attr('y', y(pp) - 5);
      lx.text(`${nf(+hh.toFixed(2))} h`);
      ly.text(`${nf(+pp.toFixed(1))} €`);
      cur.attr('aria-valuenow', +hh.toFixed(2)).attr('aria-valuetext', `${nf(+hh.toFixed(2))} heure, prix ${nf(+pp.toFixed(1))} euros`);
      const hStr = `${nf(+hh.toFixed(2))} h`;
      const pStr = `${nf(+pp.toFixed(1))} €`;
      say.innerHTML =
        mode === 'image'
          ? `Je pars de <b>${hStr}</b> sur l'axe des heures, je monte jusqu'à la droite, je lis <b>${pStr}</b>. <b>${pStr}</b> est l'<b>image</b> de ${hStr}.${hh === 0 ? ` Pour 0 h le prix n'est pas 0 € : il reste le diagnostic, ${FIXE} €.` : ''}`
          : `Je pars de <b>${pStr}</b> sur l'axe des prix, je vais jusqu'à la droite, je lis <b>${hStr}</b>. <b>${hStr}</b> est un <b>antécédent</b> de ${pStr}.`;
    }

    function enableReading() {
      allPlaced = true;
      const dur = RM ? 0 : 1100;
      kLine.transition('draw').duration(dur).ease(spring).attr('stroke-dashoffset', 0);
      kLab.transition().delay(dur * 0.6).duration(RM ? 0 : 400).attr('opacity', 1);
      stair.transition().delay(dur * 0.8).duration(RM ? 0 : 500).attr('opacity', 1);
      [gx, gy, cur, lx, ly].forEach((s) => s.transition().delay(dur * 0.9).duration(RM ? 0 : 400).attr('opacity', 1));
      updateCursor(false);
    }

    // glisser les pastilles (verticalement)
    pins.forEach((p, i) => {
      const setV = (raw) => {
        if (placed[i]) return;
        let v = Math.max(0, Math.min(YM, Math.round(raw / 5) * 5));
        if (Math.abs(v - price(HS[i])) <= 5 && Math.abs(raw - price(HS[i])) <= 7) {
          // aimantation sur la bonne valeur
          v = price(HS[i]);
          val[i] = v;
          placed[i] = true;
          posPins(true);
          p.dot.transition().duration(RM ? 0 : 200).attr('r', 13).transition().duration(RM ? 0 : 400).ease(spring).attr('r', 8.5);
          const n = placed.filter(Boolean).length;
          say.textContent = n === 5 ? '' : `${n} point${n > 1 ? 's' : ''} sur 5 bien placé${n > 1 ? 's' : ''}.`;
          if (n === 5) enableReading();
          return;
        }
        val[i] = v;
        posPins(false);
        say.textContent = `Point de ${HS[i]} h : tu le tires à ${v} €. Calcule : ${FIXE} + ${HS[i]} × ${HOUR} = ?`;
      };
      p.g.call(
        drag()
          .subject((ev) => ({ x: ev.x, y: ev.y }))
          .on('start', function () {
            select(this).style('cursor', 'grabbing');
          })
          .on('drag', (ev) => setV(y.invert(ev.y)))
          .on('end', function () {
            select(this).style('cursor', 'grab');
          })
      );
      p.g.on('keydown', (ev) => {
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowRight') (ev.preventDefault(), setV(val[i] + (ev.shiftKey ? 15 : 5)));
        else if (ev.key === 'ArrowDown' || ev.key === 'ArrowLeft') (ev.preventDefault(), setV(val[i] - (ev.shiftKey ? 15 : 5)));
      });
    });

    // glisser le curseur le long de la droite
    cur.call(
      drag()
        .subject((ev) => ({ x: ev.x, y: ev.y }))
        .on('start', function () {
          select(this).style('cursor', 'grabbing');
          curDot.transition().duration(RM ? 0 : 150).attr('r', 10);
        })
        .on('drag', (ev) => {
          const raw = mode === 'image' ? x.invert(ev.x) : (y.invert(ev.y) - FIXE) / HOUR;
          cursorH = Math.max(0, Math.min(XM, Math.round(raw * 20) / 20));
          updateCursor(false);
        })
        .on('end', function () {
          select(this).style('cursor', 'grab');
          curDot.transition().duration(RM ? 0 : 350).ease(spring).attr('r', 7);
        })
    );
    cur.on('keydown', (ev) => {
      const d = ev.key === 'ArrowRight' || ev.key === 'ArrowUp' ? 1 : ev.key === 'ArrowLeft' || ev.key === 'ArrowDown' ? -1 : 0;
      if (!d) return;
      ev.preventDefault();
      cursorH = Math.max(0, Math.min(XM, Math.round((cursorH + d * (ev.shiftKey ? 0.5 : 0.05)) * 20) / 20));
      updateCursor(false);
    });

    const setMode = (m) => {
      mode = m;
      btn('img').classList.toggle('on', m === 'image');
      btn('ant').classList.toggle('on', m === 'ante');
      if (allPlaced) updateCursor(true);
    };
    btn('img').onclick = () => {
      if (!allPlaced) return void (say.textContent = "Place d'abord les 5 points : la droite apparaîtra, puis tu pourras lire le graphique.");
      setMode('image');
    };
    btn('ant').onclick = () => {
      if (!allPlaced) return void (say.textContent = "Place d'abord les 5 points : la droite apparaîtra, puis tu pourras lire le graphique.");
      setMode('ante');
    };
    btn('oth').onclick = () => {
      showOther = !showOther;
      btn('oth').classList.toggle('on', showOther);
      [oLine, oLab, cross, crossT].forEach((s) => s.transition().duration(RM ? 0 : 500).attr('opacity', showOther ? 1 : 0));
      if (showOther) say.innerHTML = `Autre garage : ${OTHER} € par heure, sans diagnostic. Pour 1 h il est moins cher (${OTHER} € contre ${price(1)} €), mais à partir de <b>1,5 h</b> (60 € dans les deux garages) le garage de Kahani est moins cher : le garage de Kahani n'est pas « toujours » moins cher.`;
    };
    btn('help').onclick = () => {
      HS.forEach((h, i) => {
        val[i] = price(h);
        placed[i] = true;
      });
      posPins(true);
      if (!allPlaced) enableReading();
    };
    btn('rz').onclick = () => {
      HS.forEach((h, i) => {
        val[i] = 0;
        placed[i] = false;
      });
      allPlaced = false;
      kLine.interrupt('draw').attr('stroke-dashoffset', kLen);
      [kLab, stair, gx, gy, cur, lx, ly].forEach((s) => s.interrupt().attr('opacity', 0));
      posPins(true);
      say.textContent = 'Les cinq points sont revenus sur l’axe. Calcule les prix du tableau et tire chaque point à sa hauteur.';
    };

    say.textContent = 'Tire chaque point vers le haut jusqu’au bon prix : 15 € de diagnostic + 30 € par heure.';
    posPins(false);
    if (!RM) {
      pins.forEach((p, i) => p.g.attr('transform', `translate(${x(HS[i])},${y(0) + 24})`).transition('mv').delay(i * 70).duration(700).ease(spring).attr('transform', `translate(${x(HS[i])},${y(0)})`));
    }
    btn('img').classList.add('on');

    cleanup = () => {
      svg.selectAll('*').interrupt();
      select(host).selectAll('*').remove();
    };
  });
  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
