import { fr } from '$lib/utils/frac.js';

// « Mon stage en chiffres » — séances 1 et 2 du module Statistique à une variable
// (TC APM, groupement 2). Source : planning-stats-stage-tcapm (étapes 1 à 5) et
// stats-stage-suite-tcapm (étapes 4 à 7) ; leçons rédigées Cours_stats_stage_TCAPM_55min
// et …_suite_…. Une seule série pour toute la classe, inventée pour l'exercice :
// personnes reçues à l'accueil d'une mairie, jours 1 à 10.
// Programme CAP : effectif total, fréquences, moyenne, bâtons, lecture de graphique.
// Médiane, quartiles, étendue : hors programme (une seule mention « pour les curieux »).
// Jamais le signe ÷ : fractions empilées (fr) ; les libellés de question disent « sur ».

const SERIE = [[10, 2], [12, 4], [14, 2], [16, 1], [18, 1]];

export default {id:"stats-stage-tcapm",classe:"TC APM",mat:"Maths",titre:"Mon stage en chiffres",
 desc:"Statistique à une variable avec la NumWorks : effectif, effectif total, moyenne, bâtons, fréquence et pourcentage — faut-il un deuxième agent à l'accueil de la mairie ?",
 pdf:"maths",
 obj:["Ranger des relevés dans un tableau d'effectifs et trouver l'effectif total",
      "Saisir V1 et N1 dans la NumWorks, lire l'effectif total et la moyenne, et les vérifier",
      "Dessiner un diagramme en bâtons et lire l'effectif et la fréquence d'une barre sur le graphique",
      "Passer d'une fréquence à un pourcentage, puis répondre à la question avec des nombres"],
 seances:[
 {t:"Je range, je compte, je calcule",pdf:["planning-stats-stage-tcapm"],
  prob:"À l'accueil de la mairie, un agent peut recevoir 15 personnes par jour, pas plus. Ton chef demande : « Faut-il un deuxième agent ? » Les chiffres de tes 10 jours de stage vont répondre.",
  steps:[
   {t:"La situation",txt:"Tu fais ton stage à l'accueil d'une mairie. Un agent peut recevoir 15 personnes par jour, pas plus. Ton chef demande : « Faut-il un deuxième agent ? » Pendant 10 jours, tu as noté combien de personnes sont venues (nombres inventés pour l'exercice).",
    doc:{h:["Jour","Personnes venues"],r:[["jour 1","12"],["jour 2","14"],["jour 3","10"],["jour 4","12"],["jour 5","18"],["jour 6","12"],["jour 7","10"],["jour 8","14"],["jour 9","12"],["jour 10","16"]]},
    apport:"Le planning en 5 étapes : <b>1. Je collecte</b> (je regarde les nombres) · <b>2. J'organise</b> (je range et je compte) · <b>3. Je calcule</b> avec la NumWorks · <b>4. J'interprète</b> (bâtons, parts, graphique) · <b>5. Je conclus</b> (je réponds avec des nombres). Dans ce chapitre : les étapes 1 à 3."},
   {t:"Je regarde les nombres",
    apport:"Avant de calculer, je lis toute la série. Je repère le <b>plus petit</b> nombre et le <b>plus grand</b> : la moyenne sera forcément entre les deux.",
    q:[{q:"Quel est le plus petit nombre de personnes en un jour ?",a:10,tol:0,hint:"Relis les 10 jours du tableau, un par un, et garde le plus petit."},
       {q:"Quel est le plus grand nombre de personnes en un jour ?",a:18,tol:0,hint:"Relis les 10 jours du tableau, un par un, et garde le plus grand."}]},
   {t:"Je range et je compte",
    apport:"Je fais un trait pour chaque jour, dans la ligne du bon nombre. L'<b>effectif</b> d'un nombre, c'est le nombre de jours où il revient. Exemple : 12 personnes sont venues 4 jours, donc l'effectif de 12 est 4. L'<b>effectif total</b>, c'est le nombre de tous les jours : 10.",
    viz:"depouillement",
    vd:{question:"Un jour après l'autre, fais un trait dans la ligne du bon nombre de personnes.",options:["10","12","14","16","18"],counts:[2,4,2,1,1],
        order:[1,2,0,1,4,1,0,2,1,3],unit:"personnes",slipMode:"value",slipLabel:"Jour",slipText:"Ce jour-là, il est venu",only:"tally",
        hintStart:"Chaque trait est un jour. À la fin, l'effectif total doit être 10 : c'est le nombre de jours.",
        endMsg:"L'effectif total est <b>10</b> : c'est le nombre de jours. L'effectif de 12 est <b>4</b> : 12 personnes sont venues 4 jours."},
    q:[{q:"Quel est l'effectif de 14 personnes ? (combien de jours)",a:2,tol:0,hint:"Compte les traits de la ligne 14 dans ta feuille."},
       {q:"Quel est l'effectif total ? (combien de jours en tout)",a:10,tol:0,hints:[{v:5,say:"5 est le nombre de lignes du tableau. L'effectif total additionne les effectifs : 2 + 4 + 2 + 1 + 1."}]}]},
   {t:"Je calcule avec la NumWorks",
    apport:"La NumWorks calcule l'effectif total et la moyenne à ma place, si je lui donne le bon tableau. Dans <b>Statistiques</b>, l'onglet <b>Données</b> a deux colonnes : <b>Valeurs V1</b> (les nombres de personnes) et <b>Effectifs N1</b> (combien de jours pour chaque nombre). Je tape chaque nombre <b>une seule fois</b> dans V1, puis son effectif dans N1. Ensuite, dans l'onglet <b>Stats</b>, je lis « Effectif total » et « Moyenne ». <b>Je vérifie toujours</b> que l'effectif total de l'écran est le même nombre que dans mon tableau.",
    calc:{mode:"stat1",series:SERIE,start:"home",stale:true,unit:"personnes"}},
   {t:"Je lis les résultats",
    apport:"Une erreur ? Appuie sur <b>Back</b>, change la case fausse, puis relis l'onglet Stats. Si l'effectif total est 5 au lieu de 10, les effectifs N1 sont restés à 1.",
    q:[{q:"Quel effectif total la NumWorks affiche-t-elle ?",a:10,tol:0,hints:[{v:5,say:"Effectif total 5 : les effectifs N1 sont restés à 1. Retourne dans Données et tape les effectifs de ton tableau."},{v:70,say:"Effectif total 70 : les nombres de personnes sont dans N1. Les nombres vont en V1, les effectifs en N1."}],hint:"Compare avec ton tableau : l'effectif total doit être le nombre de jours."},
       {q:"Quelle moyenne la NumWorks affiche-t-elle ? (nombre de personnes par jour)",a:13,tol:0,hints:[{v:14,say:"14 est la moyenne des cinq nombres sans les effectifs : N1 n'a pas été rempli."}],hint:"La moyenne est entre le plus petit nombre (10) et le plus grand (18)."},
       {q:"La moyenne est-elle entre le plus petit et le plus grand nombre ? (oui / non)",a:"oui",txt:true,sol:"Oui : 13 est entre 10 et 18. Une moyenne hors de cet intervalle signale une erreur de saisie."}]},
   {t:"Et à la main ?",
    apport:`Pour comprendre ce que la NumWorks fait : je <b>multiplie</b> chaque nombre par son effectif, j'<b>additionne</b>, puis je prends la part de l'effectif total. Moyenne = ${fr("10×2 + 12×4 + 14×2 + 16×1 + 18×1","10")} = ${fr("130","10")} = 13.`,
    q:[{q:"Somme de tous les nombres : 10×2 + 12×4 + 14×2 + 16×1 + 18×1",a:130,tol:0,hint:"20 + 48 + 28 + 16 + 18."},
       {q:"130 personnes sur 10 jours : combien par jour en moyenne ?",a:13,tol:0}]}],
  quiz:[{q:"« L'effectif de 12 est 4 » veut dire que :",o:["12 personnes sont venues 4 jours","4 personnes sont venues 12 jours","12 + 4 = 16 personnes sont venues"],c:0,e:"L'effectif d'un nombre, c'est le nombre de jours où ce nombre revient."},
        {q:"La NumWorks affiche un effectif total de 5, ton tableau en compte 10. Que vérifier d'abord ?",o:["la colonne des effectifs N1","la pile de la calculatrice","la couleur de l'écran"],c:0,e:"N1 est resté à 1 pour chaque nombre : 5 nombres × 1 = 5."},
        {q:"Tes nombres vont de 10 à 18 et la NumWorks affiche une moyenne de 50. C'est possible ?",o:["Non : la moyenne est toujours entre le plus petit et le plus grand nombre","Oui, tout est possible"],c:0,e:"Une moyenne reste entre le minimum et le maximum : sinon il y a une erreur de saisie."}],
  trace:`<b>Question.</b> Tu fais ton stage à l'accueil d'une mairie. Faut-il mettre un deuxième agent ?<br><b>Les nombres.</b> J'ai noté 10 jours : 12, 14, 10, 12, 18, 12, 10, 14, 12, 16.<br><b>L'effectif.</b> L'effectif, c'est le nombre de jours pour un même nombre de personnes. Exemple : 12 personnes sont venues 4 jours, l'effectif de 12 est 4. L'<b>effectif total</b>, c'est le nombre de tous les jours : 10.<br><b>La moyenne.</b> La moyenne, c'est le nombre d'un jour normal. J'additionne tous les nombres : 130. Puis je prends la part de l'effectif total : ${fr("130","10")} = 13. La moyenne est toujours entre le plus petit nombre (10) et le plus grand (18).<br><b>Avec la NumWorks.</b> Home, Statistiques. Onglet Données : nombres en V1, effectifs en N1. Onglet Stats : je lis Effectif total et Moyenne, et je vérifie que l'effectif total est bien 10.`},
 {t:"Les bâtons, les parts et la réponse",pdf:["stats-stage-suite-tcapm"],
  prob:"Même série, même question. On dessine les bâtons, on lit le graphique de la NumWorks, on passe des parts aux pourcentages, et on répond au chef avec des nombres.",
  steps:[
   {t:"On repart du même tableau",txt:"Tu as noté 10 jours à l'accueil d'une mairie. Tout le monde repart du même tableau (nombres inventés pour l'exercice). Compare avec le tien : corrige si besoin.",
    doc:{h:["Nombre de personnes","Effectif (jours)"],r:[["10","2"],["12","4"],["14","2"],["16","1"],["18","1"],["Effectif total","10"]]},
    apport:"On finit le planning : <b>4. J'interprète</b> (les bâtons, une part, le graphique de la NumWorks, le pourcentage) et <b>5. Je conclus</b> (je réponds au chef avec des nombres)."},
   {t:"Je dessine les bâtons",
    apport:"Un bâton par nombre de personnes. <b>La hauteur du bâton est l'effectif</b> : le nombre de jours. Fixe la hauteur de chaque bâton sur la grille : un ✓ s'affiche quand elle est juste.",
    viz:"batonsDessin",vd:{values:[10,12,14,16,18],effs:[2,4,2,1,1],ymax:5,limit:15,xlabel:"nombre de personnes",ylabel:"jours"},
    q:[{q:"Combien de jours ont plus de 15 personnes ? Compte avec tes bâtons.",a:2,tol:0,hint:"Plus de 15 personnes : regarde les bâtons du 16 et du 18, puis additionne leurs hauteurs."}]},
   {t:"Une part, puis un pourcentage",
    apport:`La <b>fréquence</b> d'un nombre, c'est sa <b>part</b> des jours : l'effectif sur l'effectif total. Les jours à plus de 15 personnes : ${fr("2","10")} = 0,2. Pour passer au pourcentage, je multiplie par 100 : 0,2 × 100 = 20 %. Sur la NumWorks, l'application <b>Calculs</b> fait le calcul : tape 2, la touche fraction, 10, puis EXE. L'écran peut afficher une fraction et un nombre décimal : lis le nombre décimal.`,
    calc:{mode:"stat1",series:[],start:"home",calculs:{expr:"2/10",expect:0.2,say:"Tape <b>2</b>, la touche <b>fraction</b>, <b>10</b>, puis <b>EXE</b>. C’est la part des jours à plus de 15 personnes.",done:"0.2 : c’est la fréquence. En pourcentage : 0,2 × 100 = 20 %."}},
    q:[{q:"Les jours à plus de 15 personnes, en pourcentage ?",a:20,tol:0,hints:[{v:0.2,say:"0,2 est la fréquence. Pour le pourcentage, multiplie par 100."},{v:2,say:"2 est l'effectif. Le pourcentage est la part de l'effectif total, multipliée par 100."}]}]},
   {t:"Je lis le graphique de la NumWorks",
    apport:"Tes nombres sont déjà tapés. Va dans l'onglet <b>Graphique</b> : tu vois des barres. Appuie sur <b>OK</b> : une barre change de couleur. Avec les flèches, change de barre. En bas de l'écran, lis <b>Effectif</b> et <b>Fréquence</b> : ils parlent de la barre choisie. Choisis chaque barre : ton carnet de lecture se remplit sous la calculatrice. La NumWorks écrit le point décimal (0.4) : toi, écris la virgule (0,4).",
    calc:{mode:"stat1",series:SERIE,start:"graph",log:true,unit:"personnes"},
    q:[{q:"Barre du 12 : quel effectif ? (nombre de jours)",a:4,tol:0},
       {q:"Barre du 12 : quelle fréquence ?",a:0.4,tol:0,hints:[{v:4,say:"4 est l'effectif. La fréquence est 4 jours sur 10 jours : lis la ligne Fréquence en bas de l'écran."}]},
       {q:"Barre du 16 : quel effectif ?",a:1,tol:0},
       {q:"Barre du 16 : quelle fréquence ?",a:0.1,tol:0},
       {q:"Quel est le total des cinq fréquences ?",a:1,tol:0,sol:"Les fréquences font toujours 1 ensemble : c'est le contrôle qui ne trompe pas."}]},
   {t:"De la fréquence au pourcentage",
    apport:"La fréquence est une part de 1. Le pourcentage est une part de 100. Pour passer de l'un à l'autre, je <b>multiplie par 100</b> : 0,4 × 100 = 40. Donc 12 personnes sont venues pendant 40 % des jours. Fais glisser le curseur pour le voir.",
    viz:"convertir",vd:{items:[{from:"freq",v:0.4,opts:["40","4","0,04"]},{from:"freq",v:0.1,opts:["10","1","0,01"]}]},
    q:[{q:"Fréquence de 10 personnes : 0,2. En pourcentage ?",a:20,tol:0},
       {q:"Fréquence de 14 personnes : 0,2. En pourcentage ?",a:20,tol:0},
       {q:"Fréquence de 18 personnes : 0,1. En pourcentage ?",a:10,tol:0,hints:[{v:1,say:"La virgule avance de 2 rangs quand on multiplie par 100 : 0,1 donne 10, pas 1."}]},
       {q:"Les cinq pourcentages font combien ensemble ?",a:100,tol:0,sol:"100 % : c'est le tout."},
       {q:"Question du chef : pour quel pourcentage de jours y a-t-il 12 personnes ou moins (les jours à 10 et à 12) ?",a:60,tol:0,hints:[{v:0.6,say:"0,6 est la fréquence. En pourcentage : 0,6 × 100."},{v:6,say:"La virgule avance de 2 rangs : 0,6 × 100 = 60."}]}]},
   {t:"Je réponds au chef",
    apport:"Une réponse utile dit <b>oui ou non</b>, donne <b>des nombres</b> et la <b>raison</b>. Compose la phrase : chaque étiquette a un rôle (moyenne, limite, effectif, effectif total, pourcentage).",
    viz:"phrase",vd:{
      example:"« En moyenne, <b>13</b> personnes viennent par jour. »",
      items:[{
        intro:"Compose la réponse à la question « Faut-il un deuxième agent ? ».",
        parts:["En moyenne, ",{s:"moy"}," personnes viennent par jour. Un agent peut en recevoir ",{s:"lim"},", donc un agent suffit presque tous les jours. Mais ",{s:"eff"}," jours sur ",{s:"tot"}," (",{s:"pct"},"), il y a plus de 15 personnes : il faut un deuxième agent ces jours-là."],
        slots:{
          moy:{role:"moyenne",answer:"13",hint:"La moyenne se lit sur l'onglet Stats de la NumWorks : 13 personnes par jour."},
          lim:{role:"limite d'un agent",answer:"15",hint:"La limite est donnée dans la question : un agent reçoit 15 personnes par jour au plus."},
          eff:{role:"effectif",answer:"2",hint:"C'est l'effectif des jours à plus de 15 personnes : les jours à 16 et à 18."},
          tot:{role:"effectif total",answer:"10",hint:"L'effectif total est le nombre de tous les jours notés."},
          pct:{role:"pourcentage",answer:"20 %",hint:(v)=>v==="0,2"?"0,2 est la fréquence. Un pourcentage s'écrit avec le signe % : 0,2 × 100 = 20 %.":"Le pourcentage est la fréquence × 100 : 2 jours sur 10 font 20 %."}},
        chips:["13","15","2","10","20 %","0,2","18","5","12"],
        after:"Tu as dit oui ou non, donné des nombres et une raison : c'est une réponse complète."}]}},
   {t:"Pour les curieux",txt:"Hors programme du CAP, non évalué : dans l'onglet Stats, plus bas dans la liste, la NumWorks affiche aussi la médiane (12) et les quartiles Q1 (12) et Q3 (14). Tu peux les ignorer : pour la question du chef, la moyenne, les effectifs et les pourcentages suffisent."}],
  quiz:[{q:"Sur un diagramme en bâtons, la hauteur d'un bâton est :",o:["l'effectif","le nombre de personnes","la moyenne"],c:0,e:"Le nombre de personnes est écrit sous le bâton ; sa hauteur donne l'effectif (le nombre de jours)."},
        {q:"4 jours sur 10 ont 12 personnes. La fréquence de 12 est :",o:["0,4 (soit 40 %)","4","0,04"],c:0,e:"4 jours sur 10 jours : 0,4. Puis 0,4 × 100 = 40 %."},
        {q:"Pour passer d'une fréquence à un pourcentage, je :",o:["multiplie par 100","ajoute 100","prends la moitié"],c:0,e:"0,4 × 100 = 40 : la virgule avance de deux rangs."}],
  trace:`<b>Le diagramme en bâtons.</b> Chaque bâton montre un nombre de personnes. La hauteur du bâton, c'est l'effectif : le nombre de jours. Ici, les bâtons ont pour hauteur 2, 4, 2, 1 et 1.<br><b>La fréquence.</b> La fréquence, c'est l'effectif sur l'effectif total. 12 personnes sont venues 4 jours sur 10 : la fréquence de 12 est ${fr("4","10")} = 0,4. La somme de toutes les fréquences est toujours 1.<br><b>Avec la NumWorks.</b> Dans Statistiques, onglet Graphique : OK, je choisis une barre avec les flèches. En bas, je lis l'Effectif et la Fréquence de cette barre.<br><b>Le pourcentage.</b> Pour passer d'une fréquence à un pourcentage, je multiplie par 100 : 0,4 × 100 = 40. Donc 12 personnes sont venues pendant 40 % des jours. Tous les pourcentages font 100 %.<br><b>Ma réponse.</b> Les jours à plus de 15 personnes : 0,1 + 0,1 = 0,2, soit 20 % des jours. Les jours à 12 personnes ou moins : 0,2 + 0,4 = 0,6, soit 60 %.<br><b>Réponse à la question.</b> En moyenne, 13 personnes viennent par jour. Un agent peut en recevoir 15 : un agent suffit presque tous les jours. Mais 2 jours sur 10 (20 %), il y a plus de 15 personnes. Il faut donc un deuxième agent pour ces jours-là.`}]}
;
