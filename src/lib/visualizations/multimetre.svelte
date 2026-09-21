<script>
  import { onDestroy, onMount } from 'svelte';
  import { box, SM, fr } from './shared.js';
  import { select } from './d3.js';
  import { drag } from 'd3-drag';

  /* Tutoriel « Utiliser un multimètre » — le circuit est fixe, seule la
   * PLACE des sondes est interactive.
   *
   * Révision (captain, 2026-09-21, deuxième retour) : les boutons pour
   * choisir la sonde active puis la borne du multimètre demandaient trop
   * d'étapes indirectes à comprendre avant même de toucher au circuit —
   * « trop perturbant », pas adapté à un enfant en difficulté. Remplacé
   * par un geste direct : chaque sonde (rouge, noire) est un objet visible
   * en permanence près de l'appareil, qu'on fait glisser jusqu'au bon
   * point de contact (glisser-déposer réel, d3-drag, PAS le clic-choix
   * précédent). La borne du multimètre (VΩ ou mA) suit automatiquement le
   * mode choisi — ce n'est plus une décision séparée à faire, seulement
   * une information affichée. Avec seulement deux points de contact
   * valides par mode, tout dépôt qui « prend » est donc forcément correct :
   * plus d'état « presque correct », seulement incomplet → correct.
   * Circuit fixe : pile 9 V, résistor 100 Ω, lampe (résistance équivalente
   * 50 Ω) en série. I = 9 / 150 = 0,06 A ; U aux bornes de la lampe =
   * 0,06 × 50 = 3 V. */

  let host;
  let cleanup = () => {};

  const U = 9,
    R1 = 100,
    R2 = 50,
    RTOT = R1 + R2,
    I = U / RTOT,
    ULAMP = I * R2;

  const OX = 150; // décalage du circuit pour laisser la place à l'appareil
  const POINTS = {
    V: [
      { id: 'lampL', x: 340 + OX, y: 50, lab: 'L1' },
      { id: 'lampR', x: 400 + OX, y: 50, lab: 'L2' }
    ],
    A: [
      { id: 'gapL', x: 230 + OX, y: 50, lab: 'C1' },
      { id: 'gapR', x: 290 + OX, y: 50, lab: 'C2' }
    ]
  };
  const PORT_LABEL = { V: 'VΩ', A: 'mA' };
  const READING = { V: `${fr(ULAMP.toFixed(1))} V`, A: `${fr((I * 1000).toFixed(0))} mA` };
  const HINT = {
    V: 'Fais glisser chaque sonde jusqu\'aux deux bornes de la lampe : le voltmètre se branche <b>en parallèle</b>, sans rien débrancher.',
    A: "Fais glisser chaque sonde jusqu'aux deux côtés de la coupure : l'ampèremètre se branche <b>en série</b>, dans le fil ouvert."
  };
  const SNAP = 30; // rayon d'accrochage, en unités du viewBox

  onMount(() => {
    host.style.position = 'relative';

    let mode = 'V';
    const placedAt = { red: null, black: null }; // id du point, ou null = au repos

    const W = 680,
      H = 230;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    // pas de role="img" ici : ça masquerait les sondes (role="button") à
    // l'arbre d'accessibilité — le SVG reste un groupe générique, chaque
    // sonde porte son propre rôle/label/clavier.

    const meterG = svg.append('g');
    const cableG = svg.append('g');
    const circuitG = svg.append('g');
    const pointsG = svg.append('g');
    const probesG = svg.append('g');

    const METER = { x: 10, y: 18, w: 110, h: 150 };
    const PORT_RED = { x: METER.x + 78, y: METER.y + METER.h - 8 };
    const PORT_BLACK = { x: METER.x + 30, y: METER.y + METER.h - 8 };
    const HOME = { red: { x: PORT_RED.x, y: PORT_RED.y + 55 }, black: { x: PORT_BLACK.x, y: PORT_BLACK.y + 55 } };
    const pos = { red: { ...HOME.red }, black: { ...HOME.black } };
    const LANE_Y = 200;

    function wire(g, x1, y1, x2, y2) {
      g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'var(--tx)').attr('stroke-width', 2.4).attr('stroke-linecap', 'round');
    }
    function battery(g) {
      const x = 60 + OX,
        y0 = 50,
        y1 = 130;
      wire(g, x, y0, x, y0 + 28);
      wire(g, x, y1 - 28, x, y1);
      g.append('line').attr('x1', x - 12).attr('y1', y0 + 28).attr('x2', x + 12).attr('y2', y0 + 28).attr('stroke', 'var(--tx)').attr('stroke-width', 5);
      g.append('line').attr('x1', x - 7).attr('y1', y1 - 28).attr('x2', x + 7).attr('y2', y1 - 28).attr('stroke', 'var(--tx)').attr('stroke-width', 2.4);
      g.append('text').attr('x', x - 20).attr('y', y0 + 34).attr('font-size', 11).attr('font-weight', 900).attr('fill', 'var(--dim)').text('9 V');
    }
    function resistor(g, cx) {
      g.append('rect').attr('x', cx - 30).attr('y', 40).attr('width', 60).attr('height', 20).attr('rx', 3).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      g.append('text').attr('x', cx).attr('y', 54).attr('text-anchor', 'middle').attr('font-size', 11).attr('font-weight', 900).attr('fill', 'var(--tx)').text('R1 100Ω');
    }
    function lamp(g, cx, lit) {
      if (lit) g.append('circle').attr('cx', cx).attr('cy', 50).attr('r', 17).attr('fill', 'var(--g)').attr('opacity', 0.22);
      g.append('circle').attr('cx', cx).attr('cy', 50).attr('r', 11).attr('fill', lit ? 'var(--g)' : 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      g.append('line').attr('x1', cx - 7).attr('y1', 43).attr('x2', cx + 7).attr('y2', 57).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
      g.append('line').attr('x1', cx - 7).attr('y1', 57).attr('x2', cx + 7).attr('y2', 43).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
    }

    function drawCircuit(lit) {
      circuitG.selectAll('*').remove();
      battery(circuitG);
      wire(circuitG, 60 + OX, 50, 120 + OX, 50);
      resistor(circuitG, 150 + OX);
      wire(circuitG, 180 + OX, 50, 230 + OX, 50);
      if (mode === 'V') wire(circuitG, 230 + OX, 50, 290 + OX, 50);
      // en mode A, le segment 230→290 reste absent : coupure visible
      wire(circuitG, 290 + OX, 50, 340 + OX, 50);
      lamp(circuitG, 370 + OX, lit);
      wire(circuitG, 400 + OX, 50, 460 + OX, 50);
      wire(circuitG, 460 + OX, 50, 460 + OX, 130);
      wire(circuitG, 60 + OX, 130, 460 + OX, 130);
    }

    function drawMeter(screenLine1, screenLine2, statusColor) {
      meterG.selectAll('*').remove();
      const { x, y, w, h } = METER;
      meterG.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 8).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
      meterG.append('rect').attr('x', x + 10).attr('y', y + 14).attr('width', w - 20).attr('height', 46).attr('rx', 3).attr('fill', 'var(--bg)').attr('stroke', `var(--${statusColor})`).attr('stroke-width', 2);
      meterG.append('text').attr('x', x + w / 2).attr('y', y + 30).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 10).attr('fill', 'var(--dim)').text(screenLine1);
      meterG.append('text').attr('x', x + w / 2).attr('y', y + 51).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 15).attr('font-weight', 'bold').attr('fill', `var(--${statusColor})`).text(screenLine2);
      [
        { p: PORT_BLACK, lab: 'COM' },
        { p: PORT_RED, lab: PORT_LABEL[mode] }
      ].forEach(({ p, lab }) => {
        meterG.append('circle').attr('cx', p.x).attr('cy', p.y).attr('r', 7).attr('fill', 'var(--bg)').attr('stroke', 'var(--dim)').attr('stroke-width', 2);
        meterG.append('text').attr('x', p.x).attr('y', y + h + 14).attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 900).attr('fill', 'var(--dim2)').text(lab);
      });
    }

    function cablePath(anchor, target) {
      return `M${anchor.x},${anchor.y} L${anchor.x},${LANE_Y} L${target.x},${LANE_Y} L${target.x},${target.y}`;
    }
    function drawCables() {
      cableG.selectAll('*').remove();
      cableG.append('path').attr('d', cablePath(PORT_BLACK, pos.black)).attr('fill', 'none').attr('stroke', 'var(--dim2)').attr('stroke-width', 3).attr('stroke-linecap', 'round');
      cableG.append('path').attr('d', cablePath(PORT_RED, pos.red)).attr('fill', 'none').attr('stroke', 'var(--red)').attr('stroke-width', 3).attr('stroke-linecap', 'round');
    }

    function isComplete() {
      return placedAt.red && placedAt.black && placedAt.red !== placedAt.black;
    }

    const ctl = box(
      host,
      'vctl',
      ['V', 'A'].map((m) => `<button data-mode="${m}"${m === mode ? ' class="on"' : ''}>${m === 'V' ? 'Tension (V)' : 'Intensité (A)'}</button>`).join('')
    );
    const say = box(host, 'say', '');
    box(
      host,
      'viz-data',
      `<details><summary>Voir les repères du circuit</summary>
        <table><thead><tr><th>Grandeur</th><th>Valeur</th></tr></thead>
        <tbody>
          <tr><td>Tension U</td><td>${fr(U.toFixed(0))} V</td></tr>
          <tr><td>Résistance totale</td><td>${RTOT} Ω</td></tr>
          <tr><td>Intensité I</td><td>${fr((I * 1000).toFixed(0))} mA</td></tr>
          <tr><td>Tension aux bornes de la lampe</td><td>${fr(ULAMP.toFixed(1))} V</td></tr>
        </tbody></table></details>`
    );

    function nearestPoint(x, y) {
      let best = null,
        bd = SNAP;
      POINTS[mode].forEach((p) => {
        const d = Math.hypot(p.x - x, p.y - y);
        if (d <= bd) {
          bd = d;
          best = p;
        }
      });
      return best;
    }

    function dropProbe(color, x, y) {
      const other = color === 'red' ? 'black' : 'red';
      const hit = nearestPoint(x, y);
      if (hit) {
        if (placedAt[other] === hit.id) placedAt[other] = null; // bumpe l'autre sonde
        placedAt[color] = hit.id;
        pos[color] = { x: hit.x, y: hit.y };
      } else {
        placedAt[color] = null;
        pos[color] = { ...HOME[color] };
      }
      render();
    }

    function makeDrag(color) {
      return drag()
        .on('start', function () {
          select(this).raise();
        })
        .on('drag', function (event) {
          pos[color] = { x: event.x, y: event.y };
          drawCables();
          probesG.select(`[data-probe="${color}"]`).attr('transform', `translate(${event.x},${event.y})`);
        })
        .on('end', (event) => dropProbe(color, event.x, event.y));
    }

    function drawProbes() {
      probesG.selectAll('*').remove();
      ['red', 'black'].forEach((color) => {
        const g = probesG
          .append('g')
          .attr('data-probe', color)
          .attr('transform', `translate(${pos[color].x},${pos[color].y})`)
          .attr('role', 'button')
          .attr('tabindex', 0)
          .attr('aria-label', `Sonde ${color === 'red' ? 'rouge' : 'noire'}${placedAt[color] ? ', posée sur ' + POINTS[mode].find((p) => p.id === placedAt[color]).lab : ', pas encore posée — fais-la glisser jusqu\'à un point de contact'}`)
          .style('cursor', 'grab')
          .call(makeDrag(color));
        g.append('circle').attr('r', 28).attr('fill', 'transparent'); // zone de préhension élargie (tactile)
        g.append('circle').attr('r', 12).attr('fill', color === 'red' ? 'var(--red)' : 'var(--dim2)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
        const cycleNext = () => {
          const pts = POINTS[mode];
          const cur = placedAt[color];
          const next = cur === pts[0].id ? pts[1] : pts[0];
          dropProbe(color, next.x, next.y);
        };
        // Le glisser-déposer est le geste principal ; clic/tape et clavier
        // (Entrée/Espace) restent une alternative accessible équivalente —
        // d3-drag supprime lui-même le clic fantôme qui suit un vrai glisser.
        g.on('click', cycleNext);
        g.on('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          cycleNext();
        });
      });
    }

    function render() {
      const complete = isComplete();
      drawCircuit(complete);
      pointsG.selectAll('*').remove();
      POINTS[mode].forEach((p) => {
        const occ = placedAt.red === p.id ? 'red' : placedAt.black === p.id ? 'black' : null;
        const g = pointsG.append('g').attr('transform', `translate(${p.x},${p.y})`);
        g.append('circle').attr('r', 6).attr('fill', occ ? (occ === 'red' ? 'var(--red)' : 'var(--dim)') : 'var(--surf3)').attr('stroke', 'var(--blue)').attr('stroke-width', 1.6);
        g.append('text').attr('y', -14).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 900).attr('fill', 'var(--blue)').text(p.lab);
      });
      drawProbes();
      drawCables();

      const colorTok = complete ? 'g' : 'red';
      drawMeter(mode === 'V' ? 'DC V' : 'DC mA', complete ? READING[mode] : '- - - -', colorTok);

      host.classList.remove('circuit-red', 'circuit-green');
      host.classList.add(complete ? 'circuit-green' : 'circuit-red');
      const status = complete ? `✓ Correct — Lecture : <b>${READING[mode]}</b>.` : 'Sondes pas encore posées.';
      say.innerHTML = `${HINT[mode]}<br><b>${status}</b>`;
      svg.attr('aria-label', `Multimètre en position ${mode === 'V' ? 'tension' : 'intensité'}. ${complete ? 'Sondes posées, lecture ' + READING[mode] + '.' : 'Sondes pas encore posées.'}`);
    }

    ctl.querySelectorAll('[data-mode]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.mode;
        placedAt.red = null;
        placedAt.black = null;
        pos.red = { ...HOME.red };
        pos.black = { ...HOME.black };
        ctl.querySelectorAll('button').forEach((z) => z.classList.toggle('on', z === b));
        render();
      };
    });

    render();

    cleanup = () => {
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
