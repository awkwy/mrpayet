<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let S = 21,
      per = 3;
    const kids = [];
    const { x, W, H } = cvs(host, 200);
    const md = box(
      host,
      'vctl',
      [
        ['Salle Soleil', 21],
        ['Salle Lune', 45]
      ]
        .map(([t, v]) => `<button data-s="${v}">${t} · ${v} m²</button>`)
        .join('')
    );
    slider(host, 'Surface de la salle', 9, 60, 21, (v) => v + ' m²', (v) => {
      S = v;
    });
    readout(host, [
      { id: 'sS', k: 'surface', c: 'd' },
      { id: 'sC', k: 'capacité (≤ S ÷ 3)' },
      { id: 'sX', k: 'm² par enfant', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      x.clearRect(0, 0, W, H);
      const Sr = Math.round(S),
        cap = Math.floor(S / per);
      while (kids.length < cap) kids.push(new Spring(0, { k: 150, bounce: true }));
      const maxA = 60,
        sc = Math.sqrt(S / maxA);
      const rw = (W - 40) * sc,
        rh = (H - 52) * sc,
        rx = (W - rw) / 2,
        ry = (H - 30 - rh) / 2 + 4;
      x.fillStyle = 'rgba(126,242,176,.05)';
      x.strokeStyle = '#2b7d57';
      x.lineWidth = 2;
      rr(x, rx, ry, rw, rh, 6);
      x.fill();
      x.stroke();
      const cols = Math.max(1, Math.round(Math.sqrt(cap * (rw / Math.max(1, rh)))));
      const rows = Math.ceil(cap / cols),
        cw = rw / cols,
        ch = rh / Math.max(1, rows);
      x.strokeStyle = 'rgba(255,255,255,.07)';
      x.lineWidth = 1;
      for (let i = 1; i < cols; i++) {
        x.beginPath();
        x.moveTo(rx + i * cw, ry);
        x.lineTo(rx + i * cw, ry + rh);
        x.stroke();
      }
      for (let j = 1; j < rows; j++) {
        x.beginPath();
        x.moveTo(rx, ry + j * ch);
        x.lineTo(rx + rw, ry + j * ch);
        x.stroke();
      }
      kids.forEach((sp, i) => sp.to(i < cap ? 1 : 0));
      for (let i = 0; i < kids.length; i++) {
        const a = kids[i].step();
        if (a < 0.01) continue;
        const c = i % cols,
          r0 = Math.floor(i / cols);
        const px = rx + c * cw + cw / 2,
          py = ry + r0 * ch + ch / 2;
        x.globalAlpha = Math.min(1, a);
        x.fillStyle = '#7ef2b0';
        const rad = Math.min(cw, ch) * 0.21 * Math.min(1.15, a);
        x.beginPath();
        x.arc(px, py - rad * 0.6, rad * 0.62, 0, 7);
        x.fill();
        rr(x, px - rad * 0.6, py + rad * 0.1, rad * 1.2, rad * 1.3, rad * 0.4);
        x.fill();
        x.globalAlpha = 1;
      }
      x.font = '11px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      x.fillText(Sr + ' m²', W / 2, ry + rh + 16);
      host.querySelector('#sS').textContent = Sr + ' m²';
      host.querySelector('#sC').textContent = cap + ' enfants';
      host.querySelector('#sX').textContent = fr((Sr / Math.max(1, cap)).toFixed(1)) + ' m²';
      say.innerHTML =
        `${Sr} ÷ ${per} = ${fr((Sr / per).toFixed(2))} → la salle accueille au plus <b>${cap} enfants</b>. ` +
        (Sr % per
          ? `Les ${Sr - cap * per} m² qui restent ne suffisent pas pour un enfant de plus.`
          : `La division tombe juste.`);
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    md.querySelectorAll('[data-s]').forEach((b) => {
      b.onclick = () => {
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        const inp = host.querySelector('input[type=range]');
        if (inp) {
          inp.value = b.dataset.s;
          inp.dispatchEvent(new Event('input'));
        }
      };
    });
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
