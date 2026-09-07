<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let a = 7,
      b = 32,
      want = 1;
    const split = new Spring(1, { k: 120, bounce: true });
    const { x, W, H } = cvs(host, 200);
    slider(host, 'Premier facteur', 2, 9, 7, (v) => '× ' + v, (v) => {
      a = v;
    });
    slider(host, 'Deuxième facteur', 11, 49, 32, (v) => String(v), (v) => {
      b = v;
    });
    const ctl = box(host, 'vctl', `<button class="p" id="sp">Découper / recoller</button>`);
    readout(host, [
      { id: 'mA', k: 'partie des dizaines' },
      { id: 'mB', k: 'partie des unités', c: 'w' },
      { id: 'mT', k: 'total' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const A = Math.round(a),
        B = Math.round(b);
      const d = Math.floor(B / 10) * 10,
        u = B - d;
      x.clearRect(0, 0, W, H);
      const L = 34,
        T = 26,
        RW = W - L - 16,
        RH = H - T - 40;
      const SP = split.to(want).step(),
        gap = SP * 16,
        wd = (RW - gap) * (d / b),
        wu = (RW - gap) * (u / b);
      x.fillStyle = 'rgba(126,242,176,.17)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 1.6;
      rr(x, L, T, wd, RH, 4);
      x.fill();
      x.stroke();
      x.fillStyle = 'rgba(255,209,102,.17)';
      x.strokeStyle = '#ffd166';
      rr(x, L + wd + gap, T, Math.max(3, wu), RH, 4);
      x.fill();
      x.stroke();
      x.strokeStyle = 'rgba(255,255,255,.07)';
      x.lineWidth = 1;
      for (let i = 1; i < A; i++) {
        const y = T + (i * RH) / A;
        x.beginPath();
        x.moveTo(L, y);
        x.lineTo(L + wd, y);
        x.moveTo(L + wd + gap, y);
        x.lineTo(L + wd + gap + wu, y);
        x.stroke();
      }
      x.font = 'bold 15px ' + SM;
      x.textAlign = 'center';
      x.fillStyle = '#7ef2b0';
      if (wd > 44) x.fillText(String(A * d), L + wd / 2, T + RH / 2);
      x.fillStyle = '#ffd166';
      if (wu > 40) x.fillText(String(A * u), L + wd + gap + wu / 2, T + RH / 2);
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText(String(d), L + wd / 2, T - 11);
      if (wu > 14) x.fillText(String(u), L + wd + gap + wu / 2, T - 11);
      x.save();
      x.translate(15, T + RH / 2);
      x.rotate(-Math.PI / 2);
      x.textAlign = 'center';
      x.fillText(String(a), 0, 0);
      x.restore();
      x.textAlign = 'center';
      x.fillStyle = '#63776d';
      x.fillText(A + ' × ' + B + ' = ' + A * d + ' + ' + A * u + ' = ' + A * B, W / 2, H - 12);
      host.querySelector('#mA').textContent = A + ' × ' + d + ' = ' + A * d;
      host.querySelector('#mB').textContent = A + ' × ' + u + ' = ' + A * u;
      host.querySelector('#mT').textContent = String(A * B);
      say.innerHTML = `Je coupe <b>${B}</b> en <b>${d} + ${u}</b>. L'aire du grand rectangle est la somme des deux morceaux : ${A * d} + ${A * u} = <b>${A * B}</b>. Aucune table au-delà de 10 n'est nécessaire.`;
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    ctl.querySelector('#sp').onclick = () => {
      want = want > 0.5 ? 0 : 1;
    };
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
