<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, rr, easeOut, easeBack, clamp01, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();
  const _t = () => performance.now() / 1000;

  onMount(() => {
    let nb = 19,
      n = 6,
      growT0 = _t();
    const { x, W, H } = cvs(host, 190);
    const md = box(
      host,
      'vctl',
      [5, 6, 8].map((v) => `<button data-n="${v}"${v === 6 ? ' class="on"' : ''}>1 adulte pour ${v}</button>`).join('')
    );
    slider(host, "Nombre d'enfants", 1, 30, 19, (v) => v + ' enfants', (v) => {
      nb = v;
    });
    readout(host, [
      { id: 'tD', k: 'division exacte', c: 'd' },
      { id: 'tA', k: 'adultes nécessaires' },
      { id: 'tR', k: 'dernier groupe', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    function draw() {
      x.clearRect(0, 0, W, H);
      const grow = easeOut((_t() - growT0) / 0.75);
      const N = Math.round(nb),
        groups = Math.ceil(N / n),
        rest = N - (groups - 1) * n;
      const gap = 9,
        gw = (W - 24 - gap * (groups - 1)) / groups,
        r = Math.min(9, gw / (Math.min(n, 4) * 2.4));
      for (let g = 0; g < groups; g++) {
        const gx = 12 + g * (gw + gap),
          full = g < groups - 1 ? n : rest,
          partial = g === groups - 1 && rest < n;
        x.fillStyle = partial ? 'rgba(255,209,102,.07)' : 'rgba(126,242,176,.05)';
        x.strokeStyle = partial ? '#ffd166' : '#2b7d57';
        x.lineWidth = 1.4;
        rr(x, gx, 18, gw, 104, 8);
        x.fill();
        x.stroke();
        const cols = Math.min(n, Math.ceil(Math.sqrt(n * 1.6))) || 1;
        for (let i = 0; i < n; i++) {
          const cx0 = gx + gw / 2 + ((i % cols) - (cols - 1) / 2) * (r * 2.5);
          const cy0 = 44 + Math.floor(i / cols) * (r * 2.6);
          const has = i < full,
            raw = grow * (groups + 0.9) - g,
            app = raw <= 0 ? 0 : raw >= 1 ? 1 : easeBack(raw);
          x.beginPath();
          x.arc(cx0, cy0, r * (has ? app : 1), 0, 7);
          x.fillStyle = has ? '#7ef2b0' : 'rgba(255,255,255,.06)';
          x.fill();
          if (!has) {
            x.strokeStyle = 'rgba(255,255,255,.13)';
            x.lineWidth = 1;
            x.stroke();
          }
        }
        const ay = 134,
          av = clamp01(grow * (groups + 0.9) - g);
        x.globalAlpha = av;
        x.fillStyle = partial ? '#ffd166' : '#46c288';
        x.beginPath();
        x.arc(gx + gw / 2, ay, 6.5, 0, 7);
        x.fill();
        rr(x, gx + gw / 2 - 6, ay + 7, 12, 13, 4);
        x.fill();
        x.globalAlpha = 1;
        x.font = '11px ' + SM;
        x.fillStyle = partial ? '#ffd166' : '#63776d';
        x.textAlign = 'center';
        x.fillText(full + '/' + n, gx + gw / 2, H - 12);
      }
      const ex = N / n;
      host.querySelector('#tD').textContent = N + ' ÷ ' + n + ' = ' + fr(ex.toFixed(2));
      host.querySelector('#tA').textContent = groups;
      host.querySelector('#tR').textContent = rest + '/' + n;
      say.innerHTML =
        rest === n
          ? `${N} ÷ ${n} = <b>${groups}</b> tout juste : les groupes sont pleins, il faut <b>${groups} adultes</b>.`
          : `${N} ÷ ${n} = ${fr(ex.toFixed(2))}. Le dernier groupe n'a que <b>${rest} enfant${rest > 1 ? 's' : ''}</b> — il lui faut quand même un adulte. On arrondit <b>vers le haut</b> : <b>${groups} adultes</b>.`;
    }
    function tick() {
      draw();
      loop.raf(tick);
    }
    md.querySelectorAll('[data-n]').forEach((b) => {
      b.onclick = () => {
        n = +b.dataset.n;
        growT0 = _t();
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
