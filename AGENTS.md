# Project agent memory

This file is the project's committed home for project-intrinsic agent knowledge: build, test, release, architecture, and sharp-edge notes that should travel with the code.

- Add durable project-specific notes here as they are discovered through real work.

## Fiches PDF téléchargeables

- Une séance référence ses fiches imprimables via `pdf:["<slug>"]` (résolu en
  `/fiches/<c.pdf>/<slug>.pdf`, voir le rendu dans
  `src/routes/c/[id]/[n]/+page.svelte`) ; le fichier doit exister dans
  `static/fiches/<c.pdf>/`, sinon le bouton de téléchargement pointe dans le
  vide. Le contenu source de ces fiches (une page HTML imprimable par atelier,
  méthode + exercices + corrigé) vit dans le projet frère en lecture seule
  `cours` (`eleve/<matière>/<slug>.html`), pas dans ce dépôt.
- Pour ajouter une fiche : lire le `.html` source dans `cours`, puis le rendre
  en PDF avec Chromium headless (même commande que `eleve/render.sh` dans ce
  projet frère, mais en sortant vers un répertoire de travail temporaire pour
  ne rien écrire dans le projet en lecture seule) :
  `chromium --headless --disable-gpu --no-sandbox --no-pdf-header-footer --print-to-pdf=<tmp>/<slug>.pdf file://<chemin>/<slug>.html`,
  puis copier le PDF obtenu dans `static/fiches/<matière>/`.

## Visualisations

- Les manipulations interactives vivent dans `src/lib/visualizations/` et sont
  enregistrées dans `registry.js` (liste et nombre exacts : lire ce fichier).
  Socle historique : `shared.js` (rendu `<canvas>`
  2D + `requestAnimationFrame`, helpers `box`/`slider`/`readout`/`Spring`/
  `createLoop`).
- **Migration D3 en cours** (canvas → `<svg>` animé par les transitions D3 ;
  imports modulaires `d3-selection`/`d3-transition`/`d3-drag`, pas le bundle
  `d3` ni `d3-scale`, pour le poids). Fiches déjà portées : `moyenne`,
  `mediane`, `moypond`, `fluctuation`, `batons`, `budget` (+ `alternatif`,
  `fusible` et `noeuds`, refontes — voir ci-dessous). Les autres restent sur
  `shared.js` (canvas) en attendant leur lot.
- `alternatif` est une **refonte** (pas une simple migration de graphe) :
  schéma de circuit avec symboles normalisés (source pile/générateur,
  interrupteur, lampe ⊗), animation de « remplissage » des fils à la fermeture
  du circuit (`stroke-dashoffset`) + paquets de courant en circulation, trois
  contextes (12 V continu / 230 V ~ / 400 V haute tension). Le contexte haute
  tension peint les fils en `--warn` (orange, pictogramme ⚠) et, interrupteur
  fermé, GRILLE la lampe prévue pour 12 V (flash de surtension, puis verre mort
  `--bg` + fêlure/filament rompu `--red` + éclats `--warn` ; jouée une seule
  fois, réparée en rouvrant l'interrupteur ou en changeant de contexte, état
  final direct si mouvement réduit). `--warn` / `--red` sont ici des jetons
  d'état légitimes (danger normalisé métier), jamais des séries de données.
  Bascule image réaliste ↔ symbole. Disposition
  **verticale imposée** (circuit en haut, trace tension/temps en dessous — jamais
  côte à côte) pour rester lisible sur un téléphone. Même contrat `d3.js`
  (imports modulaires, `springEase`, `prefers-reduced-motion`).
