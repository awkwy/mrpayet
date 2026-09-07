<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, slider, readout, Spring, SM, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const seuil = (vd && vd.seuil) || 280,
      unite = (vd && vd.unite) || '€',
      MAX = (vd && vd.max) || 400;
    const label = (vd && vd.label) || 'coût du projet';
    let v = Math.round(seuil * 0.8),
      sens = (vd && vd.sens) || '<=';
    const { x, W, H } = cvs(host, 150);
    slider(host, label, 0, MAX, Math.round(seuil * 0.8), (z) => Math.round(z) + ' ' + unite, (z) => {
      v = z;
    });
    const md = box(host, 'vctl', `<button data-s="<=" class="on">coût ≤ seuil</button><button data-s=">">coût > seuil</button>`);
    readout(host, [
      { id: 'nv', k: label, c: 'd' },
      { id: 'ns', k: 'seuil' },
      { id: 'nok', k: 'verdict', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const cur = new Spring(seuil * 0.8, { k: 160, d: 22 });
    function draw() {
      const V = cur.to(v).step();
      x.clearRect(0, 0, W, H);
      const L = 16,
        R = W - 16,
        y = 64,
        xf = (q) => L + (q / MAX) * (R - L);
      x.fillStyle = 'rgba(126,242,176,.12)';
      if (sens === '<=') x.fillRect(L, y - 10, xf(seuil) - L, 20);
      else x.fillRect(xf(seuil), y - 10, R - xf(seuil), 20);
      x.strokeStyle = 'rgba(255,255,255,.25)';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(L, y);
      x.lineTo(R, y);
      x.stroke();
      x.font = '10px ' + SM;
      x.fillStyle = '#63776d';
      x.textAlign = 'center';
      for (let q = 0; q <= MAX; q += MAX / 4) {
        x.beginPath();
        x.moveTo(xf(q), y - 4);
        x.lineTo(xf(q), y + 4);
        x.stroke();
        x.fillText(Math.round(q), xf(q), y + 18);
      }
      x.strokeStyle = '#ffd166';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(xf(seuil), y - 16);
      x.lineTo(xf(seuil), y + 16);
      x.stroke();
      x.fillStyle = '#ffd166';
      x.fillText('seuil ' + seuil, xf(seuil), y - 24);
      const ok = sens === '<=' ? V <= seuil : V > seuil;
      x.fillStyle = ok ? '#7ef2b0' : '#e2725b';
      x.beginPath();
      x.arc(xf(V), y, 6, 0, 7);
      x.fill();
      x.font = 'bold 12px ' + SM;
      x.textAlign = 'center';
      x.fillText(Math.round(V) + ' ' + unite, xf(V), y + 34);
      host.querySelector('#nv').textContent = Math.round(V) + ' ' + unite;
      host.querySelector('#ns').textContent = seuil + ' ' + unite;
      const ne = host.querySelector('#nok');
      ne.textContent = ok ? 'possible' : 'refusé';
      ne.className = 'v ' + (ok ? '' : 'r');
      say.innerHTML = ok
        ? `${Math.round(V)} ${sens === '<=' ? '≤' : '>'} ${seuil} : l'inéquation est <b>vérifiée</b>. ${sens === '<=' ? `Le point est dans la zone verte : c'est finançable.` : `Le point dépasse le seuil.`}`
        : `${Math.round(V)} ${sens === '<=' ? '≤' : '>'} ${seuil} est <b>faux</b> : le point est hors de la zone. ${sens === '<=' ? `Ça dépasse le budget de ${Math.round(V) - seuil} ${unite}.` : ``}`;
    }
    md.querySelectorAll('[data-s]').forEach((b) => {
      b.onclick = () => {
        sens = b.dataset.s;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
