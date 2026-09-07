<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let k = 1;
    const { x, W, H } = cvs(host, 220);
    slider(host, 'Coefficient k dans f(x) = k·x²', -3, 3, 1, (z) => 'k = ' + fr(z.toFixed(1)), (z) => {
      k = z === 0 ? 0.01 : z;
    });
    readout(host, [
      { id: 'pae', k: 'f(x)', c: 'd' },
      { id: 'pa2', k: 'f(2)', c: 'w' },
      { id: 'pas', k: 'sommet' }
    ]);
    const say = box(host, 'say', '');
    const sk = new Spring(1, { k: 150, d: 22 });
    function draw() {
      const K = sk.to(k).step();
      x.clearRect(0, 0, W, H);
      const cx = W / 2,
        L = 20,
        R = W - 14,
        T = 12,
        B = 14,
        YL = 14;
      const sx = (v) => cx + (v / 4.2) * ((R - L) / 2);
      const sy = (v) => (H - B) / 2 - (v / YL) * ((H - B - T) / 2) + T / 2 + (H - B - T) / 4;
      x.strokeStyle = 'rgba(255,255,255,.18)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(L, sy(0));
      x.lineTo(R, sy(0));
      x.moveTo(cx, T);
      x.lineTo(cx, H - B);
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      [-4, -2, 2, 4].forEach((v) => x.fillText(v, sx(v), sy(0) + 13));
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.6;
      x.lineJoin = 'round';
      x.beginPath();
      let started = false;
      for (let v = -4.2; v <= 4.2; v += 0.1) {
        const yy = K * v * v;
        const py = sy(yy);
        if (py < T || py > H - B) {
          started = false;
          continue;
        }
        if (!started) {
          x.moveTo(sx(v), py);
          started = true;
        } else x.lineTo(sx(v), py);
      }
      x.stroke();
      x.fillStyle = '#ffd166';
      x.beginPath();
      x.arc(cx, sy(0), 4.5, 0, 7);
      x.fill();
      host.querySelector('#pae').textContent = fr(K.toFixed(1)) + ' x²';
      host.querySelector('#pa2').textContent = fr((K * 4).toFixed(1));
      host.querySelector('#pas').textContent = '(0 ; 0)';
      say.innerHTML =
        Math.abs(K) < 0.05
          ? `k proche de 0 : la parabole est presque plate.`
          : `<b>f(x) = ${fr(K.toFixed(1))} x²</b>. ` +
            (K > 0
              ? `k > 0 : la parabole est <b>tournée vers le haut</b>, elle a un <b>minimum</b> en (0 ; 0) — décroissante puis croissante.`
              : `k < 0 : la parabole est <b>tournée vers le bas</b>, elle a un <b>maximum</b> en (0 ; 0).`) +
            ` Plus |k| est grand, plus elle est <b>resserrée</b>. f(2) = ${fr(K.toFixed(1))} × 4 = ${fr((K * 4).toFixed(1))}.`;
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
