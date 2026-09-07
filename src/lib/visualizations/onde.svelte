<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let f = 100,
      ph = 0;
    const { x, W, H } = cvs(host, 150);
    slider(host, 'Fréquence du son', 40, 2000, 100, (v) => Math.round(v) + ' Hz', (v) => {
      f = v;
    });
    readout(host, [
      { id: 'oF', k: 'fréquence', c: 'd' },
      { id: 'oT', k: 'période T = 1 ÷ f', c: 'w' },
      { id: 'oH', k: 'hauteur' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      ph += 0.03;
      x.clearRect(0, 0, W, H);
      const L = 14,
        R = W - 14,
        cy = H / 2 - 6,
        amp = H * 0.27;
      x.strokeStyle = 'rgba(255,255,255,.1)';
      x.setLineDash([3, 3]);
      x.beginPath();
      x.moveTo(L, cy);
      x.lineTo(R, cy);
      x.stroke();
      x.setLineDash([]);
      const cycles = 1.3 * Math.pow(f / 100, 0.6);
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.2;
      x.lineJoin = 'round';
      x.beginPath();
      for (let i = 0; i <= 220; i++) {
        const u = i / 220,
          yy = cy - Math.sin(u * cycles * Math.PI * 2 + ph) * amp;
        i ? x.lineTo(L + u * (R - L), yy) : x.moveTo(L + u * (R - L), yy);
      }
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'left';
      x.fillText('grave', L, H - 6);
      x.textAlign = 'right';
      x.fillText('aigu', R, H - 6);
      const gp = (Math.log(f) - Math.log(40)) / (Math.log(2000) - Math.log(40));
      x.fillStyle = '#ffd166';
      x.fillRect(L + gp * (R - L) - 1.5, H - 17, 3, 9);
      host.querySelector('#oF').textContent = Math.round(f) + ' Hz';
      host.querySelector('#oT').textContent = fr((1000 / f).toFixed(1000 / f < 10 ? 1 : 0)) + ' ms';
      host.querySelector('#oH').textContent = f < 250 ? 'son grave' : f < 800 ? 'son médium' : 'son aigu';
      say.innerHTML =
        `${Math.round(f)} vibrations par seconde. T = 1 ÷ ${Math.round(f)} = <b>${fr((1000 / f).toFixed(1))} ms</b>. ` +
        (f < 250
          ? `Fréquence basse &rarr; <b>son grave</b>, qui traverse bien les murs.`
          : f < 800
            ? `Fréquence moyenne.`
            : `Fréquence haute &rarr; <b>son aigu</b>, vite arrêté par un obstacle.`);
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
