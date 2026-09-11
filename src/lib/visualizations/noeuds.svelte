<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr, createLoop } from './shared.js';
  import { select } from './d3.js';

  /* Fiche « coupe une branche et lis les ampèremètres » (séance 2, sécurité
   * électrique) — refonte canvas → D3/SVG avec un vrai schéma normalisé, dans
   * la lignée de `fusible` et `alternatif`.
   *
   * 1. Forme  : un schéma de circuit propre — pile, un AMPÈREMÈTRE d'entrée,
   *    un nœud qui alimente deux branches en parallèle, chacune avec SON
   *    PROPRE ampèremètre et sa lampe ⊗, sur une grille alignée. La loi des
   *    nœuds (I_entrée = I_gauche + I_droite) se lit directement sur les
   *    trois appareils, sans rien démonter.
   * 2. Couleur : les fils sous tension = teinte unique `--g`. Une lampe
   *    grillée = jeton d'état légitime `--red` (statut binaire, doublé du
   *    filament rompu et du mot dans le message), jamais une série. Le nœud
   *    est un simple repère graphique : point plein `--tx`, pas un statut.
   * 3. Validation : reprise du couple `--g`/`--red` déjà validé pour
   *    `alternatif`/`fusible` (CVD ΔE ≥ 19 deutan), pas de nouvelle couleur.
   * 4. Marques : fils 2,6 u bouts arrondis, ampèremètre = rond + « A »,
   *    lampe ⊗ ; nœud = point plein + libellé.
   * 5. Interaction : deux boutons « griller » (gauche/droite) + un bouton
   *    « tout réparer ». Pas d'infobulle, les valeurs sont déjà sur le
   *    schéma et dans les relevés.
   * 6. Accessibilité : role="img" + aria-label, vue tableau repliable,
   *    prefers-reduced-motion (flux de courant coupé), thème sombre.
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

    const IB = 4.6; // intensité de base par lampe (A)
    let broken = [false, false]; // [gauche, droite]

    const W = 620;
    const H = 300;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // ---- géométrie ----
    const XL = 84; // rail gauche (pile)
    const BR = [250, 430]; // x des deux branches (gauche = nœud, droite = bord)
    const YT = 64;
    const YB = 244;
    const SRC = [XL, (YT + YB) / 2];
    const lampY = 190;
    const ammY = 112;

    const circuitG = svg.append('g').attr('class', 'circuit');

    // fils de fond
    const bg = circuitG.append('g');
    const seg = (a) =>
      bg
        .append('line')
        .attr('x1', a[0]).attr('y1', a[1]).attr('x2', a[2]).attr('y2', a[3])
        .attr('stroke', 'var(--line2)').attr('stroke-width', 2.6).attr('stroke-linecap', 'round');
    seg([XL, YT, BR[0], YT]); // rail haut, pile -> nœud
    seg([BR[0], YT, BR[1], YT]); // rail haut, nœud -> branche droite
    seg([XL, YB, BR[1], YB]); // rail bas complet
    seg([XL, YT, XL, YB]); // rail gauche (pile)
    seg([BR[0], YT, BR[0], YB]); // branche gauche
    seg([BR[1], YT, BR[1], YB]); // branche droite

    // fils sous tension
    const live = circuitG.append('g');
    const liveSeg = (a) =>
      live
        .append('line')
        .attr('x1', a[0]).attr('y1', a[1]).attr('x2', a[2]).attr('y2', a[3])
        .attr('stroke', 'var(--g)').attr('stroke-width', 2.6).attr('stroke-linecap', 'round').attr('opacity', 0);
    const wEntree = liveSeg([XL, YT, BR[0], YT]);
    const wRailHaut2 = liveSeg([BR[0], YT, BR[1], YT]);
    const wRailBas = liveSeg([XL, YB, BR[1], YB]);
    const wSrcUp = liveSeg([XL, YT, XL, YB]);
    const wBranch = [liveSeg([BR[0], YT, BR[0], YB]), liveSeg([BR[1], YT, BR[1], YB])];

    // paquets de courant (densité ∝ intensité)
    const flowEntree = live
      .append('line')
      .attr('x1', XL).attr('y1', YT).attr('x2', BR[0]).attr('y2', YT)
      .attr('stroke', 'var(--g)').attr('stroke-width', 3.2).attr('stroke-linecap', 'round')
      .attr('opacity', 0).attr('stroke-dasharray', '3 20');
    const flowBranch = BR.map((x) =>
      live
        .append('line')
        .attr('x1', x).attr('y1', YT).attr('x2', x).attr('y2', YB)
        .attr('stroke', 'var(--g)').attr('stroke-width', 3.2).attr('stroke-linecap', 'round')
        .attr('opacity', 0).attr('stroke-dasharray', '3 20')
    );

    // masque le fil sous les symboles
    const gaps = circuitG.append('g');
    const maskRect = (x, y, w, h) => gaps.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', 'var(--surf)');
    maskRect(SRC[0] - 6, SRC[1] - 16, 12, 32);
    BR.forEach((x) => {
      maskRect(x - 14, ammY - 14, 28, 28);
      maskRect(x - 12, lampY - 12, 24, 24);
    });

    // ---- pile ----
    const srcG = svg.append('g').attr('transform', `translate(${SRC[0]},${SRC[1]})`);
    srcG.append('line').attr('x1', 0).attr('y1', -13).attr('x2', 0).attr('y2', 13).attr('stroke', 'var(--tx)').attr('stroke-width', 2.5);
    srcG.append('line').attr('x1', -7).attr('y1', -8).attr('x2', -7).attr('y2', 8).attr('stroke', 'var(--tx)').attr('stroke-width', 5);
    srcG.append('text').attr('x', 14).attr('y', 4).attr('font-family', SM).attr('font-size', 10.5).attr('font-weight', 'bold').attr('fill', 'var(--tx)').text('pile');

    // ---- nœud ----
    svg.append('circle').attr('cx', BR[0]).attr('cy', YT).attr('r', 4).attr('fill', 'var(--tx)');
    svg.append('text').attr('x', BR[0]).attr('y', YT - 12).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 11).attr('font-weight', 'bold').attr('fill', 'var(--tx)').text('nœud');

    // ---- ampèremètre d'entrée ----
    const ammEntree = svg.append('g').attr('transform', `translate(${(XL + BR[0]) / 2},${YT})`);
    ammEntree.append('circle').attr('r', 16).attr('fill', 'var(--surf)').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
    ammEntree.append('text').attr('y', 5).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 13).attr('font-weight', 'bold').attr('fill', 'var(--tx)').text('A');
    const txtEntree = svg.append('text').attr('x', (XL + BR[0]) / 2).attr('y', YT - 24).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 11).attr('font-weight', 'bold').attr('fill', 'var(--g)');

    // ---- ampèremètres + lampes des deux branches ----
    function buildBranch(x) {
      const ammG = svg.append('g').attr('transform', `translate(${x},${ammY})`);
      ammG.append('circle').attr('r', 15).attr('fill', 'var(--surf)').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
      ammG.append('text').attr('y', 5).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 12.5).attr('font-weight', 'bold').attr('fill', 'var(--tx)').text('A');
      const ammTxt = svg.append('text').attr('x', x + 26).attr('y', ammY + 4).attr('font-family', SM).attr('font-size', 11).attr('font-weight', 'bold').attr('fill', 'var(--g)');

      const lampG = svg.append('g').attr('transform', `translate(${x},${lampY})`);
      const glow = lampG.append('circle').attr('r', 18).attr('fill', 'var(--g)').attr('opacity', 0);
      const circle = lampG.append('circle').attr('r', 11).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      const x1 = lampG.append('line').attr('x1', -7.5).attr('y1', -7.5).attr('x2', 7.5).attr('y2', 7.5).attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      const x2 = lampG.append('line').attr('x1', -7.5).attr('y1', 7.5).attr('x2', 7.5).attr('y2', -7.5).attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      const brk = lampG
        .append('path')
        .attr('d', 'M -8 -2 L -3 3 L -1 -3 M 1 3 L 3 -3 L 8 2')
        .attr('fill', 'none').attr('stroke', 'var(--red)').attr('stroke-width', 2).attr('stroke-linecap', 'round').attr('opacity', 0);

      return { ammTxt, glow, circle, x1, x2, brk };
    }
    const branches = BR.map(buildBranch);

    // ---- contrôles ----
    const ctl = box(
      host,
      'vctl',
      `<button data-b="0">Griller la lampe gauche</button><button data-b="1">Griller la lampe droite</button><button class="gh" id="rz">Tout réparer</button>`
    );

    readout(host, [
      { id: 'nE', k: 'entrée', c: 'd' },
      { id: 'nG', k: 'branche gauche', c: 'd' },
      { id: 'nD', k: 'branche droite', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption>Loi des nœuds : I entrée = I gauche + I droite</caption>` +
        `<thead><tr><th>Point de mesure</th><th>Intensité</th></tr></thead>` +
        `<tbody id="nBody"></tbody></table></details>`
    );
    const nBody = dataView.querySelector('#nBody');

    // ---------- rendu ----------
    function applyBranch(i, animate) {
      const an = animate && !RM;
      const b = branches[i];
      const on = !broken[i];
      const wc = 'var(--g)';
      (an ? wBranch[i].transition('w').duration(240) : wBranch[i].interrupt('w')).attr('opacity', on ? 1 : 0);
      (an ? b.circle.transition('l').duration(240) : b.circle.interrupt('l')).attr('fill', on ? wc : 'var(--bg)').attr('stroke', on ? 'var(--tx)' : 'var(--red)');
      (an ? b.glow.transition('l').duration(240) : b.glow.interrupt('l')).attr('opacity', on ? 0.22 : 0);
      (an ? b.x1.transition('l').duration(200) : b.x1.interrupt('l')).attr('opacity', on ? 1 : 0);
      (an ? b.x2.transition('l').duration(200) : b.x2.interrupt('l')).attr('opacity', on ? 1 : 0);
      (an ? b.brk.transition('l').duration(200) : b.brk.interrupt('l')).attr('opacity', on ? 0 : 1);
      b.ammTxt.attr('fill', on ? 'var(--g)' : 'var(--dim2)').text(`${fr((on ? IB : 0).toFixed(1))} A`);
    }

    function render(animate) {
      const an = animate && !RM;
      const Ig = broken[0] ? 0 : IB;
      const Id = broken[1] ? 0 : IB;
      const Ie = Ig + Id;
      const anyOn = Ie > 0;

      [wEntree, wRailHaut2, wRailBas, wSrcUp].forEach((w) => (an ? w.transition('w').duration(240) : w.interrupt('w')).attr('opacity', anyOn ? 1 : 0));
      applyBranch(0, animate);
      applyBranch(1, animate);
      txtEntree.text(`${fr(Ie.toFixed(1))} A`);

      flowEntree.attr('opacity', anyOn && !RM ? 0.9 : 0);
      flowBranch[0].attr('opacity', !broken[0] && !RM ? 0.9 : 0);
      flowBranch[1].attr('opacity', !broken[1] && !RM ? 0.9 : 0);

      host.querySelector('#nE').textContent = `${fr(Ie.toFixed(1))} A`;
      host.querySelector('#nG').textContent = `${fr(Ig.toFixed(1))} A`;
      host.querySelector('#nD').textContent = `${fr(Id.toFixed(1))} A`;

      say.innerHTML =
        `À l'entrée : <b>${fr(Ie.toFixed(1))} A</b>. En sortie : ${fr(Ig.toFixed(1))} + ${fr(Id.toFixed(1))} = <b>${fr(Ie.toFixed(1))} A</b>. ` +
        (Ig === 0 && Id === 0
          ? 'Plus rien ne circule.'
          : broken[0] || broken[1]
            ? "Une branche est coupée : l'ampèremètre d'entrée le voit tout de suite, sans rien démonter."
            : 'Ce qui entre au nœud ressort en totalité : c\'est la loi des nœuds.');

      svg.attr(
        'aria-label',
        `Ampèremètre d'entrée : ${fr(Ie.toFixed(1))} ampères. Branche gauche : ${fr(Ig.toFixed(1))} ampères${broken[0] ? ', lampe grillée' : ''}. ` +
          `Branche droite : ${fr(Id.toFixed(1))} ampères${broken[1] ? ', lampe grillée' : ''}.`
      );

      nBody.replaceChildren(
        ...[
          ["Entrée (avant le nœud)", Ie],
          ['Branche gauche', Ig],
          ['Branche droite', Id]
        ].map(([k, v]) => {
          const tr = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.textContent = k;
          const td2 = document.createElement('td');
          td2.textContent = `${fr(v.toFixed(1))} A`;
          tr.append(td1, td2);
          return tr;
        })
      );
    }

    // paquets de courant (vitesse fixe, densité déjà encodée par l'opacité on/off)
    let t = 0;
    function tick() {
      if (!RM) {
        t += 1;
        const off = -((t * 0.9) % 23);
        flowEntree.attr('stroke-dashoffset', off);
        flowBranch[0].attr('stroke-dashoffset', off);
        flowBranch[1].attr('stroke-dashoffset', off);
      }
      loop.raf(tick);
    }

    // ---- interactions ----
    ctl.querySelectorAll('[data-b]').forEach((b) => {
      b.onclick = () => {
        const i = +b.dataset.b;
        broken[i] = !broken[i];
        b.classList.toggle('on', broken[i]);
        b.textContent = (broken[i] ? 'Réparer' : 'Griller') + ' la lampe ' + (i ? 'droite' : 'gauche');
        render(true);
      };
    });
    ctl.querySelector('#rz').onclick = () => {
      broken = [false, false];
      ctl.querySelectorAll('[data-b]').forEach((b, i) => {
        b.classList.remove('on');
        b.textContent = 'Griller la lampe ' + (i ? 'droite' : 'gauche');
      });
      render(true);
    };

    render(false);
    if (!RM) {
      live.selectAll('line').attr('opacity', 0);
      render(true);
    }
    tick();

    cleanup = () => {
      loop.stop();
      svg.selectAll('*').interrupt('w').interrupt('l');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
