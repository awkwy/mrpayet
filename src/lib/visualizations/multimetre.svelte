<script>
  import { onDestroy, onMount } from 'svelte';
  import { box, SM, fr } from './shared.js';
  import { select } from './d3.js';

  /* Tutoriel « Utiliser un multimètre » — activité neuve, même patron que
   * circuit.svelte : le circuit est fixe (pas de construction), seule la
   * PLACE des sondes est interactive, sur un petit nombre d'emplacements
   * fixes (jamais de glisser-déposer libre — cf. AGENTS.md « Snapper à des
   * emplacements fixes »). Le vrai geste enseigné : voltmètre en parallèle
   * (aux bornes d'un dipôle), ampèremètre en série (dans une coupure du
   * circuit) — capacités exigibles du programme CAP physique-chimie
   * (« mesurer l'intensité », « mesurer la tension aux bornes d'un dipôle »).
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

  const POINTS = {
    V: [
      { id: 'lampL', x: 340, y: 50, lab: 'L1' },
      { id: 'lampR', x: 400, y: 50, lab: 'L2' }
    ],
    A: [
      { id: 'gapL', x: 230, y: 50, lab: 'C1' },
      { id: 'gapR', x: 290, y: 50, lab: 'C2' }
    ]
  };
  const PORT_OK = { V: 'VOHM', A: 'mA' };
  const READING = { V: `${fr(ULAMP.toFixed(1))} V`, A: `${fr((I * 1000).toFixed(0))} mA` };
  const HINT = {
    V: "Le voltmètre se branche <b>en parallèle</b>, aux deux bornes de la lampe, sans rien débrancher.",
    A: "L'ampèremètre se branche <b>en série</b> : on ouvre le circuit et on l'insère dans la coupure."
  };

  onMount(() => {
    host.style.position = 'relative';

    let mode = 'V';
    let port = null;
    let probe = 'red';
    let placed = { red: null, black: null };

    const W = 560,
      H = 190;
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const circuitG = svg.append('g');
    const pointsG = svg.append('g');
    const statusTxt = svg
      .append('text')
      .attr('x', W / 2)
      .attr('y', 172)
      .attr('text-anchor', 'middle')
      .attr('font-family', SM)
      .attr('font-size', 12)
      .attr('font-weight', 'bold');

    function wire(g, x1, y1, x2, y2) {
      g.append('line').attr('x1', x1).attr('y1', y1).attr('x2', x2).attr('y2', y2).attr('stroke', 'var(--tx)').attr('stroke-width', 2.4).attr('stroke-linecap', 'round');
    }
    function battery(g) {
      const x = 60,
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
      wire(circuitG, 60, 50, 120, 50);
      resistor(circuitG, 150);
      wire(circuitG, 180, 50, 230, 50);
      if (mode === 'V') wire(circuitG, 230, 50, 290, 50);
      // en mode A, le segment 230→290 reste absent : coupure visible
      wire(circuitG, 290, 50, 340, 50);
      lamp(circuitG, 370, lit);
      wire(circuitG, 400, 50, 460, 50);
      wire(circuitG, 460, 50, 460, 130);
      wire(circuitG, 60, 130, 460, 130);
    }

    function evalState() {
      const need = new Set(POINTS[mode].map((p) => p.id));
      const got = new Set([placed.red, placed.black].filter(Boolean));
      const bothPlaced = placed.red && placed.black;
      const samePoint = bothPlaced && placed.red === placed.black;
      const nodesOK = bothPlaced && !samePoint && [...need].every((id) => got.has(id));
      const portOK = port === PORT_OK[mode];
      if (nodesOK && portOK) return { status: 'green', reason: 'ok' };
      if (samePoint) return { status: 'red', reason: 'same' };
      if (!bothPlaced) return { status: 'red', reason: 'incomplete' };
      if (nodesOK && !portOK) return { status: 'orange', reason: 'port' };
      return { status: 'red', reason: 'nodes' };
    }

    const REASON_TEXT = {
      incomplete: () => 'Place la sonde rouge et la sonde noire chacune sur un point de contact.',
      same: () => 'Les deux sondes ne peuvent pas être au même endroit.',
      nodes: () => (mode === 'V' ? 'Place les deux sondes sur les deux bornes de la lampe (L1 et L2).' : 'Place les deux sondes sur les deux côtés de la coupure (C1 et C2).'),
      port: () => `Bonne position des sondes, mais la borne rouge du multimètre doit être sur <b>${PORT_OK[mode] === 'VOHM' ? 'VΩ' : 'mA'}</b>, pas sur l'autre.`,
      ok: () => `Branchement correct. Lecture : <b>${READING[mode]}</b>.`
    };
    const STATUS_LABEL = { red: '✗ Incorrect', orange: '⚠ Presque', green: '✓ Correct' };

    const ctl = box(
      host,
      'vctl',
      ['V', 'A'].map((m) => `<button data-mode="${m}"${m === mode ? ' class="on"' : ''}>${m === 'V' ? 'Tension (V)' : 'Intensité (A)'}</button>`).join('')
    );
    const portCtl = box(host, 'vctl', `<button data-port="VOHM">Borne rouge : VΩ</button><button data-port="mA">Borne rouge : mA</button>`);
    const probeCtl = box(host, 'vctl', `<button data-probe="red" class="on">Sonde rouge</button><button data-probe="black">Sonde noire</button>`);
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

    function render() {
      const st = evalState();
      drawCircuit(st.status === 'green');
      pointsG.selectAll('*').remove();
      POINTS[mode].forEach((p) => {
        const occ = placed.red === p.id ? 'red' : placed.black === p.id ? 'black' : null;
        const g = pointsG
          .append('g')
          .attr('transform', `translate(${p.x},${p.y})`)
          .attr('role', 'button')
          .attr('tabindex', 0)
          .attr('aria-label', `Point de contact ${p.lab}${occ ? ', sonde ' + (occ === 'red' ? 'rouge' : 'noire') + ' posée ici' : ', vide'}`);
        g.append('circle').attr('r', 14).attr('fill', 'transparent');
        g.append('circle').attr('r', 6).attr('fill', occ ? (occ === 'red' ? 'var(--red)' : 'var(--dim)') : 'var(--surf3)').attr('stroke', 'var(--blue)').attr('stroke-width', 1.6);
        g.append('text').attr('y', -14).attr('text-anchor', 'middle').attr('font-size', 10).attr('font-weight', 900).attr('fill', 'var(--blue)').text(p.lab);
        g.style('cursor', 'pointer').on('click', () => place(p.id));
        g.on('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            place(p.id);
          }
        });
      });

      host.classList.remove('circuit-red', 'circuit-orange', 'circuit-green');
      host.classList.add(`circuit-${st.status}`);
      statusTxt.text(STATUS_LABEL[st.status]).attr('fill', `var(--${st.status === 'red' ? 'red' : st.status === 'orange' ? 'warn' : 'g'})`);
      const msg = (REASON_TEXT[st.reason] || REASON_TEXT.ok)();
      say.innerHTML = `${HINT[mode]}<br><b>${STATUS_LABEL[st.status]}</b> — ${msg}`;
      svg.attr('aria-label', `Multimètre en position ${mode === 'V' ? 'tension' : 'intensité'}. ${STATUS_LABEL[st.status]}.`);
    }

    function place(pointId) {
      if (placed.red === pointId) placed.red = null;
      if (placed.black === pointId) placed.black = null;
      placed[probe] = pointId;
      render();
    }

    ctl.querySelectorAll('[data-mode]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.mode;
        placed = { red: null, black: null };
        ctl.querySelectorAll('button').forEach((z) => z.classList.toggle('on', z === b));
        render();
      };
    });
    portCtl.querySelectorAll('[data-port]').forEach((b) => {
      b.onclick = () => {
        port = b.dataset.port;
        portCtl.querySelectorAll('button').forEach((z) => z.classList.toggle('on', z === b));
        render();
      };
    });
    probeCtl.querySelectorAll('[data-probe]').forEach((b) => {
      b.onclick = () => {
        probe = b.dataset.probe;
        probeCtl.querySelectorAll('button').forEach((z) => z.classList.toggle('on', z === b));
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
