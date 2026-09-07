<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let nb = 18;
    const h1 = new Spring(0, { k: 135, bounce: true }),
      h2 = new Spring(0, { k: 135, bounce: true });
    const { x, W, H } = cvs(host, 200);
    slider(host, "Nombre d'enfants", 6, 30, 18, (v) => v + ' enfants', (v) => {
      nb = v;
    });
    readout(host, [
      { id: 'bE', k: 'encadrement 1 pour 6' },
      { id: 'bT', k: 'conducteurs', c: 'w' },
      { id: 'bR', k: 'adultes retenus' }
    ]);
    const say = box(host, 'say', '');
    const PLACES = [4, 4, 4, 6];
    function need(N) {
      const enc = Math.ceil(N / 6);
      let rest = N,
        veh = 0;
      for (const p of PLACES) {
        if (rest <= 0) break;
        rest -= p;
        veh++;
      }
      const cond = rest > 0 ? null : veh;
      return { enc, cond, veh };
    }
    function draw() {
      const N = Math.round(nb);
      const { enc, cond } = need(N);
      const t1 = enc,
        t2 = cond === null ? 0 : cond;
      const H1 = h1.to(t1).step(),
        H2 = h2.to(t2).step();
      x.clearRect(0, 0, W, H);
      const base = H - 40,
        top = 22,
        maxV = 6,
        u = (base - top) / maxV;
      const bw = Math.min(74, W * 0.2),
        x1 = W * 0.3 - bw / 2,
        x2 = W * 0.7 - bw / 2;
      x.strokeStyle = 'rgba(255,255,255,.1)';
      x.lineWidth = 1;
      for (let i = 0; i <= maxV; i++) {
        const y = base - i * u;
        x.beginPath();
        x.moveTo(18, y);
        x.lineTo(W - 18, y);
        x.stroke();
        x.font = '10px ' + SM;
        x.fillStyle = '#3f5049';
        x.textAlign = 'left';
        x.fillText(i, 4, y);
      }
      const win = cond === null ? 0 : t1 >= t2 ? 1 : 2;
      [
        [x1, H1, '#46c288', 1],
        [x2, H2, '#ffd166', 2]
      ].forEach(([px, hv, col, id]) => {
        const hh = hv * u;
        x.fillStyle = win === id ? col : 'rgba(255,255,255,.13)';
        rr(x, px, base - hh, bw, hh, 5);
        x.fill();
        if (win === id) {
          x.strokeStyle = col;
          x.lineWidth = 2;
          x.stroke();
        }
      });
      const M = Math.max(t1, t2);
      if (cond !== null) {
        x.strokeStyle = '#7ef2b0';
        x.setLineDash([6, 5]);
        x.lineWidth = 2;
        const y = base - Math.max(H1, H2) * u;
        x.beginPath();
        x.moveTo(18, y);
        x.lineTo(W - 18, y);
        x.stroke();
        x.setLineDash([]);
        x.font = 'bold 12px ' + SM;
        x.fillStyle = '#7ef2b0';
        x.textAlign = 'right';
        x.fillText(M + ' adultes', W - 20, y - 13);
      }
      x.font = '11px ' + SM;
      x.textAlign = 'center';
      x.fillStyle = '#46c288';
      x.fillText('encadrement', x1 + bw / 2, base + 16);
      x.fillStyle = '#ffd166';
      x.fillText('conduite', x2 + bw / 2, base + 16);
      host.querySelector('#bE').textContent = enc;
      host.querySelector('#bT').textContent = cond === null ? '—' : cond;
      host.querySelector('#bR').textContent = cond === null ? '—' : M;
      say.innerHTML =
        cond === null
          ? `<b>${N} enfants</b> pour 18 places seulement : aucun transport possible, le nombre de conducteurs n'a plus de sens.`
          : `Encadrement : ${N} ÷ 6 → <b>${enc}</b>. Conduite : ${cond} véhicule${cond > 1 ? 's' : ''} → <b>${cond}</b>. On retient <b>le plus grand : ${M}</b>` +
            (M > Math.min(enc, cond)
              ? `, et la règle la moins exigeante (${Math.min(enc, cond)}) est alors couverte elle aussi.`
              : ` — les deux règles tombent d'accord.`);
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
