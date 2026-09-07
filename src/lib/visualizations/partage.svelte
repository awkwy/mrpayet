<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let p = 70;
    const cur = new Spring(70, { k: 175, bounce: true });
    const TOT = 276;
    const { x, W, H } = cvs(host, 170);
    slider(host, 'Part de M. Ali', 0, 100, 70, (v) => v + ' %', (v) => {
      p = v;
    });
    readout(host, [
      { id: 'pA', k: 'M. Ali' },
      { id: 'pB', k: 'Mme Bacar', c: 'w' },
      { id: 'pS', k: 'somme des parts', c: 'd' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const C = cur.to(p).step();
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        w = R - L,
        y = 54,
        h = 44;
      const a = (TOT * C) / 100,
        b = TOT - a,
        wa = (w * C) / 100;
      x.fillStyle = '#46c288';
      rr(x, L, y, Math.max(1, wa), h, 6);
      x.fill();
      x.fillStyle = '#ffd166';
      rr(x, L + wa, y, Math.max(1, w - wa), h, 6);
      x.fill();
      x.strokeStyle = '#0a0e0c';
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(L + wa, y - 2);
      x.lineTo(L + wa, y + h + 2);
      x.stroke();
      x.font = 'bold 13px ' + SM;
      x.fillStyle = '#04120a';
      x.textAlign = 'center';
      if (wa > 66) x.fillText(fr(a.toFixed(2)) + ' €', L + wa / 2, y + h / 2);
      if (w - wa > 66) x.fillText(fr(b.toFixed(2)) + ' €', L + wa + (w - wa) / 2, y + h / 2);
      x.font = '11px ' + SM;
      x.textAlign = 'left';
      x.fillStyle = '#46c288';
      x.fillText('M. Ali  ' + Math.round(C) + ' %', L, y - 14);
      x.textAlign = 'right';
      x.fillStyle = '#ffd166';
      x.fillText(100 - Math.round(C) + ' %  Mme Bacar', R, y - 14);
      x.fillStyle = 'rgba(255,255,255,.07)';
      rr(x, L, y + h + 16, w, 20, 5);
      x.fill();
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText('total à payer : ' + TOT + ' € — inchangé', W / 2, y + h + 26);
      host.querySelector('#pA').textContent = fr(a.toFixed(2)) + ' €';
      host.querySelector('#pB').textContent = fr(b.toFixed(2)) + ' €';
      host.querySelector('#pS').textContent = fr((a + b).toFixed(2)) + ' €';
      say.innerHTML = `${TOT} × ${fr((C / 100).toFixed(2))} = <b>${fr(a.toFixed(2))} €</b> pour M. Ali, ${TOT} × ${fr(((100 - C) / 100).toFixed(2))} = <b>${fr(b.toFixed(2))} €</b> pour Mme Bacar. La somme redonne toujours <b>${TOT} €</b> : c'est la vérification.`;
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
