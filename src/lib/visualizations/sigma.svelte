<script>
  import { onMount, onDestroy } from 'svelte';
  import { select } from 'd3-selection';
  import { drag } from 'd3-drag';
  import 'd3-transition';
  import { springEase, linScale } from './d3.js';
  import { Spring, createLoop } from './shared.js';
  import { summary, nf } from '$lib/utils/stats-mv.js';

  /* Explorateur d'écart type : fais glisser une valeur et regarde bouger la
   * moyenne, σ, la médiane et l'écart interquartile.
   *
   * 1. Forme  : chaque relevé est un rond sur un axe gradué (nuage de points,
   *    valeurs identiques empilées) ; on peut le tirer au doigt. La bande
   *    centrée sur la moyenne a pour demi-largeur σ : plus les ronds sont
   *    éloignés de la moyenne, plus elle s'élargit.
   * 2. Couleur : relevés = teinte de données --g ; moyenne = --dim ; médiane
   *    et écart interquartile = --blue (valeurs dérivées « robustes ») ;
   *    bande σ = lavis --g. Jamais --warn / --red : l'incident n'est pas un
   *    statut d'erreur mais une valeur de plus ; il est repéré par un anneau
   *    clair et le libellé « incident ».
   * 3. Mouvement : les repères et les nombres suivent par ressort (Spring /
   *    springEase) ; jamais de saut. L'incident entre depuis le bord droit.
   * 4. Accessibilité : chaque rond est un slider clavier (flèches), lecture
   *    chiffrée sous le graphique, vue tableau repliable, mouvement réduit
   *    respecté.
   * σ = écart type de population (la ligne « σ » de la calculatrice). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};
  const loop = createLoop();

  const ALL_SETS = vd?.sets ?? [
    { id: 'madi', name: 'Madi', title: 'vidanges de Madi', unit: 'min', vals: [20, 19, 21, 20, 20, 21, 19, 20, 20, 20], dom: [5, 65], step: 1, tick: 10, dec: 2, incident: 60 },
    { id: 'soilihi', name: 'Soilihi', title: 'vidanges de Soilihi', unit: 'min', vals: [12, 28, 15, 25, 20, 10, 30, 18, 22, 20], dom: [5, 65], step: 1, tick: 10, dec: 2, incident: 60 },
    { id: 'f1', name: 'Fournisseur 1', title: 'plaquettes du fournisseur 1', unit: 'mm', vals: [11.8, 12.1, 12.0, 11.9, 12.2, 12.0, 11.9, 12.1], dom: [10.4, 13.6], step: 0.1, tick: 0.5, dec: 2 },
    { id: 'f2', name: 'Fournisseur 2', title: 'plaquettes du fournisseur 2', unit: 'mm', vals: [11.0, 13.1, 12.4, 10.6, 12.9, 11.3, 13.0, 11.7], dom: [10.4, 13.6], step: 0.1, tick: 0.5, dec: 2 }
  ];

  // `vd.only` (facultatif) : ne garder que certaines séries (ex. ['f1', 'f2'])
  const SETS = vd?.only ? ALL_SETS.filter((s) => vd.only.includes(s.id)) : ALL_SETS;

  onMount(() => {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const spring = springEase({ stiffness: 170, damping: 20, duration: 1.1 });
    const W = 360;
    const H = 232;
    const L = 16;
    const R = W - 16;
    const AXY = 178;
    host.style.position = 'relative';

    let cur = 0;
    let vals = [...SETS[0].vals];
    let incident = false;
    let svg;
    let x;
    let dotsG;
    let bandR;
    let sigLine;
    let sigTxt;
    let iqrLine;
    let iqrTxt;
    let meanL;
    let medL;
    let meanT;
    let medT;
    let prev = null;

    const chips = document.createElement('div');
    chips.className = 'vctl';
    chips.setAttribute('role', 'group');
    chips.setAttribute('aria-label', 'Choisir la série');
    SETS.forEach((s, i) => {
      const b = document.createElement('button');
      b.textContent = s.name;
      b.dataset.i = String(i);
      chips.appendChild(b);
    });
    host.appendChild(chips);
    const stage = document.createElement('div');
    stage.style.position = 'relative';
    host.appendChild(stage);

    const read = document.createElement('div');
    read.className = 'read';
    const R4 = [
      ['mean', 'moyenne', 'd'],
      ['sigma', 'écart type σ', ''],
      ['med', 'médiane', 'b'],
      ['iqr', 'écart interquartile', 'b']
    ];
    read.innerHTML = R4.map(([id, k, c]) => `<div><span class="v ${c}" id="sg-${id}">—</span><span class="k">${k}</span></div>`).join('');
    host.appendChild(read);
    const ctl = document.createElement('div');
    ctl.className = 'vctl';
    ctl.innerHTML = '<button class="p" data-a="inc">Ajouter l\'incident</button><button class="gh" data-a="reset">Remettre la série</button>';
    host.appendChild(ctl);
    const say = document.createElement('div');
    say.className = 'say';
    say.setAttribute('aria-live', 'polite');
    host.appendChild(say);
    const dv = document.createElement('div');
    dv.className = 'viz-data';
    dv.innerHTML = '<details><summary>Voir les valeurs</summary><p class="sgtab"></p></details>';
    host.appendChild(dv);

    // nombres animés (ressort)
    const springs = {};
    const fmts = {};
    function setNum(id, target, dec) {
      const el = host.querySelector('#sg-' + id);
      fmts[id] = dec;
      if (!springs[id] || RM) {
        springs[id] = new Spring(target, { k: 160, d: 22 });
        el.textContent = nf(target, dec);
        return;
      }
      springs[id].to(target);
      const tick = () => {
        const v = springs[id].step();
        el.textContent = nf(v, fmts[id]);
        if (Math.abs(v - springs[id].g) > 1e-3 || Math.abs(springs[id].v) > 1e-3) loop.raf(tick);
        else el.textContent = nf(springs[id].g, fmts[id]);
      };
      loop.raf(tick);
    }

    function build() {
      select(stage).selectAll('*').remove();
      const S = SETS[cur];
      x = linScale(S.dom, [L, R]);
      svg = select(stage)
        .append('svg')
        .attr('class', 'd3viz')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('role', 'group')
        .attr('aria-label', `Nuage des relevés : ${S.title}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
      const ax = svg.append('g');
      ax.append('line').attr('x1', L).attr('x2', R).attr('y1', AXY).attr('y2', AXY).attr('stroke', 'var(--line2)');
      const dec = S.step < 1 ? 1 : 0;
      for (let v = Math.ceil(S.dom[0] / S.tick) * S.tick; v <= S.dom[1] + 1e-9; v += S.tick) {
        ax.append('line').attr('x1', x(v)).attr('x2', x(v)).attr('y1', AXY).attr('y2', AXY + 4).attr('stroke', 'var(--line2)');
        ax.append('text').attr('x', x(v)).attr('y', AXY + 15).attr('text-anchor', 'middle').attr('fill', 'var(--dim2)').attr('font-size', 10).attr('font-family', 'var(--sm)').text(nf(+v.toFixed(2), S.step < 1 ? 1 : 0));
      }
      ax.append('text').attr('x', R).attr('y', AXY + 30).attr('text-anchor', 'end').attr('fill', 'var(--dim2)').attr('font-size', 10).attr('font-family', 'var(--sm)').text(S.unit);

      bandR = svg.append('rect').attr('y', 40).attr('height', AXY - 40).attr('fill', 'var(--g)').attr('fill-opacity', 0.1).attr('rx', 3);
      sigLine = svg.append('line').attr('y1', 30).attr('y2', 30).attr('stroke', 'var(--g2)').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
      sigTxt = svg.append('text').attr('y', 24).attr('text-anchor', 'middle').attr('fill', 'var(--g)').attr('font-size', 10.5).attr('font-weight', 'bold').attr('font-family', 'var(--sm)');
      iqrLine = svg.append('line').attr('y1', 10).attr('y2', 10).attr('stroke', 'var(--blue)').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
      iqrTxt = svg.append('text').attr('y', 8).attr('text-anchor', 'start').attr('fill', 'var(--blue)').attr('font-size', 10).attr('font-weight', 'bold').attr('font-family', 'var(--sm)');
      meanL = svg.append('line').attr('y1', 38).attr('y2', AXY).attr('stroke', 'var(--dim)').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
      medL = svg.append('line').attr('y1', 38).attr('y2', AXY).attr('stroke', 'var(--blue)').attr('stroke-width', 2.4).attr('stroke-linecap', 'round').attr('stroke-dasharray', '1 0');
      meanT = svg.append('text').attr('y', H - 8).attr('text-anchor', 'middle').attr('fill', 'var(--dim)').attr('font-size', 10.5).attr('font-weight', 'bold').attr('font-family', 'var(--sm)');
      medT = svg.append('text').attr('y', H - 22).attr('text-anchor', 'middle').attr('fill', 'var(--blue)').attr('font-size', 10.5).attr('font-weight', 'bold').attr('font-family', 'var(--sm)');
      dotsG = svg.append('g');
      prev = null;
    }

    const fmtV = (v) => nf(+v.toFixed(2), SETS[cur].step < 1 ? 1 : 0);

    function stackY(arr) {
      const cnt = {};
      return arr.map((v) => {
        const k = v.toFixed(3);
        cnt[k] = (cnt[k] || 0) + 1;
        return AXY - 9 - (cnt[k] - 1) * 9.5;
      });
    }

    function render(animate) {
      const S = SETS[cur];
      const all = incident && S.incident != null ? [...vals, S.incident] : vals;
      const st = summary(all);
      const ys = stackY(all);
      const T = (sel) => (animate && !RM ? sel.transition('m').duration(700).ease(spring) : sel.interrupt('m'));

      const data = all.map((v, i) => ({ i, v, y: ys[i], inc: incident && i === all.length - 1 && S.incident != null }));
      const join = dotsG.selectAll('g.d').data(data, (d) => d.i);
      join.exit().transition().duration(RM ? 0 : 300).attr('opacity', 0).remove();
      const en = join.enter().append('g').attr('class', 'd').attr('tabindex', 0).attr('role', 'slider').style('cursor', 'grab').style('outline', 'none');
      en.append('circle').attr('class', 'hit').attr('r', 14).attr('fill', 'transparent');
      en.append('circle').attr('class', 'mk').attr('r', 5.2).attr('stroke', 'var(--surf)').attr('stroke-width', 1.5);
      en.attr('transform', (d) => `translate(${d.inc && !RM ? R + 20 : x(d.v)},${d.y})`);
      const me = en.merge(join);
      me.select('.mk')
        .attr('fill', 'var(--g)')
        .attr('stroke', (d) => (d.inc ? 'var(--tx)' : 'var(--surf)'))
        .attr('stroke-width', (d) => (d.inc ? 2.4 : 1.5));
      me.attr('aria-valuemin', S.dom[0]).attr('aria-valuemax', S.dom[1]).attr('aria-valuenow', (d) => d.v).attr('aria-label', (d) => `${d.inc ? 'Incident' : 'Relevé ' + (d.i + 1)} : ${fmtV(d.v)} ${S.unit}`);
      me.each(function (d) {
        T(select(this)).attr('transform', `translate(${x(d.v)},${d.y})`);
      });
      bindDrag(en);

      // repères
      const gM = x(st.mean);
      const gD = x(st.med);
      T(bandR).attr('x', x(st.mean - st.sigma)).attr('width', Math.max(2, x(st.mean + st.sigma) - x(st.mean - st.sigma)));
      T(sigLine).attr('x1', x(st.mean - st.sigma)).attr('x2', x(st.mean + st.sigma));
      T(sigTxt).attr('x', gM);
      sigTxt.text(`σ = ${nf(st.sigma, S.dec)}`);
      T(iqrLine).attr('x1', x(st.q1)).attr('x2', x(st.q3));
      T(iqrTxt).attr('x', Math.min(x(st.q3) + 6, W - 82));
      iqrTxt.text(`Q₃ − Q₁ = ${nf(+st.iqr.toFixed(2), S.step < 1 ? 1 : 0)}`);
      T(meanL).attr('x1', gM).attr('x2', gM);
      T(medL).attr('x1', gD).attr('x2', gD);
      T(meanT).attr('x', Math.max(46, Math.min(W - 46, gM)));
      meanT.text(`moyenne ${nf(+st.mean.toFixed(2), S.step < 1 ? 2 : 1)}`);
      T(medT).attr('x', Math.max(40, Math.min(W - 40, gD)));
      medT.text(`médiane ${nf(+st.med.toFixed(2), S.step < 1 ? 2 : 0)}`);

      setNum('mean', st.mean, S.step < 1 ? 2 : 1);
      setNum('sigma', st.sigma, S.dec);
      setNum('med', st.med, S.step < 1 ? 2 : 1);
      setNum('iqr', st.iqr, S.step < 1 ? 2 : 0);

      // lecture
      const u = S.unit;
      if (incident && prev) {
        say.innerHTML = `Avec l'incident de <b>${S.incident} ${u}</b> : la moyenne passe de <b>${nf(prev.mean, S.step < 1 ? 2 : 1)}</b> à <b>${nf(st.mean, 1)}</b>, σ de <b>${nf(prev.sigma, S.dec)}</b> à <b>${nf(st.sigma, S.dec)}</b> ; la médiane ne bouge presque pas (<b>${nf(prev.med, 0)}</b> → <b>${nf(st.med, 0)}</b>) et l'écart interquartile reste petit (<b>${nf(st.iqr, 0)}</b>). Une valeur extrême fait exploser la moyenne et σ, pas la médiane.`;
      } else {
        const small = st.sigma / Math.max(1e-9, Math.abs(st.mean)) < 0.08;
        say.innerHTML = `σ ≈ <b>${nf(st.sigma, S.dec)} ${u}</b> pour une moyenne de <b>${nf(st.mean, S.step < 1 ? 2 : 1)} ${u}</b> : ${small ? 'les relevés sont <b>resserrés</b> autour de la moyenne (série régulière).' : 'les relevés sont <b>étalés</b> autour de la moyenne (série irrégulière).'} Tire un rond et regarde la bande verte s'élargir ou se resserrer.`;
      }
      if (!incident) prev = st;
      dv.querySelector('.sgtab').textContent = `${S.title} (${u}) : ${[...all].sort((a, b) => a - b).map(fmtV).join(' · ')}`;
    }

    function bindDrag(sel) {
      const S = SETS[cur];
      sel.each(function (d) {
        if (d.inc) return;
        const el = select(this);
        const setV = (nv) => {
          const q = Math.round(nv / S.step) * S.step;
          const c = Math.max(S.dom[0], Math.min(S.dom[1], +q.toFixed(3)));
          if (c !== vals[d.i]) {
            vals[d.i] = c;
            render(false);
            // un glissement doit rester fluide : les repères suivent par transition courte
          }
        };
        el.call(
          drag()
            .subject((ev) => ({ x: ev.x, y: ev.y }))
            .on('start', function () {
              select(this).style('cursor', 'grabbing').select('.mk').transition().duration(RM ? 0 : 160).attr('r', 7.5);
            })
            .on('drag', (ev) => setV(x.invert(ev.x)))
            .on('end', function () {
              select(this).style('cursor', 'grab').select('.mk').transition().duration(RM ? 0 : 350).ease(spring).attr('r', 5.2);
            })
        );
        el.on('keydown', (ev) => {
          const k = ev.shiftKey ? 5 : 1;
          if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') (ev.preventDefault(), setV(vals[d.i] + k * S.step));
          else if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') (ev.preventDefault(), setV(vals[d.i] - k * S.step));
        });
      });
    }

    function pick(i) {
      cur = i;
      vals = [...SETS[cur].vals];
      incident = false;
      prev = null;
      chips.querySelectorAll('button').forEach((b) => b.classList.toggle('on', +b.dataset.i === i));
      const hasInc = SETS[cur].incident != null;
      ctl.querySelector('[data-a=inc]').style.display = hasInc ? '' : 'none';
      ctl.querySelector('[data-a=inc]').textContent = "Ajouter l'incident (" + (SETS[cur].incident ?? '') + ' ' + SETS[cur].unit + ')';
      build();
      render(false);
      if (!RM) {
        dotsG.selectAll('g.d').attr('transform', (d) => `translate(${x(d.v)},${AXY})`).transition('m').delay((d, k) => k * 35).duration(700).ease(spring).attr('transform', (d) => `translate(${x(d.v)},${d.y})`);
      }
    }
    chips.querySelectorAll('button').forEach((b) => (b.onclick = () => pick(+b.dataset.i)));
    ctl.querySelector('[data-a=inc]').onclick = (e) => {
      incident = !incident;
      e.currentTarget.textContent = incident ? "Retirer l'incident" : "Ajouter l'incident (" + SETS[cur].incident + ' ' + SETS[cur].unit + ')';
      render(true);
    };
    ctl.querySelector('[data-a=reset]').onclick = () => {
      vals = [...SETS[cur].vals];
      incident = false;
      ctl.querySelector('[data-a=inc]').textContent = "Ajouter l'incident (" + (SETS[cur].incident ?? '') + ' ' + SETS[cur].unit + ')';
      render(true);
    };

    pick(0);

    cleanup = () => {
      loop.stop();
      if (svg) svg.selectAll('*').interrupt('m');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
