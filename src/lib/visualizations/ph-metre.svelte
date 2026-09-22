<script>
  import { onDestroy, onMount } from 'svelte';
  import { box, SM, fr } from './shared.js';
  import { select } from './d3.js';
  import { drag } from 'd3-drag';

  /* Tutoriel « Mesurer un pH » — même patron que multimetre.svelte : une
   * sonde unique, glisser-déposer réel (d3-drag), points de contact fixes
   * (les béchers), aucune décision par bouton avant de toucher au matériel.
   * Deux modes, choisis par vd.mode :
   *  - "dilute" (un bécher, dilution) : glisse la sonde dans le bécher
   *    pour lire le pH ; glisse la goutte d'eau sur le bécher pour diluer
   *    (le pH se rapproche de 7 en divisant l'écart par deux à chaque
   *    ajout — modèle simplifié mais réaliste). Réussite = pH dans la
   *    plage cible pendant que la sonde est en place.
   *  - "compare" (plusieurs béchers fixes) : glisse la sonde dans chaque
   *    bécher pour relever son pH. Réussite = les trois relevés faits ;
   *    le message final indique lesquels sont hors norme — ce n'est pas
   *    une erreur si certains le sont, c'est le constat attendu. */

  let { vd } = $props();

  let host;
  let cleanup = () => {};

  const MODE = (vd && vd.mode) || 'compare';
  const TARGET = (vd && vd.target) || [6.5, 8.5];
  const CONTAINERS =
    MODE === 'dilute'
      ? [{ id: 'c0', label: (vd && vd.label) || 'Solution', ph: (vd && vd.initial) || 9 }]
      : ((vd && vd.points) || []).map((p, i) => ({ id: 'c' + i, label: p.label, ph: p.ph }));

  const inRange = (ph) => ph >= TARGET[0] && ph <= TARGET[1];
  // Convention du programme : pH < 7 acide, pH = 7 neutre, pH > 7 basique —
  // indépendante de la plage cible (6,5-7,5 ou 6,5-8,5) qui est une norme
  // d'usage, pas la définition chimique de la neutralité.
  const nature = (ph) => (ph < 7 ? 'acide' : ph > 7 ? 'basique' : 'neutre');

  onMount(() => {
    host.style.position = 'relative';

    let probeAt = null; // id de bécher, ou null = au repos
    const probed = new Set(); // béchers déjà sondés au moins une fois (mode compare)
    let dilutions = 0; // mode dilute

    const W = 680,
      H = 230;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');
    // pas de role="img" : la sonde (et la goutte d'eau) sont de vrais
    // éléments interactifs, voir la leçon retenue sur multimetre.svelte.

    const meterG = svg.append('g');
    const cableG = svg.append('g');
    const containersG = svg.append('g');
    const pointsG = svg.append('g');
    const probesG = svg.append('g');

    const METER = { x: 10, y: 18, w: 110, h: 150 };
    const PORT = { x: METER.x + 55, y: METER.y + METER.h - 8 };
    const HOME_PROBE = { x: PORT.x, y: PORT.y + 55 };
    const HOME_WATER = { x: PORT.x + 65, y: HOME_PROBE.y };
    const pos = { probe: { ...HOME_PROBE }, water: { ...HOME_WATER } };
    const LANE_Y = 200;
    const SNAP = 34;

    const CX = MODE === 'dilute' ? [420] : [280, 430, 580];
    const CY = 60;
    CONTAINERS.forEach((c, i) => {
      c.x = CX[i];
      c.y = CY;
    });

    function beaker(g, c) {
      const w = 56,
        h = 66,
        x = c.x - w / 2,
        y = c.y;
      const liqH = h * 0.6;
      g.append('rect').attr('x', x + 2).attr('y', y + h - liqH).attr('width', w - 4).attr('height', liqH - 2).attr('fill', 'var(--surf3)');
      g.append('path').attr('d', `M${x},${y} L${x},${y + h} L${x + w},${y + h} L${x + w},${y}`).attr('fill', 'none').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
      g.append('text').attr('x', c.x).attr('y', y - 8).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 900).attr('fill', 'var(--blue)').text(c.label);
      if (probed.has(c.id)) {
        g.append('text').attr('x', c.x).attr('y', y + h + 16).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 900).attr('fill', 'var(--dim)').text(`pH ${fr(c.ph.toFixed(1))}`);
      }
    }

    function drawContainers() {
      containersG.selectAll('*').remove();
      CONTAINERS.forEach((c) => beaker(containersG, c));
    }

    function drawMeter(line2, statusColor) {
      meterG.selectAll('*').remove();
      const { x, y, w, h } = METER;
      meterG.append('rect').attr('x', x).attr('y', y).attr('width', w).attr('height', h).attr('rx', 8).attr('fill', 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 2);
      meterG.append('rect').attr('x', x + 10).attr('y', y + 14).attr('width', w - 20).attr('height', 46).attr('rx', 3).attr('fill', 'var(--bg)').attr('stroke', `var(--${statusColor})`).attr('stroke-width', 2);
      meterG.append('text').attr('x', x + w / 2).attr('y', y + 30).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 10).attr('fill', 'var(--dim)').text('pH');
      meterG.append('text').attr('x', x + w / 2).attr('y', y + 51).attr('text-anchor', 'middle').attr('font-family', SM).attr('font-size', 17).attr('font-weight', 'bold').attr('fill', `var(--${statusColor})`).text(line2);
      meterG.append('circle').attr('cx', PORT.x).attr('cy', PORT.y).attr('r', 7).attr('fill', 'var(--bg)').attr('stroke', 'var(--dim)').attr('stroke-width', 2);
      meterG.append('text').attr('x', PORT.x).attr('y', y + h + 14).attr('text-anchor', 'middle').attr('font-size', 9).attr('font-weight', 900).attr('fill', 'var(--dim2)').text('électrode');
    }

    function cablePath(anchor, target) {
      return `M${anchor.x},${anchor.y} L${anchor.x},${LANE_Y} L${target.x},${LANE_Y} L${target.x},${target.y}`;
    }
    function probePt(c) {
      return { x: c.x, y: c.y + 20 }; // point de contact, à la surface du liquide
    }

    function drawCable() {
      cableG.selectAll('*').remove();
      const target = probeAt ? CONTAINERS.find((c) => c.id === probeAt) : null;
      cableG.append('path').attr('d', cablePath(PORT, target ? probePt(target) : pos.probe)).attr('fill', 'none').attr('stroke', 'var(--blue)').attr('stroke-width', 3).attr('stroke-linecap', 'round');
    }

    function nearestContainer(x, y) {
      let best = null,
        bd = SNAP;
      CONTAINERS.forEach((c) => {
        const p = probePt(c);
        const d = Math.hypot(p.x - x, p.y - y);
        if (d <= bd) {
          bd = d;
          best = c;
        }
      });
      return best;
    }

    function dropProbe(x, y) {
      const hit = nearestContainer(x, y);
      if (hit) {
        probeAt = hit.id;
        probed.add(hit.id);
        pos.probe = probePt(hit);
      } else {
        probeAt = null;
        pos.probe = { ...HOME_PROBE };
      }
      render();
    }

    function dropWater(x, y) {
      const hit = MODE === 'dilute' ? nearestContainer(x, y) : null;
      if (hit) {
        dilutions += 1;
        const c = CONTAINERS[0];
        c.ph = 7 + ((vd && vd.initial ? vd.initial : 9) - 7) * Math.pow(0.5, dilutions);
      }
      pos.water = { ...HOME_WATER };
      render();
    }

    function makeDrag(kind) {
      return drag()
        .on('start', function () {
          select(this).raise();
        })
        .on('drag', function (event) {
          pos[kind] = { x: event.x, y: event.y };
          if (kind === 'probe') drawCable();
          probesG.select(`[data-obj="${kind}"]`).attr('transform', `translate(${event.x},${event.y})`);
        })
        .on('end', (event) => (kind === 'probe' ? dropProbe(event.x, event.y) : dropWater(event.x, event.y)));
    }

    function drawProbeAndWater() {
      probesG.selectAll('*').remove();
      const probe = probesG
        .append('g')
        .attr('data-obj', 'probe')
        .attr('transform', `translate(${pos.probe.x},${pos.probe.y})`)
        .attr('role', 'button')
        .attr('tabindex', 0)
        .attr('aria-label', `Électrode${probeAt ? ', plongée dans ' + CONTAINERS.find((c) => c.id === probeAt).label : ", pas encore plongée — fais-la glisser jusqu'à un bécher"}`)
        .style('cursor', 'grab')
        .call(makeDrag('probe'));
      probe.append('circle').attr('r', 28).attr('fill', 'transparent');
      probe.append('circle').attr('r', 12).attr('fill', 'var(--blue)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
      const cycleProbe = () => {
        const ids = CONTAINERS.map((c) => c.id);
        const idx = ids.indexOf(probeAt);
        const next = CONTAINERS[(idx + 1) % ids.length];
        const p = probePt(next);
        dropProbe(p.x, p.y);
      };
      probe.on('click', cycleProbe);
      probe.on('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        cycleProbe();
      });

      if (MODE === 'dilute') {
        const water = probesG
          .append('g')
          .attr('data-obj', 'water')
          .attr('transform', `translate(${pos.water.x},${pos.water.y})`)
          .attr('role', 'button')
          .attr('tabindex', 0)
          .attr('aria-label', "Goutte d'eau — fais-la glisser sur le bécher pour diluer la solution")
          .style('cursor', 'grab')
          .call(makeDrag('water'));
        water.append('circle').attr('r', 26).attr('fill', 'transparent');
        water.append('circle').attr('r', 10).attr('fill', 'var(--blue)').attr('opacity', 0.55).attr('stroke', 'var(--tx)').attr('stroke-width', 1.4);
        const addWater = () => {
          const p = probePt(CONTAINERS[0]);
          dropWater(p.x, p.y);
        };
        water.on('click', addWater);
        water.on('keydown', (event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return;
          event.preventDefault();
          addWater();
        });
      }
    }

    const say = box(host, 'say', '');
    box(
      host,
      'viz-data',
      `<details><summary>Voir les repères</summary>
        <table><thead><tr><th>Point</th><th>pH</th><th>Nature</th></tr></thead>
        <tbody>${CONTAINERS.map((c) => `<tr><td>${c.label}</td><td>${fr(c.ph.toFixed(1))}</td><td>${nature(c.ph)}</td></tr>`).join('')}</tbody></table></details>`
    );

    function render() {
      drawContainers();
      pointsG.selectAll('*').remove();
      CONTAINERS.forEach((c) => {
        const p = probePt(c);
        pointsG
          .append('circle')
          .attr('cx', p.x)
          .attr('cy', p.y)
          .attr('r', 5)
          .attr('fill', probeAt === c.id ? 'var(--blue)' : 'var(--surf3)')
          .attr('stroke', 'var(--blue)')
          .attr('stroke-width', 1.4);
      });
      drawProbeAndWater();
      drawCable();

      const current = probeAt ? CONTAINERS.find((c) => c.id === probeAt) : null;
      const screenVal = current ? fr(current.ph.toFixed(1)) : '- -';

      let colorTok, status;
      if (MODE === 'dilute') {
        const c = CONTAINERS[0];
        const measured = probeAt === c.id;
        if (!measured && probed.size === 0) {
          colorTok = 'red';
          status = "Glisse l'électrode dans le bécher pour lire le pH de départ.";
        } else if (inRange(c.ph) && measured) {
          colorTok = 'g';
          status = `✓ pH dans la plage visée (${fr(TARGET[0])}–${fr(TARGET[1])}) — solution prête à l'emploi.`;
        } else {
          colorTok = 'warn';
          status = `pH actuel ${fr(c.ph.toFixed(1))} (${nature(c.ph)}), encore hors de la plage ${fr(TARGET[0])}–${fr(TARGET[1])}. Glisse la goutte d'eau sur le bécher pour diluer, puis vérifie à nouveau.`;
        }
      } else {
        if (probed.size < CONTAINERS.length) {
          colorTok = 'red';
          status = `Teste les ${CONTAINERS.length} points avec l'électrode (${probed.size}/${CONTAINERS.length} fait${probed.size > 1 ? 's' : ''}).`;
        } else {
          colorTok = 'g';
          const hors = CONTAINERS.filter((c) => !inRange(c.ph));
          status = hors.length
            ? `✓ Les ${CONTAINERS.length} points sont testés. Hors norme (${fr(TARGET[0])}–${fr(TARGET[1])}) : ${hors.map((c) => `${c.label} (pH ${fr(c.ph.toFixed(1))}, ${nature(c.ph)})`).join(', ')}.`
            : `✓ Les ${CONTAINERS.length} points sont testés, tous dans la norme (${fr(TARGET[0])}–${fr(TARGET[1])}).`;
        }
      }

      drawMeter(current ? screenVal : '- -', colorTok);
      host.classList.remove('circuit-red', 'circuit-orange', 'circuit-green');
      host.classList.add(colorTok === 'red' ? 'circuit-red' : colorTok === 'warn' ? 'circuit-orange' : 'circuit-green');
      say.innerHTML = status;
      svg.attr('aria-label', `pH-mètre. ${status.replace(/<[^>]+>/g, '')}`);
    }

    render();

    cleanup = () => {
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
