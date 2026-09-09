<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, slider, readout, SM, fr } from './shared.js';
  import { barField, spring, select, tip, vbToCss } from './d3.js';

  /* Fiche « moyenne pondérée » — portée sur D3 via la procédure dataviz.
   *
   * 1. Forme  : trois effectifs par âge → diagramme en bâtons (magnitude,
   *    comparaison directe). L'âge moyen est une valeur dérivée unique → repère
   *    d'emphase (le pivot), comme sur `moyenne`/`mediane`.
   * 2. Couleur : une seule série (les effectifs) → teinte séquentielle unique
   *    `--g` ; pas de légende (le titre nomme la série). Le pivot est un accent
   *    neutre `--blue` — jamais `--warn`, jeton d'état réservé
   *    (color-formula.md « status colors are reserved »). Identité par la
   *    position sur l'axe + le libellé direct, jamais par la couleur seule.
   * 3. Validation : node scripts/validate_palette.js "#7ef2b0,#7ec8f2"
   *    --mode dark --surface "#0f1512" → série/accent CVD ΔE 15,5 (deutan) /
   *    17,1 (normal), contraste ≥ 3:1 : PASS. Les FAIL « lightness band /
   *    chroma floor » sont une propriété du thème néon-sur-noir du site, pas
   *    corrigeables sans hex hors tokens.css.
   * 4. Marques : bâtons à bout arrondi 4 u, 2 u d'écart couleur surface entre
   *    voisins ; pivot = filet pointillé 2 u + pastille à l'axe + libellé sur sa
   *    propre ligne sous les âges (pas de flèche qui chevauche les libellés).
   *    Axe : filet 1 u. Libellé direct sélectif : les effectifs sur les bâtons,
   *    le pivot.
   * 5. Interaction : trois curseurs (un par âge) conservés + infobulle
   *    survol/focus sur les bâtons ; cible de survol > la marque.
   * 6. Accessibilité : vue tableau repliable, focus clavier = survol, mouvement
   *    réduit respecté (l'assouplissement vient des curseurs), thème sombre
   *    validé.
   *
   * Contraintes captain conservées : D3/SVG, imports modulaires, mouvement
   * amorti (curseurs à ressort de `shared.js`), poids léger, parité d'échelle
   * (VB_W) avec les fiches canvas voisines. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const AGES = [1, 2, 3];
    const UNIT = 'ans';
    const eff = [10, 20, 10];
    const MAXE = 30;

    const { svg, W, band, yScale, AX } = barField(host, {
      height: 214,
      cats: AGES.length,
      bot: 60,
      top: 24
    });
    svg.attr('aria-label', `Diagramme en bâtons des effectifs par âge et pivot de l'âge moyen`);
    const svgNode = svg.node();
    const bulle = tip(host);

    const barsG = svg.append('g').attr('class', 'bars');
    const pivotG = svg.append('g').attr('class', 'pivot');
    const stem = pivotG
      .append('line')
      .attr('y1', 8)
      .attr('y2', AX)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '5 4');
    const knob = pivotG
      .append('circle')
      .attr('cy', AX)
      .attr('r', 3.5)
      .attr('fill', 'var(--blue)');
    const plabel = pivotG
      .append('text')
      .attr('y', AX + 42)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--blue)')
      .attr('font-family', SM)
      .attr('font-size', 12)
      .attr('font-weight', 'bold');

    // axe : un repère d'âge sous chaque bâton, entre les bornes réelles
    const xForAge = (a) => {
      const span = AGES[AGES.length - 1] - AGES[0] || 1;
      return band(0).cx + ((a - AGES[0]) / span) * (band(AGES.length - 1).cx - band(0).cx);
    };

    AGES.forEach((a, i) => {
      svg
        .select('.ax')
        .append('text')
        .attr('x', band(i).cx)
        .attr('y', AX + 16)
        .attr('text-anchor', 'middle')
        .attr('fill', 'var(--dim2)')
        .attr('font-family', SM)
        .attr('font-size', 11)
        .text(`${a} ${a > 1 ? UNIT : UNIT.replace(/s$/, '')}`);
    });

    let ready = false;
    AGES.forEach((a, i) => {
      slider(
        host,
        `${a} ${a > 1 ? UNIT : UNIT.replace(/s$/, '')}`,
        0,
        MAXE,
        eff[i],
        (v) => `${Math.round(v)} enfants`,
        (v) => {
          eff[i] = v;
          if (ready) render();
        }
      );
    });

    readout(host, [
      { id: 'pT', k: 'effectif total', c: 'd' },
      { id: 'pS', k: 'somme pondérée', c: 'd' },
      { id: 'pM', k: 'âge moyen', c: 'b' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les données</summary>` +
        `<table><caption id="pCap"></caption><thead><tr><th>Âge</th><th>Effectif</th><th>Âge × effectif</th></tr></thead>` +
        `<tbody id="pBody"></tbody></table></details>`
    );
    const tbody = dataView.querySelector('#pBody');
    const cap = dataView.querySelector('#pCap');

    function showTip(i, E, cx, topY) {
      const p = vbToCss(host, svgNode, cx, topY);
      bulle.show(p.x, p.y, `${E} enfants`, `${AGES[i]} ${AGES[i] > 1 ? UNIT : UNIT.replace(/s$/, '')}`);
    }

    function render() {
      const E = eff.map((v) => Math.round(v));
      const tot = E.reduce((s, v) => s + v, 0) || 1;
      const somme = E.reduce((s, v, i) => s + v * AGES[i], 0);
      const moy = somme / tot;
      const mxE = Math.max(...E, 1);

      const join = barsG.selectAll('g.bar').data(E, (d, i) => i);
      const enter = join.enter().append('g').attr('class', 'bar');
      enter
        .append('rect')
        .attr('class', 'hit')
        .attr('fill', 'transparent')
        .attr('tabindex', 0)
        .attr('y', 0)
        .attr('height', AX)
        .on('mouseleave blur', () => bulle.hide());
      enter
        .append('rect')
        .attr('class', 'mark')
        .attr('rx', 4)
        .attr('fill', 'var(--g)')
        .attr('y', AX)
        .attr('height', 0)
        .style('pointer-events', 'none');

      const all = enter.merge(join);
      all.each(function (d, i) {
        const g = select(this);
        const b = band(i);
        const topY = yScale(d / mxE);
        g.select('rect.hit')
          .attr('x', b.x)
          .attr('width', b.w)
          .attr('aria-label', `${AGES[i]} ${AGES[i] > 1 ? UNIT : UNIT.replace(/s$/, '')} : ${d} enfants`)
          .on('mouseenter focus', () => showTip(i, d, b.cx, topY))
          .on('mouseleave blur', () => bulle.hide());
        g.select('rect.mark')
          .attr('x', b.x + 1)
          .attr('width', Math.max(0, b.w - 2))
          .interrupt('h')
          .attr('y', topY)
          .attr('height', AX - topY);
      });

      // libellé de valeur : dans le bâton près du sommet s'il est assez haut
      // (évite la collision avec le pivot au-dessus), au-dessus sinon
      const labs = barsG.selectAll('text.blab').data(E, (d, i) => i);
      labs
        .enter()
        .append('text')
        .attr('class', 'blab')
        .attr('text-anchor', 'middle')
        .attr('font-family', SM)
        .attr('font-size', 12)
        .attr('font-weight', 'bold')
        .merge(labs)
        .each(function (d, i) {
          const b = band(i);
          const topY = yScale(d / mxE);
          const inside = AX - topY > 26;
          select(this)
            .attr('x', b.cx)
            .attr('y', inside ? topY + 15 : topY - 7)
            .attr('fill', inside ? 'var(--bg)' : 'var(--tx)')
            .text(d);
        });

      const px = xForAge(moy);
      stem.attr('x1', px).attr('x2', px);
      knob.attr('cx', px);
      plabel.attr('x', Math.max(54, Math.min(W - 54, px)));
      plabel.text(`moyenne ${fr(moy.toFixed(2))} ${UNIT}`);

      host.querySelector('#pT').textContent = tot;
      host.querySelector('#pS').textContent = somme;
      host.querySelector('#pM').textContent = `${fr(moy.toFixed(2))} ${UNIT}`;

      say.innerHTML =
        `Somme pondérée : ${AGES.map((a, i) => `${a}×${E[i]}`).join(' + ')} = <b>${somme}</b>. ` +
        `Âge moyen : ${somme} ÷ ${tot} = <b>${fr(moy.toFixed(2))} ${UNIT}</b>.<br>` +
        `Déplace les effectifs : deux répartitions très différentes peuvent donner le même âge moyen.`;

      cap.textContent = `Effectif ${tot} · somme pondérée ${somme} · âge moyen ${fr(moy.toFixed(2))} ${UNIT}`;
      tbody.replaceChildren(
        ...AGES.map((a, i) => {
          const tr = document.createElement('tr');
          const c1 = document.createElement('td');
          c1.textContent = `${a} ${a > 1 ? UNIT : UNIT.replace(/s$/, '')}`;
          const c2 = document.createElement('td');
          c2.textContent = fr(E[i]);
          const c3 = document.createElement('td');
          c3.textContent = fr(a * E[i]);
          tr.append(c1, c2, c3);
          return tr;
        })
      );
    }

    ready = true;
    render();
    // révélation : les bâtons montent de l'axe, décalés (même identité de
    // mouvement que l'entrée décalée des points sur `moyenne`/`mediane`)
    if (!RM) {
      const E0 = eff.map((v) => Math.round(v));
      const mx0 = Math.max(...E0, 1);
      barsG.selectAll('rect.mark').each(function (d, i) {
        const topY = yScale(E0[i] / mx0);
        select(this)
          .attr('y', AX)
          .attr('height', 0)
          .transition('h')
          .duration(640)
          .delay(i * 90)
          .ease(spring)
          .attr('y', topY)
          .attr('height', AX - topY);
      });
    }

    cleanup = () => {
      svg.selectAll('*').interrupt('h').interrupt('p');
      bulle.remove();
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
