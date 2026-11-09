<script>
  import { onMount, onDestroy } from 'svelte';
  import { select } from 'd3-selection';
  import { drag } from 'd3-drag';
  import 'd3-transition';
  import { springEase, linScale } from './d3.js';
  import { summary } from '$lib/utils/stats-mv.js';

  /* Deux boîtes à moustaches à construire sur UN SEUL axe (10 à 36 min).
   *
   * 1. Forme  : pour chaque équipe, cinq repères à faire glisser — minimum, Q₁,
   *    médiane, Q₃, maximum ; la boîte et les moustaches se redessinent en
   *    direct. Un axe commun aligne les deux équipes : on compare des largeurs
   *    de boîte, pas des dessins.
   * 2. Couleur : boîtes et moustaches = teinte de données --g (une seule
   *    série par ligne, identifiée par son libellé de ligne) ; médiane =
   *    accent --blue (valeur dérivée) ; barème = repère neutre --dim en
   *    pointillé, libellé à l'écran. Pas de --warn / --red.
   * 3. Mouvement : les repères partent d'un état de repos visible (cinq
   *    positions régulières), glissent au doigt avec pas de 1 min, et rejoignent
   *    leur place de correction en ressort (springEase) via « Montre-moi ».
   * 4. Accessibilité : chaque repère est un slider (role="slider", flèches ±1,
   *    Maj+flèches ±5) ; la vérification écrit un compte rendu texte ; vue
   *    tableau repliable ; mouvement réduit respecté. */

  let { vd } = $props();
  let host;
  let cleanup = () => {};

  const TEAMS = vd?.teams ?? [
    {
      name: 'Équipe du matin',
      short: 'Matin',
      vals: [22, 25, 28, 24, 22, 24, 31, 27, 22, 26, 24, 24, 22, 19, 23, 23, 21, 25, 20, 20, 26, 23, 21, 23]
    },
    {
      name: "Équipe de l'après-midi",
      short: 'Après-midi',
      vals: [12, 14, 16, 17, 18, 19, 19, 20, 21, 22, 22, 23, 23, 24, 25, 26, 27, 28, 29, 29, 30, 32, 34, 35]
    }
  ];
  const AX = vd?.axis ?? [10, 36];
  const BAREME = vd?.bareme ?? 24;
  const UNIT = vd?.unit ?? 'min';
  const KEYS = ['min', 'q1', 'med', 'q3', 'max'];
  const NAMES = ['min', 'Q₁', 'méd.', 'Q₃', 'max'];
  const LONG = ['le minimum', 'Q₁', 'la médiane', 'Q₃', 'le maximum'];
  const SOL = TEAMS.map((t) => {
    const s = summary(t.vals);
    return KEYS.map((k) => s[k]);
  });

  onMount(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spring = springEase({ stiffness: 150, damping: 17, duration: 1.2 });
    const W = 360;
    const L = 18;
    const R = W - 14;
    const ROWH = 96;
    const TOP = 34;
    const H = TOP + TEAMS.length * ROWH + 42;
    const AXY = H - 30;
    const x = linScale(AX, [L, R]);
    const clampV = (v) => Math.max(AX[0], Math.min(AX[1], Math.round(v)));

    // état : valeurs des repères par équipe (position de repos : cinq repères régulièrement espacés)
    const REST = [0, 1, 2, 3, 4].map((i) => Math.round(AX[0] + 2 + (i * (AX[1] - AX[0] - 4)) / 4));
    const val = TEAMS.map(() => [...REST]);
    const good = TEAMS.map(() => KEYS.map(() => false));
    let verdict = '';

    host.style.position = 'relative';
    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'group')
      .attr('aria-label', 'Deux boîtes à moustaches à construire sur le même axe')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // grille et axe
    const grid = svg.append('g');
    for (let v = AX[0]; v <= AX[1]; v += 2) {
      grid.append('line').attr('x1', x(v)).attr('x2', x(v)).attr('y1', TOP - 6).attr('y2', AXY).attr('stroke', 'var(--line)').attr('stroke-width', 0.7);
      grid.append('text').attr('x', x(v)).attr('y', AXY + 14).attr('text-anchor', 'middle').attr('fill', 'var(--dim2)').attr('font-size', 9.5).attr('font-family', 'var(--sm)').text(v);
    }
    grid.append('line').attr('x1', L).attr('x2', R).attr('y1', AXY).attr('y2', AXY).attr('stroke', 'var(--line2)');
    grid.append('text').attr('x', R).attr('y', AXY + 28).attr('text-anchor', 'end').attr('fill', 'var(--dim2)').attr('font-size', 10).attr('font-family', 'var(--sm)').text(`durée (${UNIT})`);
    // barème
    grid.append('line').attr('x1', x(BAREME)).attr('x2', x(BAREME)).attr('y1', TOP - 8).attr('y2', AXY).attr('stroke', 'var(--dim)').attr('stroke-width', 1.6).attr('stroke-dasharray', '5 4');
    grid.append('text').attr('x', x(BAREME)).attr('y', 11).attr('text-anchor', 'middle').attr('fill', 'var(--dim)').attr('font-size', 10).attr('font-family', 'var(--sm)').attr('font-weight', 'bold').text(`barème ${BAREME} ${UNIT}`);

    const rows = TEAMS.map((t, ti) => {
      const cy = TOP + ti * ROWH + 38;
      const g = svg.append('g').attr('class', 'row');
      g.append('text').attr('x', L).attr('y', cy - 38).attr('fill', 'var(--tx)').attr('font-size', 11.5).attr('font-family', 'var(--sm)').attr('font-weight', 'bold').text(t.short ?? t.name);
      const wL = g.append('line').attr('stroke', 'var(--g2)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
      const wR = g.append('line').attr('stroke', 'var(--g2)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
      const capL = g.append('line').attr('stroke', 'var(--g2)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
      const capR = g.append('line').attr('stroke', 'var(--g2)').attr('stroke-width', 2).attr('stroke-linecap', 'round');
      const box = g.append('rect').attr('y', cy - 15).attr('height', 30).attr('rx', 3).attr('fill', 'var(--g)').attr('fill-opacity', 0.2).attr('stroke', 'var(--g)').attr('stroke-width', 1.5);
      const medL = g.append('line').attr('stroke', 'var(--blue)').attr('stroke-width', 3.2).attr('stroke-linecap', 'round');
      const wid = g.append('text').attr('text-anchor', 'middle').attr('fill', 'var(--blue)').attr('font-size', 10).attr('font-family', 'var(--sm)').attr('font-weight', 'bold');
      const pins = KEYS.map((k, ki) => {
        const p = g
          .append('g')
          .attr('class', 'pin')
          .attr('tabindex', 0)
          .attr('role', 'slider')
          .attr('aria-orientation', 'horizontal')
          .attr('aria-valuemin', AX[0])
          .attr('aria-valuemax', AX[1])
          .style('cursor', 'grab')
          .style('outline', 'none');
        p.append('circle').attr('class', 'hit').attr('r', 20).attr('cy', cy).attr('fill', 'transparent');
        const dot = p.append('circle').attr('class', 'dot').attr('r', 8.5).attr('cy', cy).attr('fill', 'var(--surf)').attr('stroke', ki === 2 ? 'var(--blue)' : 'var(--g)').attr('stroke-width', 2.4);
        const num = p.append('text').attr('text-anchor', 'middle').attr('y', cy - 15 - (ki % 2) * 0).attr('fill', 'var(--tx)').attr('font-size', 10.5).attr('font-family', 'var(--sm)').attr('font-weight', 'bold').style('pointer-events', 'none');
        const nm = p.append('text').attr('text-anchor', 'middle').attr('y', cy + 28 + (ki % 2) * 0).attr('fill', 'var(--dim)').attr('font-size', 9.5).attr('font-family', 'var(--sm)').style('pointer-events', 'none').text(NAMES[ki]);
        return { p, dot, num, nm, cy };
      });
      return { cy, wL, wR, capL, capR, box, medL, wid, pins };
    });

    const say = document.createElement('div');
    say.className = 'say';
    say.setAttribute('aria-live', 'polite');
    const ctl = document.createElement('div');
    ctl.className = 'vctl';
    ctl.innerHTML =
      '<button class="p" data-a="check">Vérifier mes boîtes</button><button class="gh" data-a="show">Montre-moi</button><button class="gh" data-a="reset">Remettre à zéro</button>';
    const dv = document.createElement('div');
    dv.className = 'viz-data';
    dv.innerHTML = '<details><summary>Voir les valeurs en tableau</summary><table><thead><tr><th></th>' + NAMES.map((n) => `<th>${n}</th>`).join('') + '</tr></thead><tbody></tbody></table></details>';
    host.append(ctl, say, dv);
    const tbody = dv.querySelector('tbody');

    function paint(animate, only) {
      TEAMS.forEach((t, ti) => {
        const v = val[ti];
        const r = rows[ti];
        const sel = (s) => (animate ? s.transition('mv').duration(RM ? 0 : 900).ease(spring) : s.interrupt('mv'));
        sel(r.wL).attr('x1', x(v[0])).attr('x2', x(v[1])).attr('y1', r.cy).attr('y2', r.cy);
        sel(r.wR).attr('x1', x(v[3])).attr('x2', x(v[4])).attr('y1', r.cy).attr('y2', r.cy);
        sel(r.capL).attr('x1', x(v[0])).attr('x2', x(v[0])).attr('y1', r.cy - 8).attr('y2', r.cy + 8);
        sel(r.capR).attr('x1', x(v[4])).attr('x2', x(v[4])).attr('y1', r.cy - 8).attr('y2', r.cy + 8);
        sel(r.box).attr('x', x(v[1])).attr('width', Math.max(0, x(v[3]) - x(v[1])));
        sel(r.medL).attr('x1', x(v[2])).attr('x2', x(v[2])).attr('y1', r.cy - 15).attr('y2', r.cy + 15);
        sel(r.wid).attr('x', (x(v[1]) + x(v[3])) / 2).attr('y', r.cy - 20 - 10).text(`boîte : ${v[3] - v[1]} ${UNIT}`);
        r.pins.forEach((pn, ki) => {
          if (only && (only[0] !== ti || only[1] !== ki) && !animate) return;
          sel(pn.p).attr('transform', `translate(${x(v[ki])},0)`);
          pn.num.text(v[ki]);
          pn.p.attr('aria-valuenow', v[ki]).attr('aria-label', `${t.short ?? t.name} : ${LONG[ki]}, ${v[ki]} ${UNIT}`);
          pn.dot.attr('stroke', good[ti][ki] ? 'var(--g)' : ki === 2 ? 'var(--blue)' : 'var(--g)').attr('fill', good[ti][ki] ? 'var(--g)' : 'var(--surf)');
        });
      });
      tbody.replaceChildren(
        ...TEAMS.map((t, ti) => {
          const tr = document.createElement('tr');
          const th = document.createElement('th');
          th.textContent = t.short ?? t.name;
          tr.append(th, ...val[ti].map((n) => Object.assign(document.createElement('td'), { textContent: String(n) })));
          return tr;
        })
      );
    }

    // glisser
    TEAMS.forEach((t, ti) => {
      rows[ti].pins.forEach((pn, ki) => {
        // un repère poussé contre son voisin l'entraîne (l'ordre min ≤ Q₁ ≤ médiane ≤ Q₃ ≤ max est toujours respecté)
        const setV = (nv) => {
          const c = clampV(nv);
          if (c === val[ti][ki]) return;
          const v = val[ti];
          v[ki] = c;
          for (let j = ki + 1; j < 5; j++) if (v[j] < v[j - 1]) v[j] = v[j - 1];
          for (let j = ki - 1; j >= 0; j--) if (v[j] > v[j + 1]) v[j] = v[j + 1];
          good[ti] = good[ti].map(() => false);
          paint(false);
          say.textContent = '';
        };
        pn.p.call(
          drag()
            .on('start', function () {
              select(this).style('cursor', 'grabbing').select('.dot').transition().duration(RM ? 0 : 200).attr('r', 11);
            })
            .on('drag', (ev) => {
              const [px] = [ev.x];
              setV(x.invert(px));
            })
            .on('end', function () {
              select(this).style('cursor', 'grab').select('.dot').transition().duration(RM ? 0 : 400).ease(spring).attr('r', 8.5);
            })
        );
        pn.p.on('keydown', (ev) => {
          const step = ev.shiftKey ? 5 : 1;
          if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') (ev.preventDefault(), setV(val[ti][ki] + step));
          else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') (ev.preventDefault(), setV(val[ti][ki] - step));
        });
        pn.p.on('focus', function () {
          select(this).select('.dot').attr('stroke-width', 4);
        });
        pn.p.on('blur', function () {
          select(this).select('.dot').attr('stroke-width', 2.4);
        });
      });
    });

    function check() {
      const lines = [];
      let okAll = true;
      TEAMS.forEach((t, ti) => {
        const bad = [];
        KEYS.forEach((k, ki) => {
          const d = val[ti][ki] - SOL[ti][ki];
          good[ti][ki] = d === 0;
          if (d !== 0) {
            okAll = false;
            bad.push(`${LONG[ki]} est trop à ${d > 0 ? 'droite' : 'gauche'}`);
          }
        });
        lines.push(`${t.short ?? t.name} : ` + (bad.length ? bad.join(' ; ') : 'les cinq repères sont justes'));
      });
      paint(false);
      rows.forEach((r, ti) =>
        r.pins.forEach((pn, ki) => {
          if (good[ti][ki] && !RM) pn.dot.attr('r', 8.5).transition().duration(220).attr('r', 12).transition().duration(420).ease(spring).attr('r', 8.5);
        })
      );
      verdict = okAll
        ? `Bravo : les deux boîtes sont justes. La boîte du matin mesure ${SOL[0][3] - SOL[0][1]} ${UNIT}, celle de l'après-midi ${SOL[1][3] - SOL[1][1]} ${UNIT} : l'équipe dont la boîte est la plus étroite est la plus régulière.`
        : lines.join('. ') + '.';
      say.textContent = verdict;
    }

    function show() {
      TEAMS.forEach((t, ti) => KEYS.forEach((k, ki) => ((val[ti][ki] = SOL[ti][ki]), (good[ti][ki] = true))));
      paint(true);
      say.textContent = `Voici les deux boîtes : matin ${SOL[0].join(' · ')} ; après-midi ${SOL[1].join(' · ')}. Même médiane, mais la boîte de l'après-midi est bien plus large.`;
    }
    function reset() {
      TEAMS.forEach((t, ti) => KEYS.forEach((k, ki) => ((val[ti][ki] = REST[ki]), (good[ti][ki] = false))));
      paint(true);
      say.textContent = 'Repères remis à leur place de départ. Fais-les glisser sur l\'axe.';
    }
    ctl.querySelector('[data-a=check]').onclick = check;
    ctl.querySelector('[data-a=show]').onclick = show;
    ctl.querySelector('[data-a=reset]').onclick = reset;

    say.textContent = "Fais glisser les cinq repères de chaque équipe (minimum, Q₁, médiane, Q₃, maximum) sur l'axe, puis vérifie.";
    paint(false);
    // entrée : les repères montent depuis la ligne
    if (!RM) {
      rows.forEach((r, ti) =>
        r.pins.forEach((pn, ki) => {
          pn.p.attr('transform', `translate(${x(AX[0] + 2)},0)`).transition('mv').delay(ti * 160 + ki * 60).duration(800).ease(spring).attr('transform', `translate(${x(val[ti][ki])},0)`);
        })
      );
    }

    cleanup = () => {
      svg.selectAll('*').interrupt('mv');
      select(host).selectAll('*').remove();
    };
  });
  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
