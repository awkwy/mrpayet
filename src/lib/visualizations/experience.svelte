<script>
  import { onMount, onDestroy } from 'svelte';
  import { cvs, box, readout, rr, SM, fr, createLoop } from './shared.js';

  let { vd } = $props();
  let host;
  const loop = createLoop();

  onMount(() => {
    let sel = new Set([1, 3, 5]),
      face = 5,
      spin = 0,
      hist = [];
    const { x, W, H } = cvs(host, 180);
    const iss = box(host, 'vctl', '');
    const ctl = box(
      host,
      'vctl',
      `<button class="p" id="roll">Lancer le dé</button><button id="ctr">Événement contraire</button><button class="gh" id="non">Aucune</button><button class="gh" id="tout">Toutes</button>`
    );
    readout(host, [
      { id: 'eP', k: 'P(A)' },
      { id: 'eF', k: 'issues favorables', c: 'd' }
    ]);
    const bar = box(
      host,
      '',
      `<div style="position:relative;height:30px;margin-top:14px">
    <div style="position:absolute;inset:12px 0 auto;height:6px;background:#1c2a24;border-radius:999px"></div>
    <div id="fp" style="position:absolute;left:0;top:12px;height:6px;width:0;background:linear-gradient(90deg,#2b7d57,#7ef2b0);border-radius:999px;transition:width .25s"></div>
    <div id="cu" style="position:absolute;top:6px;left:0;width:3px;height:18px;background:#fff;border-radius:2px;transition:left .25s"></div>
    <div style="position:absolute;top:0;left:0;font:10px var(--sm);color:var(--dim2)">0 · impossible</div>
    <div style="position:absolute;top:0;right:0;font:10px var(--sm);color:var(--dim2)">1 · certain</div></div>`
    );
    const say = box(host, 'say', '');
    const PIP = {
      1: [[0.5, 0.5]],
      2: [
        [0.28, 0.28],
        [0.72, 0.72]
      ],
      3: [
        [0.28, 0.28],
        [0.5, 0.5],
        [0.72, 0.72]
      ],
      4: [
        [0.28, 0.28],
        [0.72, 0.28],
        [0.28, 0.72],
        [0.72, 0.72]
      ],
      5: [
        [0.28, 0.28],
        [0.72, 0.28],
        [0.5, 0.5],
        [0.28, 0.72],
        [0.72, 0.72]
      ],
      6: [
        [0.28, 0.25],
        [0.72, 0.25],
        [0.28, 0.5],
        [0.72, 0.5],
        [0.28, 0.75],
        [0.72, 0.75]
      ]
    };
    function die(px, py, s, v, on) {
      x.fillStyle = on ? '#7ef2b0' : '#16211d';
      x.strokeStyle = on ? '#7ef2b0' : '#365046';
      x.lineWidth = 2;
      rr(x, px, py, s, s, s * 0.18);
      x.fill();
      x.stroke();
      x.fillStyle = on ? '#04120a' : '#e7efe9';
      (PIP[v] || []).forEach(([a, b]) => {
        x.beginPath();
        x.arc(px + a * s, py + b * s, s * 0.075, 0, 7);
        x.fill();
      });
    }
    function draw() {
      x.clearRect(0, 0, W, H);
      const s = Math.min(96, H * 0.55);
      die(W / 2 - s / 2, 14, s, face, sel.has(face));
      x.font = '12px ' + SM;
      x.textAlign = 'center';
      x.fillStyle = sel.has(face) ? '#7ef2b0' : '#63776d';
      x.fillText(sel.has(face) ? 'dans mon événement' : 'hors de mon événement', W / 2, 26 + s + 8);
      const sh = Math.min(20, (W - 40) / 16);
      hist.slice(-13).forEach((v, i) => {
        const n = Math.min(hist.length, 13),
          px = W / 2 - (n * (sh + 4)) / 2 + i * (sh + 4);
        die(px, H - sh - 6, sh, v, sel.has(v));
      });
    }
    function paint() {
      iss.innerHTML = '';
      for (let i = 1; i <= 6; i++) {
        const b = document.createElement('button');
        b.textContent = i;
        b.style.cssText = 'min-width:42px;text-align:center';
        if (sel.has(i)) b.classList.add('on');
        b.setAttribute('aria-pressed', sel.has(i));
        b.onclick = () => {
          sel.has(i) ? sel.delete(i) : sel.add(i);
          paint();
          upd();
        };
        iss.appendChild(b);
      }
    }
    function upd() {
      const k = sel.size,
        p = k / 6;
      host.querySelector('#eP').textContent = p === 0 ? '0' : p === 1 ? '1' : k + '/6';
      host.querySelector('#eF').textContent = k + '/6 = ' + fr(p.toFixed(3));
      host.querySelector('#fp').style.width = p * 100 + '%';
      host.querySelector('#cu').style.left = 'calc(' + p * 100 + '% - 1.5px)';
      say.innerHTML =
        p === 0
          ? "Aucune issue ne convient : l'événement est <b>impossible</b>, sa probabilité vaut 0."
          : p === 1
            ? 'Toutes les issues conviennent : l\'événement est <b>certain</b>, sa probabilité vaut 1.'
            : `${k} issue${k > 1 ? 's' : ''} favorable${k > 1 ? 's' : ''} sur 6 possibles : P(A) = ${k}/6 = <b>${fr(p.toFixed(3))}</b>. Une probabilité reste toujours entre 0 et 1.`;
      draw();
    }
    ctl.querySelector('#roll').onclick = () => {
      if (spin) return;
      spin = 1;
      let fr0 = 0,
        k = 0,
        gap = 1;
      const step = () => {
        if (++fr0 >= gap) {
          fr0 = 0;
          k++;
          gap = k < 12 ? 1 : k < 18 ? 3 : k < 22 ? 6 : 10;
          face = 1 + Math.floor(Math.random() * 6);
          draw();
        }
        if (k < 24) loop.raf(step);
        else {
          spin = 0;
          hist.push(face);
          draw();
          const ok = sel.has(face),
            r = hist.filter((v) => sel.has(v)).length;
          say.innerHTML = `Résultat : <b>${face}</b> — ${ok ? "il <b style='color:var(--g)'>appartient</b> à l'événement." : "il <b>n'appartient pas</b> à l'événement."} Sur ${hist.length} lancer${hist.length > 1 ? 's' : ''}, ${r} ${r > 1 ? 'ont' : 'a'} réussi (fréquence ${fr((r / hist.length).toFixed(2))}).`;
        }
      };
      loop.raf(step);
    };
    ctl.querySelector('#ctr').onclick = () => {
      const n = new Set();
      for (let i = 1; i <= 6; i++) if (!sel.has(i)) n.add(i);
      sel = n;
      paint();
      upd();
      say.innerHTML = 'Événement <b>contraire</b> : on garde toutes les issues qui restent. P(A) + P(Ā) = 1.';
    };
    ctl.querySelector('#non').onclick = () => {
      sel = new Set();
      paint();
      upd();
    };
    ctl.querySelector('#tout').onclick = () => {
      sel = new Set([1, 2, 3, 4, 5, 6]);
      paint();
      upd();
    };
    paint();
    upd();
  });

  onDestroy(() => loop.stop());
</script>

<div bind:this={host} class="viz"></div>
