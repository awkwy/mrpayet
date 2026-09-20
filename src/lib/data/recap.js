export const RECAP = {
 "securite-electrique":[
  {sig:"On te donne la puissance P (W) et la tension U (V), on demande l'intensité I",
   met:"I = P ÷ U",ex:"110 W sous 12 V → I = 110 ÷ 12 ≈ 9,2 A",pg:"Ne pas inverser : c'est P ÷ U, pas U ÷ P."},
  {sig:"Choisir le calibre d'un fusible",
   met:"Le premier calibre juste au-dessus de l'intensité calculée.",ex:"I = 9,2 A → calibre 10 A (fusible rouge)",pg:"Prendre plus gros « pour être tranquille » : le circuit n'est alors plus protégé."},
  {sig:"Savoir si une branche du circuit est coupée",
   met:"Loi des nœuds : l'intensité qui entre au nœud = somme des intensités qui sortent. Une branche à 0 A est coupée.",ex:"9,2 A entrent, 4,6 A repartent à gauche → 4,6 A à droite. Si 0 A à droite : lampe droite HS.",pg:"Oublier qu'au nœud, tout ce qui entre ressort."},
  {sig:"Dire si une tension est continue ou alternative",
   met:"Alternative : le signal change de signe et se répète (période T). Continue : valeur constante, un seul signe.",ex:"Secteur : alternatif, 230 V efficaces, 50 Hz. Batterie : continu, 12 V.",pg:"Confondre la valeur efficace (230 V) et la valeur crête (325 V)."},
  {sig:"Passer de la fréquence à la période (ou l'inverse)",
   met:"T = 1 ÷ f  et  f = 1 ÷ T",ex:"f = 50 Hz → T = 1 ÷ 50 = 0,02 s = 20 ms",pg:"Unités : T en secondes, f en hertz. 20 ms = 0,020 s."}
 ],
 "mecanique-mv":[
  {sig:"Trancher repos ou mouvement",
   met:"Toujours annoncer le référentiel choisi : la même situation change de réponse si on change de référentiel.",ex:"Une valve est immobile par rapport à l'écrou de la roue, en mouvement par rapport à la route.",pg:"Dire « ça bouge » sans préciser par rapport à quoi."},
  {sig:"Lire une chronophotographie",
   met:"Points régulièrement espacés = uniforme ; points de plus en plus espacés = accéléré ; points de plus en plus rapprochés = ralenti.",ex:"Zone de freinage : points de plus en plus rapprochés → mouvement ralenti.",pg:"Confondre l'espacement des points avec leur nombre."},
  {sig:"Calculer une vitesse moyenne et convertir km/h ↔ m/s",
   met:"v = d ÷ t (m et s → m/s). km/h → m/s : ÷ 3,6. m/s → km/h : × 3,6.",ex:"250 m en 12 s → 20,8 m/s → 20,8 × 3,6 ≈ 75 km/h",pg:"Mélanger les unités, ou multiplier au lieu de diviser par 3,6."},
  {sig:"Donner un résultat unique à partir de plusieurs mesures",
   met:"Calculer la moyenne, l'arrondir avec un nombre de chiffres cohérent avec la précision de l'instrument, puis comparer à une valeur de référence.",ex:"23,9 ; 24,0 ; 24,1 mm → moyenne 24,0 mm, compatible avec la référence constructeur 24,0 mm.",pg:"Se fier à une seule mesure, ou garder trop de chiffres après la virgule."}
 ],
 "stats-probas":[
  {sig:"Résumer une série de mesures par un seul nombre",
   met:"Moyenne = somme de toutes les valeurs ÷ nombre de valeurs.",ex:"398 ÷ 8 = 49,75 min",pg:"Une seule valeur très éloignée des autres fait « mentir » la moyenne."},
  {sig:"Une valeur est très différente des autres (panne exceptionnelle, cas rare)",
   met:"Prends la médiane : range la série, c'est la valeur du milieu (moyenne des deux du milieu si l'effectif est pair). Elle résiste aux valeurs extrêmes.",ex:"30·35·38·40·40·45·50·120 → médiane (40 + 40) ÷ 2 = 40",pg:"Oublier de ranger la série avant de prendre le milieu."},
  {sig:"Mesurer à quel point les valeurs sont dispersées",
   met:"Étendue = valeur maximale − valeur minimale.",ex:"120 − 30 = 90 min",pg:"Ce n'est pas une moyenne ; c'est juste un écart."},
  {sig:"Calculer la probabilité d'un événement (cas simples, issues équiprobables)",
   met:"P = nombre d'issues favorables ÷ nombre d'issues possibles.",ex:"Tirer un diesel parmi 2 diesels et 3 essences : 2 ÷ 5 = 0,4",pg:"Une probabilité est toujours entre 0 et 1. Sinon, il y a une erreur."},
  {sig:"Probabilité de l'événement contraire",
   met:"P(contraire) = 1 − P.",ex:"P(diesel) = 0,4 → P(essence) = 1 − 0,4 = 0,6",pg:"Soustraire de 1, pas additionner les deux."},
  {sig:"Deux tirages / deux épreuves à la suite, indépendants",
   met:"Arbre ou tableau à double entrée. Nombre total d'issues = produit du nombre de possibilités de chaque épreuve.",ex:"Pièce (2) puis dé à 4 faces (4) → 2 × 4 = 8 issues",pg:"Additionner (2 + 4) au lieu de multiplier."},
  {sig:"Deux contrôles du même lot ne donnent pas la même fréquence de défauts",
   met:"C'est la fluctuation d'échantillonnage : normal sur de petits échantillons. Plus n est grand, moins ça fluctue.",ex:"Lot à 2 % : sur 50 pièces on peut trouver 0,04 ; ce n'est pas une erreur.",pg:"Croire qu'un des deux contrôleurs s'est trompé."},
  {sig:"Estimer une probabilité qu'on ne connaît pas",
   met:"Répète l'expérience un grand nombre de fois : la fréquence observée se stabilise vers la probabilité.",ex:"6000 lancers, 1023 fois le 6 → 0,171 ≈ 1/6",pg:"Conclure sur trop peu de répétitions (la fréquence saute encore)."}
 ],
 "decider-sous-contrainte":[
  {sig:"« Combien d'adultes / d'accompagnateurs faut-il ? »",
   met:"Taux « 1 pour n » : nombre d'enfants ÷ n, puis arrondi à l'entier supérieur.",ex:"19 enfants, 1 pour 6 → 19 ÷ 6 ≈ 3,17 → 4 adultes",pg:"Arrondir au plus proche : le dernier groupe, même incomplet, réclame un adulte."},
  {sig:"« Combien d'enfants tiennent dans la salle / le véhicule ? »",
   met:"Capacité = surface ÷ (m² imposés par enfant), ou nombre de places. C'est un maximum.",ex:"21 m², 3 m² par enfant → 21 ÷ 3 = 7 enfants au plus",pg:"Oublier que c'est un maximum (inéquation : nombre ≤ capacité)."},
  {sig:"« Est-ce possible / suffisant / dans le budget ? »",
   met:"Écris une inéquation : quantité ≤ seuil. Puis compare.",ex:"Projet à 275 € ≤ 280 € disponibles → oui. À 305 € → non.",pg:"Confondre ≤ et <, ou comparer au mauvais nombre."},
  {sig:"Deux règles imposent chacune un minimum",
   met:"Calcule les deux minimums, retiens le plus grand, vérifie que l'autre est alors couvert.",ex:"Encadrement 3, conduite 4 → on retient 4 (et 4 ≥ 3).",pg:"Faire la somme, ou garder le plus petit."},
  {sig:"« Combien reste-t-il après les dépenses obligatoires ? »",
   met:"Recettes − dépenses fixes = somme disponible.",ex:"1 380 − 1 100 = 280 €",pg:"Oublier une dépense fixe dans le total."}
 ],
 "calculs-commerciaux":[
  {sig:"Passer d'un prix HT à un prix TTC",
   met:"TTC = HT × (1 + taux de TVA).",ex:"250 € HT, TVA 20 % → 250 × 1,20 = 300 €",pg:"Ajouter le taux (250 + 20) au lieu de multiplier par 1,20."},
  {sig:"Appliquer une remise / réduction de X %",
   met:"Nouveau prix = prix × (1 − X/100). Ce facteur (1 − X/100) est le coefficient multiplicateur.",ex:"Remise 8 % → × 0,92 ; 300 × 0,92 = 276 €",pg:"Multiplier par 0,08 : ça donne le montant de la remise, pas le prix à payer."},
  {sig:"Répartir une somme selon des pourcentages",
   met:"Chaque part = somme totale × (pourcentage/100). La somme des parts doit redonner le total.",ex:"276 € en 70 / 30 → 193,20 € et 82,80 € ; 193,20 + 82,80 = 276 ✓",pg:"Ne pas vérifier que la somme des parts fait bien le total."},
  {sig:"Calculer le montant d'une TVA ou d'une remise seule",
   met:"Montant = base × (taux/100).",ex:"TVA sur 250 € à 20 % : 250 × 0,20 = 50 €",pg:"Appliquer le taux au TTC au lieu du HT."}
 ],
 "ap-consolidation":[
  {sig:"Poser une division",
   met:"Chiffre par chiffre, de gauche à droite : « combien de fois ? », j'écris au quotient, je soustrais, j'abaisse le chiffre suivant.",ex:"92 ÷ 4 : 9÷4 → 2 (reste 1) ; j'abaisse le 2 → 12 ÷ 4 → 3. Quotient 23.",pg:"Oublier d'abaisser le chiffre suivant."},
  {sig:"« Combien pour chacun ? »",
   met:"Division-partage : total ÷ nombre de parts.",ex:"24 gobelets, 4 tables → 24 ÷ 4 = 6 par table",pg:"Confondre avec « combien de paquets »."},
  {sig:"« Combien de paquets / de groupes ? »",
   met:"Division-groupement : total ÷ taille du paquet.",ex:"24 gobelets, paquets de 4 → 6 paquets",pg:"Le reste ne forme pas un paquet complet."},
  {sig:"Vérifier une division",
   met:"quotient × diviseur (+ reste) = dividende.",ex:"23 × 4 = 92 ✓",pg:"Ne pas vérifier du tout."},
  {sig:"« X % de Y »",
   met:"Y × (X/100).",ex:"60 % de 25 enfants : 25 × 0,60 = 15",pg:"Diviser par X au lieu de multiplier par X/100."},
  {sig:"Prix de n articles connaissant le prix de p articles",
   met:"Proportionnalité : prix d'un article = prix ÷ p, puis × n.",ex:"5 pots = 21,50 € → 1 pot = 4,30 € → 8 pots = 34,40 €",pg:"Additionner au lieu de multiplier."}
 ],
 "ap-consolidation-tcapmp":[
  {sig:"Passer d'un prix HT à un prix TTC",
   met:"TTC = HT × (1 + taux de TVA).",ex:"320 € HT, TVA 20 % → 320 × 1,20 = 384 €",pg:"Additionner le taux au lieu de multiplier (320 + 20 n'est pas le TTC)."},
  {sig:"Retrouver le HT à partir du TTC",
   met:"HT = TTC ÷ (1 + taux).",ex:"180 € TTC, TVA 20 % → 180 ÷ 1,20 = 150 €",pg:"Multiplier au lieu de diviser."},
  {sig:"Appliquer une remise ou une hausse en une seule opération",
   met:"Nouveau prix = prix × coefficient multiplicateur : (1 − X/100) pour une remise, (1 + X/100) pour une hausse.",ex:"Remise 15 % sur 80 € → × 0,85 = 68 €",pg:"Confondre le montant de la remise (prix × taux) et le prix payé."},
  {sig:"Répartir une somme selon des pourcentages",
   met:"Chaque part = total × (pourcentage/100) ; la somme des parts doit redonner le total.",ex:"350 € en 60 / 40 → 210 € et 140 € ; 210 + 140 = 350 ✓",pg:"Ne pas vérifier que la somme des parts fait bien le total."},
  {sig:"Choisir le sens d'un arrondi de quantité",
   met:"« Au minimum pour tout contenir » → vers le haut. « Combien de lots complets » → vers le bas.",ex:"204 pièces, cartons de 25 → 204 ÷ 25 = 8,16 → 9 cartons",pg:"Arrondir systématiquement au plus proche sans regarder la question posée."}
 ],
 "ap-consolidation-2pmv2":[
  {sig:"Poser une division",
   met:"Chiffre par chiffre, de gauche à droite : « combien de fois ? », j'écris au quotient, je soustrais, j'abaisse le chiffre suivant.",ex:"92 bougies en 4 lots égaux : 9÷4 → 2 (reste 1) ; j'abaisse le 2 → 12÷4 → 3. Quotient 23.",pg:"Oublier d'abaisser le chiffre suivant."},
  {sig:"« Combien pour chacun ? »",
   met:"Division-partage : total ÷ nombre de parts.",ex:"24 filtres, 4 véhicules → 24 ÷ 4 = 6 par véhicule",pg:"Confondre avec « combien de cartons »."},
  {sig:"« Combien de cartons / de lots ? »",
   met:"Division-groupement : total ÷ taille du lot.",ex:"24 filtres, cartons de 4 → 6 cartons",pg:"Le reste ne forme pas un carton complet."},
  {sig:"Choisir le sens d'un arrondi de quantité",
   met:"« Au minimum pour tout inclure » → vers le haut. « Combien de lots complets » → vers le bas.",ex:"45 bidons, étagères de 8 → 45 ÷ 8 = 5,6 → 6 étagères",pg:"Arrondir systématiquement au plus proche sans regarder la question posée."},
  {sig:"Prix de n articles connaissant le prix de p articles",
   met:"Proportionnalité : prix d'un article = prix ÷ p, puis × n.",ex:"5 bidons = 20 € → 1 bidon = 4 € → 8 bidons = 32 €",pg:"Additionner au lieu de multiplier."},
  {sig:"« X % de Y »",
   met:"Y × (X/100).",ex:"60 % de 20 véhicules : 20 × 0,60 = 12",pg:"Diviser par X au lieu de multiplier par X/100."}
 ],
 "ap-fractions":[
  {sig:"Lire une fraction a/b",
   met:"b = nombre total de parts égales (dénominateur), a = nombre de parts prises (numérateur).",ex:"3/4 : 4 parts égales, on en prend 3",pg:"Inverser numérateur et dénominateur."},
  {sig:"Simplifier une fraction",
   met:"Diviser le numérateur et le dénominateur par un même diviseur commun.",ex:"6/8 = (6÷2)/(8÷2) = 3/4",pg:"Diviser seulement l'un des deux termes."},
  {sig:"Comparer deux fractions",
   met:"Même dénominateur : je compare les numérateurs. Sinon, je les ramène au même dénominateur ou je compare à 1/2 et à 1.",ex:"3/4 = 6/8, donc 3/4 > 5/8",pg:"Comparer directement les numérateurs de fractions à dénominateurs différents."},
  {sig:"Additionner deux fractions de même dénominateur",
   met:"On garde le dénominateur et on additionne les numérateurs.",ex:"3/8 + 4/8 = 7/8",pg:"Additionner aussi les dénominateurs."},
  {sig:"Calculer a/b d'une quantité N",
   met:"(N ÷ b) × a.",ex:"3/4 de 20 : 20 ÷ 4 = 5, puis 5 × 3 = 15",pg:"Multiplier directement N par a sans diviser par b."}
 ],
 "ap-signes":[
  {sig:"Additionner deux nombres relatifs de même signe",
   met:"On additionne les distances à zéro et on garde le signe commun.",ex:"(−3) + (−4) = −7",pg:"Oublier de garder le signe commun."},
  {sig:"Additionner deux nombres relatifs de signes différents",
   met:"On soustrait la plus petite distance à zéro de la plus grande, et on garde le signe du nombre qui a la plus grande distance.",ex:"(−7) + (+3) = −4",pg:"Additionner les distances au lieu de les soustraire."},
  {sig:"Soustraire un nombre relatif",
   met:"a − b = a + (−b) : soustraire, c'est additionner l'opposé.",ex:"5 − (−3) = 5 + (+3) = 8",pg:"Garder le signe − au lieu de le transformer en +."},
  {sig:"Multiplier ou diviser deux nombres relatifs",
   met:"Signes identiques → résultat positif. Signes différents → résultat négatif.",ex:"(−3) × (−4) = 12 ; (−3) × 4 = −12",pg:"Oublier d'appliquer la règle des signes au résultat."}
 ],
 "fiche-outils":[
  {sig:"Addition posée",
   met:"Aligner les unités sous les unités, additionner de droite à gauche, retenir la dizaine quand une colonne dépasse 9.",ex:"47 + 38 : 7 + 8 = 15 → j'écris 5, je retiens 1 ; 4 + 3 + 1 = 8 → 85",pg:"Mal aligner les chiffres."},
  {sig:"Soustraction",
   met:"Compter en avançant du plus petit vers le plus grand.",ex:"82 − 47 : +3 → 50, +30 → 80, +2 → 82 ; total avancé 35",pg:"Se tromper de sens (avancer au lieu de reculer)."},
  {sig:"Multiplier par un nombre à deux chiffres",
   met:"Décomposer : a × (dizaines + unités) = a × dizaines + a × unités.",ex:"7 × 32 = 7 × 30 + 7 × 2 = 210 + 14 = 224",pg:"Oublier un des deux morceaux."},
  {sig:"Multiplier ou diviser par 10, 100, 1000",
   met:"× 10 : la virgule se déplace d'un rang vers la droite. ÷ 10 : d'un rang vers la gauche.",ex:"× 100 → deux rangs à droite ; 3,5 × 100 = 350",pg:"Déplacer la virgule du mauvais côté."}
 ],
 "stat-aepe":[
  {sig:"Calculer une fréquence",
   met:"fréquence = effectif de la valeur ÷ effectif total.",ex:"14 enfants sur 40 → 14 ÷ 40 = 0,35 = 35 %",pg:"Diviser par le mauvais total, ou oublier de convertir en %."},
  {sig:"Vérifier un tableau de fréquences",
   met:"la somme de toutes les fréquences doit faire 1 (ou 100 %).",ex:"0,15 + 0,35 + 0,30 + 0,20 = 1 ✓",pg:"Ne pas vérifier du tout."},
  {sig:"Calculer une moyenne quand les valeurs se répètent",
   met:"(somme des valeur × effectif) ÷ effectif total.",ex:"(1×10 + 2×20 + 3×10) ÷ 40 = 80 ÷ 40 = 2",pg:"Diviser par le nombre de valeurs différentes au lieu de l'effectif total."},
  {sig:"Trouver l'angle d'un secteur (diagramme circulaire)",
   met:"angle = fréquence × 360°.",ex:"35 % → 0,35 × 360 = 126°",pg:"Utiliser 100° ou 180° au lieu de 360°."},
  {sig:"Choisir entre bâtons et circulaire",
   met:"comparer des quantités → bâtons ; montrer la part de chaque valeur dans le tout → circulaire.",ex:"« quelle proportion de la crèche a moins d'un an ? » → circulaire",pg:"Un camembert avec trop de secteurs devient illisible."}
 ],
 "chimie-aepe":[
  {sig:"Lire un pictogramme « corrosif »",
   met:"corrosif = attaque la peau et les yeux → gants + lunettes, local aéré, jamais de mélange.",ex:"détartrant, eau de Javel concentrée",pg:"Croire qu'un produit d'entretien « de tous les jours » est sans danger."},
  {sig:"Classer une solution à partir de son pH",
   met:"pH < 7 : acide · pH = 7 : neutre · pH > 7 : basique.",ex:"pH 2 → acide ; pH 9 → basique",pg:"Inverser : croire qu'un pH élevé est acide."},
  {sig:"Prévoir l'effet d'une dilution sur le pH",
   met:"diluer rapproche le pH de 7 : le pH d'un acide monte, celui d'une base descend.",ex:"Javel pH 11, très diluée → pH 8",pg:"Penser qu'une dilution change la nature (un acide qui deviendrait basique)."},
  {sig:"Calculer la masse de produit pour une solution",
   met:"masse = concentration massique × volume (Cm en g/L, V en L).",ex:"4 g/L sur 5 L → 4 × 5 = 20 g",pg:"Diviser au lieu de multiplier, ou mélanger mL et L."},
  {sig:"Vérifier une préparation",
   met:"(masse réellement mise ÷ volume) doit redonner la concentration visée.",ex:"(8 × 2,5) ÷ 5 = 4 g/L ✓",pg:"Ne pas vérifier."}
 ],
 "interet-apmp":[
  {sig:"Calculer un intérêt simple",
   met:"I = capital × taux annuel (en décimal) × durée en années.",ex:"3000 × 0,03 × 3 = 270 €",pg:"Laisser le taux en % : utiliser 3 au lieu de 0,03."},
  {sig:"La durée est donnée en mois",
   met:"convertir en année : durée = nombre de mois ÷ 12.",ex:"8 mois → 8 ÷ 12 ≈ 0,67 ; I = 600 × 0,024 × (8/12) = 9,60 €",pg:"Multiplier par le nombre de mois directement."},
  {sig:"Calculer la valeur acquise",
   met:"valeur acquise = capital + intérêts.",ex:"3000 + 270 = 3270 €",pg:"Confondre avec les intérêts seuls."},
  {sig:"Répartir une somme en versements égaux sans intérêts",
   met:"versement = somme totale ÷ nombre de versements ; la somme des versements redonne le total.",ex:"480 ÷ 4 = 120 € ; 4 × 120 = 480 ✓",pg:"Ajouter des intérêts alors que l'accord est sans intérêts."},
  {sig:"Vérifier un calcul d'intérêt (ordre de grandeur)",
   met:"sur moins d'un an l'intérêt est plus petit que l'intérêt annuel ; sur plus d'un an, plus grand.",ex:"8 mois → moins que sur 12 mois",pg:"Ne pas contrôler la vraisemblance."}
 ],
 "acoustique-apmp":[
  {sig:"Dire si un son est grave ou aigu",
   met:"fréquence basse (Hz) → grave ; fréquence haute → aigu.",ex:"100 Hz → grave ; 4000 Hz → aigu",pg:"Confondre « fort » (dB) et « aigu » (Hz)."},
  {sig:"Passer de la fréquence à la période d'un son",
   met:"T = 1 ÷ f (T en secondes, f en Hz).",ex:"f = 100 Hz → T = 0,01 s = 10 ms",pg:"Laisser T en Hz au lieu de secondes."},
  {sig:"Situer un niveau sonore sur l'échelle",
   met:"repères fournis : 60 dB conversation, 85 dB seuil de danger, 120 dB seuil de douleur.",ex:"92 dB → au-dessus du danger, en dessous de la douleur",pg:"Oublier que le risque dépend aussi de la durée d'exposition."},
  {sig:"Calculer le niveau après un isolant",
   met:"niveau perçu = niveau source − atténuation (en dB).",ex:"92 dB − 25 dB = 67 dB",pg:"Diviser au lieu de soustraire ; les décibels ne se multiplient pas."},
  {sig:"Juger une nuisance de voisinage",
   met:"comparer le niveau perçu au niveau toléré = bruit de fond + émergence autorisée (souvent 5 dB).",ex:"67 dB perçus contre 35 + 5 = 40 dB tolérés → nuisance",pg:"Comparer au seuil de douleur au lieu du niveau toléré."}
 ],
 "stat-apmp":[
  {sig:"Calculer une fréquence",
   met:"fréquence = effectif de la catégorie ÷ effectif total.",ex:"21 interventions sur 60 → 21 ÷ 60 = 0,35 = 35 %",pg:"Diviser par le mauvais total, ou oublier de convertir en %."},
  {sig:"Vérifier un tableau de fréquences",
   met:"la somme de toutes les fréquences doit faire 1 (ou 100 %).",ex:"0,35 + 0,25 + 0,15 + 0,25 = 1 ✓",pg:"Ne pas vérifier."},
  {sig:"Calculer une moyenne",
   met:"moyenne = somme des valeurs ÷ nombre de valeurs.",ex:"100 jours ÷ 10 médiations = 10 jours",pg:"Une valeur extrême (un cas très long) fausse la moyenne."},
  {sig:"Choisir entre moyenne et médiane",
   met:"si une valeur est très éloignée des autres, la médiane (valeur du milieu, série rangée) décrit mieux le cas courant.",ex:"délais : moyenne 10 j, médiane 7 j → annoncer 7 j",pg:"Oublier de ranger la série avant de prendre le milieu."},
  {sig:"Trouver l'angle d'un secteur (diagramme circulaire)",
   met:"angle = fréquence × 360°.",ex:"35 % → 0,35 × 360 = 126°",pg:"Utiliser 100° ou 180° au lieu de 360°."}
 ],
 "propor-aepe":[
  {sig:"Compléter un tableau de proportionnalité",
   met:"coefficient = valeur du bas ÷ valeur du haut ; on multiplie chaque valeur du haut par ce coefficient.",ex:"30 mL pour 5 L → coeff 6 ; pour 8 L : 8 × 6 = 48 mL",pg:"Additionner (5 → 8, donc +3 partout) au lieu de multiplier."},
  {sig:"Trouver une quatrième proportionnelle",
   met:"produit en croix : (valeur connue × valeur connue en diagonale) ÷ valeur restante.",ex:"30 × 8 ÷ 5 = 48",pg:"Se tromper de diagonale."},
  {sig:"Vérifier si une situation est proportionnelle",
   met:"diviser chaque valeur du bas par celle du haut : proportionnel si on trouve toujours le même nombre.",ex:"36 ÷ 6 = 6 et 72 ÷ 12 = 6 → proportionnel ; sieste 90 min inchangée → non",pg:"Supposer que tout est proportionnel et faire une règle de trois à tort."},
  {sig:"Calculer X % d'une quantité",
   met:"quantité × (X ÷ 100).",ex:"60 % de 25 → 25 × 0,60 = 15",pg:"Diviser par X au lieu de multiplier par X/100."},
  {sig:"Augmenter ou diminuer de X %",
   met:"× (1 + X/100) pour augmenter, × (1 − X/100) pour diminuer.",ex:"+5 % → × 1,05 ; −20 % → × 0,80",pg:"Oublier le « 1 + » ou le « 1 − » et ne multiplier que par X/100."}
 ],
 "probas-aepe":[
  {sig:"Calculer une probabilité (issues équiprobables)",
   met:"P = nombre d'issues favorables ÷ nombre d'issues possibles.",ex:"un pair au dé : 3 ÷ 6 = 0,5",pg:"Donner un résultat hors de [0 ; 1] : c'est forcément une erreur."},
  {sig:"Probabilité de l'événement contraire",
   met:"P(contraire) = 1 − P.",ex:"P = 0,2 → contraire 0,8",pg:"Additionner les deux au lieu de soustraire de 1."},
  {sig:"Compter les issues de deux tirages",
   met:"arbre ou tableau à double entrée ; nombre total = produit des possibilités.",ex:"3 activités × 6 faces = 18",pg:"Additionner (3 + 6) au lieu de multiplier."},
  {sig:"Estimer une probabilité à partir de lancers",
   met:"répéter un grand nombre de fois ; la fréquence se stabilise vers la probabilité.",ex:"2000 lancers, 1010 face → 0,505 ≈ 0,5",pg:"Conclure sur 20 lancers (la fréquence fluctue encore beaucoup)."}
 ],
 "probas-apmp":[
  {sig:"Calculer une probabilité (tirage au sort)",
   met:"P = 1 ÷ nombre de personnes (ou d'issues) également possibles.",ex:"5 médiateurs → P(un donné) = 1 ÷ 5 = 0,2",pg:"Oublier que P reste entre 0 et 1."},
  {sig:"Probabilité de l'événement contraire",
   met:"P(contraire) = 1 − P.",ex:"P(tiré) = 0,2 → P(pas tiré) = 0,8",pg:"Additionner au lieu de soustraire de 1."},
  {sig:"Croiser deux critères",
   met:"tableau à double entrée ; nombre de cas = produit des possibilités de chaque critère.",ex:"3 lieux × 2 moments = 6 cas",pg:"Faire une somme au lieu d'un produit."},
  {sig:"Juger la fiabilité d'une fréquence de terrain",
   met:"la fréquence se stabilise sur un grand nombre de cas ; elle fluctue sur un petit nombre.",ex:"200 fiches → 31 % fiable ; 10 fiches → à ne pas utiliser",pg:"Tirer une conclusion à partir de trop peu de fiches."}
 ],
 "fonctions-aepe":[
  {sig:"Lire l'image d'une valeur",
   met:"se placer à l'abscisse a, monter jusqu'à la courbe, lire l'ordonnée : c'est f(a).",ex:"sur la courbe, f(6) ≈ 7 kg",pg:"Confondre image et antécédent (chercher a au lieu de f(a))."},
  {sig:"Lire un antécédent d'une valeur",
   met:"se placer à l'ordonnée b, aller jusqu'à la courbe, lire l'abscisse : c'est un antécédent de b.",ex:"un antécédent de 7 kg ≈ 6 mois",pg:"Oublier qu'une valeur peut avoir plusieurs antécédents."},
  {sig:"Décrire les variations sur un intervalle",
   met:"la courbe monte (de gauche à droite) → croissante ; elle descend → décroissante.",ex:"le poids de 0 à 12 mois : croissant",pg:"Regarder un seul point au lieu de l'allure sur tout l'intervalle."},
  {sig:"Reconnaître une fonction linéaire",
   met:"proportionnalité ⇔ f(x) = a × x ⇔ droite passant par l'origine (0 ; 0).",ex:"lait = 120 × biberons ; f(0) = 0",pg:"Croire qu'une droite quelconque (qui ne passe pas par 0) est linéaire."}
 ],
 "fonctions-apmp":[
  {sig:"Lire l'image d'une valeur sur une courbe",
   met:"se placer à l'abscisse a, monter jusqu'à la courbe, lire l'ordonnée : c'est f(a).",ex:"image du mois 4 → 18 incidents",pg:"Confondre image et antécédent."},
  {sig:"Lire un antécédent d'une valeur",
   met:"se placer à l'ordonnée b, aller jusqu'à la courbe, lire l'abscisse.",ex:"antécédent de 22 → le mois 6",pg:"Oublier qu'il peut y avoir plusieurs antécédents."},
  {sig:"Repérer où un seuil est dépassé",
   met:"tracer la droite horizontale du seuil ; la courbe au-dessus = seuil dépassé.",ex:"seuil 20 : seul le mois 6 (22) est au-dessus",pg:"Lire « au-dessus » comme « en dessous »."},
  {sig:"Reconnaître une évolution proportionnelle (linéaire)",
   met:"f(x) = a × x ⇔ droite passant par l'origine (0 ; 0).",ex:"coût = 25 × kits ; f(0) = 0",pg:"Croire qu'une droite qui ne passe pas par 0 est linéaire."}
 ],
 "geometrie-aepe":[
  {sig:"Calculer le périmètre d'un rectangle (le tour)",
   met:"P = 2 × (Longueur + largeur), en mètres.",ex:"6 m sur 4 m → 2 × (6 + 4) = 20 m",pg:"Confondre avec l'aire, ou oublier le × 2."},
  {sig:"Calculer l'aire d'un rectangle (la surface)",
   met:"A = Longueur × largeur, en m².",ex:"6 × 4 = 24 m² → 24 ÷ 4 = 6 enfants",pg:"Additionner au lieu de multiplier."},
  {sig:"Calculer le volume d'un pavé",
   met:"V = Longueur × largeur × hauteur (mêmes unités), en m³ ; 1 m³ = 1000 L.",ex:"3 × 2 × 0,2 = 1,2 m³ = 1200 L",pg:"Mélanger cm et m sans convertir."},
  {sig:"Trouver l'hypoténuse d'un triangle rectangle",
   met:"c = √(a² + b²) (c = le plus grand côté, face à l'angle droit).",ex:"√(3² + 4²) = √25 = 5",pg:"Additionner a + b au lieu de a² + b²."},
  {sig:"Vérifier un angle droit (réciproque de Pythagore)",
   met:"si a² + b² = c², le triangle est rectangle — règle du 3-4-5.",ex:"9 + 16 = 25 = 5² → angle droit",pg:"Prendre le mauvais côté comme hypoténuse."}
 ],
 "thermique":[
  {sig:"Convertir une température entre °C et K",
   met:"T(K) = T(°C) + 273  et  T(°C) = T(K) − 273.",ex:"37 °C → 310 K ; 300 K → 27 °C",pg:"Multiplier au lieu d'ajouter ; oublier le signe pour les températures négatives."},
  {sig:"Prévoir la température finale de deux corps en contact",
   met:"ils évoluent vers une température commune (équilibre thermique) ; la chaleur va du chaud vers le froid.",ex:"biberon 50 °C dans une pièce à 22 °C → 22 °C",pg:"Croire que le corps chaud garde sa température."},
  {sig:"Décrire la température pendant un changement d'état",
   met:"elle reste constante (palier) : fusion de l'eau à 0 °C, ébullition à 100 °C.",ex:"eau qui bout : bloquée à 100 °C même si on chauffe plus",pg:"Penser que la température monte encore pendant l'ébullition."}
 ],
 "mecanique":[
  {sig:"Calculer une vitesse moyenne",
   met:"vitesse = distance ÷ durée (m et s → m/s).",ex:"12 m en 4 s → 12 ÷ 4 = 3 m/s",pg:"Mélanger les unités (minutes et secondes, km et m)."},
  {sig:"Passer du poids à la masse (ou l'inverse)",
   met:"P = m × g, avec g ≈ 10 N/kg. Poids en N, masse en kg.",ex:"25 kg → P = 250 N ; 80 N → m = 8 kg",pg:"Confondre masse (kg) et poids (N)."},
  {sig:"Vérifier l'équilibre d'un solide soumis à deux forces",
   met:"équilibre ⇔ même droite d'action, sens opposés, même valeur.",ex:"meuble immobile de 250 N : le sol pousse de 250 N vers le haut",pg:"Oublier une des trois conditions (surtout la même droite d'action)."}
 ],
 "optique":[
  {sig:"Appliquer la loi de la réflexion",
   met:"angle de réflexion = angle d'incidence (mesurés par rapport à la normale).",ex:"incidence 30° → réflexion 30°",pg:"Mesurer les angles par rapport à la surface au lieu de la normale."},
  {sig:"Décrire la réfraction air → eau",
   met:"le rayon se rapproche de la normale ; plus l'incidence augmente, plus la réfraction augmente.",ex:"40° dans l'air → ~29° dans l'eau",pg:"Croire que le rayon continue tout droit."},
  {sig:"Mélanger des lumières colorées (synthèse additive)",
   met:"rouge + vert + bleu = blanc ; aucune lumière = noir.",ex:"écran : R + V + B au max → blanc",pg:"Confondre avec le mélange de peintures (où R+V+B donne du foncé)."},
  {sig:"Situer et reconnaître IR et UV",
   met:"IR après le rouge (chaleur), UV avant le violet (invisibles, dangereux pour la peau et les yeux).",ex:"coup de soleil = UV ; lampe chauffante = IR",pg:"Croire que les UV se voient ou sont sans danger."}
 ],
 "propor-apmp":[
  {sig:"Partager un total proportionnellement",
   met:"coefficient = total à partager ÷ total des quantités ; chaque part = sa quantité × coefficient.",ex:"1500 € pour 20 m → 75 €/m ; 5 m → 375 €",pg:"Oublier de vérifier que la somme des parts fait le total."},
  {sig:"Utiliser une échelle",
   met:"échelle = plan ÷ réel (même unité). Réel = mesure du plan × dénominateur de l'échelle.",ex:"1/500, 6 cm → 6 × 500 = 3000 cm = 30 m",pg:"Mélanger cm et m sans convertir."},
  {sig:"Exprimer une part en pourcentage",
   met:"(part ÷ total) × 100.",ex:"36 sur 50 → 72 %",pg:"Diviser par la part au lieu du total."},
  {sig:"Calculer un pourcentage d'évolution",
   met:"(valeur finale − valeur initiale) ÷ valeur initiale × 100 ; négatif = baisse.",ex:"de 40 à 30 → (30−40)/40 = −25 %",pg:"Diviser par la valeur finale, ou par 100."},
  {sig:"Appliquer une évolution avec le coefficient",
   met:"× (1 + t/100) pour une hausse, × (1 − t/100) pour une baisse.",ex:"−25 % → × 0,75 ; +15 % → × 1,15",pg:"Multiplier par t/100 seul (ça donne l'évolution, pas la nouvelle valeur)."}
 ],
 "degre1-apmp":[
  {sig:"Mettre un problème en équation",
   met:"nommer l'inconnue x, exprimer les autres quantités en fonction de x, écrire l'égalité de l'énoncé.",ex:"deux parts, l'une 60 de moins : x + (x − 60) = 480",pg:"Se tromper de sens (x − 60 ou x + 60)."},
  {sig:"Résoudre ax + b = c",
   met:"retirer b des deux côtés, puis diviser par a.",ex:"12h + 40 = 148 → 12h = 108 → h = 9",pg:"Diviser avant d'avoir isolé le terme en x."},
  {sig:"Vérifier une solution",
   met:"remplacer x par sa valeur dans l'énoncé de départ.",ex:"12 × 9 + 40 = 148 ✓",pg:"Ne pas vérifier."},
  {sig:"Écrire une inéquation de budget",
   met:"« ne pas dépasser B » s'écrit : coût ≤ B.",ex:"275 ≤ 280 → projet finançable",pg:"Confondre ≤ (au plus) et ≥ (au moins)."},
  {sig:"Résoudre une inéquation ax + b ≤ c",
   met:"comme une équation (retirer b, diviser par a > 0) ; la solution est un ensemble de valeurs.",ex:"12h + 40 ≤ 280 → h ≤ 20",pg:"Donner une seule valeur au lieu d'un ensemble."}
 ],
 "degre1-mv":[
  {sig:"Résoudre ax + b = c",
   met:"retirer b des deux côtés, puis diviser par a.",ex:"38h + 45 = 197 → 38h = 152 → h = 4",pg:"Diviser avant d'avoir isolé le terme en x."},
  {sig:"Mettre un problème en équation",
   met:"nommer x, écrire le coût sous la forme (tarif)·x + (forfait), poser l'égalité de l'énoncé.",ex:"coût = 22n + 40 ; budget 300 → 22n + 40 = 300 (ou ≤)",pg:"Oublier le forfait, ou l'ajouter au mauvais endroit."},
  {sig:"Résoudre une inéquation ax + b ≤ c",
   met:"comme une équation (retirer b, diviser par a) ; si a > 0 le sens ≤ est conservé.",ex:"22n + 40 ≤ 300 → n ≤ 11,8 → 11 (entier)",pg:"Oublier d'ajuster au contexte (entier, positif)."},
  {sig:"Trouver quand deux tarifs sont égaux",
   met:"écrire A(x) = B(x), regrouper les x d'un côté, les nombres de l'autre.",ex:"35h + 60 = 45h + 20 → h = 4",pg:"Se tromper de signe en changeant un terme de côté."},
  {sig:"Vérifier une solution",
   met:"remplacer l'inconnue par sa valeur dans l'énoncé.",ex:"38 × 4 + 45 = 197 ✓",pg:"Ne pas vérifier."}
 ],
 "fonctions-mv":[
  {sig:"Lire une image / un antécédent",
   met:"image de a : je monte de a jusqu'à la courbe, je lis l'ordonnée. Antécédent de b : je pars de b, je vais jusqu'à la courbe, je lis l'abscisse.",ex:"P(3) ≈ 5 mm ; antécédent de 1,6 ≈ 6,4",pg:"Confondre image et antécédent."},
  {sig:"Lire coefficient directeur et ordonnée à l'origine (fonction affine)",
   met:"f(x) = ax + b : a = variation quand x augmente de 1 ; b = f(0) = où la droite coupe l'axe vertical.",ex:"f(x) = 15x + 40 → a = 15 (prix unitaire), b = 40 (forfait)",pg:"Prendre b pour le coefficient directeur."},
  {sig:"Donner le sens de variation d'une fonction affine",
   met:"a > 0 → croissante ; a < 0 → décroissante ; a = 0 → constante.",ex:"f(x) = −3x + 7 : décroissante",pg:"Regarder b au lieu de a."},
  {sig:"Décrire des variations et un extremum sur une courbe",
   met:"courbe qui monte → croissante ; qui descend → décroissante. Point le plus haut = maximum, le plus bas = minimum.",ex:"température : croissante jusqu'à 5 min (max 104 °C), puis décroissante",pg:"Ne regarder qu'un point au lieu de l'allure."},
  {sig:"Utiliser la fonction carré",
   met:"f(x) = k·x² : parabole de sommet (0 ; 0). Quand x est multiplié par n, x² est multiplié par n².",ex:"v : 50 → 100 (×2) ⇒ distance de freinage ×4",pg:"Croire que doubler v double la distance de freinage."}
 ],
 "geo-mv":[
  {sig:"Calculer une aire ou un volume usuel",
   met:"rectangle : L×l. Disque : π r². Cylindre : (π r²)×h. Pavé : L×l×h. 1 m³ = 1000 L.",ex:"cylindre base 0,126 m², h 0,6 m → 0,075 m³ = 75 L",pg:"Utiliser le diamètre au lieu du rayon ; mélanger les unités."},
  {sig:"Trouver l'hypoténuse (Pythagore)",
   met:"c = √(a² + b²), c face à l'angle droit.",ex:"√(120² + 160²) = √40000 = 200",pg:"Additionner a + b au lieu de a² + b²."},
  {sig:"Vérifier un angle droit (réciproque)",
   met:"si a² + b² = (diagonale)², le triangle (ou le cadre) est rectangle.",ex:"90² + 120² = 22500 = 150² → d'équerre",pg:"Prendre le mauvais côté comme hypoténuse."},
  {sig:"Prévoir l'effet d'un agrandissement de rapport k",
   met:"longueurs × k, aires × k², volumes × k³.",ex:"maquette au 1/5 : volumes × (1/5)³ = 1/125",pg:"Diviser le volume par k au lieu de k³."}
 ],
 "stat2var-ms":[
  {sig:"Le nuage de points monte ou descend à peu près régulièrement",
   met:"Ajustement affine y = ax + b, donné par la calculatrice — on ne le recalcule pas à la main.",ex:"y = 3,5x + 12 → au mois 8 : 3,5 × 8 + 12 = 40",pg:"Refaire un calcul de régression à la main : on utilise l'outil numérique."},
  {sig:"Le nuage de points s'incurve nettement (pas une droite)",
   met:"Changement de variable indiqué (ex. z = log(y)), ajustement affine sur (x ; z), puis retour à y = 10ᶻ.",ex:"z = 0,05x + 1 → à x = 20 : z = 2 → y = 10² = 100",pg:"Oublier de revenir à y après avoir travaillé sur z."},
  {sig:"Estimer une valeur dans / hors de la période mesurée",
   met:"Dans la période : interpoler (fiable). En dehors : extrapoler (moins fiable, la tendance est supposée se poursuivre).",ex:"données de 1 à 10 : le mois 8 s'interpole, le mois 15 s'extrapole",pg:"Faire autant confiance à une extrapolation lointaine qu'à une interpolation."}
 ],
 "proba-ms":[
  {sig:"Une situation aléatoire à plusieurs épreuves qui se suivent",
   met:"Arbre pondéré : somme des probabilités = 1 sur chaque nœud ; probabilité d'un chemin = produit des branches.",ex:"0,95 × 0,98 = 0,931",pg:"Additionner les probabilités d'un chemin au lieu de les multiplier."},
  {sig:"Calculer P(un événement du 2ᵉ niveau) sur un arbre à deux niveaux",
   met:"Formule des probabilités totales : additionner les probabilités de tous les chemins qui mènent à cet événement.",ex:"0,0196 + 0,0294 = 0,049",pg:"N'additionner qu'un seul chemin au lieu de tous ceux qui aboutissent à l'événement."},
  {sig:"Montrer que deux événements A et B sont indépendants",
   met:"Comparer la probabilité mesurée de « A et B » au produit P(A) × P(B) calculé séparément : s'ils coïncident, l'indépendance est vérifiée.",ex:"0,90 × 0,85 = 0,765, égal à la mesure : indépendance confirmée",pg:"Confondre indépendance et incompatibilité (ne jamais pouvoir se produire ensemble)."}
 ],
 "suites-ms":[
  {sig:"Une évolution à taux fixe, période après période",
   met:"Suite géométrique uₙ₊₁ = uₙ × q, avec q = 1 + taux (hausse) ou q = 1 − taux (baisse). Terme direct : uₙ = u₀ × qⁿ.",ex:"+8 % par an, u₀ = 40 → u₅ = 40 × 1,08⁵ ≈ 59",pg:"Utiliser q = taux au lieu de q = 1 ± taux."},
  {sig:"Trouver un budget ou un cumul sur plusieurs périodes",
   met:"Somme des n premiers termes de la suite géométrique, avec l'outil numérique (formule non exigée par cœur).",ex:"coûts 3000 ; 3150 ; … sur 5 ans → total ≈ 16 577 €",pg:"Multiplier le premier terme par n au lieu d'additionner les vrais termes (qui augmentent)."},
  {sig:"Trouver le premier rang où la suite dépasse (ou passe sous) un seuil",
   met:"Recherche par balayage : calculer les termes un par un jusqu'à franchir le seuil.",ex:"2000 × 0,94ⁿ < 1000 → n = 12 (951,8 < 1000, alors que n = 11 donne encore 1012,6)",pg:"Résoudre une équation exacte alors qu'un balayage numérique suffit et est attendu."}
 ],
 "poly3-ms":[
  {sig:"Étudier la fonction cube f(x) = x³",
   met:"f'(x) = 3x², toujours positive ou nulle (un carré) : f est strictement croissante sur ℝ.",ex:"f'(0) = 0 mais pas d'extremum : f continue de croître avant et après 0",pg:"Croire qu'une dérivée nulle en un point signale toujours un extremum local."},
  {sig:"Dresser le tableau de variations d'un polynôme de degré ⩽ 3",
   met:"Étudier le signe de la dérivée f' : f' > 0 → f croissante ; f' < 0 → f décroissante. Extremum local où f' change de signe.",ex:"f'(x) = 3(x−1)(x−3) : positive avant 1 et après 3, négative entre les deux",pg:"Étudier le signe de f au lieu du signe de f'."},
  {sig:"Compter le nombre de solutions de f(x) = c à l'aide du tableau",
   met:"Compter, sur chaque morceau strictement monotone du tableau de variations, si la valeur c est franchie.",ex:"maximum local 4, minimum local 0 : f(x) = 2 a 3 solutions ; f(x) = 5 n'en a aucune sur l'intervalle étudié",pg:"Vouloir résoudre l'équation par le calcul algébrique au lieu de lire le tableau."}
 ],
 "expolog-ms":[
  {sig:"Une évolution exponentielle de base q, f(x) = A × qˣ",
   met:"q > 1 → fonction croissante ; 0 < q < 1 → fonction décroissante. Propriété : qᵃ × qᵇ = qᵃ⁺ᵇ.",ex:"P(x) = 100 × 0,6ˣ (q = 0,6 < 1) : décroissante, P(3) = 21,6",pg:"Confondre le sens de variation : croire que q < 1 donne toujours une fonction croissante."},
  {sig:"Passer de 10ˣ = b à x, ou inversement",
   met:"log(b) est l'unique solution de 10ˣ = b ; en particulier log(10ˣ) = x. La fonction log est croissante sur ]0 ; +∞[.",ex:"log(1000) = 3 car 10³ = 1000",pg:"Appliquer log(x) à une valeur négative ou nulle : ce n'est pas défini."},
  {sig:"Résoudre une équation ou inéquation qˣ = a (ou qˣ ⩽/⩾ a)",
   met:"Appliquer log aux deux membres : log(qˣ) = x × log(q), donc x = log(a) ÷ log(q).",ex:"0,6ˣ = 0,05 → x = log(0,05) ÷ log(0,6) ≈ 5,9",pg:"Oublier que log(qˣ) = x × log(q), pas log(q)^x ni x + log(q)."}
 ],
 "commerce-ms":[
  {sig:"Calculer un capital après n périodes à intérêts composés",
   met:"Cₙ = C₀ × (1 + t)ⁿ, avec t le taux par période en décimal.",ex:"8000 × 1,03⁵ ≈ 9274,19 €",pg:"Utiliser la formule des intérêts simples (C₀ × t × n) à la place."},
  {sig:"Compléter un tableau d'amortissement à annuités constantes",
   met:"intérêt de l'année = capital restant dû × taux ; amortissement = annuité − intérêt ; nouveau capital restant dû = ancien − amortissement.",ex:"15000 € à 4 %, annuité 3369,41 € : année 1, intérêt 600 €, amortissement 2769,41 €, restant dû 12230,59 €",pg:"Calculer l'intérêt sur le capital initial chaque année au lieu du capital restant dû."},
  {sig:"Convertir un taux annuel en taux mensuel équivalent",
   met:"(1 + tₘ)¹² = 1 + t, donc tₘ = (1 + t)^(1/12) − 1 — différent de t ÷ 12.",ex:"taux annuel 4 % → taux mensuel équivalent ≈ 0,33 %",pg:"Diviser simplement le taux annuel par 12."},
  {sig:"Calculer le taux moyen de plusieurs évolutions successives",
   met:"Coefficient global = produit des coefficients de chaque période ; taux moyen tel que (1 + tₘₒy)ⁿ = coefficient global.",ex:"+5 % puis −3 % puis +2 % → coefficient 1,0389 → taux moyen ≈ +1,28 % par an",pg:"Faire la moyenne arithmétique des pourcentages (ici +1,33 %, ce qui est faux)."}
 ],
 "stat2var-mcv":[
  {sig:"Le nuage de points monte ou descend à peu près régulièrement",
   met:"Ajustement affine y = ax + b, donné par la calculatrice (onglet Stats) — on ne le recalcule pas à la main.",ex:"y = 1,42x − 0,29 → à la semaine 10 : 1,42 × 10 − 0,29 ≈ 13,9",pg:"Refaire un calcul de régression à la main : on utilise l'outil numérique."},
  {sig:"Évaluer si un ajustement affine est pertinent",
   met:"Regarder |r| (ou r²) donné par la calculatrice : |r| ⩾ 0,95 excellent, 0,85 ⩽ |r| < 0,95 acceptable, |r| < 0,85 à éviter.",ex:"r ≈ 0,96 → ajustement excellent",pg:"Croire qu'un r² proche de 1 prouve un lien de cause à effet (corrélation ≠ causalité)."},
  {sig:"Extrapoler très loin de la zone observée",
   met:"Résoudre l'équation normalement, mais rappeler que la fiabilité diminue d'autant plus que l'extrapolation est lointaine.",ex:"données de la semaine 1 à 7, prédiction à la semaine 29 : extrapolation lointaine, à prendre avec prudence",pg:"Faire autant confiance à une extrapolation lointaine qu'à une interpolation, même avec un bon r²."}
 ],
 "proba-mcv":[
  {sig:"Calculer P(A ⋂ B) et P(A ⋃ B) à partir d'un tableau croisé",
   met:"P(A ⋂ B) = effectif de la case commune ÷ total. P(A ⋃ B) = P(A) + P(B) − P(A ⋂ B), pour ne pas compter deux fois l'intersection.",ex:"P(abîmé) = 0,12, P(taille S) = 0,45, P(abîmé ∩ S) = 0,07 → P(abîmé ∪ S) = 0,5",pg:"Additionner P(A) + P(B) sans retrancher l'intersection : on la compte deux fois."},
  {sig:"Calculer une fréquence ou une probabilité conditionnelle",
   met:"Fréquence conditionnelle : lue directement sur la ligne/colonne de la catégorie qui conditionne. Probabilité conditionnelle : P_A(B) = P(A ⋂ B) ÷ P(A).",ex:"42 sur 48 déjà-acheteurs recommandent → 42 ÷ 48 ≈ 0,88",pg:"Diviser par le total général au lieu de l'effectif de la catégorie qui conditionne."}
 ],
 "suites-mcv":[
  {sig:"Une quantité augmente (ou diminue) toujours du même nombre à chaque étape",
   met:"Suite arithmétique : uₙ₊₁ = uₙ + r. Terme de rang n : uₙ = u₀ + n × r.",ex:"u₀ = 8, r = 3 → u₁₀ = 8 + 10 × 3 = 38",pg:"Confondre avec une suite géométrique (× r au lieu de + r) — vue en terminale, pas en première."},
  {sig:"Calculer un total cumulé sur plusieurs périodes",
   met:"Somme des n premiers termes, obtenue à l'aide d'un outil numérique (la formule n'est pas exigée par cœur en première).",ex:"8+11+14+17+20+23 = 93",pg:"Ne prendre que le dernier terme au lieu d'additionner tous les termes de la période."}
 ],
 "eqineq-mcv":[
  {sig:"Trouver le seuil de rentabilité (coût = recette)",
   met:"Résoudre graphiquement (ou dans un tableau de valeurs) C(x) = R(x) : chercher où les deux lignes/courbes coïncident.",ex:"C(5) = R(5) = 25 → seuil à x = 5",pg:"Chercher où C(x) = 0 ou R(x) = 0 au lieu de C(x) = R(x)."},
  {sig:"Trouver à partir de quand on est bénéficiaire",
   met:"Résoudre l'inéquation R(x) ⩾ C(x) : chercher où la ligne/courbe de R est au-dessus de celle de C.",ex:"à partir de x = 6, R(x) &gt; C(x)",pg:"S'arrêter au seuil d'égalité sans vérifier de quel côté l'inéquation est vraie."}
 ],
 "poly2-mcv":[
  {sig:"Un polynôme de degré 2 est donné sous forme factorisée a(x − x₁)(x − x₂)",
   met:"Les racines se lisent directement : x₁ et x₂. Le signe s'étudie facteur par facteur (règle des signes d'un produit).",ex:"−2(p−3)(p−9) → racines 3 et 9",pg:"Chercher les racines par une autre méthode alors qu'elles sont déjà lisibles dans la forme factorisée."},
  {sig:"Trouver le sommet (maximum ou minimum) d'une parabole à partir de ses racines",
   met:"Le sommet est toujours au milieu des deux racines : (x₁ + x₂) ÷ 2. Le signe de a indique si c'est un maximum (a &lt; 0) ou un minimum (a &gt; 0).",ex:"racines 3 et 9 → sommet en (3+9)÷2 = 6",pg:"Oublier que a &lt; 0 donne un maximum et a &gt; 0 un minimum (facile à inverser)."}
 ],
 "derivee-mcv":[
  {sig:"Étudier les variations d'une fonction polynôme de degré ⩽ 2",
   met:"Calculer f'(x) = 2ax + b, étudier son signe, puis en déduire le sens de variation de f (f' &gt; 0 → f croissante).",ex:"B(p) = −2p²+24p−54 → B'(p) = −4p+24, nulle en p = 6",pg:"Étudier le signe de f au lieu du signe de f' pour parler des variations."},
  {sig:"La fonction inverse dans un coût moyen unitaire (k/x + c)",
   met:"1/x est décroissante sur ]0 ; +∞[ ; ajouter une constante ne change pas le sens de variation.",ex:"CM(x) = 15/x + 2 est décroissante : plus x augmente, plus CM(x) diminue",pg:"Croire qu'un coût moyen peut descendre en dessous du coût variable constant (ici 2 €) : il s'en approche sans l'atteindre."}
 ],
 "commerce-mcv":[
  {sig:"Calculer un capital après une durée à intérêts simples",
   met:"Intérêt = capital initial × taux × durée (en fraction d'année si besoin). Capital disponible = capital initial + intérêt.",ex:"300 € à 4 % annuel sur 6 mois → intérêt 6 €, capital 306 €",pg:"Calculer l'intérêt sur le capital déjà augmenté des intérêts précédents (c'est l'intérêt composé, pas simple)."},
  {sig:"Calculer un coût marginal",
   met:"Cm(x) = C(x+1) − C(x) ; pour de grandes quantités, on peut l'approcher par C'(x).",ex:"C(x) = 15+2x → Cm(x) = 2, constant, égal à C'(x)",pg:"Confondre coût marginal (coût d'une unité de plus) et coût moyen (coût total ÷ quantité)."}
 ],
 "geo-mcv":[
  {sig:"Section d'un pavé droit par un plan parallèle à une face",
   met:"La section garde exactement les mêmes dimensions que la face à laquelle elle est parallèle.",ex:"carton 60×40×50 cm coupé à mi-hauteur → section 60×40 cm, comme la base",pg:"Croire que la section change de taille selon la hauteur de coupe dans un pavé droit — c'est vrai pour une pyramide, pas pour un pavé droit."},
  {sig:"Section d'une pyramide par un plan parallèle à sa base",
   met:"La section est un polygone semblable à la base mais plus petit ; sa taille diminue en se rapprochant du sommet.",ex:"base 1,20 m coupée à mi-hauteur → section 0,60 m de côté",pg:"Appliquer la règle du pavé droit (section identique à la base) à une pyramide."}
 ],
 "stat2var-mcvtle":[
  {sig:"Le nuage de points monte ou descend à peu près régulièrement",
   met:"Ajustement affine y = ax + b, donné par la calculatrice — on ne le recalcule pas à la main.",ex:"y = 3,5x + 12 → au mois 8 : 3,5 × 8 + 12 = 40",pg:"Refaire un calcul de régression à la main : on utilise l'outil numérique."},
  {sig:"Le nuage de points s'incurve nettement (pas une droite)",
   met:"Changement de variable indiqué (ex. z = log(y)), ajustement affine sur (x ; z), puis retour à y = 10ᶻ.",ex:"z = 0,05x + 1 → à x = 20 : z = 2 → y = 10² = 100",pg:"Oublier de revenir à y après avoir travaillé sur z."},
  {sig:"Estimer une valeur dans / hors de la période mesurée",
   met:"Dans la période : interpoler (fiable). En dehors : extrapoler (moins fiable, la tendance est supposée se poursuivre).",ex:"données de 1 à 12 : le mois 8 s'interpole, le mois 14 s'extrapole",pg:"Faire autant confiance à une extrapolation lointaine qu'à une interpolation."}
 ],
 "proba-mcvtle":[
  {sig:"Une situation aléatoire à plusieurs épreuves qui se suivent",
   met:"Arbre pondéré : somme des probabilités = 1 sur chaque nœud ; probabilité d'un chemin = produit des branches.",ex:"0,95 × 0,98 = 0,931",pg:"Additionner les probabilités d'un chemin au lieu de les multiplier."},
  {sig:"Calculer P(un événement du 2ᵉ niveau) sur un arbre à deux niveaux",
   met:"Formule des probabilités totales : additionner les probabilités de tous les chemins qui mènent à cet événement.",ex:"0,0097 + 0,0396 = 0,0493",pg:"N'additionner qu'un seul chemin au lieu de tous ceux qui aboutissent à l'événement."},
  {sig:"Montrer que deux événements A et B sont indépendants",
   met:"Comparer la probabilité mesurée de « A et B » au produit P(A) × P(B) calculé séparément : s'ils coïncident, l'indépendance est vérifiée.",ex:"0,90 × 0,85 = 0,765, égal à la mesure : indépendance confirmée",pg:"Confondre indépendance et incompatibilité (ne jamais pouvoir se produire ensemble)."}
 ],
 "suites-mcvtle":[
  {sig:"Une évolution à taux fixe, période après période",
   met:"Suite géométrique uₙ₊₁ = uₙ × q, avec q = 1 + taux (hausse) ou q = 1 − taux (baisse). Terme direct : uₙ = u₀ × qⁿ.",ex:"+8 % par semaine, u₀ = 40 → u₅ = 40 × 1,08⁵ ≈ 59",pg:"Utiliser q = taux au lieu de q = 1 ± taux."},
  {sig:"Une suite géométrique est exactement une fonction exponentielle de n",
   met:"uₙ = u₀ × qⁿ = u₀ × e^(n×ln(q)) : sur la calculatrice, un modèle Exponentielle appliqué aux points (n ; uₙ) retrouve a = u₀ et b = ln(q).",ex:"q = 1,08 → b = ln(1,08) ≈ 0,077, a ≈ 40",pg:"Chercher un ajustement affine sur une suite géométrique — les points ne s'alignent pas, c'est le modèle exponentiel qu'il faut choisir."},
  {sig:"Trouver le premier rang où la suite dépasse (ou passe sous) un seuil",
   met:"Recherche par balayage : calculer les termes un par un jusqu'à franchir le seuil.",ex:"2000 × 0,94ⁿ < 1000 → n = 12 (951,8 < 1000, alors que n = 11 donne encore 1012,6)",pg:"Résoudre une équation exacte alors qu'un balayage numérique suffit et est attendu."}
 ],
 "poly3-mcvtle":[
  {sig:"Étudier la fonction cube f(x) = x³",
   met:"f'(x) = 3x², toujours positive ou nulle (un carré) : f est strictement croissante sur ℝ.",ex:"f'(0) = 0 mais pas d'extremum : f continue de croître avant et après 0",pg:"Croire qu'une dérivée nulle en un point signale toujours un extremum local."},
  {sig:"Dresser le tableau de variations d'un polynôme de degré ⩽ 3",
   met:"Étudier le signe de la dérivée f' : f' > 0 → f croissante ; f' < 0 → f décroissante. Extremum local où f' change de signe.",ex:"f'(x) = 3(x−1)(x−3) : positive avant 1 et après 3, négative entre les deux",pg:"Étudier le signe de f au lieu du signe de f'."},
  {sig:"Compter le nombre de solutions de f(x) = c à l'aide du tableau",
   met:"Compter, sur chaque morceau strictement monotone du tableau de variations, si la valeur c est franchie.",ex:"maximum local 4, minimum local 0 : f(x) = 2 a 3 solutions ; f(x) = 5 n'en a aucune sur l'intervalle étudié",pg:"Vouloir résoudre l'équation par le calcul algébrique au lieu de lire le tableau."}
 ],
 "expolog-mcvtle":[
  {sig:"Une évolution exponentielle de base q, f(x) = A × qˣ",
   met:"q > 1 → fonction croissante ; 0 < q < 1 → fonction décroissante. Propriété : qᵃ × qᵇ = qᵃ⁺ᵇ.",ex:"P(x) = 100 × 0,6ˣ (q = 0,6 < 1) : décroissante, P(3) = 21,6",pg:"Confondre le sens de variation : croire que q < 1 donne toujours une fonction croissante."},
  {sig:"Passer de 10ˣ = b à x, ou inversement",
   met:"log(b) est l'unique solution de 10ˣ = b ; en particulier log(10ˣ) = x. La fonction log est croissante sur ]0 ; +∞[.",ex:"log(1000) = 3 car 10³ = 1000",pg:"Appliquer log(x) à une valeur négative ou nulle : ce n'est pas défini."},
  {sig:"Résoudre une équation ou inéquation qˣ = a (ou qˣ ⩽/⩾ a)",
   met:"Appliquer log aux deux membres : log(qˣ) = x × log(q), donc x = log(a) ÷ log(q).",ex:"0,6ˣ = 0,05 → x = log(0,05) ÷ log(0,6) ≈ 5,9",pg:"Oublier que log(qˣ) = x × log(q), pas log(q)^x ni x + log(q)."}
 ],
 "commerce-mcvtle":[
  {sig:"Calculer un capital après n périodes à intérêts composés",
   met:"Cₙ = C₀ × (1 + t)ⁿ, avec t le taux par période en décimal.",ex:"8000 × 1,03⁵ ≈ 9274,19 €",pg:"Utiliser la formule des intérêts simples (C₀ × t × n) à la place."},
  {sig:"Compléter un tableau d'amortissement à annuités constantes",
   met:"intérêt de l'année = capital restant dû × taux ; amortissement = annuité − intérêt ; nouveau capital restant dû = ancien − amortissement.",ex:"15000 € à 4 %, annuité 3369,41 € : année 1, intérêt 600 €, amortissement 2769,41 €, restant dû 12230,59 €",pg:"Calculer l'intérêt sur le capital initial chaque année au lieu du capital restant dû."},
  {sig:"Convertir un taux annuel en taux mensuel équivalent",
   met:"(1 + tₘ)¹² = 1 + t, donc tₘ = (1 + t)^(1/12) − 1 — différent de t ÷ 12.",ex:"taux annuel 4 % → taux mensuel équivalent ≈ 0,33 %",pg:"Diviser simplement le taux annuel par 12."},
  {sig:"Calculer le taux moyen de plusieurs évolutions successives",
   met:"Coefficient global = produit des coefficients de chaque période ; taux moyen tel que (1 + tₘₒy)ⁿ = coefficient global.",ex:"+5 % puis −3 % puis +2 % → coefficient 1,0389 → taux moyen ≈ +1,28 % par an",pg:"Faire la moyenne arithmétique des pourcentages (ici +1,33 %, ce qui est faux)."}
 ]
};