- `fusible` est une **refonte** analogue (schéma normalisé : pile 12 V, FUSIBLE
  juste après = rectangle traversé par son filament, cinq consommateurs lampes ⊗
  en parallèle sur grille alignée). Le filament chauffe `--g` → `--warn` →
  `--red` selon I / calibre (rouge seulement si I > calibre, cohérent avec la
  fusion), puis ROMPT en surintensité (arcs + flash joués une seule fois via
  drapeau `wasMelted`, mot FONDU, circuit dé-énergisé ; réversible sous le
  calibre). Jauge d'intensité sous le circuit : langage visuel de `budget`
  (barre I face au calibre, repère `--blue` pointillé). Boutons consommateurs +
  calibre, `role="img"` + `aria-label`, vue tableau repliable, paquets de
  courant ∝ I coupés sous `prefers-reduced-motion`. Même contrat `d3.js`.
- `noeuds` est une **refonte** analogue (schéma normalisé : pile, ampèremètre
  d'entrée en série, un nœud repéré point + libellé, deux branches parallèles
  après le nœud chacune avec son propre ampèremètre et sa lampe ⊗ — loi des
  nœuds I_entrée = I_gauche + I_droite lisible directement sur les trois
  appareils). Griller une lampe (boutons par branche + « tout réparer ») coupe
  sa branche avec le même code visuel que `fusible`/`alternatif` (verre mort
  `--bg`, contour + filament rompu `--red`, jeton d'état légitime pour un
  statut binaire) et fait retomber aussitôt l'ampèremètre d'entrée. `role="img"`
  + `aria-label` décrivant les trois ampèremètres, vue tableau repliable,
  paquets de courant coupés sous `prefers-reduced-motion`. Même contrat `d3.js`.
- Socle partagé : `d3.js` — `dotPlot` + `stackDots` (nuage de points sur axe
  gradué), `barField` (diagramme en bâtons sur axe catégoriel : `band(i)`,
  `yScale(frac)` ; `batons` y ajoute un tracé de secteurs local `arcPath` pour
  le mode circulaire), `linScale`, easing ressort `springEase`/`spring`, infobulle
  `tip` + conversion `vbToCss` ; `VB_W` = largeur logique du canvas historique,
  pour rendre à la même échelle que les fiches canvas voisines. CSS du cadre
  SVG : `.viz svg.d3viz` mutualisé avec `.viz canvas` dans
  `src/lib/styles/viz.css` (+ classes additives `.vtip`, `.viz-data`,
  `.read .v.b`, sans effet sur les fiches canvas).
- Toutes les fiches portées suivent la procédure `dataviz` (voir en-tête de
  chaque fichier) : couleurs **exclusivement** via `var(--…)` de `tokens.css` —
  série de données = teinte séquentielle unique `--g` ; valeur dérivée
  (moyenne, médiane, âge moyen) ou repère théorique (proportion `p`) = accent
  `--blue` ; jamais `--warn`/`--red` comme série de données — jetons d'état
  réservés, mais légitimes pour un vrai statut binaire (`budget` `--g`/`--red`
  finançable/dépasse, `alternatif` `--warn` haute tension, `fusible`
  `--warn`/`--red` filament qui chauffe puis fond, `noeuds` `--red` lampe
  grillée), toujours doublé d'un pictogramme + libellé, jamais la couleur
  seule. Palettes validées `--mode dark` avec le `validate_palette.js` fourni
  par la skill `dataviz` (lancé depuis le répertoire de la skill lors de son
  étape de validation, ce n'est pas un script de ce dépôt — voir les en-têtes
  de fichier pour les commandes exactes rejouées) ; les FAIL band/chroma sont
  la propriété du thème néon du site, pas corrigeables sans hex hors tokens.
  Accessibilité : vue tableau repliable, focus clavier = survol,
  `prefers-reduced-motion` respecté.
- Contrainte tenue : mobile d'abord / poids léger (voir `src/lib/styles/tokens.css`).
  Animations : jamais de saut instantané — easing amorti obligatoire.
- Pas de tests du rendu SVG/canvas des visualisations dans la suite (`vitest`
  couvre `src/lib/stores/`, `src/lib/data/` et `src/lib/utils/`) ; un module de
  logique pure extrait d'une visualisation (ex. `circuit-eval.js`, voir
  ci-dessous) peut avoir son propre test, `vitest` incluant tout
  `src/**/*.test.js`.

