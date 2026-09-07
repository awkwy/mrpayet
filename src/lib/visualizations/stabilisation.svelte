<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const P = 1 / 6,
      TOP = 0.5;
    let n = 0,
      h = 0,
      pts = [],
      playing = false;
    const { x, W, H } = cvs(host, 215);
    const ctl = box(
      host,
      'vctl',
      `<button class="p" id="pl">&#9654; Lancer en continu</button><button id="p1">+100 d'un coup</button><button class="gh" id="rz">Recommencer</button>`
    );
    readout(host, [
      { id: 'bF', k: 'fréquence observée' },
      { id: 'bN', k: 'lancers', c: 'd' },
      { id: 'bE2', k: 'écart à 1/6', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const L = 48,
      R = 14,
      T = 14,
      B = 28,
      yOf = (v) => H - B - (Math.min(v, TOP) / TOP) * (H - B - T);
    function draw() {
      x.clearRect(0, 0, W, H);
      x.font = '11px ' + SM;
      x.strokeStyle = 'rgba(255,255,255,.2)';
      x.lineWidth = 1;
      x.beginPath();
      x.moveTo(L, T);
      x.lineTo(L, H - B);
      x.lineTo(W - R, H - B);
      x.stroke();
      x.fillStyle = 'rgba(255,255,255,.5)';
      x.textAlign = 'right';
      x.fillText('0', L - 6, H - B);
      x.fillText('0,5', L - 6, T);
      x.strokeStyle = '#ffd166';
      x.setLineDash([5, 4]);
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(L, yOf(P));
      x.lineTo(W - R, yOf(P));
      x.stroke();
      x.setLineDash([]);
      x.fillStyle = '#ffd166';
      x.textAlign = 'left';
      x.fillText('1/6', W - R - 26, yOf(P) - 12);
      if (pts.length > 1) {
        const nm = pts[pts.length - 1][0],
          xOf = (k) => L + (k / nm) * (W - L - R);
        x.strokeStyle = '#e7efe9';
        x.lineWidth = 2.2;
        x.lineJoin = 'round';
        x.beginPath();
        pts.forEach(([k, v], i) => {
          const y = Math.max(T, Math.min(H - B, yOf(v)));
          i ? x.lineTo(xOf(k), y) : x.moveTo(xOf(k), y);
        });
        x.stroke();
        const l = pts[pts.length - 1];
        x.fillStyle = '#7ef2b0';
        x.beginPath();
        x.arc(xOf(l[0]), Math.max(T, Math.min(H - B, yOf(l[1]))), 4.5, 0, 7);
        x.fill();
      }
      x.textAlign = 'center';
      x.fillStyle = 'rgba(255,255,255,.42)';
      x.fillText(n ? n.toLocaleString('fr') + ' lancers' : '', (L + W - R) / 2, H - 9);
    }
    function add(k) {
      for (let i = 0; i < k; i++) {
        n++;
        if (Math.floor(Math.random() * 6) === 5) h++;
        if (n <= 300 || n % Math.ceil(n / 300) === 0) pts.push([n, h / n]);
      }
      const f = h / n;
      host.querySelector('#bF').textContent = fr(f.toFixed(3));
      host.querySelector('#bN').textContent = n.toLocaleString('fr');
      host.querySelector('#bE2').textContent = fr(Math.abs(f - P).toFixed(3));
      draw();
      say.innerHTML =
        n < 40
          ? "Trop peu de lancers : la fréquence saute dans tous les sens, elle n'est pas fiable."
          : Math.abs(f - P) > 0.04
            ? 'Ça s\'approche, mais ça bouge encore. Continue de lancer.'
            : `La fréquence s'est <b style="color:var(--g)">stabilisée</b> autour de 1/6 ≈ 0,167. C'est la <b>probabilité</b> qui apparaît d'elle-même.`;
    }
    function loop2() {
      if (!playing) return;
      add(n < 200 ? 2 : n < 2000 ? 15 : 60);
      loop.raf(loop2);
    }
    ctl.querySelector('#pl').onclick = function () {
      playing = !playing;
      this.innerHTML = playing ? '&#10073;&#10073; Pause' : '&#9654; Lancer en continu';
      if (playing) loop2();
    };
    ctl.querySelector('#p1').onclick = () => add(100);
    ctl.querySelector('#rz').onclick = () => {
      playing = false;
      ctl.querySelector('#pl').innerHTML = '&#9654; Lancer en continu';
      n = 0;
      h = 0;
      pts = [];
      host.querySelector('#bF').textContent = '—';
      host.querySelector('#bN').textContent = '0';
      host.querySelector('#bE2').textContent = '—';
      draw();
      say.textContent = 'Appuie sur « Lancer en continu » et regarde la courbe se former.';
    };
    add(400);
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
