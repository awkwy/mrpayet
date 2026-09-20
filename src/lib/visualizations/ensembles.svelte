<script>
  import { onMount } from 'svelte';
  import { cvs, box, readout, SM, fr } from './shared.js';

  let { vd } = $props();
  let host;

  onMount(() => {
    const total = (vd && vd.total) || 100;
    const labelA = (vd && vd.labelA) || 'A';
    const labelB = vd && vd.labelB;
    const nA = (vd && vd.nA) || 0;
    const nB = (vd && vd.nB) || 0;
    const nAB = (vd && vd.nAB) || 0;
    const twoSet = !!labelB;

    const { x, W, H, c } = cvs(host, twoSet ? 250 : 200);
    const L = 16,
      R = W - 16,
      T = 30,
      B = H - 16;
    const rectCX = (L + R) / 2,
      cy = (T + B) / 2;
    const r = twoSet ? Math.min((B - T) * 0.36, (R - L) * 0.26) : Math.min((B - T) * 0.42, (R - L) * 0.32);
    const dist = twoSet ? r * 1.05 : 0;
    const cxA = rectCX - dist / 2,
      cxB = rectCX + dist / 2;

    const zones = twoSet
      ? [
          { k: 'A', lab: labelA, n: nA, txt: () => `A = « ${labelA} ». P(A) = ${nA} ÷ ${total} = ${fr((nA / total).toFixed(2))}.` },
          { k: 'B', lab: labelB, n: nB, txt: () => `B = « ${labelB} ». P(B) = ${nB} ÷ ${total} = ${fr((nB / total).toFixed(2))}.` },
          {
            k: 'Abar',
            lab: 'Ā',
            n: total - nA,
            txt: () => `Ā : l'événement contraire de A — « ${labelA} » ne se produit pas. P(Ā) = 1 − P(A) = ${fr((1 - nA / total).toFixed(2))}.`
          },
          {
            k: 'inter',
            lab: 'A ⋂ B',
            n: nAB,
            txt: () => `A ⋂ B (intersection) : à la fois « ${labelA} » ET « ${labelB} ». P(A ⋂ B) = ${nAB} ÷ ${total} = ${fr((nAB / total).toFixed(2))}.`
          },
          {
            k: 'union',
            lab: 'A ⋃ B',
            n: nA + nB - nAB,
            txt: () =>
              `A ⋃ B (réunion) : « ${labelA} » OU « ${labelB} » (au moins l'un des deux). P(A ⋃ B) = P(A) + P(B) − P(A ⋂ B) = ${fr(((nA + nB - nAB) / total).toFixed(2))}.`
          }
        ]
      : [
          { k: 'A', lab: labelA, n: nA, txt: () => `A = « ${labelA} ». P(A) = ${nA} ÷ ${total} = ${fr((nA / total).toFixed(2))}.` },
          {
            k: 'Abar',
            lab: 'Ā',
            n: total - nA,
            txt: () => `Ā : l'événement contraire de A — « ${labelA} » ne se produit pas. P(Ā) = 1 − P(A) = ${fr((1 - nA / total).toFixed(2))}.`
          }
        ];

    let sel = zones[0].k;

    const ctl = box(
      host,
      'vctl',
      zones.map((z, i) => `<button data-k="${z.k}"${i === 0 ? ' class="on"' : ''}>${z.lab}</button>`).join('')
    );
    readout(host, [
      { id: 'ensn', k: 'effectif', c: 'd' },
      { id: 'ensp', k: 'probabilité', c: 'w' }
    ]);
    const say = box(host, 'say', '');
    box(
      host,
      'viz-data',
      `<details><summary>Voir toutes les zones
        <table><thead><tr><th>Notation</th><th>Effectif</th><th>Probabilité</th></tr></thead>
        <tbody>${zones.map((z) => `<tr><td>${z.lab}</td><td>${z.n}</td><td>${fr((z.n / total).toFixed(2))}</td></tr>`).join('')}</tbody></table></details>`
    );

    function circleAPath() {
      x.arc(cxA, cy, r, 0, 7);
    }
    function circleBPath() {
      x.arc(cxB, cy, r, 0, 7);
    }
    function rectPath() {
      x.rect(L, T, R - L, B - T);
    }

    function fillZone(k) {
      x.fillStyle = 'rgba(126,242,176,.4)';
      if (k === 'A') {
        x.beginPath();
        circleAPath();
        x.fill();
      } else if (k === 'B') {
        x.beginPath();
        circleBPath();
        x.fill();
      } else if (k === 'inter') {
        x.save();
        x.beginPath();
        circleAPath();
        x.clip();
        x.beginPath();
        circleBPath();
        x.fill();
        x.restore();
      } else if (k === 'union') {
        x.beginPath();
        circleAPath();
        circleBPath();
        x.fill();
      } else if (k === 'Abar') {
        x.beginPath();
        rectPath();
        circleAPath();
        x.fill('evenodd');
      }
    }

    function draw() {
      x.clearRect(0, 0, W, H);
      x.fillStyle = 'rgba(255,255,255,.03)';
      x.beginPath();
      rectPath();
      x.fill();
      fillZone(sel);
      x.strokeStyle = 'rgba(255,255,255,.22)';
      x.lineWidth = 1;
      x.beginPath();
      rectPath();
      x.stroke();
      x.strokeStyle = '#7ef2b0';
      x.lineWidth = 1.6;
      x.beginPath();
      circleAPath();
      x.stroke();
      if (twoSet) {
        x.beginPath();
        circleBPath();
        x.stroke();
      }
      x.font = '11px ' + SM;
      x.fillStyle = '#9fb0a8';
      x.textAlign = 'left';
      x.fillText('Ω', L + 4, T + 12);
      x.textAlign = 'center';
      x.fillStyle = '#7ef2b0';
      x.fillText(labelA, cxA - (twoSet ? r * 0.55 : 0), cy - r - 8);
      if (twoSet) x.fillText(labelB, cxB + r * 0.55, cy - r - 8);
      const z = zones.find((zz) => zz.k === sel);
      host.querySelector('#ensn').textContent = z.n;
      host.querySelector('#ensp').textContent = fr((z.n / total).toFixed(2));
      say.innerHTML = z.txt();
      c.setAttribute('aria-label', `Diagramme d'ensembles : ${z.txt()}`);
    }

    c.setAttribute('role', 'img');
    ctl.querySelectorAll('button').forEach((b) => {
      b.onclick = () => {
        sel = b.dataset.k;
        ctl.querySelectorAll('button').forEach((z) => z.classList.remove('on'));
        b.classList.add('on');
        draw();
      };
    });

    draw();
  });
</script>

<div bind:this={host} class="viz"></div>
