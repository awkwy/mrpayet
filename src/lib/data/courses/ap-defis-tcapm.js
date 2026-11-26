import { fr } from '$lib/utils/frac.js';

// AP TC APM — « Trois défis chiffrés » (samedi 5 décembre 2026), après le bilan de la
// séquence Statistique à une variable. Source : fiche ap-defis-tcapm (séance
// 2026-12-05-ap-defis-tcapm) : pourcentages, moyenne, tableau d'effectifs avec la NumWorks,
// puis un défi bonus sur le camembert. Contexte : le point d'accueil de la mairie de Kahani.
// Complète les ateliers d'ap-stats-tcapm : ici, trois défis enchaînés au choix de l'élève.
// Nombres inventés pour l'exercice. Programme CAP : pas de médiane ni de quartiles.
// Jamais le signe ÷ : fractions empilées (fr) ; les libellés de question disent « sur ».

const ATTENTE = [[5, 4], [10, 3], [15, 2], [20, 1]];

export default {id:"ap-defis-tcapm",classe:"TC APM",mat:"AP",titre:"Trois défis chiffrés",
 desc:"Au point d'accueil de la mairie de Kahani : pourcentages, moyenne, tableau d'effectifs avec la NumWorks, et un camembert en bonus. Je m'entraîne sur mon défi le plus difficile.",
 pdf:"ap",
 obj:["Calculer des pourcentages à partir d'effectifs",
      "Calculer une moyenne et la comparer à un jour",
      "Calculer la moyenne d'un tableau d'effectifs et la vérifier avec la NumWorks",
      "Lire un camembert : fraction du tour, pourcentage, nombre de visiteurs"],
 seances:[
 {t:"Trois défis chiffrés",pdf:["ap-defis-tcapm-standard","ap-defis-tcapm-accessible"],
  prob:"En stage à l'accueil de la mairie, on compte les demandes, les visiteurs et l'attente. Quel défi est le plus difficile pour moi ? Aujourd'hui, je m'entraîne dessus.",
  steps:[
   {t:"Le point d'accueil de la mairie",txt:"En stage au guichet de la mairie de Kahani, on compte : les demandes, les visiteurs, le temps d'attente. Trois défis de chiffres, puis un bonus. Choisis dans quel ordre les faire, et prends le temps sur celui qui est le plus difficile pour toi. (Nombres inventés pour l'exercice.) Mots : le pourcentage est une part sur 100, la moyenne est un nombre pour chaque jour, l'effectif est le nombre de personnes."},
   {t:"Défi 1 · Les pourcentages",
    apport:`Pour un pourcentage : ${fr("partie","total")}, puis sur 100. Si le total est 25, multiplie par 4 pour arriver à 100 (25 × 4 = 100) et multiplie la partie par 4 aussi. Les pourcentages de tous les types font 100 % ensemble.`,
    doc:{h:["Demande","Personnes"],r:[["Papiers (carte, acte…)","10"],["Renseignements","8"],["Rendez-vous","7"]]},
    q:[{q:"Combien de personnes en tout ? (effectif total : 10 + 8 + 7)",a:25,tol:0},
       {q:"Papiers : 10 sur 25. Quel pourcentage ? (aide : 25 × 4 = 100)",a:40,tol:0,hints:[{v:0.4,say:"0,4 est la fréquence. Le pourcentage la multiplie par 100."},{v:10,say:"10 est l'effectif. Multiplie-le par 4, comme 25 pour arriver à 100."}]},
       {q:"Renseignements : 8 sur 25. Quel pourcentage ?",a:32,tol:0,hints:[{v:8,say:"8 est l'effectif. Multiplie-le par 4 : 8 × 4."}]},
       {q:"Rendez-vous : quel pourcentage, sans calculer la fraction ? (les trois font 100 %)",a:28,tol:0,sol:"100 − 40 − 32 = 28 %, et 7 sur 25 : 7 × 4 = 28 : le contrôle est bon."}]},
   {t:"Défi 2 · La moyenne",
    apport:`Moyenne = ${fr("total","effectif total")} : j'ajoute les cinq jours, puis je partage par le nombre de jours. Pour comparer un jour à la moyenne, je fais une soustraction.`,
    doc:{h:["Jour","Visiteurs"],r:[["lundi","14"],["mardi","9"],["mercredi","11"],["jeudi","16"],["vendredi","10"]]},
    q:[{q:"Quel est le total des visiteurs sur les 5 jours ? (14 + 9 + 11 + 16 + 10)",a:60,tol:0},
       {q:"Quelle est la moyenne par jour ? (60 sur 5)",a:12,tol:0,hints:[{v:60,say:"60 est le total. La moyenne est le total sur 5 jours."}]},
       {q:"Le jeudi : 16 visiteurs. C'est combien de plus que la moyenne ?",a:4,tol:0,hint:"16 − 12."}]},
   {t:"Défi 3 · Le tableau d'effectifs",
    apport:`Ici la valeur est une durée et l'effectif est le nombre de personnes. Total des minutes : j'ajoute durée × personnes sur chaque ligne (5 × 4, 10 × 3, 15 × 2, 20 × 1). Moyenne = ${fr("total des minutes","effectif total")}. Puis je vérifie avec la NumWorks : <b>V1</b> = les minutes, <b>N1</b> = les personnes.`,
    doc:{h:["Attente (minutes)","Personnes"],r:[["5","4"],["10","3"],["15","2"],["20","1"]]},
    q:[{q:"Combien de personnes en tout ? (effectif total : 4 + 3 + 2 + 1)",a:10,tol:0},
       {q:"Total des minutes : 5 × 4 + 10 × 3 + 15 × 2 + 20 × 1 ?",a:100,tol:0,hints:[{v:50,say:"50 est la somme des durées sans les effectifs. Multiplie chaque durée par son nombre de personnes."}]}],
    calc:{mode:"stat1",series:ATTENTE,start:"home",unit:"minutes"}},
   {t:"Défi 3 · Je lis la NumWorks et je conclus",
    apport:"Ta NumWorks doit afficher le même effectif total que ton tableau (10) et la même moyenne que ton calcul. Si ce n'est pas le cas, cherche l'erreur : N1 resté à 1, colonnes échangées, ancien tableau non effacé. Puis écris la conclusion : « En moyenne, une personne attend… minutes ».",
    q:[{q:"Quelle moyenne la NumWorks affiche-t-elle ? (minutes d'attente)",a:10,tol:0,hints:[{v:12.5,say:"12,5 est la moyenne de 5, 10, 15 et 20 sans les effectifs : N1 n'a pas été rempli."}]},
       {q:"Calcule à la main : 100 minutes sur 10 personnes. Combien de minutes en moyenne ?",a:10,tol:0,sol:"10 : la NumWorks et ton calcul sont pareils, c'est vérifié."}]},
   {t:"Défi 4 (bonus) · Le camembert",
    apport:"Un camembert fait un tour de 360°. 180° est la moitié du tour (50 %), 90° est un quart (25 %). Pour un nombre de visiteurs, je prends le pourcentage du total.",
    img:{src:"/images/tcapm-camembert-age.svg",alt:"camembert de 40 visiteurs par âge : moins de 25 ans 90°, 25 à 60 ans 180°, plus de 60 ans 90°"},
    q:[{q:"« Moins de 25 ans » : 90°. Quel pourcentage du tour ? (un tour = 360°)",a:25,tol:0,hints:[{v:90,say:"90 est l'angle. Un tour est 360° : 90° est un quart du tour."}]},
       {q:"La grande part : 180°, soit 50 %. Sur 40 visiteurs, combien de visiteurs ?",a:20,tol:0,hints:[{v:50,say:"50 est le pourcentage. 50 %, c'est la moitié : la moitié de 40."}],sol:"La moitié de 40 est 20 visiteurs."}]}],
  quiz:[{q:"5 personnes sur 20 : quel pourcentage ?",o:["25 %","5 %","50 %"],c:0,e:"5 sur 20 = 1 sur 4 = 25 %."},
        {q:"Total 30 sur 5 jours : quelle moyenne ?",o:["6","35","150"],c:0,e:"30 sur 5 = 6."},
        {q:"Une part de 180° dans un camembert : quel pourcentage ?",o:["50 %","18 %","180 %"],c:0,e:"180° est la moitié du tour : 50 %."},
        {q:"3 personnes attendent 10 minutes. Combien de minutes en tout ?",o:["30","13","3"],c:0,e:"10 × 3 = 30."}],
  trace:`<b>Pourcentage</b> = ${fr("partie","total")} puis sur 100, par exemple ${fr("10","25")} = 40 %.<br><b>Moyenne</b> = ${fr("total","effectif total")}, par exemple ${fr("60","5")} = 12.<br><b>Tableau d'effectifs.</b> Total = valeur × effectif sur chaque ligne, puis j'additionne : 100 minutes pour 10 personnes, moyenne 10 minutes. La NumWorks vérifie (V1 = minutes, N1 = personnes).<br><b>Camembert.</b> 90° = ${fr("1","4")} = 25 %. Mon défi le plus difficile : je m'entraîne encore.`}]}
;
