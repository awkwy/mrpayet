<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let L = 6,
      l = 4;
    const { x, W, H } = cvs(host, 180);
    slider(host, 'Longueur', 2, 10, 6, (v) => Math.round(v) + ' m', (v) => {
      L = v;
    });
    slider(host, 'Largeur', 2, 8, 4, (v) => Math.round(v) + ' m', (v) => {
      l = v;
    });
    readout(host, [
      { id: 'gP', k: 'périmètre (le tour)', c: 'd' },
      { id: 'gA', k: 'aire (la surface)', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const sL = new Spring(6, { k: 150, d: 22 }),
      sl = new Spring(4, { k: 150, d: 22 });
    function draw() {
      const Lv = sL.to(L).step(),
        lv = sl.to(l).step();
      x.clearRect(0, 0, W, H);
      const pad = 34,
        sc = Math.min((W - 2 * pad) / 10, (H - 2 * pad) / 8);
      const w = Lv * sc,
        h = lv * sc,
        rx = (W - w) / 2,
        ry = (H - h) / 2;
      x.fillStyle = 'rgba(126,242,176,.10)';
      x.fillRect(rx, ry, w, h);
      x.strokeStyle = 'rgba(255,255,255,.10)';
      x.lineWidth = 1;
      for (let i = 1; i < Math.round(Lv); i++) {
        x.beginPath();
        x.moveTo(rx + i * sc, ry);
        x.lineTo(rx + i * sc, ry + h);
        x.stroke();
      }
      for (let j = 1; j < Math.round(lv); j++) {
        x.beginPath();
        x.moveTo(rx, ry + j * sc);
        x.lineTo(rx + w, ry + j * sc);
        x.stroke();
      }
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.5;
      x.strokeRect(rx, ry, w, h);
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText(fr(Lv.toFixed(1)) + ' m', rx + w / 2, ry - 10);
      x.save();
      x.translate(rx - 12, ry + h / 2);
      x.rotate(-Math.PI / 2);
      x.fillText(fr(lv.toFixed(1)) + ' m', 0, 0);
      x.restore();
      const P = 2 * (Math.round(Lv) + Math.round(lv)),
        A = Math.round(Lv) * Math.round(lv);
      host.querySelector('#gP').textContent = P + ' m';
      host.querySelector('#gA').textContent = A + ' m²';
      say.innerHTML =
        `Périmètre = 2 × (${Math.round(Lv)} + ${Math.round(lv)}) = <b>${P} m</b> de barrière. ` +
        `Aire = ${Math.round(Lv)} × ${Math.round(lv)} = <b>${A} m²</b> (compte les carreaux d'1 m²).`;
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
