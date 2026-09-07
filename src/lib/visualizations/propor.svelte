<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let haut = 8;
    const A = 5,
      B = 30;
    const { x, W, H } = cvs(host, 140);
    slider(host, "Eau dans le seau", 1, 20, 8, (v) => Math.round(v) + ' L', (v) => {
      haut = v;
    });
    readout(host, [
      { id: 'cK', k: 'coefficient (mL par L)', c: 'd' },
      { id: 'cP', k: 'produit à mettre', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const cur = new Spring(8, { k: 150, d: 22 });
    function draw() {
      const hv = cur.to(haut).step(),
        k = B / A,
        pv = hv * k;
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        rowY = [34, 88],
        cw = (R - L) / 2;
      const cell = (cx, cy, txt, col) => {
        x.strokeStyle = '#31473d';
        x.lineWidth = 1.4;
        x.fillStyle = 'rgba(255,255,255,.03)';
        rr(x, cx, cy, cw - 8, 32, 6);
        x.fill();
        x.stroke();
        x.fillStyle = col;
        x.font = 'bold 14px ' + SM;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillText(txt, cx + (cw - 8) / 2, cy + 16);
        x.textBaseline = 'alphabetic';
      };
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('eau (L)', L, rowY[0] - 5);
      x.fillText('produit (mL)', L, rowY[1] - 5);
      cell(L, rowY[0], String(A), '#8fa79b');
      cell(L + cw, rowY[0], fr(hv.toFixed(1)), '#7ef2b0');
      cell(L, rowY[1], String(B), '#8fa79b');
      cell(L + cw, rowY[1], fr(pv.toFixed(1)), '#ffd166');
      x.strokeStyle = '#46c288';
      x.lineWidth = 1.5;
      x.font = '10px ' + SM;
      x.textAlign = 'center';
      x.fillStyle = '#46c288';
      [L, L + cw].forEach((cx) => {
        const mid = cx + (cw - 8) / 2;
        x.beginPath();
        x.moveTo(mid, rowY[0] + 32);
        x.lineTo(mid, rowY[1]);
        x.stroke();
        x.fillText('× ' + fr(k.toFixed(0)), mid + 20, (rowY[0] + 32 + rowY[1]) / 2);
      });
      host.querySelector('#cK').textContent = fr(k.toFixed(0));
      host.querySelector('#cP').textContent = fr(pv.toFixed(1)) + ' mL';
      say.innerHTML = `Coefficient : ${B} ÷ ${A} = <b>${fr(k.toFixed(0))} mL par litre</b>. Pour ${fr(hv.toFixed(1))} L : ${fr(hv.toFixed(1))} × ${fr(k.toFixed(0))} = <b>${fr(pv.toFixed(1))} mL</b>. Le même coefficient relie toujours les deux lignes.`;
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
