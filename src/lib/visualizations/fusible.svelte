<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr, createLoop } from './shared.js';
  import { linScale, spring, select } from './d3.js';

  /* Fiche « pourquoi ce fusible a-t-il fondu ? » (séance 1, sécurité
   * électrique) — refonte canvas → D3/SVG avec un vrai schéma normalisé, dans
   * la lignée de `alternatif`.
   *
   * 1. Forme  : un schéma de circuit propre — pile 12 V (gauche), FUSIBLE juste
   *    après, puis cinq consommateurs en parallèle (lampes ⊗), sur une grille
   *    alignée. En dessous, une jauge d'intensité : la comparaison I vs calibre
   *    est un SEUIL (même langage visuel que `budget` : barre + repère --blue).
   * 2. Couleur : les fils sous tension = teinte unique `--g`. Le filament du
   *    fusible chauffe `--g` → `--warn` → `--red` selon le rapport I / calibre,
   *    puis ROMPT en surintensité (jeton d'état légitime : « fondu » est un
   *    vrai statut, doublé du mot FONDU et de la coupure visible du circuit).
   *    Le calibre est un repère : accent neutre `--blue`.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#e2725b"
   *    --mode dark --surface "#0f1512" → séparation CVD ΔE 19,2 (deutan) : PASS
   *    (même note « lightness band » que les autres fiches).
   * 4. Marques : fils 2,6 u bouts arrondis, symboles filet 2 u, lampe ⊗,
   *    fusible = rectangle traversé par son filament. Jauge : barre 4 u,
   *    repère pointillé 1,4 u.
   * 5. Interaction : boutons consommateurs + boutons calibre. Pas d'infobulle
   *    (tout est déjà étiqueté).
   * 6. Accessibilité : role="img" + aria-label, vue tableau repliable,
   *    prefers-reduced-motion (révélation + fusion coupées → état direct),
   *    thème sombre.
   *
   * Contraintes captain : D3/SVG, imports modulaires, mouvement amorti, poids
   * léger, parité d'échelle (VB_W = 620). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};
  const loop = createLoop();

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const U = 12;
    const CONS = [
      ['Feux de croisement', 110, 'Feux'],
      ['Autoradio', 40, 'Radio'],
      ['Ventilateur habitacle', 120, 'Ventil.'],
      ['Lunette dégivrante', 180, 'Dégiv.'],
      ['Essuie-glace', 60, 'Essuie']
    ];
    const CALS = [5, 10, 15, 20, 30];
    let on = [true, false, false, false, false];
    let cal = 10;
    let melted = false;

    const W = 620;
    const H = 300;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // ---- géométrie du circuit ----
    const XL = 84; // rail gauche (pile)
    const XR = 556; // rail droit
    const YT = 40; // rail haut (+12 V, après le fusible)
    const YB = 184; // rail bas (masse)
    const FUSE = [162, YT]; // fusible juste après la pile
    const FW = 52;
    const FH = 20;
    const SRC = [XL, (YT + YB) / 2];
    const consX = CONS.map((_, i) => 214 + i * 80); // 214..534, après le fusible
    const lampY = (YT + YB) / 2;

    // segments de fil : [x1,y1,x2,y2, testEnergized()]
    const railTopL = [XL, YT, FUSE[0] - FW / 2, YT]; // pile -> fusible
    const railTopR = [FUSE[0] + FW / 2, YT, XR, YT]; // fusible -> rail
    const railBot = [XL, YB, XR, YB];
    const railLeft = [XL, YT, XL, YB];
    const railRight = [XR, YT, XR, YB];

    const circuitG = svg.append('g').attr('class', 'circuit');

    // fils de fond (toujours visibles, discrets)
    const bg = circuitG.append('g').attr('class', 'bg');
    const seg = (a) =>
      bg
        .append('line')
        .attr('x1', a[0])
        .attr('y1', a[1])
        .attr('x2', a[2])
        .attr('y2', a[3])
        .attr('stroke', 'var(--line2)')
        .attr('stroke-width', 2.6)
        .attr('stroke-linecap', 'round');
    [railTopL, railTopR, railBot, railLeft, railRight].forEach(seg);
    consX.forEach((x) => seg([x, YT, x, YB]));

    // fils sous tension (par-dessus, colorés selon l'état)
    const live = circuitG.append('g').attr('class', 'live');
    const liveSeg = (a) =>
      live
        .append('line')
        .attr('x1', a[0])
        .attr('y1', a[1])
        .attr('x2', a[2])
        .attr('y2', a[3])
        .attr('stroke', 'var(--g)')
        .attr('stroke-width', 2.6)
        .attr('stroke-linecap', 'round')
        .attr('opacity', 0);
    const wTopL = liveSeg(railTopL);
    const wTopR = liveSeg(railTopR);
    const wBot = liveSeg(railBot);
    const wLeft = liveSeg(railLeft);
    const wRight = liveSeg(railRight);
    const wCons = consX.map((x) => liveSeg([x, YT, x, YB]));

    // paquets de courant sur les rails (densité ∝ intensité)
    const flowTop = live
      .append('line')
      .attr('x1', FUSE[0] + FW / 2)
      .attr('y1', YT)
      .attr('x2', XR)
      .attr('y2', YT)
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 3.4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .attr('stroke-dasharray', '3 21');
    const flowBot = live
      .append('line')
      .attr('x1', XL)
      .attr('y1', YB)
      .attr('x2', XR)
      .attr('y2', YB)
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 3.4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .attr('stroke-dasharray', '3 21');

    // masque le fil sous les symboles
    const gaps = circuitG.append('g').attr('class', 'gaps');
    [
      [SRC[0] - 6, SRC[1] - 16, 12, 32],
      [FUSE[0] - FW / 2 - 2, YT - FH / 2 - 2, FW + 4, FH + 4]
    ].forEach(([x, y, w, h]) => gaps.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', 'var(--surf)'));
    consX.forEach((x) => gaps.append('rect').attr('x', x - 12).attr('y', lampY - 12).attr('width', 24).attr('height', 24).attr('fill', 'var(--surf)'));

    // ---- pile 12 V ----
    const srcG = svg.append('g').attr('class', 'src').attr('transform', `translate(${SRC[0]},${SRC[1]})`);
    srcG.append('line').attr('x1', 0).attr('y1', -13).attr('x2', 0).attr('y2', 13).attr('stroke', 'var(--tx)').attr('stroke-width', 2.5);
    srcG.append('line').attr('x1', -7).attr('y1', -8).attr('x2', -7).attr('y2', 8).attr('stroke', 'var(--tx)').attr('stroke-width', 5);
    srcG.append('text').attr('x', 14).attr('y', 4).attr('text-anchor', 'start').attr('font-family', SM).attr('font-size', 10.5).attr('font-weight', 'bold').attr('fill', 'var(--tx)').text('12 V');

    // ---- fusible ----
    const fuG = svg.append('g').attr('class', 'fuse').attr('transform', `translate(${FUSE[0]},${FUSE[1]})`);
    fuG.append('rect').attr('x', -FW / 2).attr('y', -FH / 2).attr('width', FW).attr('height', FH).attr('rx', 3).attr('fill', 'rgba(0,0,0,0.3)').attr('stroke', 'var(--dim)').attr('stroke-width', 1.6);
    const fuElt1 = fuG
      .append('path')
      .attr('d', `M ${-FW / 2 + 6} 0 L -4 0`)
      .attr('fill', 'none')
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round');
    const fuElt2 = fuG
      .append('path')
      .attr('d', `M 4 0 L ${FW / 2 - 6} 0`)
      .attr('fill', 'none')
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round');
    const fuBridge = fuG
      .append('path')
      .attr('d', 'M -4 0 L 4 0')
      .attr('fill', 'none')
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round');
    const fuArc1 = fuG.append('path').attr('d', 'M -4 0 Q -1 -5 2 -1').attr('fill', 'none').attr('stroke', 'var(--red)').attr('stroke-width', 2).attr('stroke-linecap', 'round').attr('opacity', 0);
    const fuArc2 = fuG.append('path').attr('d', 'M 4 0 Q 1 5 -2 1').attr('fill', 'none').attr('stroke', 'var(--red)').attr('stroke-width', 2).attr('stroke-linecap', 'round').attr('opacity', 0);
    const fuFlash = fuG.append('circle').attr('r', 4).attr('fill', 'var(--warn)').attr('opacity', 0);
    const fuLabel = fuG
      .append('text')
      .attr('x', 0)
      .attr('y', FH / 2 + 15)
      .attr('text-anchor', 'middle')
      .attr('font-family', SM)
      .attr('font-size', 11)
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--red)')
      .attr('opacity', 0)
      .text('FONDU');
    fuG.append('text').attr('x', 0).attr('y', -FH / 2 - 7).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 9).attr('fill', 'var(--dim2)').text('fusible');

    // ---- lampes (consommateurs) ----
    const lamps = consX.map((x, i) => {
      const g = svg.append('g').attr('class', 'lampe').attr('transform', `translate(${x},${lampY})`);
      const glow = g.append('circle').attr('r', 18).attr('fill', 'var(--g)').attr('opacity', 0);
      const c = g.append('circle').attr('r', 10).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      g.append('line').attr('x1', -7).attr('y1', -7).attr('x2', 7).attr('y2', 7).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
      g.append('line').attr('x1', -7).attr('y1', 7).attr('x2', 7).attr('y2', -7).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
      g.append('text')
        .attr('x', 0)
        .attr('y', YB - lampY + 13)
        .attr('text-anchor', 'middle')
        .attr('font-family', SM)
        .attr('font-size', 9.5)
        .attr('fill', 'var(--dim)')
        .text(CONS[i][2]);
      return { glow, c };
    });

    // ---- jauge d'intensité ----
    const GL = XL;
    const GR = XR;
    const GY = 250;
    const GH = 15;
    const gaugeG = svg.append('g').attr('class', 'gauge');
    gaugeG.append('line').attr('x1', XL).attr('x2', XR).attr('y1', 214).attr('y2', 214).attr('stroke', 'var(--line)').attr('stroke-width', 1);
    gaugeG.append('text').attr('x', GL).attr('y', GY - 12).attr('font-family', SM).attr('font-size', 10).attr('fill', 'var(--dim2)').text("L'INTENSITÉ DANS LE CIRCUIT");
    gaugeG.append('rect').attr('x', GL).attr('y', GY).attr('width', GR - GL).attr('height', GH).attr('rx', 4).attr('fill', 'rgba(0,0,0,0.22)').attr('stroke', 'var(--line2)').attr('stroke-width', 1);
    const gaugeBar = gaugeG.append('rect').attr('x', GL).attr('y', GY).attr('height', GH).attr('rx', 4).attr('width', 0).attr('fill', 'var(--g)');
    const calLine = gaugeG.append('line').attr('y1', GY - 6).attr('y2', GY + GH + 6).attr('stroke', 'var(--blue)').attr('stroke-dasharray', '5 4').attr('stroke-width', 1.4);
    const calTxt = gaugeG.append('text').attr('y', GY + GH + 18).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 10).attr('font-weight', 'bold').attr('fill', 'var(--blue)');
    const iTxt = gaugeG.append('text').attr('y', GY - 12).attr('text-anchor', 'end').attr('x', GR).attr('font-family', SM).attr('font-size', 10.5).attr('font-weight', 'bold');

    // ---- contrôles ----
    const btnCons = box(
      host,
      'vctl',
      CONS.map((c, i) => `<button data-c="${i}"${on[i] ? ' class="on"' : ''}>${c[0]}</button>`).join('')
    );
    const btnCal = box(
      host,
      'vctl',
      CALS.map((v) => `<button data-k="${v}"${v === cal ? ' class="on"' : ''}>${v} A</button>`).join('')
    );

    readout(host, [
      { id: 'vP', k: 'puissance totale', c: 'd' },
      { id: 'vI', k: 'intensité I = P ÷ U', c: 'd' },
      { id: 'vC', k: 'calibre', c: 'b' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="fCap"></caption>` +
        `<thead><tr><th>Consommateur</th><th>Puissance</th><th>État</th></tr></thead>` +
        `<tbody id="fBody"></tbody></table></details>`
    );
    const fBody = dataView.querySelector('#fBody');
    const fCap = dataView.querySelector('#fCap');

    // ---------- calculs ----------
    const totalP = () => CONS.reduce((s, c, i) => s + (on[i] ? c[1] : 0), 0);

    // ---------- rendu ----------
    function heatColour(ratio) {
      if (ratio >= 1) return 'var(--red)';
      if (ratio >= 0.85) return 'var(--warn)';
      return 'var(--g)';
    }

    function applyFuse(animate, ratio) {
      const an = animate && !RM;
      const col = heatColour(ratio);
      [fuElt1, fuElt2].forEach((e) => (an ? e.transition('f').duration(240) : e.interrupt('f')).attr('stroke', col));

      if (melted) {
        (an ? fuBridge.transition('f').duration(160) : fuBridge.interrupt('f')).attr('opacity', 0);
        (an ? fuArc1.transition('f').delay(120).duration(180) : fuArc1.interrupt('f')).attr('opacity', 1);
        (an ? fuArc2.transition('f').delay(120).duration(180) : fuArc2.interrupt('f')).attr('opacity', 1);
        (an ? fuLabel.transition('f').delay(160).duration(200) : fuLabel.interrupt('f')).attr('opacity', 1);
        if (an) {
          fuFlash.interrupt('f').attr('r', 4).attr('opacity', 0.95);
          fuFlash.transition('f').duration(360).attr('r', 16).attr('opacity', 0);
        }
      } else {
        (an ? fuBridge.transition('f').duration(200) : fuBridge.interrupt('f')).attr('opacity', 1).attr('stroke', col);
        fuArc1.interrupt('f').attr('opacity', 0);
        fuArc2.interrupt('f').attr('opacity', 0);
        fuLabel.interrupt('f').attr('opacity', 0);
        fuFlash.interrupt('f').attr('opacity', 0);
      }
    }

    function applyWires(animate) {
      const an = animate && !RM;
      const powered = !melted;
      const dur = an ? 260 : 0;
      // rails toujours parcourus si le circuit est fermé et au moins une lampe est on
      const anyOn = on.some(Boolean) && powered;
      [wLeft, wTopL].forEach((w) => (an ? w.transition('w').duration(dur) : w.interrupt('w')).attr('opacity', anyOn ? 1 : 0));
      // rail haut/bas côté charges + rail droit : parcourus jusqu'à la dernière lampe active
      [wTopR, wBot, wRight].forEach((w) => (an ? w.transition('w').duration(dur) : w.interrupt('w')).attr('opacity', anyOn ? 1 : 0));
      wCons.forEach((w, i) => (an ? w.transition('w').duration(dur) : w.interrupt('w')).attr('opacity', on[i] && powered ? 1 : 0));
      lamps.forEach((L, i) => {
        const lit = on[i] && powered;
        (an ? L.c.transition('w').duration(dur) : L.c.interrupt('w')).attr('fill', lit ? 'var(--g)' : 'var(--surf3)');
        (an ? L.glow.transition('w').duration(dur) : L.glow.interrupt('w')).attr('opacity', lit ? 0.22 : 0);
      });
      const showFlow = anyOn && !RM;
      flowTop.attr('opacity', showFlow ? 0.9 : 0);
      flowBot.attr('opacity', showFlow ? 0.9 : 0);
    }

    function applyGauge(animate, I, ratio) {
      const an = animate && !RM;
      const gmax = Math.max(cal * 1.35, I * 1.1, 6);
      const xG = linScale([0, gmax], [GL, GR]);
      const col = heatColour(ratio);
      (an ? gaugeBar.transition('g').duration(420).ease(spring) : gaugeBar.interrupt('g'))
        .attr('width', Math.max(0, xG(I) - GL))
        .attr('fill', col);
      const cx = xG(cal);
      (an ? calLine.transition('g').duration(420) : calLine.interrupt('g')).attr('x1', cx).attr('x2', cx);
      calTxt.attr('x', Math.min(GR - 30, Math.max(GL + 30, cx))).text(`calibre ${cal} A`);
      iTxt.attr('fill', col).text(`I = ${fr(I.toFixed(1))} A`);
    }

    let animRatio = 0;
    function render(animate) {
      const P = totalP();
      const I = P / U;
      const ratio = cal ? I / cal : 0;
      melted = ratio > 1;

      applyFuse(animate, ratio);
      applyWires(animate);
      applyGauge(animate, I, ratio);

      host.querySelector('#vP').textContent = `${P} W`;
      const iel = host.querySelector('#vI');
      iel.textContent = `${fr(I.toFixed(1))} A`;
      iel.className = 'v ' + (ratio >= 1 ? 'r' : ratio >= 0.85 ? 'w' : 'd');
      host.querySelector('#vC').textContent = `${cal} A`;

      say.innerHTML = melted
        ? `<b>Le fusible a fondu.</b> ${fr(I.toFixed(1))} A dépassent le calibre de ${cal} A : le circuit s'ouvre et protège le faisceau.`
        : ratio >= 0.85
          ? `P = ${P} W sous ${U} V, donc I = ${P} ÷ ${U} = <b>${fr(I.toFixed(1))} A</b>. On est tout près du calibre de ${cal} A.`
          : `P = ${P} W sous ${U} V, donc I = ${P} ÷ ${U} = <b>${fr(I.toFixed(1))} A</b>. Le calibre de ${cal} A tient.`;

      svg.attr(
        'aria-label',
        `Circuit 12 volts protégé par un fusible de ${cal} ampères. ` +
          `Consommateurs actifs : ${CONS.filter((_, i) => on[i]).map((c) => c[0]).join(', ') || 'aucun'}. ` +
          `Intensité ${fr(I.toFixed(1))} ampères. Fusible ${melted ? 'fondu, circuit ouvert' : 'intact'}.`
      );

      fCap.textContent = `Puissance ${P} W · I = ${fr(I.toFixed(1))} A · calibre ${cal} A`;
      fBody.replaceChildren(
        ...CONS.map(([nm, p], i) => rowTr(nm, `${fr(p)} W`, on[i] ? 'allumé' : '—')),
        rowTr('Total allumé', `${fr(P)} W`, `${fr(I.toFixed(1))} A`),
        rowTr('Fusible', `${cal} A`, melted ? 'fondu' : 'intact')
      );

      void animRatio;
      animRatio = ratio;
    }

    function rowTr(a, b, c) {
      const tr = document.createElement('tr');
      [a, b, c].forEach((t) => {
        const td = document.createElement('td');
        td.textContent = t;
        tr.append(td);
      });
      return tr;
    }

    // paquets de courant (vitesse ∝ intensité)
    function tick() {
      const P = totalP();
      const I = P / U;
      if (I > 0 && !melted && !RM) {
        const off = (performance.now() / (60 / Math.min(4, I / 3 + 0.6))) % 24;
        flowTop.attr('stroke-dashoffset', -off);
        flowBot.attr('stroke-dashoffset', off);
      }
      loop.raf(tick);
    }

    // ---- interactions ----
    btnCons.querySelectorAll('[data-c]').forEach((b) => {
      b.onclick = () => {
        const i = +b.dataset.c;
        on[i] = !on[i];
        b.classList.toggle('on', on[i]);
        render(true);
      };
    });
    btnCal.querySelectorAll('[data-k]').forEach((b) => {
      b.onclick = () => {
        cal = +b.dataset.k;
        btnCal.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        render(true);
      };
    });

    render(false);
    // révélation : les fils sous tension apparaissent
    if (!RM) {
      live.selectAll('line').attr('opacity', 0);
      render(true);
    }
    tick();

    cleanup = () => {
      loop.stop();
      svg.selectAll('*').interrupt('f').interrupt('w').interrupt('g');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
