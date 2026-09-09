<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr } from './shared.js';
  import { barField, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « effectif / fréquence · bâtons ↔ circulaire » — portée sur D3 via la
   * procédure dataviz.
   *
   * 1. Forme  : une seule grandeur (l'effectif) répartie sur des catégories.
   *    - Diagramme en bâtons = comparaison de magnitude (choosing-a-form.md).
   *    - Diagramme circulaire = part de chaque catégorie dans le tout. Le
   *      programme (BO) l'exige explicitement (« angle = fréquence × 360° »),
   *      donc c'est bien un camembert, pas une barre empilée de substitution.
   *    Les trois modes (effectifs / fréquences / pourcentages) ne changent que
   *    le libellé, pas la géométrie : c'est la même série.
   * 2. Couleur : une série unique → teinte séquentielle unique `--g`, pour les
   *    bâtons ET les secteurs. Pas de jeu de 4 couleurs : color-formula.md
   *    « assign categorical hues in fixed order, never cycled », et le site n'a
   *    que deux teintes hors jetons d'état réservés (`--warn`/`--red`). Les
   *    catégories des cours ne sont pas toutes ordonnées (âges vs types de
   *    conflit), donc pas de rampe séquentielle non plus. L'identité passe par
   *    la position (axe) et le libellé direct — jamais par la couleur.
   *    Les secteurs sont séparés par un filet 2,5 u couleur fond
   *    (marks-and-anatomy.md « surface gap ») et portent tous un libellé.
   * 3. Validation : palette mono `--g` sur fond sombre, contraste ≥ 3:1 : PASS
   *    (node scripts/validate_palette.js "#7ef2b0" --mode dark). Pas de paire
   *    catégorielle à valider puisqu'il n'y en a pas.
   * 4. Marques : bâtons bout arrondi 4 u, 2 u d'écart couleur fond entre
   *    voisins ; secteurs filet 2,5 u ; axe filet 1 u. Libellé direct partout.
   * 5. Interaction : bascule bâtons/circulaire animée (jamais de saut) +
   *    sélecteur de mode + infobulle survol/focus.
   * 6. Accessibilité : vue tableau repliable (catégorie · effectif · fréquence
   *    · pourcentage), focus clavier = survol, mouvement réduit respecté, thème
   *    sombre validé.
   *
   * Contraintes captain conservées : D3/SVG, imports modulaires, transitions
   * ressort, révélation décalée, poids léger, parité d'échelle (VB_W). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUR = RM ? 0 : 620;

    const CATS = (vd && vd.cats) || [
      ['0–1 an', 6],
      ['1–2 ans', 14],
      ['2–3 ans', 12],
      ['3–4 ans', 8]
    ];
    const UNIT = (vd && vd.unit) || 'enfants';
    const TOT = CATS.reduce((s, c) => s + c[1], 0) || 1;
    const N = CATS.length;

    let mode = 'eff';
    let circ = false;
    let gen = 0; // annule les animations de bascule dépassées

    const { svg, W, band, yScale, AX } = barField(host, {
      height: 232,
      cats: N,
      bot: 42,
      top: 30,
      fill: 0.6
    });
    svg.attr('aria-label', 'Diagramme des effectifs par catégorie, en bâtons ou en secteurs');
    const svgNode = svg.node();
    const bulle = tip(host);

    // libellés de catégorie sous l'axe (bâtons)
    const axLabels = svg.select('.ax');
    CATS.forEach((c, i) => {
      axLabels
        .append('text')
        .attr('class', 'catlab')
        .attr('x', band(i).cx)
        .attr('y', AX + 15)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--dim2)')
        .attr('font-family', SM)
        .attr('font-size', 10.5)
        .text(c[0]);
    });

    const barsG = svg.append('g').attr('class', 'bars');
    const pieG = svg.append('g').attr('class', 'pie').attr('opacity', 0).attr('pointer-events', 'none');

    const PCX = W / 2;
    const PCY = AX / 2 + 2;
    const PR = Math.min(AX / 2 - 22, 76);

    function arcPath(a0, a1) {
      const p0 = [PCX + PR * Math.cos(a0), PCY + PR * Math.sin(a0)];
      const p1 = [PCX + PR * Math.cos(a1), PCY + PR * Math.sin(a1)];
      const large = a1 - a0 > Math.PI ? 1 : 0;
      return `M${PCX},${PCY} L${p0[0]},${p0[1]} A${PR},${PR} 0 ${large} 1 ${p1[0]},${p1[1]} Z`;
    }

    const md = box(
      host,
      'vctl',
      `<button data-m="eff" class="on">Effectifs</button>` +
        `<button data-m="freq">Fréquences</button>` +
        `<button data-m="pct">Pourcentages</button>`
    );
    const tg = box(host, 'vctl', `<button class="p" id="tg">▸ Voir en diagramme circulaire</button>`);
    readout(host, [
      { id: 'kT', k: `total (${UNIT})`, c: 'd' },
      { id: 'kM', k: 'la plus fréquente', c: 'b' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="kCap"></caption>` +
        `<thead><tr><th>Catégorie</th><th>Effectif</th><th>Fréquence</th><th>%</th></tr></thead>` +
        `<tbody id="kBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#kBody');
    const cap = dataView.querySelector('#kCap');

    const val = (e) =>
      mode === 'eff' ? String(e) : mode === 'freq' ? fr((e / TOT).toFixed(2)) : Math.round((e / TOT) * 100) + ' %';

    // ---- bâtons ----
    const mxE = Math.max(...CATS.map((c) => c[1]), 1);
    CATS.forEach((c, i) => {
      const b = band(i);
      const g = barsG.append('g').attr('class', 'bar');
      g.append('rect')
        .attr('class', 'hit')
        .attr('x', b.x)
        .attr('width', b.w)
        .attr('y', 0)
        .attr('height', AX)
        .attr('fill', 'transparent')
        .attr('tabindex', 0)
        .attr('aria-label', `${c[0]} : ${c[1]} ${UNIT}`)
        .on('mouseenter focus', () => {
          const topY = yScale(c[1] / mxE);
          const p = vbToCss(host, svgNode, b.cx, topY);
          bulle.show(p.x, p.y, `${c[1]} ${UNIT}`, c[0]);
        })
        .on('mouseleave blur', () => bulle.hide());
      g.append('rect')
        .attr('class', 'mark')
        .attr('x', b.x + 1)
        .attr('width', Math.max(0, b.w - 2))
        .attr('rx', 4)
        .attr('fill', 'var(--g)')
        .attr('y', AX)
        .attr('height', 0)
        .style('pointer-events', 'none');
      g.append('text')
        .attr('class', 'blab')
        .attr('x', b.cx)
        .attr('text-anchor', 'middle')
        .attr('font-family', SM)
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .attr('fill', 'var(--tx)');
    });

    // ---- secteurs ----
    let a0 = -Math.PI / 2;
    const sectors = CATS.map((c, i) => {
      const a1 = a0 + (c[1] / TOT) * Math.PI * 2;
      const s = { i, c, a0, a1, am: (a0 + a1) / 2 };
      a0 = a1;
      pieG
        .append('path')
        .attr('class', 'sect')
        .attr('d', arcPath(s.a0, s.a1))
        .attr('fill', 'var(--g)')
        .attr('stroke', 'var(--bg)')
        .attr('stroke-width', 2.5)
        .attr('tabindex', 0)
        .attr('aria-label', `${c[0]} : ${Math.round((c[1] / TOT) * 100)} %`)
        .on('mouseenter focus', () => {
          const lx = PCX + Math.cos(s.am) * PR * 0.6;
          const ly = PCY + Math.sin(s.am) * PR * 0.6;
          const p = vbToCss(host, svgNode, lx, ly);
          bulle.show(p.x, p.y, `${Math.round((c[1] / TOT) * 100)} %`, c[0]);
        })
        .on('mouseleave blur', () => bulle.hide());
      return s;
    });
    sectors.forEach((s) => {
      // valeur (%, fréquence ou effectif) dans le secteur s'il est assez large
      const cos = Math.cos(s.am);
      const big = s.a1 - s.a0 > 0.45;
      if (big) {
        pieG
          .append('text')
          .attr('class', 'plab')
          .attr('x', PCX + cos * PR * 0.6)
          .attr('y', PCY + Math.sin(s.am) * PR * 0.6)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('font-family', SM)
          .attr('font-size', 10)
          .attr('font-weight', 'bold')
          .attr('fill', 'var(--bg)')
          .attr('data-i', s.i);
      }
      // nom de la catégorie en dehors du secteur (identité sans couleur)
      const ox = PCX + cos * (PR + 10);
      const oy = PCY + Math.sin(s.am) * (PR + 10);
      const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
      pieG
        .append('text')
        .attr('class', 'pname')
        .attr('x', ox)
        .attr('y', oy)
        .attr('text-anchor', anchor)
        .attr('dominant-baseline', 'middle')
        .attr('font-family', SM)
        .attr('font-size', 11)
        .attr('fill', 'var(--dim)')
        .text(s.c[0]);
    });

    function mostFrequent() {
      let mi = 0;
      CATS.forEach((c, i) => {
        if (c[1] > CATS[mi][1]) mi = i;
      });
      return mi;
    }

    function paintLabels() {
      barsG.selectAll('text.blab').each(function (_, i) {
        const topY = yScale(CATS[i][1] / mxE);
        const insideBar = AX - topY > 26;
        select(this)
          .attr('y', insideBar ? topY + 15 : topY - 7)
          .attr('fill', insideBar ? 'var(--bg)' : 'var(--tx)')
          .text(val(CATS[i][1]));
      });
      pieG.selectAll('text.plab').each(function () {
        const i = +select(this).attr('data-i');
        select(this).text(val(CATS[i][1]));
      });
    }

    function updateReadouts() {
      const mi = mostFrequent();
      host.querySelector('#kT').textContent = `${TOT}`;
      host.querySelector('#kM').textContent = CATS[mi][0];
      cap.textContent = `Total ${TOT} ${UNIT} · ${N} catégories`;
      tbody.replaceChildren(
        ...CATS.map((c) => {
          const tr = document.createElement('tr');
          [c[0], String(c[1]), fr((c[1] / TOT).toFixed(2)), Math.round((c[1] / TOT) * 100) + ' %'].forEach((t, k) => {
            const td = document.createElement('td');
            td.textContent = t;
            if (k === 0) td.setAttribute('scope', 'row');
            tr.appendChild(td);
          });
          return tr;
        })
      );
      say.innerHTML = circ
        ? `Chaque secteur = la <b>part</b> d'une catégorie ; le tour complet (360°) = les ${TOT} ${UNIT}. ` +
          `« ${CATS[mi][0]} » occupe le plus grand secteur.`
        : mode === 'eff'
          ? `Hauteur du bâton = <b>effectif</b>. On compare les quantités d'un coup d'œil.`
          : mode === 'freq'
            ? `Hauteur = <b>fréquence</b> (effectif ÷ ${TOT}). La somme de toutes les fréquences fait 1.`
            : `Hauteur = <b>pourcentage</b> (fréquence × 100). La somme fait 100 %.`;
    }

    function layoutBars(animate) {
      barsG.selectAll('g.bar').each(function (_, i) {
        const b = band(i);
        const topY = yScale(CATS[i][1] / mxE);
        const r = select(this).select('rect.mark');
        if (animate && !RM) {
          r.transition('t').duration(DUR).delay(i * 70).ease(spring).attr('y', topY).attr('height', AX - topY);
        } else {
          r.interrupt('t').attr('y', topY).attr('height', AX - topY);
        }
      });
    }

    function setView(animate) {
      const myGen = ++gen;
      updateReadouts();
      paintLabels();
      tg.querySelector('button').innerHTML = circ
        ? '▸ Voir en diagramme en bâtons'
        : '▸ Voir en diagramme circulaire';
      md.style.opacity = circ ? '.4' : '1';
      md.querySelectorAll('button').forEach((b) => (b.disabled = circ));

      if (!circ) {
        pieG.interrupt('f').transition('f').duration(RM ? 0 : 220).attr('opacity', 0).on('end', () => {
          if (myGen === gen) pieG.attr('pointer-events', 'none');
        });
        barsG.attr('pointer-events', null);
        barsG
          .transition('f')
          .duration(RM ? 0 : 200)
          .attr('opacity', 1);
        svg.selectAll('.catlab').transition('f').duration(RM ? 0 : 200).attr('opacity', 1);
        svg.select('.ax line').attr('opacity', 1);
        layoutBars(animate);
      } else {
        barsG.selectAll('rect.mark').interrupt('t').attr('y', AX).attr('height', 0);
        barsG.transition('f').duration(RM ? 0 : 200).attr('opacity', 0);
        barsG.attr('pointer-events', 'none');
        svg.selectAll('.catlab').transition('f').duration(RM ? 0 : 200).attr('opacity', 0);
        svg.select('.ax line').attr('opacity', 0);
        pieG.attr('pointer-events', null);
        pieG.interrupt('f').transition('f').duration(RM ? 0 : 260).attr('opacity', 1);
        if (animate && !RM) {
          pieG.selectAll('path.sect').each(function (_, i) {
            const s = sectors[i];
            select(this)
              .attr('d', arcPath(s.a0, s.a0))
              .transition('sweep')
              .duration(520)
              .delay(i * 110)
              .ease(spring)
              .attrTween('d', () => (t) => arcPath(s.a0, s.a0 + (s.a1 - s.a0) * t));
          });
          pieG
            .selectAll('text.plab, text.pname')
            .attr('opacity', 0)
            .transition('sweep')
            .delay(360)
            .duration(300)
            .attr('opacity', 1);
        } else {
          pieG.selectAll('path.sect').each(function (_, i) {
            select(this).attr('d', arcPath(sectors[i].a0, sectors[i].a1));
          });
          pieG.selectAll('text.plab, text.pname').attr('opacity', 1);
        }
      }
    }

    md.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        if (circ) return;
        mode = b.dataset.m;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        paintLabels();
        updateReadouts();
      };
    });
    tg.querySelector('#tg').onclick = () => {
      circ = !circ;
      setView(true);
    };

    // état initial : bâtons, révélation décalée
    setView(true);

    cleanup = () => {
      svg.selectAll('*').interrupt('t').interrupt('f').interrupt('sweep');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
