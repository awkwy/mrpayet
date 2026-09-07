export const CCF = {
 "2P MV2":{
  label:"devoir commun",
  intro:"Le <b>devoir commun</b> de mi-mars porte sur les <b>statistiques à une variable</b> et les <b>probabilités</b>. Il se passe en classe entière et il est noté. Mêmes cinq compétences qu'au bac : ce qui compte, c'est ce que tu <b>fais</b> devant un problème.",
  maths:{titre:"Devoir commun — mathématiques",duree:"statistiques + probabilités",note:"noté",taches:[
   {titre:"Les durées d'intervention de la semaine",
    ctx:"Le chef d'atelier a chronométré huit interventions cette semaine (en minutes) : 30, 45, 40, 35, 50, 40, 38, 120. La dernière était une longue recherche de panne électrique. Il veut décrire ces durées.",
    qs:[
     {comp:"S'approprier",q:"Combien d'interventions ont été chronométrées ?",a:8,tol:0},
     {comp:"Réaliser",q:"Somme des huit durées : 30 + 45 + 40 + 35 + 50 + 40 + 38 + 120 = ? (en min)",a:398,tol:0},
     {comp:"Réaliser",q:"Durée moyenne : 398 ÷ 8 = ? (en min)",a:49.75,tol:0.05},
     {comp:"Analyser/Raisonner",q:"Range les huit durées. L'effectif est pair : la médiane est la moyenne des 4ᵉ et 5ᵉ valeurs. Que valent ces deux valeurs ?",a:["40 et 40","40 40","40;40","40 ; 40"],txt:true,sol:"Rangées : 30 · 35 · 38 · 40 · 40 · 45 · 50 · 120. La 4ᵉ et la 5ᵉ valent toutes deux 40."},
     {comp:"Réaliser",q:"Médiane : (40 + 40) ÷ 2 = ? (en min)",a:40,tol:0},
     {comp:"Réaliser",q:"Étendue : 120 − 30 = ? (en min)",a:90,tol:0},
     {comp:"Valider",q:"Pour décrire une intervention habituelle, vaut-il mieux annoncer la moyenne (49,75) ou la médiane (40) ?",a:["la mediane","mediane"],txt:true,sol:"La médiane : la moyenne est tirée vers le haut par l'intervention de 120 min."}
    ],
    comm:"Le chef d'atelier veut afficher une durée indicative pour les clients. Rédige la phrase.",
    commA:"« Comptez environ 40 minutes pour une intervention courante ; certaines recherches de panne peuvent dépasser une heure. »"},
   {titre:"Le lot de bougies d'allumage",
    ctx:"Un lot de 200 bougies arrive au magasin ; le fournisseur annonce 2 % de défauts. Le magasinier en prélève 50 pour vérifier. À l'atelier, cinq véhicules attendent un contrôle : 2 diesels et 3 essences ; on en tire un au sort chaque matin.",
    qs:[
     {comp:"S'approprier",q:"Taux de défaut annoncé, écrit en nombre décimal ?",a:0.02,tol:0},
     {comp:"Réaliser",q:"Nombre moyen de bougies défectueuses sur les 200 : 200 × 0,02 = ?",a:4,tol:0},
     {comp:"Réaliser",q:"Le magasinier trouve 2 défectueuses sur 50. Fréquence observée : 2 ÷ 50 = ?",a:0.04,tol:0},
     {comp:"Valider",q:"Cette fréquence de 0,04 prouve-t-elle que le fournisseur a menti ? (oui / non)",a:"non",txt:true,sol:"Non : sur seulement 50 pièces, la fréquence fluctue autour de 0,02. C'est la fluctuation d'échantillonnage."},
     {comp:"Analyser/Raisonner",q:"Probabilité de tirer un diesel parmi les 5 véhicules : ",a:0.4,tol:0.001,sol:"2 diesels sur 5 : 2 ÷ 5 = 0,4."},
     {comp:"Réaliser",q:"Probabilité de tirer une essence (événement contraire) : 1 − 0,4 = ?",a:0.6,tol:0.001},
     {comp:"Analyser/Raisonner",q:"On tire un véhicule lundi, puis un autre mardi (le lundi est remis en jeu). Combien de couples (lundi ; mardi) possibles ?",a:25,tol:0,sol:"5 possibilités lundi × 5 mardi = 25. On peut le voir avec un arbre ou un tableau à double entrée."}
    ],
    comm:"Explique au magasinier pourquoi il ne faut pas s'alarmer d'avoir trouvé 2 bougies défectueuses sur 50.",
    commA:"« Sur un petit échantillon, la fréquence de défauts varie autour des 2 % annoncés : 2 sur 50 (soit 4 %) reste normal. Il faudrait contrôler beaucoup plus de bougies pour juger le lot. »"}
  ]}
 },
 "TC APMP":{
  intro:"Groupement 2 : le CCF de maths porte sur la statistique, la proportionnalité, le premier degré, les fonctions et les <b>calculs commerciaux et financiers</b> (pas de géométrie).",
  maths:{titre:"Situation de mathématiques",duree:"45 min",note:"/ 12",taches:[
   {titre:"Le matériel de la salle de médiation",
    ctx:"Une association de médiation de quartier équipe une salle de réunion. Devis du fournisseur (montants HT) : 12 chaises à 24 €, 1 tableau à 85 €, livraison 30 €. TVA 20 %. Le fournisseur accorde une remise de 5 % sur le mobilier (chaises + tableau), pas sur la livraison. La dépense est partagée : mairie 60 %, association 40 %.",
    qs:[
     {comp:"S'approprier",q:"Sur quels articles porte la remise de 5 % ?",a:["les chaises et le tableau","chaises et tableau","le mobilier","mobilier"],txt:true,sol:"Le mobilier : les chaises et le tableau. Pas la livraison."},
     {comp:"Réaliser",q:"Prix HT des 12 chaises : 12 × 24 = ? (en €)",a:288,tol:0},
     {comp:"Réaliser",q:"Prix HT du mobilier (chaises + tableau) : 288 + 85 = ? (en €)",a:373,tol:0},
     {comp:"Analyser/Raisonner",q:"Une remise de 5 % correspond à quel coefficient multiplicateur ?",a:0.95,tol:0.001,sol:"1 − 0,05 = 0,95."},
     {comp:"Réaliser",q:"Mobilier après remise : 373 × 0,95 = ? (en €)",a:354.35,tol:0.02},
     {comp:"Réaliser",q:"On ajoute la livraison : 354,35 + 30 = ? (en € HT)",a:384.35,tol:0.02},
     {comp:"Réaliser",q:"Montant TTC : 384,35 × 1,20 = ? (en €)",a:461.22,tol:0.05},
     {comp:"Réaliser",q:"Part de la mairie : 461,22 × 0,60 = ? (en €)",a:276.73,tol:0.05},
     {comp:"Réaliser",q:"Part de l'association : 461,22 × 0,40 = ? (en €)",a:184.49,tol:0.05},
     {comp:"Valider",q:"Vérification : 276,73 + 184,49 = ? (en €)",a:461.22,tol:0.05,sol:"On retrouve le montant TTC : le partage est juste."}
    ],
    comm:"Rédige la phrase que l'association enverra à la mairie pour lui indiquer sa participation.",
    commA:"« Le coût total du matériel s'élève à 461,22 € TTC. Conformément à la répartition 60 / 40, la participation de la mairie est de 276,73 € et celle de l'association de 184,49 €. »"}
  ]},
  sciences:{titre:"Situation de physique-chimie",duree:"45 min",note:"/ 8",taches:[
   {titre:"Un conflit de voisinage pour bruit",
    ctx:"Un voisin se plaint de la musique d'un autre. Le soir, tu mesures au sonomètre : 88 dB à 1 m de l'enceinte. Le bruit de fond du quartier le soir est de 40 dB. La réglementation tolère une émergence (différence avec le bruit de fond) de 5 dB. Échelle fournie : seuil de danger pour l'oreille 85 dB, seuil de douleur 120 dB. Un mur mitoyen atténue le son de 30 dB.",
    qs:[
     {comp:"S'approprier",q:"Que mesure un sonomètre ? (en deux mots)",a:["le niveau sonore","niveau sonore","niveau d'intensité acoustique","le niveau d'intensité acoustique","niveau d intensite acoustique"],txt:true,sol:"Le niveau d'intensité acoustique, exprimé en décibels (dB)."},
     {comp:"S'approprier",q:"Bruit de fond du quartier le soir ? (en dB)",a:40,tol:0},
     {comp:"Analyser/Raisonner",q:"Émergence tolérée 5 dB au-dessus du bruit de fond : niveau total maximal toléré ? (en dB)",a:45,tol:0},
     {comp:"Réaliser",q:"Émergence réellement mesurée : 88 − 40 = ? (en dB)",a:48,tol:0},
     {comp:"Valider",q:"Cette émergence de 48 dB dépasse-t-elle la tolérance de 5 dB ? (oui / non)",a:"oui",txt:true},
     {comp:"Valider",q:"Le niveau de 88 dB dépasse-t-il le seuil de danger de 85 dB ? (oui / non)",a:"oui",txt:true},
     {comp:"Réaliser",q:"Niveau perçu chez le plaignant, derrière le mur : 88 − 30 = ? (en dB)",a:58,tol:0}
    ],
    comm:"En tant qu'agent de prévention et de médiation, que dis-tu aux deux parties, chiffres à l'appui ?",
    commA:"« Le niveau mesuré, 88 dB, dépasse le seuil de danger (85 dB) et l'émergence autorisée (48 dB contre 5 dB tolérés). Même atténué par le mur, le son reste à 58 dB chez le voisin. Il faut baisser le volume ou déplacer l'enceinte. »"}
  ]}
 },
 "TC AEPE":{
  intro:"Groupement 1 : le CCF de maths porte sur la statistique, la proportionnalité, le premier degré, les fonctions et la <b>géométrie</b> (pas de calculs commerciaux).",
  maths:{titre:"Situation de mathématiques",duree:"45 min",note:"/ 12",taches:[
   {titre:"La commande de couches de la crèche",
    ctx:"Une micro-crèche accueille 12 enfants et ouvre 4 jours par semaine. Chaque enfant utilise en moyenne 6 couches par jour. Un carton contient 132 couches et coûte 28,50 €. Le fournisseur accorde une remise de 10 % à partir de 10 cartons commandés.",
    qs:[
     {comp:"S'approprier",q:"Combien d'enfants, et combien de jours d'ouverture par semaine ?",a:["12 et 4","12 ; 4","12 enfants 4 jours","12 4"],txt:true,sol:"12 enfants, 4 jours par semaine."},
     {comp:"Réaliser",q:"Couches utilisées en une journée : 12 × 6 = ?",a:72,tol:0},
     {comp:"Réaliser",q:"Couches pour une semaine : 72 × 4 = ?",a:288,tol:0},
     {comp:"Analyser/Raisonner",q:"Couches pour 4 semaines : 288 × 4 = ?",a:1152,tol:0},
     {comp:"Réaliser",q:"Nombre de cartons nécessaires : 1152 ÷ 132 = ? (arrondi à l'entier supérieur)",a:9,tol:0,sol:"1152 ÷ 132 ≈ 8,7 → on arrondit vers le haut : 9 cartons."},
     {comp:"Valider",q:"9 cartons suffisent-ils ? Calcule 9 × 132.",a:1188,tol:0,sol:"1188 ≥ 1152 : oui, il en reste même un peu."},
     {comp:"Réaliser",q:"Coût de 10 cartons avec la remise de 10 % : 10 × 28,50 × 0,90 = ? (en €)",a:256.5,tol:0.05},
     {comp:"Réaliser",q:"Coût de 9 cartons sans remise : 9 × 28,50 = ? (en €)",a:256.5,tol:0.05},
     {comp:"Valider",q:"Que remarques-tu en comparant les deux montants ?",a:["ils sont egaux","c'est le meme prix","le meme prix","egaux","identiques","pareil","c est pareil"],txt:true,sol:"C'est exactement le même prix : 10 cartons remisés coûtent autant que 9 cartons plein tarif."}
    ],
    comm:"Tu conseilles la directrice sur la commande à passer. Que lui dis-tu ?",
    commA:"« Il faut 9 cartons pour le mois, mais 10 cartons avec la remise coûtent le même prix (256,50 €). Autant commander 10 cartons : on paie pareil et on a une avance pour le mois suivant. »"}
  ]},
  sciences:{titre:"Situation de physique-chimie",duree:"45 min",note:"/ 8",taches:[
   {titre:"Préparer une solution désinfectante",
    ctx:"Le protocole d'hygiène de la crèche demande une solution de chlore de concentration massique 2 g/L. Tu dois en préparer 3 L. Tu disposes de pastilles de chlore de 1,5 g. Le bidon de pastilles porte le pictogramme « corrosif ». Après préparation, tu mesures le pH de la solution : 9.",
    qs:[
     {comp:"S'approprier",q:"Concentration voulue (en g/L) ?",a:2,tol:0},
     {comp:"Réaliser",q:"Masse de chlore nécessaire : Cm × V = 2 × 3 = ? (en g)",a:6,tol:0},
     {comp:"Réaliser",q:"Nombre de pastilles de 1,5 g : 6 ÷ 1,5 = ?",a:4,tol:0},
     {comp:"S'approprier",q:"pH mesuré : 9. La solution est-elle acide, neutre ou basique ?",a:["basique"],txt:true,sol:"pH > 7 : la solution est basique."},
     {comp:"Analyser/Raisonner",q:"On dilue cette solution avec de l'eau. Vers quelle valeur de pH se rapproche-t-elle ?",a:7,tol:0,sol:"Une dilution rapproche le pH de 7 (neutre)."},
     {comp:"Valider",q:"Après dilution, on mesure pH 8. Est-ce cohérent ? (oui / non)",a:"oui",txt:true,sol:"Oui : 8 est plus proche de 7 que 9 ne l'était."},
     {comp:"Réaliser",q:"Pictogramme « corrosif » : quel équipement de protection mets-tu ? (un mot suffit)",a:["gants","lunettes","gants et lunettes","des gants","gants lunettes","blouse"],txt:true,sol:"Gants et lunettes de protection au minimum."}
    ],
    comm:"Une collègue va reprendre la préparation. Que lui écris-tu sur la fiche de poste ?",
    commA:"« Dissoudre 4 pastilles (6 g) dans 3 L d'eau pour obtenir 2 g/L. Port de gants et lunettes obligatoire (produit corrosif). Solution basique (pH 9) : ne pas mélanger avec un autre produit. »"}
  ]}
 }
};