## Activité de construction avec correction en direct (`circuit`)

- `circuit` (fiche fusible, sécurité électrique) est une **activité neuve**, pas
  une migration : l'élève place générateur/fusible/lampe et trace les fils sur
  une grille à emplacements fixes (jamais de tracé libre), avec un halo
  correct/incorrect en direct sur `.viz` (rouge/orange/vert, classes
  `.viz.circuit-{red,orange,green}` dans `viz.css`, toujours doublé d'un
  pictogramme + texte de statut). Patron réutilisable pour toute future
  activité « construis et vérifie » du même type :
  - **Séparer la logique de correction du rendu** dans un module pur dédié
    (`circuit-eval.js`, testé par `circuit-eval.test.js`) quand c'est un vrai
    algorithme (ici : fermeture de boucle, court-circuit, convention de
    schéma) — le rendu SVG lui-même (`circuit.svelte`) reste hors suite vitest,
    comme les autres visualisations, mais la logique de graphe (ex. « connexe
    + degré 2 partout ⇒ cycle simple unique ») porte à elle seule plusieurs
    invariants électriques d'un coup et se prête bien à un test unitaire, voir
    l'en-tête de ce fichier.
  - **Snapper à des emplacements fixes plutôt que détecter un tracé libre** :
    élimine toute la détection géométrique (diagonale, désalignement) par
    construction.
  - Halo = classes CSS additives sur `.viz` posées par le composant
    (`host.classList`), jamais de scoped `<style>` Svelte (le rendu de ces
    fiches est impératif, hors du DOM compilé par Svelte, donc un `<style>`
    scoped n'atteindrait rien sans `:global()`) ; couleurs de halo via
    `color-mix(in srgb, var(--…) …%, transparent)`, jamais de rgba hex en dur.
    Pulsation d'attention coupée sous `prefers-reduced-motion`.

## TP / activité de manipulation dans une séance

Le schéma d'étape (`t`/`txt`/`img`/`apport`/`doc`/`q`) n'a pas de champ dédié
pour une activité de manipulation réelle (peser, mesurer, câbler…). Le pattern
« Avec matériel » / « Sans matériel » déjà utilisé dans les séquences source du
projet frère `cours` (ex. `sciences/physique/Securite_electrique_2PMV2_sequence.md`,
séance 2) se transpose directement dans un `apport` HTML : sous-titres en gras
« Avec matériel » (procédure réelle avec l'équipement) puis « Sans matériel »
(renvoi vers un `doc` de repli avec des valeurs déjà relevées), suivi de `q`
qui exploitent ce relevé de repli. Ça garde une vraie consigne de manipulation
pour l'enseignant équipé, sans bloquer celui qui ne l'est pas.

## Jeux de révision (automatismes)

- Deux mécanismes de révision « ludiques » complètent le quiz flash existant
  (`src/routes/flash/[classe]/[theme]`), même source de données
  (`$lib/data/automatismes.js`), mêmes points d'entrée depuis le sélecteur de
  thème (`src/routes/flash/[classe]/+page.svelte`) : **cartes à associer**
  (`[theme]/cartes`, memory 6 paires/12 cartes, dédupliquées par réponse pour
  éviter toute correspondance ambiguë — voir `dedupedItems` dans le
  composant) et **parcours par niveaux** (`[classe]/parcours`, une carte de
  progression par classe qui débloque les thèmes de `AUTO.c[classe].o` un par
  un puis un nœud « défi final »).
- Le parcours réutilise tel quel le quiz flash comme épreuve de nœud (pas un
  3ᵉ mécanisme) : `[theme]/+page.svelte` lit `?level=1` (thème) ou
  `?level=defi` (mélange, `?level=defi` sur la route `melange`) et
  valide/persiste via `$lib/stores/automatismes-progress.js` (75 % minimum,
  clé localStorage `mrp.parcours.<slug classe>`, dégradé en silence si
  indisponible — même convention que `$lib/stores/progress.js`). Cette page
  est prérendue (`prerender = true`) : lire la query string s'y fait via
  `browser` + `location.search` (pattern `readLevel()` du composant), jamais
  via `page.url.searchParams` qui lève une erreur de build sur une page
  statique. Le déblocage séquentiel n'est pas qu'un habillage du parcours :
  `[theme]/+page.svelte` revérifie lui-même le prérequis (thème précédent de
  `AUTO.c[classe].o` validé, ou tous les thèmes pour `defi`) avant d'appeler
  `markThemeCleared`/`markDefiCleared`, pour qu'une arrivée directe sur l'URL
  `?level=…` (lien partagé, retour navigateur) ne puisse pas valider un nœud
  hors séquence.
- Habillage pixel-art des deux mécanismes : sprites bitmap à la main dans
  `$lib/pixel/sprites.js` (grille de caractères `#`/`+`/`.`, voir
  commentaire d'en-tête), rendus par `$lib/components/pixel/PixelIcon.svelte`
  (`<rect>` SVG, pas d'asset raster — même convention que les visualisations,
  voir ci-dessus). Chrome bouton/panneau/barre de progression trapu dans
  `$lib/styles/pixel.css`, importé seulement par les pages de ces deux
  mécanismes (jamais dans `+layout.svelte`) pour que le reste du site garde
  son chrome habituel.

## Comparaison de situations en onglets (`situations`)

- Pour comparer un petit nombre de situations parallèles (2-4) avec de la
  place pour une illustration, un `step` peut porter
  `situations:[{t, illus, fields:[[label,value],...]}, …]` au lieu de
  `doc:{h,r}` (ex. `securite-electrique.js`, étape « Trois milieux, trois
  risques »). Rendu par `$lib/components/SituationsTabs.svelte` en onglets
  (une situation = un onglet, illustration + liste label/valeur), consommé
  par `src/routes/c/[id]/[n]/+page.svelte` en parallèle du rendu `doc:{h,r}`
  générique (jamais remplacé : `doc` reste le bon choix pour un vrai tableau,
  ex. le code couleur des fusibles ou les relevés du technicien dans ce même
  fichier). N'utiliser `situations` que pour ce cas précis (comparaison
  illustrée, peu d'entrées) ; un tableau de données réelles reste `doc`.
- **Seule dépendance UI-kit du projet** (choix délibéré, pas un défaut à
  reproduire ailleurs) : `SituationsTabs.svelte` s'appuie sur
  `flowbite-svelte` (`Tabs`/`TabItem`) avec `tabStyle="none"` — désactive tout
  le thème visuel par défaut de flowbite (classes Tailwind gray/primary) pour
  ne garder que la structure ARIA (`role="tablist"`/`"tab"`/`"tabpanel"`,
  sélection) ; l'apparence vient entièrement du CSS scoped du composant, en
  tokens.css. `tailwindcss` + `@tailwindcss/vite` (`vite.config.js`) sont
  requis comme peer deps mais **sans la couche preflight** :
  `src/lib/styles/flowbite.css` importe seulement `tailwindcss/theme` et
  `tailwindcss/utilities`, jamais `tailwindcss/preflight` (qui réinitialise
  les éléments globaux et casserait le design du reste du site). Ce fichier
  n'est importé que par `SituationsTabs.svelte`, jamais dans
  `+layout.svelte` — même convention opt-in que `pixel.css`. Tailwind
  n'analyse pas `node_modules` par défaut : les classes par défaut de
  flowbite-svelte (définies dans son propre bundle compilé) ne génèrent donc
  aucun CSS et sont inertes ; c'est voulu, puisque `tabStyle="none"` +
  classes maison les remplacent de toute façon.
- Illustrations pixel-art multi-teintes : `$lib/pixel/situations.js` (bitmaps
  + palette `caractère → var(--…)`, plusieurs teintes par sprite) rendues par
  `$lib/components/pixel/SituationIllus.svelte` (`<rect>` SVG,
  `image-rendering: pixelated`) — variante de la technique
  `$lib/pixel/sprites.js`/`PixelIcon.svelte` (voir « Jeux de révision »
  ci-dessus) mais avec plus de deux tons par bitmap au lieu du seul couple
  ink/accent ; `--warn` y sert de câble haute tension (véhicule électrique),
  même convention que la visualisation `alternatif`.

## Statistique TC APM (stage, registre, sondage, AP)

- Quatre cours pour la classe `TC APM` (slug `tcapm`) : `stats-stage-tcapm`,
  `registre-mediation-tcapm`, `sondage-tcapm`, `ap-stats-tcapm`, tous dans le bloc
  `stat-cap` / `numeriques-cap` (AP). **La classe s'appelle « TC APM », jamais « APMP »** (règle du
  capitaine, tout texte visible) : l'ancien libellé et l'ancien slug `tcapmp` ne subsistent que dans
  `$lib/utils/legacy-class.js`, qui prérend des redirections 307 (`/p/tcapmp`, `/flash/tcapmp/…`,
  `/bloc/tcapmp/…`, `/revisions/…`, `/ccf/…`, `/r/TC APMP`) — toute route à paramètre `classe` y
  passe via `withLegacyClassEntries` + `redirectLegacyClass`. Restent volontairement en `apmp`
  (liens imprimés / QR / favoris, progression `mrp.done` indexée par id) : les ids de cours
  (`stat-apmp`, `ap-consolidation-tcapmp`…) et les noms de PDF `*-tcapmp-*`. La progression du
  parcours d'automatismes (`mrp.parcours.<slug>`) est relue depuis l'ancienne clé. Programme CAP :
  effectif total, fréquences, moyenne, bâtons, circulaire ; médiane et quartiles hors programme
  (boîte « pour les curieux » seulement, voir `Stat1Shell`).
- **Division : jamais ÷.** Dans `apport` / `trace` / `met` des récap (HTML via `{@html}`) on
  écrit `fr(num, den)` de `$lib/utils/frac.js` (classe globale `.fr` dans `global.css`) ; dans
  un libellé de question ou une option de QCM (texte brut) on dit « 8 sur 20 ». Le test
  `courses/tcapm-stats.test.js` refuse ÷ dans ces contenus (et dans le thème `freq`).
- Manipulations neuves (`registry.js`) : `registre`, `frequence`, `convertir`, `moissuivant`,
  `phrase` (assembler « effectif total + effectif + pourcentage », réutilisable avec n'importe
  quel gabarit `vd.items[].parts`), `batonsDessin`, `depouillement` (réponses → effectifs →
  fréquences → bâtons/circulaire ; `vd.only:'tally'` s'arrête à l'effectif total),
  `saisieErreur`. Briques communes : `$lib/styles/stat-viz.css` (importé par chaque composant,
  jamais dans `+layout.svelte`). Svelte 5 natif (`Tween` de `svelte/motion` + `backOut`), pas
  de D3. **Piège** : ne pas nommer une classe `.read` ou `.say` dans un composant — `viz.css` les
  définit globalement (readout / bulle) et elles fuient dans le composant.
- Calculatrice 1 variable : `calc:{mode:'stat1', series:[[v,n],…], start:'home'|'data'|'graph'|'stats',
  stale?, log?, calculs?}` → `$lib/numworks/Stat1Shell.svelte` (logique pure et testée dans
  `stat1.js`). L'onglet Stats montre ce que l'élève a RÉELLEMENT tapé (N1 oublié → effectif total 5) ;
  le contrôle « même effectif total que mon tableau » explique l'écart. `findBadCalcRefs` ignore ce mode.
- `QuizInput` accepte `hints:[{v, say}]` (message pour une erreur typique précise) et `hint`
  (consigne générale), affichés après une pause de frappe : c'est le « retour sur question
  ouverte » préféré du capitaine aux phrases à trous. `checkText` compare maintenant un nombre
  attendu **exactement** (0,35 n'est plus accepté pour 0,3, 400 pour 40) et accepte virgule ou point.
- Automatismes : le thème `freq` (TC APM) est ajouté en FIN de `automatismes.js` (fichier d'une
  seule ligne : toute autre édition entre en conflit) ; ses variantes aléatoires viennent de
  `$lib/data/auto-freq.js` (`GENERATORS`), branchées dans `flash/[classe]/[theme]`. Un item
  `[q, a, {bars}]` dessine un diagramme sous la question. Les thèmes d'un bloc partagé sont
  filtrés par classe sur la page `bloc/…`.
- Fiches PDF de ces cours (`static/fiches/{maths,ap}/`) : rendues depuis `cours/eleve/…` avec la
  commande Chromium ci-dessus sur une COPIE temporaire de l'arbre `eleve/` (`_style.css`, `qr/`,
  lien vers `images/`) dont on a remplacé les `&divide;` restants (via `fractions_html.py` du projet
  `cours`, lu seulement) et le QR : les fiches sources pointent vers `/i/stats-probas` (cours 2P MV2)
  alors que le bon cours est `/i/stats-stage-tcapm` ou `/i/ap-stats-tcapm`. Vérifier
  `pdftotext … | grep ÷` avant de copier. Chromium de la sandbox ne charge pas les pages
  `http://127.0.0.1` ; pour voir une manipulation à 390 px, construire un bundle IIFE à part (Vite +
  `@sveltejs/vite-plugin-svelte`, alias `$lib`) et l'ouvrir en `file://`.

## Jeu du pendu

- Route `/jeux/pendu` (page unique, lien depuis l'accueil). Mots par thème dans
  `$lib/data/pendu-words.js` (un mot simple par entrée, sans tiret ni ligature
  œ — le test `pendu.test.js` le vérifie) ; logique pure (accents → lettre de
  base, tirage, état immuable) dans `$lib/utils/pendu.js`. Le mot est tiré
  dans `onMount` (page prérendue : pas de hasard au rendu serveur). Touches
  du clavier à l'écran en `aria-disabled` (pas `disabled`) pour garder le
  focus clavier.

## Contenu 2P MV2 récent (bilan stats, bougies, lot de pièces, conversions, tarif)

- **Fractions, jamais « ÷ »** dans le contenu récent : `frac(n, d)` de
  `src/lib/utils/fr.js` (classe `.fr` dans `global.css`). `QuizInput` accepte
  `qh`/`solh` (HTML) à côté de `q`/`sol` ; `RecapCard` accepte `exh`.
- Séances ajoutées dans `courses/stats-probas-bilan.js`, `stats-probas-bougies.js`,
  `fonctions-tarif.js` (entrée Fonctions, verrouillée par `mv-fonctions` 30-33
  dans `progression.js`) et le cours `co-intervention-conversions-mv2.js`.
  Insérer une séance décale les clés `COMP` (`competences.js`) et `ch` de
  `blocs.js` : les renuméroter ensemble.
- Auto-tests : `data/selftests-stats.js` (réponses CALCULÉES par
  `utils/stats-mv.js`, testées) rendus par `autotest*.svelte`.
- PDF : nommer `<slug>-standard.pdf` quand la source n'a pas de suffixe ;
  libellés des boutons dans `pdfLabel()` (`course-helpers.js`).
- Vérification visuelle : ce Chromium ne livre pas les requêtes loopback ;
  naviguer par CDP avec interception `Fetch.fulfillRequest` du dossier `build/`.

## Maintaining this file

Keep this file for knowledge useful to almost every future agent session in this project.
Do not repeat what the codebase already shows; point to the authoritative file or command instead.
Prefer rewriting or pruning existing entries over appending new ones.
When updating this file, preserve this bar for all agents and keep entries concise.
