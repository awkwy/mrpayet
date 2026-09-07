<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let a = 3,
      b = 4;
    const { x, W, H } = cvs(host, 200);
    slider(host, 'Côté vertical', 1, 6, 3, (v) => Math.round(v) + ' m', (v) => {
      a = v;
    });
    slider(host, 'Côté horizontal', 1, 8, 4, (v) => Math.round(v) + ' m', (v) => {
      b = v;
    });
    readout(host, [
      { id: 'yA', k: 'a² + b²', c: 'd' },
      { id: 'yC', k: 'hypoténuse c', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const sa = new Spring(3, { k: 150, d: 22 }),
      sb = new Spring(4, { k: 150, d: 22 });
    function draw() {
      const av = sa.to(a).step(),
        bv = sb.to(b).step(),
        cv = Math.hypot(av, bv);
      x.clearRect(0, 0, W, H);
      const pad = 40,
        sc = Math.min((W - 2 * pad) / 8, (H - 2 * pad) / 6);
      const ox = pad + 8,
        oy = H - pad;
      const A = [ox, oy],
        B = [ox + bv * sc, oy],
        C = [ox, oy - av * sc];
      x.fillStyle = 'rgba(126,242,176,.10)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2.4;
      x.beginPath();
      x.moveTo(...A);
      x.lineTo(...B);
      x.lineTo(...C);
      x.closePath();
      x.fill();
      x.stroke();
      x.strokeStyle = '#ffd166';
      x.lineWidth = 1.6;
      x.strokeRect(ox, oy - 12, 12, 12);
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText(fr(bv.toFixed(1)), (A[0] + B[0]) / 2, oy + 16);
      x.save();
      x.translate(ox - 14, (A[1] + C[1]) / 2);
      x.rotate(-Math.PI / 2);
      x.fillText(fr(av.toFixed(1)), 0, 0);
      x.restore();
      x.fillStyle = '#ffd166';
      x.fillText('c = ' + fr(cv.toFixed(2)), (B[0] + C[0]) / 2 + 14, (B[1] + C[1]) / 2 - 6);
      const ar = Math.round(av),
        br = Math.round(bv),
        sum = ar * ar + br * br;
      host.querySelector('#yA').textContent = ar + '² + ' + br + '² = ' + sum;
      host.querySelector('#yC').textContent = '√' + sum + ' = ' + fr(Math.sqrt(sum).toFixed(2)) + ' m';
      const nice = Number.isInteger(Math.sqrt(sum));
      say.innerHTML =
        `a² + b² = ${ar}² + ${br}² = ${ar * ar} + ${br * br} = <b>${sum}</b>. ` +
        `Donc c = √${sum} = <b>${fr(Math.sqrt(sum).toFixed(2))} m</b>. ` +
        (nice ? (ar === 3 && br === 4 ? 'C\'est le fameux triangle <b>3-4-5</b> des maçons.' : "L'hypoténuse tombe juste.") : '');
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
