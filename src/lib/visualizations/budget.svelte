<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, readout, SM, fr } from './shared.js';
  import { linScale, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « budget : quel projet est finançable ? » — portée canvas → D3/SVG
   * via la procédure dataviz.
   *
   * 1. Forme  : la question est « coût du projet ≤ budget disponible ? » — une
   *    comparaison à un SEUIL. Panneau A : le salaire se partage entre charges
   *    fixes et disponible (part-à-tout, contexte). Panneau B : chaque projet en
   *    barre horizontale face à la ligne de budget — magnitude + état
   *    (finançable / dépasse). Zoom sur la zone de décision (échelle propre au
   *    panneau B), là où se joue l'inéquation.
   * 2. Couleur : « dépasser le budget » est un ÉTAT, pas une série de données —
   *    donc jeton d'état réservé, légitimement : `--g` = finançable,
   *    `--red` = dépasse. La règle « jamais --warn/--red comme série » vise les
   *    séries ; ici c'est un statut, livré avec un pictogramme + un libellé
   *    explicite (« finançable » / « dépasse de X € ») + la barre qui franchit
   *    visiblement la ligne — jamais la couleur seule (color-formula.md
   *    « status colors ship with an icon + label »). Le budget disponible est un
   *    repère : accent neutre `--blue`, comme le pivot de `moypond`. Les charges
   *    fixes sont une surface neutre `--surf3`.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#e2725b"
   *    --mode dark --surface "#0f1512" → séparation CVD ΔE 19,2 (deutan) /
   *    32,1 (normal), contraste ≥ 3:1 : PASS. Les FAIL « lightness band » sont
   *    une propriété du thème néon-sur-noir du site, pas corrigeables sans hex
   *    hors tokens.css (même note que `moyenne`/`moypond`).
   * 4. Marques : barres à bout arrondi 4 u, ligne de seuil = filet pointillé
   *    1,4 u `--blue`, pictogrammes ✓ / ✗ tracés, libellé direct sélectif
   *    (nom + coût, verdict). Axe implicite (la ligne de budget sert de repère).
   * 5. Interaction : trois boutons (un par projet) + infobulle survol/focus sur
   *    les barres ; cible de survol > la marque.
   * 6. Accessibilité : `role="img"` + `aria-label`, vue tableau repliable,
   *    focus clavier = survol, `prefers-reduced-motion` (révélation coupée),
   *    thème sombre. L'état n'est jamais porté par la couleur seule.
   *
   * Contraintes captain : D3/SVG, imports modulaires, mouvement amorti,
   * poids léger, parité d'échelle (VB_W = 620). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const FIX = [
      ['Loyer', 520],
      ['Transport', 170],
      ['Alimentation', 340],
      ['Téléphone', 38],
      ['Mutuelle', 32]
    ];
    const PROJ = [
      ['A', 275],
      ['B', 305],
      ['C', 287]
    ];
    const SAL = 1380;
    const TOT = FIX.reduce((s, f) => s + f[1], 0); // 1100
    const REST = SAL - TOT; // 280
    const okOf = (v) => v <= REST;
    let pick = 0;

    const W = 620;
    const H = 240;
    const L = 18;
    const R = W - 18;

    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');
    const svgNode = svg.node();
    const bulle = tip(host);

    // ---------- panneau A : le salaire se partage ----------
    const xA = linScale([0, SAL], [L, R]);
    const AY = 26;
    const AH = 20;
    const aG = svg.append('g').attr('class', 'salaire');
    aG.append('text')
      .attr('x', L)
      .attr('y', 16)
      .attr('font-family', SM)
      .attr('font-size', 10.5)
      .attr('fill', 'var(--dim2)')
      .text(`Salaire net : ${SAL} €`);
    aG.append('rect')
      .attr('x', xA(0))
      .attr('y', AY)
      .attr('width', xA(TOT) - xA(0))
      .attr('height', AH)
      .attr('rx', 4)
      .attr('fill', 'var(--surf3)')
      .attr('stroke', 'var(--line2)')
      .attr('stroke-width', 1);
    aG.append('rect')
      .attr('x', xA(TOT) + 2)
      .attr('y', AY)
      .attr('width', Math.max(2, xA(SAL) - xA(TOT) - 2))
      .attr('height', AH)
      .attr('rx', 4)
      .attr('fill', 'var(--blue)');
    aG.append('text')
      .attr('x', L)
      .attr('y', AY + AH + 13)
      .attr('font-family', SM)
      .attr('font-size', 10)
      .attr('fill', 'var(--dim)')
      .text(`charges fixes : ${TOT} €`);
    aG.append('text')
      .attr('x', R)
      .attr('y', AY + AH + 13)
      .attr('text-anchor', 'end')
      .attr('font-family', SM)
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--blue)')
      .text(`disponible : ${REST} €`);

    // ---------- panneau B : les projets face au budget ----------
    const PMAX = Math.ceil((Math.max(...PROJ.map((p) => p[1]), REST) * 1.16) / 20) * 20;
    const xB = linScale([0, PMAX], [L, R]);
    const BY0 = 92;
    const ROW = 44;
    const BARH = 15;
    const rowY = (i) => BY0 + i * ROW;
    const barTop = (i) => rowY(i) + 17;

    const bG = svg.append('g').attr('class', 'projets');

    // ligne de budget disponible (repère --blue)
    const seuilX = xB(REST);
    bG.append('line')
      .attr('x1', seuilX)
      .attr('x2', seuilX)
      .attr('y1', rowY(0) - 4)
      .attr('y2', rowY(PROJ.length - 1) + BARH + 22)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-dasharray', '5 4')
      .attr('stroke-width', 1.4);
    bG.append('text')
      .attr('x', Math.min(R, Math.max(L + 40, seuilX)))
      .attr('y', rowY(0) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-family', SM)
      .attr('font-size', 10)
      .attr('font-weight', 'bold')
      .attr('fill', 'var(--blue)')
      .text(`budget disponible : ${REST} €`);

    const rowsG = bG.append('g').attr('class', 'rows');

    readout(host, [
      { id: 'gR', k: 'reste après charges', c: 'b' },
      { id: 'gP', k: 'coût du projet', c: 'd' },
      { id: 'gV', k: 'verdict', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    const md = box(
      host,
      'vctl',
      PROJ.map(
        (p, i) =>
          `<button data-p="${i}"${i === 0 ? ' class="on"' : ''}>Projet ${p[0]} · ${p[1]} €</button>`
      ).join('')
    );

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption>Budget disponible : ${REST} € (salaire ${SAL} − charges ${TOT})</caption>` +
        `<thead><tr><th>Poste</th><th>Montant</th><th>Verdict</th></tr></thead>` +
        `<tbody id="gBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#gBody');
    tbody.replaceChildren(
      ...FIX.map(([nm, v]) => rowTr(nm, `${fr(v)} €`, '')),
      rowTr('Charges fixes', `${fr(TOT)} €`, ''),
      rowTr('Disponible', `${fr(REST)} €`, ''),
      ...PROJ.map(([nm, v]) =>
        rowTr(`Projet ${nm}`, `${fr(v)} €`, okOf(v) ? 'finançable' : `dépasse de ${fr(v - REST)} €`)
      )
    );

    function rowTr(a, b, c) {
      const tr = document.createElement('tr');
      const c1 = document.createElement('td');
      c1.textContent = a;
      const c2 = document.createElement('td');
      c2.textContent = b;
      const c3 = document.createElement('td');
      c3.textContent = c;
      tr.append(c1, c2, c3);
      return tr;
    }

    function showTip(i, cx, cy) {
      const [nm, v] = PROJ[i];
      const p = vbToCss(host, svgNode, cx, cy);
      bulle.show(
        p.x,
        p.y,
        `${v} €`,
        okOf(v) ? `finançable (reste ${REST - v} €)` : `dépasse de ${v - REST} €`
      );
    }

    // ---------- rendu ----------
    function drawRow(g, i, reveal) {
      const [nm, v] = PROJ[i];
      const ok = okOf(v);
      const sel = i === pick;
      const col = ok ? 'var(--g)' : 'var(--red)';
      const y = rowY(i);
      const bt = barTop(i);

      g.selectAll('*').remove();

      // cible de survol (plus large que la barre)
      g.append('rect')
        .attr('x', L)
        .attr('y', y)
        .attr('width', R - L)
        .attr('height', ROW - 6)
        .attr('fill', 'transparent')
        .attr('tabindex', 0)
        .attr('aria-label', `Projet ${nm}, ${v} euros, ${ok ? 'finançable' : `dépasse le budget de ${v - REST} euros`}`)
        .on('mouseenter focus', () => showTip(i, Math.min(xB(v), R - 40), bt))
        .on('mouseleave blur', () => bulle.hide());

      // pictogramme ✓ / ✗
      const ic = g.append('g').attr('transform', `translate(${L},${y + 2})`);
      if (ok) {
        ic.append('path')
          .attr('d', 'M0 5 L3.5 9 L10 -1')
          .attr('fill', 'none')
          .attr('stroke', 'var(--g)')
          .attr('stroke-width', 2.3)
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      } else {
        ic.append('path')
          .attr('d', 'M0 0 L9 9 M9 0 L0 9')
          .attr('fill', 'none')
          .attr('stroke', 'var(--red)')
          .attr('stroke-width', 2.3)
          .attr('stroke-linecap', 'round');
      }

      // nom + coût (gauche), verdict (droite)
      g.append('text')
        .attr('x', L + 18)
        .attr('y', y + 10)
        .attr('font-family', SM)
        .attr('font-size', 11.5)
        .attr('font-weight', sel ? 'bold' : 'normal')
        .attr('fill', 'var(--tx)')
        .text(`Projet ${nm} — ${v} €`);
      g.append('text')
        .attr('x', R)
        .attr('y', y + 10)
        .attr('text-anchor', 'end')
        .attr('font-family', SM)
        .attr('font-size', 10.5)
        .attr('font-weight', 'bold')
        .attr('fill', col)
        .text(ok ? 'finançable' : `dépasse de ${v - REST} €`);

      // barre
      const bar = g
        .append('rect')
        .attr('class', 'bar')
        .attr('x', L)
        .attr('y', bt)
        .attr('height', BARH)
        .attr('rx', 4)
        .attr('fill', col)
        .attr('stroke', sel ? 'var(--tx)' : 'none')
        .attr('stroke-width', sel ? 2 : 0)
        .attr('width', 0);

      const target = Math.max(3, xB(v) - L);
      if (reveal && !RM) {
        bar.transition('h').duration(560).delay(i * 90).ease(spring).attr('width', target);
      } else {
        bar.attr('width', target);
      }
    }

    function render(reveal) {
      const rows = rowsG.selectAll('g.row').data(PROJ.map((_, i) => i));
      rows.enter().append('g').attr('class', 'row');
      rowsG.selectAll('g.row').each(function (i) {
        drawRow(select(this), i, reveal);
      });

      const [nm, v] = PROJ[pick];
      const ok = okOf(v);
      host.querySelector('#gR').textContent = `${REST} €`;
      host.querySelector('#gP').textContent = `${v} €`;
      const ve = host.querySelector('#gV');
      ve.textContent = ok ? 'finançable' : 'trop cher';
      ve.className = 'v ' + (ok ? '' : 'r');

      say.innerHTML = ok
        ? `${v} ≤ ${REST} : l'inéquation <b>coût ≤ budget</b> est vérifiée. Le projet <b>${nm}</b> passe, il resterait ${REST - v} €.`
        : `${v} > ${REST} : l'inéquation <b>coût ≤ budget</b> n'est pas vérifiée. Le projet <b>${nm}</b> dépasse le budget de <b>${v - REST} €</b>.`;

      svg.attr(
        'aria-label',
        `Budget disponible ${REST} euros. Projets : ` +
          PROJ.map(([n, c]) => `${n} ${c} euros ${okOf(c) ? 'finançable' : `dépasse de ${c - REST}`}`).join(', ') +
          `. Sélection : projet ${nm}.`
      );
    }

    md.querySelectorAll('[data-p]').forEach((b) => {
      b.onclick = () => {
        pick = +b.dataset.p;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        render(false);
      };
    });

    render(true);

    cleanup = () => {
      svg.selectAll('*').interrupt('h');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
