<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let k = 2;
    const { x, W, H } = cvs(host, 190);
    slider(host, "Rapport d'agrandissement k", 0.5, 3, 2, (z) => '× ' + fr(z.toFixed(1)), (z) => {
      k = z;
    });
    readout(host, [
      { id: 'agL', k: 'longueurs', c: 'd' },
      { id: 'agA', k: 'aires', c: 'w' },
      { id: 'agV', k: 'volumes', c: 'r' }
    ]);
    const say = box(host, 'say', '');
    const sk = new Spring(2, { k: 140, d: 22 });
    function draw() {
      const K = sk.to(k).step();
      x.clearRect(0, 0, W, H);
      const base = 28,
        x0 = 24,
        y0 = H - 26;
      x.strokeStyle = 'rgba(255,255,255,.3)';
      x.lineWidth = 1.5;
      x.strokeRect(x0, y0 - base * 0.7, base, base * 0.7);
      x.font = '9px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText("d'origine", x0, y0 + 12);
      const w = base * K,
        hh = base * 0.7 * K;
      x.fillStyle = 'rgba(126,242,176,.10)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2;
      x.fillRect(x0 + base + 22, y0 - hh, w, hh);
      x.strokeRect(x0 + base + 22, y0 - hh, w, hh);
      x.fillStyle = '#7ef2b0';
      x.fillText('× ' + fr(K.toFixed(1)), x0 + base + 22, y0 + 12);
      const bx = W - 118,
        bw = 100;
      [
        ['longueur', K, '#8fa79b', 0],
        ['aire', K * K, '#7ef2b0', 1],
        ['volume', K * K * K, '#e2725b', 2]
      ].forEach(([lab, val, col, i]) => {
        const yy = 22 + i * 26,
          ww = Math.min(bw, (bw * val) / 12);
        x.fillStyle = col;
        rr(x, bx, yy, Math.max(3, ww), 16, 4);
        x.fill();
        x.font = '10px ' + SM;
        x.fillStyle = '#0a0e0c';
        x.textAlign = 'left';
        if (ww > 44) x.fillText('× ' + fr(val.toFixed(1)), bx + 6, yy + 8);
        x.fillStyle = '#63776d';
        x.textAlign = 'right';
        x.fillText(lab, bx - 6, yy + 9);
      });
      host.querySelector('#agL').textContent = '× ' + fr(K.toFixed(2));
      host.querySelector('#agA').textContent = '× ' + fr((K * K).toFixed(2));
      host.querySelector('#agV').textContent = '× ' + fr((K * K * K).toFixed(2));
      say.innerHTML =
        `Quand on multiplie les <b>longueurs</b> par ${fr(K.toFixed(1))}, les <b>aires</b> sont multipliées par ${fr(K.toFixed(1))}² = <b>${fr((K * K).toFixed(2))}</b> et les <b>volumes</b> par ${fr(K.toFixed(1))}³ = <b>${fr((K * K * K).toFixed(2))}</b>. ` +
        (K < 1
          ? `Ici <b>k < 1</b> : c'est une <b>réduction</b>. Sur une maquette, les surfaces sont ${fr((1 / (K * K)).toFixed(0))} fois plus petites, les volumes ${fr((1 / (K * K * K)).toFixed(0))} fois.`
          : `Ici <b>k > 1</b> : c'est un <b>agrandissement</b>. Doubler les longueurs (k = 2) multiplie déjà le volume par 8.`);
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
