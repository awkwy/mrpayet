<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let m = 25,
      sol = 250;
    const { x, W, H } = cvs(host, 200);
    slider(host, "Masse de l'objet", 5, 60, 25, (v) => Math.round(v) + ' kg', (v) => {
      m = v;
    });
    slider(host, 'Force du support (vers le haut)', 0, 700, 250, (v) => Math.round(v) + ' N', (v) => {
      sol = v;
    });
    readout(host, [
      { id: 'fP', k: 'poids P = m × 10', c: 'w' },
      { id: 'fS', k: 'force du support', c: 'd' },
      { id: 'fB', k: 'bilan' }
    ]);
    const say = box(host, 'say', '');
    const sm = new Spring(25, { k: 150, d: 22 }),
      ss = new Spring(250, { k: 150, d: 22 }),
      off = new Spring(0, { k: 90, d: 12 });
    function draw() {
      const mv = sm.to(m).step(),
        P = mv * 10,
        Sv = ss.to(sol).step();
      const net = Sv - P;
      off.to(Math.max(-1, Math.min(1, net / 300)) * 22);
      const oy = off.step();
      x.clearRect(0, 0, W, H);
      const cx = W / 2,
        cy = H / 2 + oy,
        bw = 64,
        bh = 44;
      x.strokeStyle = '#31473d';
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(20, H - 24);
      x.lineTo(W - 20, H - 24);
      x.stroke();
      x.fillStyle = 'rgba(126,242,176,.14)';
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 2;
      rr(x, cx - bw / 2, cy - bh / 2, bw, bh, 6);
      x.fill();
      x.stroke();
      x.font = '11px ' + SM;
      x.fillStyle = '#e7efe9';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText(Math.round(mv) + ' kg', cx, cy);
      x.textBaseline = 'alphabetic';
      const arr = (x0, y0, len, col, lab) => {
        x.strokeStyle = col;
        x.fillStyle = col;
        x.lineWidth = 2.5;
        x.beginPath();
        x.moveTo(x0, y0);
        x.lineTo(x0, y0 + len);
        x.stroke();
        const d = Math.sign(len);
        x.beginPath();
        x.moveTo(x0, y0 + len);
        x.lineTo(x0 - 4, y0 + len - 6 * d);
        x.lineTo(x0 + 4, y0 + len - 6 * d);
        x.closePath();
        x.fill();
        x.font = '10px ' + SM;
        x.textAlign = 'left';
        x.fillText(lab, x0 + 7, y0 + len / 2);
      };
      arr(cx - 14, cy + bh / 2, 12 + P / 9, '#ffd166', 'P = ' + Math.round(P) + ' N');
      arr(cx + 14, cy - bh / 2, -(12 + Sv / 9), '#7ec8f2', Math.round(Sv) + ' N');
      host.querySelector('#fP').textContent = Math.round(P) + ' N';
      host.querySelector('#fS').textContent = Math.round(Sv) + ' N';
      const be = host.querySelector('#fB');
      be.textContent = Math.abs(net) < 8 ? 'équilibre' : net > 0 ? 'se soulève' : "s'enfonce / tombe";
      be.className = 'v ' + (Math.abs(net) < 8 ? '' : 'r');
      say.innerHTML =
        Math.abs(net) < 8
          ? `Les <b>deux forces</b> ont la <b>même valeur</b> (${Math.round(P)} N), la <b>même droite d'action</b> et des <b>sens opposés</b> : l'objet est en <b>équilibre</b>, il ne bouge pas.`
          : net > 0
            ? `Le support pousse plus fort (${Math.round(Sv)} N) que le poids (${Math.round(P)} N) : déséquilibre vers le haut.`
            : `Le poids (${Math.round(P)} N) l'emporte sur le support (${Math.round(Sv)} N) : l'objet n'est pas soutenu.`;
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
