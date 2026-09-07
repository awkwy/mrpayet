<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, rr, Spring, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    const CATS = (vd && vd.cats) || [
      ['0–1 an', 6],
      ['1–2 ans', 14],
      ['2–3 ans', 12],
      ['3–4 ans', 8]
    ];
    const UNIT = (vd && vd.unit) || 'enfants';
    const TOT = CATS.reduce((s, c) => s + c[1], 0);
    let mode = 'eff',
      circ = false;
    const { x, W, H } = cvs(host, 210);
    const md = box(
      host,
      'vctl',
      `<button data-m="eff" class="on">Effectifs</button><button data-m="freq">Fréquences</button><button data-m="pct">Pourcentages</button>`
    );
    const tg = box(host, 'vctl', `<button class="p" id="tg">&#9656; Voir en diagramme circulaire</button>`);
    readout(host, [
      { id: 'kT', k: 'effectif total', c: 'd' },
      { id: 'kM', k: 'la plus fréquente', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    const springs = CATS.map(() => new Spring(0, { k: 130, bounce: true }));
    const COL = ['#7ec8f2', '#7ef2b0', '#b79cf2', '#ffd166'];
    function label(i) {
      const e = CATS[i][1];
      return mode === 'eff' ? String(e) : mode === 'freq' ? fr((e / TOT).toFixed(2)) : Math.round((e / TOT) * 100) + ' %';
    }
    function draw() {
      x.clearRect(0, 0, W, H);
      const mx = Math.max(...CATS.map((c) => c[1]));
      if (!circ) {
        const L = 30,
          B = 40,
          T = 18,
          gap = (W - L - 12) / CATS.length,
          bw = gap * 0.6;
        x.strokeStyle = 'rgba(255,255,255,.15)';
        x.lineWidth = 1;
        x.beginPath();
        x.moveTo(L, H - B);
        x.lineTo(W - 8, H - B);
        x.stroke();
        CATS.forEach((cc, i) => {
          springs[i].to(cc[1] / mx);
          const h = Math.max(0, springs[i].step()) * (H - B - T);
          const bx = L + i * gap + (gap - bw) / 2;
          x.fillStyle = COL[i];
          rr(x, bx, H - B - h, bw, h, 4);
          x.fill();
          x.font = 'bold 12px ' + SM;
          x.fillStyle = '#e7efe9';
          x.textAlign = 'center';
          x.fillText(label(i), bx + bw / 2, H - B - h - 11);
          x.font = '10px ' + SM;
          x.fillStyle = '#8fa79b';
          x.fillText(cc[0], bx + bw / 2, H - B + 15);
        });
      } else {
        const cx = W * 0.5,
          cy = (H - 6) / 2,
          r = Math.min(cx - 8, cy - 4);
        let a0 = -Math.PI / 2;
        CATS.forEach((cc, i) => {
          const frac = cc[1] / TOT,
            a1 = a0 + frac * Math.PI * 2,
            am = (a0 + a1) / 2;
          x.beginPath();
          x.moveTo(cx, cy);
          x.arc(cx, cy, r, a0, a1);
          x.closePath();
          x.fillStyle = COL[i];
          x.fill();
          x.strokeStyle = '#0a0e0c';
          x.lineWidth = 2;
          x.stroke();
          if (frac > 0.07) {
            x.fillStyle = '#04120a';
            x.font = 'bold 11px ' + SM;
            x.textAlign = 'center';
            x.fillText(Math.round(frac * 100) + '%', cx + Math.cos(am) * r * 0.6, cy + Math.sin(am) * r * 0.6);
          }
          a0 = a1;
        });
      }
      let mi = 0;
      CATS.forEach((cc, i) => {
        if (cc[1] > CATS[mi][1]) mi = i;
      });
      host.querySelector('#kT').textContent = TOT;
      host.querySelector('#kM').textContent = CATS[mi][0];
      say.innerHTML = circ
        ? `Chaque secteur = une <b>fréquence</b> ; le tour complet (360°) = les ${TOT} ${UNIT}. « ${CATS[mi][0]} » occupe le plus gros secteur.`
        : mode === 'eff'
          ? `Hauteur du bâton = <b>effectif</b>. On compare les quantités d'un coup d'œil.`
          : `Hauteur = <b>fréquence</b> (effectif ÷ ${TOT}). La somme de toutes les fréquences fait 1.`;
    }
    md.querySelectorAll('[data-m]').forEach((b) => {
      b.onclick = () => {
        mode = b.dataset.m;
        md.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
      };
    });
    tg.querySelector('#tg').onclick = function () {
      circ = !circ;
      this.innerHTML = circ ? '&#9656; Voir en diagramme en bâtons' : '&#9656; Voir en diagramme circulaire';
      md.style.opacity = circ ? '.4' : '1';
    };
    function tick() {
      draw();
      loop.raf(tick);
    }
    tick();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
