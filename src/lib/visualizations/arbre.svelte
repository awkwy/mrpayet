<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, rr, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const C = ['Pile', 'Face'],
      D = [1, 2, 3, 4];
    let grown = 10,
      ev = 'p';
    const leaves = [];
    C.forEach((c, i) => D.forEach((d, j) => leaves.push({ c, d, i, j })));
    const fav = (l) => (ev === 'p' ? l.c === 'Pile' : ev === 'd' ? l.d === 4 : l.c === 'Pile' && l.d === 4);
    const { x, W, H } = cvs(host, 196);
    const evb = box(
      host,
      'vctl',
      `<button data-e="p" class="on">« Pile »</button><button data-e="d">« obtenir un 4 »</button><button data-e="pd">« Pile et 4 »</button>`
    );
    const ctl = box(host, 'vctl', `<button class="p" id="bd">&#8635; Revoir la construction</button>`);
    readout(host, [
      { id: 'aT2', k: 'issues au total', c: 'd' },
      { id: 'aF2', k: 'issues favorables', c: 'w' },
      { id: 'aP2', k: 'probabilité' }
    ]);
    const tb = box(host, '', '');
    const say = box(host, 'say', '');
    function draw() {
      x.clearRect(0, 0, W, H);
      x.font = '12px ' + SM;
      const x0 = 30,
        x1 = Math.min(120, W * 0.3),
        x2 = Math.min(W - 96, W * 0.62),
        cy = H / 2;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      x.fillText('départ', x0, cy - 20);
      x.fillStyle = '#7ef2b0';
      x.beginPath();
      x.arc(x0, cy, 5, 0, 7);
      x.fill();
      C.forEach((c, i) => {
        const y1 = cy + (i ? 62 : -62),
          on1 = grown >= 1;
        x.strokeStyle = on1 ? '#46c288' : '#24352e';
        x.lineWidth = 2;
        x.beginPath();
        x.moveTo(x0, cy);
        x.lineTo(x1, y1);
        x.stroke();
        if (on1) {
          x.fillStyle = '#e7efe9';
          x.textAlign = 'center';
          x.fillText(c, x1, y1 - 14);
          x.fillStyle = '#46c288';
          x.beginPath();
          x.arc(x1, y1, 4.5, 0, 7);
          x.fill();
        }
        D.forEach((d, j) => {
          const idx = i * 4 + j,
            on2 = grown >= 2 + idx,
            y2 = y1 + (j - 1.5) * 30;
          x.strokeStyle = on2 ? '#365046' : '#1a2621';
          x.lineWidth = 1.5;
          x.beginPath();
          x.moveTo(x1, y1);
          x.lineTo(x2, y2);
          x.stroke();
          if (on2) {
            const l = leaves[idx],
              f = grown >= 10 && fav(l),
              bw = Math.min(78, W - x2 - 12);
            x.fillStyle = f ? '#ffd166' : '#16211d';
            x.strokeStyle = f ? '#ffd166' : '#365046';
            x.lineWidth = 1.4;
            rr(x, x2 + 4, y2 - 11, bw, 22, 6);
            x.fill();
            x.stroke();
            x.fillStyle = f ? '#04120a' : '#8fa79b';
            x.textAlign = 'center';
            x.fillText(l.c[0] + ' · ' + l.d, x2 + 4 + bw / 2, y2);
          }
        });
      });
    }
    function tbl() {
      const rows = C.map(
        (c) =>
          `<tr><th style="color:${(ev === 'p' && c === 'Pile') || (ev === 'pd' && c === 'Pile') ? 'var(--warn)' : 'var(--g2)'}">${c.toUpperCase()}</th>` +
          D.map((d) => {
            const f = grown >= 10 && fav({ c, d });
            return `<td style="text-align:center;${f ? 'background:rgba(255,209,102,.18);color:var(--warn);font-weight:700' : ''}">${c[0]}${d}</td>`;
          }).join('') +
          '</tr>'
      ).join('');
      tb.innerHTML = `<p style="font-size:12.5px;color:var(--dim);margin:14px 0 6px">Le même dénombrement, en <b style="color:var(--tx)">tableau à double entrée</b> :</p>
      <div class="doc"><div class="sc"><table class="t"><tr><th></th>${D.map((d) => `<th style="text-align:center">${d}</th>`).join('')}</tr>${rows}</table></div></div>`;
    }
    function upd() {
      const f = leaves.filter(fav).length;
      host.querySelector('#aT2').textContent = grown >= 10 ? '8' : '—';
      host.querySelector('#aF2').textContent = grown >= 10 ? f : '—';
      host.querySelector('#aP2').textContent = grown >= 10 ? f + '/8 = ' + fr((f / 8).toFixed(3)) : '—';
      if (grown >= 10)
        say.innerHTML = `2 issues pour la pièce × 4 pour le dé = <b>8 issues</b> au total. L'événement en compte <b style="color:var(--warn)">${f}</b> : P = ${f}/8 = ${fr((f / 8).toFixed(3))}.`;
      draw();
      tbl();
    }
    ctl.querySelector('#bd').onclick = () => {
      grown = 0;
      upd();
      let f0 = 0;
      const step = () => {
        f0++;
        if (f0 % 3 === 0) {
          grown++;
          draw();
          tbl();
        }
        if (grown < 10) loop.raf(step);
        else upd();
      };
      loop.raf(step);
    };
    evb.querySelectorAll('[data-e]').forEach((b) => {
      b.onclick = () => {
        ev = b.dataset.e;
        evb.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        if (grown >= 10) upd();
        else draw();
      };
    });
    upd();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
