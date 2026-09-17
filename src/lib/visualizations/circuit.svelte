<script>
  import { onMount, onDestroy } from 'svelte';
  import { box, SM, createLoop } from './shared.js';
  import { select } from './d3.js';
  import { evaluateCircuit } from './circuit-eval.js';

  /* Fiche « Dessine le circuit toi-même » (séance fusible) — activité neuve,
   * pas une migration : l'élève place générateur/fusible/lampe et trace les
   * fils sur une grille, avec un retour de correction en direct (halo),
   * inspiré des indicateurs correct/incorrect en direct façon jeu télévisé.
   * Fait suite au changement de fiche papier dans le projet frère `cours`
   * (légende des symboles + case vide à dessiner en classe, au lieu d'un
   * schéma pré-dessiné) — voir AGENTS.md « Fiches PDF téléchargeables ».
   *
   * 1. Forme : dix emplacements fixes sur une grille 4×2 (3 fils horizontaux
   *    par rangée + 4 « montants » verticaux) — un clic pose l'outil courant
   *    sur un emplacement. Les fils sont donc toujours droits par
   *    construction (jamais en diagonale, jamais à main levée) : pas besoin
   *    de détecter un tracé oblique, seul le graphe compte.
   * 2. Couleur : jetons d'état légitimes pour un vrai statut à trois niveaux
   *    (halo du cadre + texte, jamais la couleur seule) — reprise du trio
   *    --g/--warn/--red déjà validé pour `fusible` (même rôle sémantique :
   *    dégradé de risque), pas de nouvelle combinaison :
   *    node scripts/validate_palette.js "#7ef2b0,#ffd166,#e2725b" --mode dark
   *    --surface "#0f1512" → séparation CVD ΔE 8,9 (protan, bande 6-8 —
   *    légitime ici car doublée du texte de statut) / 16,0 (normal) : PASS ;
   *    chroma et contraste : PASS. Bande de luminosité : FAIL, propriété du
   *    thème néon du site (déjà noté pour les autres fiches, non corrigeable
   *    sans hex hors tokens). Les fils/symboles restent en encre neutre
   *    (--tx/--dim) et ne passent au vert qu'une fois le circuit fermé
   *    (même convention « énergisé » que `fusible`/`noeuds`) — jamais de
   *    rouge/orange sur un fil ou un symbole, ces jetons ne vivent que sur
   *    le halo + le texte de statut.
   * 3. Logique : le calcul de correction (fermeture de boucle, court-circuit,
   *    convention fusible-après-générateur) est une fonction pure séparée,
   *    `circuit-eval.js` — un vrai algorithme de graphe, pas seulement de
   *    l'assemblage SVG, donc isolé même si la suite vitest ne couvre pas
   *    les visualisations (voir AGENTS.md).
   * 4. Marques : mêmes gabarits que `fusible`/`noeuds` (pile trait long+court,
   *    fusible rectangle + filament, lampe ⊗), tournés selon l'orientation
   *    de l'emplacement (transform rotate) plutôt que redessinés deux fois.
   * 5. Interaction : palette d'outils (boutons), clic/tape sur un
   *    emplacement pour poser l'outil courant (remplace ce qui s'y trouvait,
   *    déplace un dipôle déjà posé ailleurs) — forgiving, pas d'erreur
   *    modale. Cible de clic élargie (trait invisible 18 u) par-dessus tout
   *    le reste pour rester cliquable au doigt.
   * 6. Accessibilité : chaque emplacement est un <line role="button"
   *    tabindex="0"> avec libellé décrivant son contenu, activable au
   *    clavier (Entrée/Espace) ; aria-label du <svg> qui reprend le message
   *    de statut ; vue tableau repliable ; halo statique (jamais la couleur
   *    seule, texte de statut toujours affiché) et sans pulsation animée
   *    sous prefers-reduced-motion (voir src/lib/styles/viz.css) ; paquets
   *    de courant coupés sous prefers-reduced-motion.
   *
   * Contraintes captain : D3/SVG, imports modulaires, mouvement amorti,
   * poids léger, disposition verticale mobile-first, parité d'échelle
   * (VB_W = 620). */

  let { vd } = $props();
  let host;
  let cleanup = () => {};
  const loop = createLoop();

  const STATUS_TEXT = {
    red: '✗ Circuit incorrect',
    orange: '⚠ Fonctionne, schéma non conforme',
    green: '✓ Circuit correct'
  };

  onMount(() => {
    host.style.position = 'relative';
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const W = 620;
    const H = 260;
    const COLS = 4;
    const ROWS = 2;
    const xs = [80, 240, 400, 560];
    const ys = [64, 196];
    const nodeId = (c, r) => `${c}-${r}`;
    const nodePos = (id) => {
      const [c, r] = id.split('-').map(Number);
      return { x: xs[c], y: ys[r] };
    };

    const slots = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS - 1; c++) slots.push([nodeId(c, r), nodeId(c + 1, r)]);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS - 1; r++) slots.push([nodeId(c, r), nodeId(c, r + 1)]);
    const slotKey = (a, b) => [a, b].sort().join('__');

    const TOOLS = [
      ['generateur', 'Générateur'],
      ['fusible', 'Fusible'],
      ['lampe', 'Lampe'],
      ['fil', 'Fil'],
      ['gomme', 'Gomme']
    ];
    let tool = 'generateur';
    const edgeType = new Map(); // slotKey -> 'fil' | 'generateur' | 'fusible' | 'lampe'
    const placedAt = { generateur: null, fusible: null, lampe: null }; // slotKey | null

    const svg = select(host)
      .append('svg')
      .attr('class', 'd3viz')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const statusTxt = svg
      .append('text')
      .attr('x', W / 2)
      .attr('y', 26)
      .attr('text-anchor', 'middle')
      .attr('font-family', SM)
      .attr('font-size', 13)
      .attr('font-weight', 'bold');

    const circuitG = svg.append('g');
    const symbolsG = svg.append('g');
    const nodesG = svg.append('g');
    const hitG = svg.append('g');

    nodePosAllForNodes().forEach(({ x, y }) => {
      nodesG.append('circle').attr('cx', x).attr('cy', y).attr('r', 3).attr('fill', 'var(--line2)');
    });
    function nodePosAllForNodes() {
      const ids = new Set();
      slots.forEach(([a, b]) => {
        ids.add(a);
        ids.add(b);
      });
      return [...ids].map(nodePos);
    }

    const edgeVisuals = new Map();
    slots.forEach(([a, b]) => {
      const key = slotKey(a, b);
      const pa = nodePos(a);
      const pb = nodePos(b);
      const line = circuitG
        .append('line')
        .attr('x1', pa.x)
        .attr('y1', pa.y)
        .attr('x2', pb.x)
        .attr('y2', pb.y)
        .attr('stroke', 'var(--line2)')
        .attr('stroke-width', 2.2)
        .attr('stroke-linecap', 'round');
      const flow = circuitG
        .append('line')
        .attr('x1', pa.x)
        .attr('y1', pa.y)
        .attr('x2', pb.x)
        .attr('y2', pb.y)
        .attr('stroke', 'var(--g)')
        .attr('stroke-width', 3)
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', '3 16')
        .attr('opacity', 0);
      const symbolG = symbolsG.append('g').attr('transform', `translate(${(pa.x + pb.x) / 2},${(pa.y + pb.y) / 2})`);
      const hit = hitG
        .append('line')
        .attr('x1', pa.x)
        .attr('y1', pa.y)
        .attr('x2', pb.x)
        .attr('y2', pb.y)
        .attr('stroke', 'transparent')
        .attr('stroke-width', 20)
        .attr('tabindex', 0)
        .attr('role', 'button')
        .style('cursor', 'pointer')
        .style('pointer-events', 'stroke');
      hit.on('click', () => placeAt(key));
      hit.on('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          placeAt(key);
        }
      });
      hit.on('focus', () => line.attr('stroke', 'var(--blue)'));
      hit.on('blur', () => render(false));
      edgeVisuals.set(key, { a, b, line, flow, symbolG });
    });

    function placeAt(key) {
      if (tool === 'gomme') {
        const prev = edgeType.get(key);
        if (prev) {
          edgeType.delete(key);
          if (prev in placedAt && placedAt[prev] === key) placedAt[prev] = null;
        }
      } else if (tool === 'fil') {
        const prev = edgeType.get(key);
        if (prev && prev !== 'fil' && placedAt[prev] === key) placedAt[prev] = null;
        edgeType.set(key, 'fil');
      } else {
        const oldKey = placedAt[tool];
        if (oldKey && oldKey !== key) edgeType.delete(oldKey);
        const prev = edgeType.get(key);
        if (prev && prev !== tool && prev in placedAt && placedAt[prev] === key) placedAt[prev] = null;
        edgeType.set(key, tool);
        placedAt[tool] = key;
      }
      render(true);
    }

    function drawGenerateur(g) {
      g.append('rect').attr('x', -15).attr('y', -16).attr('width', 30).attr('height', 32).attr('fill', 'var(--surf)');
      g.append('line').attr('x1', 0).attr('y1', -13).attr('x2', 0).attr('y2', 13).attr('stroke', 'var(--tx)').attr('stroke-width', 2.5);
      g.append('line').attr('x1', -7).attr('y1', -8).attr('x2', -7).attr('y2', 8).attr('stroke', 'var(--tx)').attr('stroke-width', 5);
    }

    function drawFusible(g) {
      const FW = 42;
      const FH = 18;
      g.append('rect').attr('x', -FW / 2 - 4).attr('y', -FH / 2 - 6).attr('width', FW + 8).attr('height', FH + 12).attr('fill', 'var(--surf)');
      g.append('rect').attr('x', -FW / 2).attr('y', -FH / 2).attr('width', FW).attr('height', FH).attr('rx', 3).attr('fill', 'rgba(0,0,0,0.3)').attr('stroke', 'var(--dim)').attr('stroke-width', 1.6);
      g.append('line').attr('x1', -FW / 2 + 5).attr('y1', 0).attr('x2', FW / 2 - 5).attr('y2', 0).attr('stroke', 'var(--tx)').attr('stroke-width', 2.2).attr('stroke-linecap', 'round');
    }

    function drawLampe(g, lit) {
      g.append('rect').attr('x', -15).attr('y', -15).attr('width', 30).attr('height', 30).attr('fill', 'var(--surf)');
      if (lit) g.append('circle').attr('r', 16).attr('fill', 'var(--g)').attr('opacity', 0.22);
      g.append('circle').attr('r', 10).attr('fill', lit ? 'var(--g)' : 'var(--surf3)').attr('stroke', 'var(--tx)').attr('stroke-width', 1.8);
      g.append('line').attr('x1', -7).attr('y1', -7).attr('x2', 7).attr('y2', 7).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
      g.append('line').attr('x1', -7).attr('y1', 7).attr('x2', 7).attr('y2', -7).attr('stroke', 'var(--tx)').attr('stroke-width', 1.6);
    }

    const ctl = box(
      host,
      'vctl',
      TOOLS.map(([id, lab]) => `<button data-tool="${id}"${id === tool ? ' class="on"' : ''}>${lab}</button>`).join('') +
        `<button class="gh" id="czReset">Réinitialiser</button>`
    );

    const say = box(host, 'say', '');

    const dataView = box(
      host,
      'viz-data',
      `<details><summary>Voir les emplacements</summary>` +
        `<table><caption id="cCap"></caption>` +
        `<thead><tr><th>Emplacement</th><th>Contenu</th></tr></thead>` +
        `<tbody id="cBody"></tbody></table></details>`
    );
    const cBody = dataView.querySelector('#cBody');
    const cCap = dataView.querySelector('#cCap');

    const REASON_TEXT = {
      missing: (r) => `Il manque : ${r.missing.join(', ')}. Place les trois dipôles pour fermer le circuit.`,
      'short-circuit': () =>
        'Court-circuit : un fil relie directement les deux bornes du générateur sans passer par un dipôle. Dans la réalité, le générateur serait détruit.',
      open: () => "Le circuit n'est pas une boucle fermée : un fil s'arrête dans le vide, ou il y a une branche en trop.",
      'fuse-not-adjacent': () =>
        'Le circuit fonctionne (la lampe s\'allume), mais le schéma ne respecte pas la convention : le fusible doit être placé juste après le générateur pour protéger tout le circuit.',
      ok: () => 'Boucle fermée, fusible juste après le générateur : le schéma est conforme.'
    };

    function slotLabel(a, b, type) {
      const base = `emplacement entre ${a} et ${b}`;
      if (!type) return `${base}, vide`;
      const names = { fil: 'fil', generateur: 'générateur', fusible: 'fusible', lampe: 'lampe' };
      return `${base}, ${names[type]}`;
    }

    function render(animate) {
      const an = animate && !RM;
      const edgesArr = [...edgeType.entries()].map(([key, type]) => {
        const [a, b] = key.split('__');
        return { a, b, type };
      });
      const result = evaluateCircuit(edgesArr);
      const energized = result.status === 'orange' || result.status === 'green';

      slots.forEach(([a, b]) => {
        const key = slotKey(a, b);
        const v = edgeVisuals.get(key);
        const type = edgeType.get(key);
        const isDipole = type === 'generateur' || type === 'fusible' || type === 'lampe';
        const color = type ? (energized ? 'var(--g)' : 'var(--tx)') : 'var(--line2)';
        (an ? v.line.transition('e').duration(220) : v.line.interrupt('e')).attr('stroke', color).attr('stroke-width', type ? 2.8 : 2.2);
        v.flow.attr('opacity', energized && type === 'fil' && !RM ? 0.9 : 0);

        v.symbolG.selectAll('*').remove();
        if (isDipole) {
          const pa = nodePos(a);
          const pb = nodePos(b);
          const angle = (Math.atan2(pb.y - pa.y, pb.x - pa.x) * 180) / Math.PI;
          v.symbolG.attr('transform', `translate(${(pa.x + pb.x) / 2},${(pa.y + pb.y) / 2}) rotate(${angle})`);
          if (type === 'generateur') drawGenerateur(v.symbolG);
          else if (type === 'fusible') drawFusible(v.symbolG);
          else drawLampe(v.symbolG, energized);
        }

      });
      hitG.selectAll('line').attr('aria-label', function (_, i) {
        const [a, b] = slots[i];
        return slotLabel(a, b, edgeType.get(slotKey(a, b)));
      });

      statusTxt.text(STATUS_TEXT[result.status]).attr('fill', `var(--${result.status === 'red' ? 'red' : result.status === 'orange' ? 'warn' : 'g'})`);

      host.classList.remove('circuit-red', 'circuit-orange', 'circuit-green');
      host.classList.add(`circuit-${result.status}`);

      const reasonMsg = (REASON_TEXT[result.reason] || REASON_TEXT.ok)(result);
      say.innerHTML = `<b>${STATUS_TEXT[result.status]}</b><br>${reasonMsg}`;

      svg.attr('aria-label', `Circuit en construction. ${STATUS_TEXT[result.status]}. ${reasonMsg}`);

      cCap.textContent = STATUS_TEXT[result.status];
      cBody.replaceChildren(
        ...slots.map(([a, b]) => {
          const type = edgeType.get(slotKey(a, b));
          const tr = document.createElement('tr');
          const td1 = document.createElement('td');
          td1.textContent = `${a} — ${b}`;
          const td2 = document.createElement('td');
          td2.textContent = type ? { fil: 'fil', generateur: 'générateur', fusible: 'fusible', lampe: 'lampe' }[type] : '—';
          tr.append(td1, td2);
          return tr;
        })
      );
    }

    let t = 0;
    function tick() {
      if (!RM) {
        t += 1;
        const off = -((t * 0.8) % 19);
        circuitG.selectAll('line').each(function () {
          const sel = select(this);
          if (+sel.attr('opacity') > 0) sel.attr('stroke-dashoffset', off);
        });
      }
      loop.raf(tick);
    }

    ctl.querySelectorAll('[data-tool]').forEach((b) => {
      b.onclick = () => {
        tool = b.dataset.tool;
        ctl.querySelectorAll('[data-tool]').forEach((z) => z.classList.toggle('on', z === b));
        // seul le focus déplace visuellement l'outil ; on ne redessine pas le circuit
      };
    });
    ctl.querySelector('#czReset').onclick = () => {
      edgeType.clear();
      placedAt.generateur = null;
      placedAt.fusible = null;
      placedAt.lampe = null;
      render(true);
    };

    render(false);
    tick();

    cleanup = () => {
      loop.stop();
      svg.selectAll('*').interrupt('e');
      select(host).selectAll('*').remove();
    };
  });

  onDestroy(() => cleanup());
</script>

<div bind:this={host} class="viz"></div>
