<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, easeOut, easeBack, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();
  const _t = () => performance.now() / 1000;

  onMount(() => {
    let mode = 'part',
      n = 24,
      d = 4,
      revT0 = _t();
    const { x, W, H } = cvs(host, 200);
    const md = box(host, 'vctl', `<button data-m="part" class="on">Partager en ${d}</button><button data-m="grp">Grouper par ${d}</button>`);
    slider(host, 'Nombre de gobelets', 6, 36, 24, (v) => v + ' gobelets', (v) => {
      n = v;
    });
    readout(host, [
      { id: 'dO', k: 'opération', c: 'd' },
      { id: 'dQ', k: 'quotient' },
      { id: 'dR', k: 'reste', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      const t = easeOut((_t() - revT0) / 0.6);
      const N = Math.round(n),
        q = Math.floor(N / d),
        r = N - q * d;
      x.clearRect(0, 0, W, H);
      const nb = mode === 'part' ? d : q + (r ? 1 : 0);
      const per = mode === 'part' ? q : d;
      const cols = Math.min(nb, Math.ceil(Math.sqrt(nb * 2.2))) || 1,
        rows = Math.ceil(nb / cols);
      const pad = 10,
        bw = (W - 2 * pad - (cols - 1) * 7) / cols,
        bh = Math.min(66, (H - 34 - (rows - 1) * 8) / rows);
      let k = 0;
      for (let b = 0; b < nb; b++) {
        const c = b % cols,
          rw = Math.floor(b / cols);
        const bx = pad + c * (bw + 7),
          by = 14 + rw * (bh + 8);
        const isRest = mode === 'grp' && r && b === nb - 1;
        x.fillStyle = isRest ? 'rgba(255,209,102,.06)' : 'rgba(126,242,176,.045)';
        x.strokeStyle = isRest ? '#ffd166' : '#2b7d57';
        x.lineWidth = 1.3;
        rr(x, bx, by, bw, bh, 7);
        x.fill();
        x.stroke();
        const cnt = isRest ? r : per,
          cc = Math.min(cnt, Math.ceil(Math.sqrt(cnt * 1.7))) || 1;
        const rad = Math.max(3, Math.min(7, bw / (cc * 2.9)));
        for (let i = 0; i < cnt; i++) {
          const raw = t * N * 1.1 - k * 0.6;
          k++;
          if (raw <= 0) continue;
          const sc0 = raw >= 1 ? 1 : easeBack(raw);
          const px = bx + bw / 2 + ((i % cc) - (cc - 1) / 2) * (rad * 2.7);
          const py = by + bh / 2 + (Math.floor(i / cc) - (Math.ceil(cnt / cc) - 1) / 2) * (rad * 2.7);
          x.globalAlpha = Math.min(1, raw);
          x.fillStyle = isRest ? '#ffd166' : '#7ef2b0';
          x.beginPath();
          x.arc(px, py, rad * sc0, 0, 7);
          x.fill();
          x.globalAlpha = 1;
        }
        x.font = '10px ' + SM;
        x.fillStyle = '#63776d';
        x.textAlign = 'center';
        x.fillText(String(isRest ? r : per), bx + bw / 2, by + bh - 6);
      }
      x.font = '11px ' + SM;
      x.fillStyle = '#8fa79b';
      x.textAlign = 'center';
      x.fillText(mode === 'part' ? d + ' tables → ' + q + ' gobelets chacune' : 'paquets de ' + d + ' → ' + q + ' paquets', W / 2, H - 8);
      host.querySelector('#dO').textContent = N + ' ÷ ' + d;
      host.querySelector('#dQ').textContent = q;
      host.querySelector('#dR').textContent = r;
      say.innerHTML =
        mode === 'part'
          ? `<b>Partage :</b> ${N} gobelets pour ${d} tables → <b>${q}</b> par table${r ? `, et ${r} en trop` : ''}. La question est « combien pour chacun ? ».`
          : `<b>Groupement :</b> ${N} gobelets par paquets de ${d} → <b>${q}</b> paquets${r ? `, plus ${r} gobelet${r > 1 ? 's' : ''} qui ne font pas un paquet` : ''}. La question est « combien de paquets ? ».`;
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    md.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.m;
        revT0 = _t();
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
