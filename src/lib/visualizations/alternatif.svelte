<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, slider, readout, SM, fr, createLoop } from './shared.js';
  import { select, spring } from './d3.js';

  /* Fiche « continu ou alternatif » — refonte D3/SVG.
   *
   * Objectif pédagogique (2P MV2, sécurité électrique) : distinguer les trois
   * milieux électriques d'un atelier et lire un schéma normalisé.
   *
   * 1. Forme  : un circuit dessiné avec les SYMBOLES NORMALISÉS (source, pile,
   *    interrupteur, lampe ⊗) au-dessus d'une trace tension/temps pleine
   *    largeur — disposition verticale imposée (jamais côte à côte), lisible
   *    sur un téléphone tenu à la verticale. Un bouton
   *    fait glisser l'image réaliste (batterie de voiture, prise, connecteur de
   *    traction) vers son symbole — l'élève apprend à lire le schéma à partir
   *    de ce qu'il voit sous le capot. Le courant est montré par un tracé qui
   *    « se remplit » le long des fils quand on ferme l'interrupteur, puis des
   *    paquets qui circulent (jamais de saut ; coupé si mouvement réduit).
   * 2. Couleur : les fils sont une teinte unique `--g`. Le contexte HAUTE
   *    TENSION (véhicule électrique) peint les fils en `--warn` (orange) avec
   *    un pictogramme ⚠ : c'est un usage LÉGITIME du jeton d'état réservé —
   *    le câble orange EST une alerte normalisée dans le métier. La trace
   *    tension/temps est la même série `--g` ; le repère de valeur efficace est
   *    un accent `--blue`.
   * 3. Validation : `--g` / `--blue` sur fond sombre, contraste ≥ 3:1 : PASS.
   *    `--warn` n'est utilisé que comme état (alerte), jamais comme série.
   * 4. Marques : fils 2,4 u bouts arrondis, symboles filet 2 u, lampe ⊗.
   *    Trace : sinus / trait plat 2 u.
   * 5. Interaction : sélecteur de contexte, interrupteur, bascule image↔schéma,
   *    curseur de fréquence (secteur seulement). Infobulle non nécessaire ici.
   * 6. Accessibilité : `role="img"` + `aria-label` décrivant l'état, vue
   *    tableau repliable des trois milieux, `prefers-reduced-motion` respecté,
   *    thème sombre.
   *
   * Contraintes captain : D3/SVG, imports modulaires, mouvement amorti,
   * poids léger, parité d'échelle (`VB_W` implicite : viewBox 620). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};
  const loop = createLoop();

  const CTX = {
    vh: {
      key: 'vh',
      label: 'Véhicule 12 V',
      volts: 12,
      ac: false,
      hv: false,
      pic: 'batterie',
      say: `Batterie du véhicule : tension <b>continue</b> (12 V). Elle garde le même signe — pas de période, pas de fréquence.`
    },
    sec: {
      key: 'sec',
      label: 'Atelier ~ 230 V',
      volts: 230,
      ac: true,
      hv: false,
      pic: 'prise',
      say: `Secteur de l'atelier : <b>alternatif sinusoïdal</b>, 230 V efficaces, 50 Hz. Le signal traverse zéro et change de signe.`
    },
    ve: {
      key: 've',
      label: 'Véhicule électrique 400 V',
      volts: 400,
      ac: false,
      hv: true,
      pic: 'connecteur',
      say: `Chaîne de traction d'un véhicule électrique : <b>continu, haute tension</b> (400 V et plus). Les <b>câbles orange</b> signalent le danger — on n'y touche pas sans habilitation.`
    }
  };

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ctx = CTX.sec;
    let on = false;
    let showPic = false;
    let f = 50;
    let phase = 0;

    // Disposition VERTICALE (jamais côte à côte) : le circuit en grand en haut,
    // la trace tension/temps pleine largeur en dessous — lisible sur un
    // téléphone tenu à la verticale.
    const W = 620;
    const H = 430;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // ---- géométrie du circuit (boucle rectangulaire, pleine largeur, en haut) ----
    const X0 = 74;
    const X1 = 546;
    const Y0 = 44;
    const Y1 = 228;
    const SW = { hinge: [282, Y0], contact: [338, Y0] }; // interrupteur (haut)
    const SRC = [X0, (Y0 + Y1) / 2]; // source (gauche)
    const LAMP = [X1, (Y0 + Y1) / 2]; // lampe (droite)

    // boucle complète, sens horaire depuis la source
    const LOOP = `M ${X0} ${SRC[1]} V ${Y0} H ${X1} V ${Y1} H ${X0} Z`;
    const PERIM = 2 * (X1 - X0) + 2 * (Y1 - Y0);

    const circuitG = svg.append('g').attr('class', 'circuit');
    // fil de fond
    const baseWire = circuitG
      .append('path')
      .attr('d', LOOP)
      .attr('fill', 'none')
      .attr('stroke', 'var(--line2)')
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round');
    // fil « énergisé » (se remplit à l'allumage)
    const liveWire = circuitG
      .append('path')
      .attr('d', LOOP)
      .attr('fill', 'none')
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 2.6)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('stroke-dasharray', `${PERIM} ${PERIM}`)
      .attr('stroke-dashoffset', PERIM);
    // paquets de courant en circulation
    const flow = circuitG
      .append('path')
      .attr('d', LOOP)
      .attr('fill', 'none')
      .attr('stroke', 'var(--g)')
      .attr('stroke-width', 3.4)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0)
      .attr('stroke-dasharray', '3 61');

    // masque le fil là où se posent les symboles
    const gap = circuitG.append('g').attr('class', 'gaps');
    [
      [SW.hinge[0] - 6, Y0 - 5, SW.contact[0] - SW.hinge[0] + 12, 10],
      [X0 - 6, SRC[1] - 16, 12, 32],
      [X1 - 6, LAMP[1] - 16, 12, 32]
    ].forEach(([x, y, w, h]) => gap.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('fill', 'var(--surf)'));

    // ---- interrupteur ----
    const swG = svg.append('g').attr('class', 'sw').style('cursor', 'pointer');
    swG.append('circle').attr('cx', SW.hinge[0]).attr('cy', SW.hinge[1]).attr('r', 3.5).attr('fill', 'var(--tx)');
    swG.append('circle').attr('cx', SW.contact[0]).attr('cy', SW.contact[1]).attr('r', 3.5).attr('fill', 'var(--tx)');
    const swArm = swG
      .append('line')
      .attr('x1', SW.hinge[0])
      .attr('y1', SW.hinge[1])
      .attr('x2', SW.contact[0])
      .attr('y2', SW.contact[1] - 18)
      .attr('stroke', 'var(--tx)')
      .attr('stroke-width', 2.6)
      .attr('stroke-linecap', 'round');
    const swHit = swG
      .append('rect')
      .attr('x', SW.hinge[0] - 6)
      .attr('y', SW.hinge[1] - 26)
      .attr('width', SW.contact[0] - SW.hinge[0] + 12)
      .attr('height', 34)
      .attr('fill', 'transparent');

    // ---- lampe (⊗) ----
    const lampG = svg.append('g').attr('class', 'lamp').attr('transform', `translate(${LAMP[0]},${LAMP[1]})`);
    const lampGlow = lampG.append('circle').attr('r', 24).attr('fill', 'var(--g)').attr('opacity', 0);
    const lampCircle = lampG.append('circle').attr('r', 13).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
    lampG.append('line').attr('x1', -9).attr('y1', -9).attr('x2', 9).attr('y2', 9).attr('stroke', 'var(--tx)').attr('stroke-width', 2);
    lampG.append('line').attr('x1', -9).attr('y1', 9).attr('x2', 9).attr('y2', -9).attr('stroke', 'var(--tx)').attr('stroke-width', 2);

    // ---- source : symbole normalisé + image réaliste (bascule) ----
    const srcG = svg.append('g').attr('class', 'src').attr('transform', `translate(${SRC[0]},${SRC[1]})`);
    const symG = srcG.append('g').attr('class', 'sym');
    const picG = srcG.append('g').attr('class', 'pic').attr('opacity', 0);
    const hvBadge = svg
      .append('g')
      .attr('class', 'hv')
      .attr('transform', `translate(${X0 + 8},${Y1 + 14})`)
      .attr('opacity', 0);
    hvBadge
      .append('path')
      .attr('d', 'M0,-10 L11,9 L-11,9 Z')
      .attr('fill', 'none')
      .attr('stroke', 'var(--warn)')
      .attr('stroke-width', 2)
      .attr('stroke-linejoin', 'round');
    hvBadge.append('text').attr('x', 0).attr('y', 5).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 11).attr('font-weight', 'bold').attr('fill', 'var(--warn)').text('!');
    hvBadge.append('text').attr('x', 16).attr('y', 5).attr('font-family', SM).attr('font-size', 10.5).attr('fill', 'var(--warn)').text('HAUTE TENSION');

    // ---- trace tension / temps (bandeau plein, en bas) ----
    const TL = 74;
    const TR = W - 24;
    const TY0 = 284;
    const TY1 = 404;
    const TCY = (TY0 + TY1) / 2;
    // séparateur entre le circuit et la trace
    svg
      .append('line')
      .attr('x1', X0)
      .attr('x2', X1)
      .attr('y1', 258)
      .attr('y2', 258)
      .attr('stroke', 'var(--line)')
      .attr('stroke-width', 1);
    const traceG = svg.append('g').attr('class', 'trace');
    traceG
      .append('text')
      .attr('x', TL)
      .attr('y', TY0 - 8)
      .attr('font-family', SM)
      .attr('font-size', 10)
      .attr('fill', 'var(--dim2)')
      .attr('letter-spacing', '0.5')
      .text('LA TENSION AU FIL DU TEMPS');
    traceG.append('line').attr('x1', TL).attr('x2', TL).attr('y1', TY0).attr('y2', TY1).attr('stroke', 'var(--line2)').attr('stroke-width', 1);
    traceG.append('line').attr('x1', TL).attr('x2', TR).attr('y1', TY1).attr('y2', TY1).attr('stroke', 'var(--line2)').attr('stroke-width', 1);
    traceG
      .append('line')
      .attr('x1', TL)
      .attr('x2', TR)
      .attr('y1', TCY)
      .attr('y2', TCY)
      .attr('stroke', 'var(--line2)')
      .attr('stroke-dasharray', '3 4')
      .attr('stroke-width', 1);
    traceG.append('text').attr('x', TL - 5).attr('y', TCY + 3).attr('text-anchor', 'end').attr('font-family', SM).attr('font-size', 9).attr('fill', 'var(--dim2)').text('0');
    const traceLine = traceG.append('path').attr('fill', 'none').attr('stroke', 'var(--g)').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
    const effLine = traceG
      .append('line')
      .attr('x1', TL)
      .attr('x2', TR)
      .attr('stroke', 'var(--blue)')
      .attr('stroke-dasharray', '5 4')
      .attr('stroke-width', 1.4)
      .attr('opacity', 0);
    const effTxt = traceG.append('text').attr('x', TL + 4).attr('font-family', SM).attr('font-size', 9.5).attr('font-weight', 'bold').attr('fill', 'var(--blue)').attr('opacity', 0);
    const traceCap = traceG.append('text').attr('x', (TL + TR) / 2).attr('y', TY1 + 14).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 9.5).attr('fill', 'var(--dim2)');

    // ---- contrôles ----
    const ctlCtx = box(
      host,
      'vctl',
      Object.values(CTX)
        .map((c) => `<button data-c="${c.key}"${c.key === 'sec' ? ' class="on"' : ''}>${c.label}</button>`)
        .join('')
    );
    const ctlRow = box(
      host,
      'vctl',
      `<button class="p" id="pw">Allumer</button><button id="tgpic">▸ Voir l'objet réel</button>`
    );
    const slWrap = document.createElement('div');
    host.appendChild(slWrap);
    const slInput = slider(slWrap, 'Fréquence du secteur', 10, 100, 50, (v) => `${Math.round(v)} Hz`, (v) => {
      f = v;
      drawTrace();
    });

    readout(host, [
      { id: 'aN', k: 'nature', c: 'b' },
      { id: 'aU', k: 'valeur efficace', c: 'd' },
      { id: 'aT', k: 'période T = 1 ÷ f', c: 'd' }
    ]);
    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les trois milieux</summary>` +
        `<table><thead><tr><th>Milieu</th><th>Tension</th><th>Nature</th><th>Repère</th></tr></thead>` +
        `<tbody>` +
        `<tr><td scope="row">Véhicule thermique</td><td>12 V</td><td>continue</td><td>—</td></tr>` +
        `<tr><td scope="row">Atelier (secteur)</td><td>230 V · 50 Hz</td><td>alternative</td><td>—</td></tr>` +
        `<tr><td scope="row">Véhicule électrique</td><td>400 V et +</td><td>continue (HT)</td><td>câbles orange</td></tr>` +
        `</tbody></table></details>`
    );

    // ---------- rendu ----------
    function drawSymbol() {
      symG.selectAll('*').remove();
      picG.selectAll('*').remove();
      const col = ctx.hv ? 'var(--warn)' : 'var(--tx)';
      if (ctx.ac) {
        // générateur alternatif : cercle + ~
        symG.append('circle').attr('r', 15).attr('fill', 'var(--surf3)').attr('stroke', col).attr('stroke-width', 2);
        symG
          .append('path')
          .attr('d', 'M -8 0 Q -4 -7 0 0 Q 4 7 8 0')
          .attr('fill', 'none')
          .attr('stroke', col)
          .attr('stroke-width', 2)
          .attr('stroke-linecap', 'round');
      } else {
        // pile : grande plaque (+) et petite plaque (−)
        symG.append('line').attr('x1', 0).attr('y1', -13).attr('x2', 0).attr('y2', 13).attr('stroke', col).attr('stroke-width', 2.5);
        symG.append('line').attr('x1', -7).attr('y1', -8).attr('x2', -7).attr('y2', 8).attr('stroke', col).attr('stroke-width', 5);
        symG.append('text').attr('x', 6).attr('y', -14).attr('font-family', SM).attr('font-size', 11).attr('fill', col).text('+');
      }
      // tension étiquetée à côté de la source, à l'intérieur de la boucle
      symG
        .append('text')
        .attr('x', 22)
        .attr('y', 4)
        .attr('text-anchor', 'start')
        .attr('font-family', SM)
        .attr('font-size', 10.5)
        .attr('font-weight', 'bold')
        .attr('fill', col)
        .text(`${ctx.volts} V${ctx.ac ? ' ~' : ''}`);

      // image réaliste (pictogramme simple)
      if (ctx.pic === 'batterie') {
        picG.append('rect').attr('x', -16).attr('y', -11).attr('width', 32).attr('height', 22).attr('rx', 2).attr('fill', 'var(--surf3)').attr('stroke', 'var(--dim)').attr('stroke-width', 1.5);
        picG.append('rect').attr('x', -11).attr('y', -15).attr('width', 6).attr('height', 4).attr('fill', 'var(--dim)');
        picG.append('rect').attr('x', 5).attr('y', -15).attr('width', 6).attr('height', 4).attr('fill', 'var(--dim)');
        picG.append('text').attr('x', -8).attr('y', 4).attr('font-family', SM).attr('font-size', 12).attr('fill', 'var(--dim)').text('+');
        picG.append('text').attr('x', 4).attr('y', 4).attr('font-family', SM).attr('font-size', 12).attr('fill', 'var(--dim)').text('−');
      } else if (ctx.pic === 'prise') {
        picG.append('rect').attr('x', -14).attr('y', -14).attr('width', 28).attr('height', 28).attr('rx', 5).attr('fill', 'var(--surf3)').attr('stroke', 'var(--dim)').attr('stroke-width', 1.5);
        picG.append('circle').attr('cx', -5).attr('cy', 0).attr('r', 2.6).attr('fill', 'var(--dim)');
        picG.append('circle').attr('cx', 5).attr('cy', 0).attr('r', 2.6).attr('fill', 'var(--dim)');
      } else {
        // connecteur haute tension (orange)
        picG.append('rect').attr('x', -15).attr('y', -12).attr('width', 30).attr('height', 24).attr('rx', 4).attr('fill', 'var(--surf3)').attr('stroke', 'var(--warn)').attr('stroke-width', 2);
        picG.append('path').attr('d', 'M -8 12 Q -8 22 -16 26 M 8 12 Q 8 22 16 26').attr('fill', 'none').attr('stroke', 'var(--warn)').attr('stroke-width', 3).attr('stroke-linecap', 'round');
      }

      symG.attr('opacity', showPic ? 0 : 1);
      picG.attr('opacity', showPic ? 1 : 0);
    }

    function wireColour() {
      return ctx.hv ? 'var(--warn)' : 'var(--g)';
    }

    function applyState(animate) {
      const wc = wireColour();
      liveWire.attr('stroke', wc);
      flow.attr('stroke', wc);
      lampGlow.attr('fill', wc);
      hvBadge.transition('h').duration(animate && !RM ? 220 : 0).attr('opacity', ctx.hv ? 1 : 0);

      // interrupteur ouvert (arm relevé) / fermé (arm horizontal)
      const armY = on ? SW.contact[1] : SW.contact[1] - 18;
      (animate && !RM ? swArm.transition('s').duration(260).ease(spring) : swArm.interrupt('s')).attr('y2', armY);

      // fil énergisé
      if (on) {
        (animate && !RM
          ? liveWire.transition('e').duration(620).ease(spring)
          : liveWire.interrupt('e')
        ).attr('stroke-dashoffset', 0);
        lampCircle.transition('l').duration(animate && !RM ? 260 : 0).attr('fill', wc);
        lampGlow.transition('l').duration(animate && !RM ? 260 : 0).attr('opacity', 0.22);
        flow.attr('opacity', RM ? 0 : 0.9);
      } else {
        (animate && !RM
          ? liveWire.transition('e').duration(320)
          : liveWire.interrupt('e')
        ).attr('stroke-dashoffset', PERIM);
        lampCircle.transition('l').duration(animate && !RM ? 200 : 0).attr('fill', 'var(--surf3)');
        lampGlow.transition('l').duration(animate && !RM ? 200 : 0).attr('opacity', 0);
        flow.attr('opacity', 0);
      }

      svg.attr(
        'aria-label',
        `Circuit ${ctx.label}, tension ${ctx.ac ? 'alternative' : 'continue'} ${ctx.volts} volts, interrupteur ${on ? 'fermé, lampe allumée' : 'ouvert, lampe éteinte'}${ctx.hv ? ', haute tension, câbles orange' : ''}.`
      );
    }

    function drawTrace() {
      const N = 120;
      const win = ctx.ac ? 1 / f : 0.04;
      const amp = (TY1 - TY0) / 2 - 22;
      const dcY = TCY - amp * 0.62;
      let d = '';
      for (let i = 0; i <= N; i++) {
        const tt = (i / N) * win;
        const x = TL + (i / N) * (TR - TL);
        const y = ctx.ac ? TCY - Math.sin(2 * Math.PI * f * (tt + phase)) * amp : dcY;
        d += (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1) + ' ';
      }
      traceLine.attr('d', d);
      traceLine.attr('stroke', 'var(--g)');

      if (ctx.ac) {
        const peak = ctx.volts * Math.SQRT2;
        const ye = TCY - amp * (ctx.volts / peak);
        effLine.attr('y1', ye).attr('y2', ye).attr('opacity', 1);
        effTxt.attr('y', ye - 4).attr('opacity', 1).attr('fill', 'var(--blue)').text(`${ctx.volts} V eff.`);
        traceCap.text(`une période T = ${fr((1000 / f).toFixed(1))} ms`);
      } else {
        effLine.attr('opacity', 0);
        effTxt.attr('y', dcY - 5).attr('opacity', 1).attr('fill', 'var(--g)').text(`${ctx.volts} V constants`);
        traceCap.text('la tension ne change pas');
      }
    }

    function updateReadouts() {
      host.querySelector('#aN').textContent = ctx.ac ? 'alternative' : 'continue';
      host.querySelector('#aU').textContent = `${ctx.volts} V`;
      host.querySelector('#aT').textContent = ctx.ac ? `${fr((1000 / f).toFixed(1))} ms` : '—';
      let extra = '';
      if (on) {
        extra = ctx.hv
          ? ` Le courant circule : sur ce circuit, le contact est <b style="color:var(--warn)">mortel</b>.`
          : ` Le courant circule : la lampe s'allume.`;
      }
      say.innerHTML = ctx.say + extra;
      slWrap.style.opacity = ctx.ac ? '1' : '.35';
      slInput.disabled = !ctx.ac;
      ctlRow.querySelector('#tgpic').textContent = showPic ? '▸ Voir le symbole' : "▸ Voir l'objet réel";
      const pw = ctlRow.querySelector('#pw');
      pw.textContent = on ? 'Éteindre' : 'Allumer';
      pw.classList.toggle('on', on);
      pw.setAttribute('aria-pressed', on ? 'true' : 'false');
      pw.setAttribute('aria-label', on ? 'Éteindre le circuit' : 'Allumer le circuit');
    }

    function refresh(animate) {
      drawSymbol();
      drawTrace();
      updateReadouts();
      applyState(animate);
    }

    // ---- animation du flux de courant ----
    function tick() {
      if (on && !RM) {
        phase = (phase + 0.0006) % 1;
        flow.attr('stroke-dashoffset', -((performance.now() / 14) % 64));
        if (ctx.ac) drawTrace();
      }
      loop.raf(tick);
    }

    // ---- interactions ----
    ctlCtx.querySelectorAll('[data-c]').forEach((b) => {
      b.onclick = () => {
        ctx = CTX[b.dataset.c];
        ctlCtx.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        refresh(true);
      };
    });
    const toggleOn = () => {
      on = !on;
      refresh(true);
    };
    ctlRow.querySelector('#pw').onclick = toggleOn;
    swHit.on('click', toggleOn);
    ctlRow.querySelector('#tgpic').onclick = () => {
      showPic = !showPic;
      symG.transition('p').duration(RM ? 0 : 200).attr('opacity', showPic ? 0 : 1);
      picG.transition('p').duration(RM ? 0 : 200).attr('opacity', showPic ? 1 : 0);
      updateReadouts();
    };

    refresh(false);
    tick();

    cleanup = () => {
      loop.stop();
      svg.selectAll('*').interrupt('e').interrupt('s').interrupt('l').interrupt('h').interrupt('p');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
