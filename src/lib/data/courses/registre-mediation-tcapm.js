import { fr } from '$lib/utils/frac.js';

// « Le registre de la médiation » — effectif / effectif total, fréquence,
// pourcentage dans les deux sens, phrase récap (TC APM, module Statistique à une
// variable). Source : registre-mediation-tcapm (fiche élève), 20 cartes :
// dispute 8, insultes 6, objet perdu ou volé 4, autre 2 (nombres inventés).
// Interactions : $lib/visualizations/{registre,frequence,convertir,moissuivant,phrase}.svelte.
// Jamais le signe ÷ : fractions empilées (fr) ; les libellés de question disent « sur ».

const PHRASE_BY = {
  "les disputes":{eff:"8",pct:"40 %"},
  "les insultes":{eff:"6",pct:"30 %"},
  "les objets perdus ou volés":{eff:"4",pct:"20 %"},
  "les autres":{eff:"2",pct:"10 %"}
};

export default {id:"registre-mediation-tcapm",classe:"TC APM",mat:"Maths",titre:"Le registre de la médiation",
 desc:"Effectif et effectif total, fréquence et pourcentage dans les deux sens, puis la phrase récap : les médiateurs du lycée comptent les situations traitées dans le mois.",
 pdf:"maths",
 obj:["Distinguer l'effectif (un seul type) et l'effectif total (tous les types ensemble)",
      "Calculer une fréquence, puis un pourcentage, et passer de l'un à l'autre dans les deux sens",
      "Retrouver un effectif à partir d'un pourcentage et d'un effectif total",
      "Écrire une phrase qui donne l'effectif total, l'effectif et le pourcentage"],
 seances:[
 {t:"Je compte les cartes",pdf:["registre-mediation-tcapm"],
  prob:"Au lycée, les médiateurs notent chaque situation traitée sur une carte. Combien de situations de chaque type, et combien en tout ?",
  steps:[
   {t:"Le registre du mois",txt:"Au lycée, les médiateurs notent chaque situation traitée sur une carte. Voici le registre du mois : 20 cartes. Chaque dessin dit le type de la situation : dispute, insultes, objet perdu ou volé, autre. (Nombres inventés pour l'exercice.)"},
   {t:"Je compte",
    apport:"<b>Effectif</b> = combien il y en a dans un seul groupe (un seul type). <b>Effectif total</b> = combien il y en a en tout (tous les types ensemble). Touche les cartes pour les compter : je vérifie que l'effectif total est égal au nombre de cartes du registre (20).",
    viz:"registre",
    q:[{q:"Effectif des disputes (combien de cartes « dispute ») ?",a:8,tol:0,hint:"Compte les cartes qui ont le dessin des deux personnages et l'éclair."},
       {q:"Effectif des insultes ?",a:6,tol:0},
       {q:"Effectif des objets perdus ou volés ?",a:4,tol:0},
       {q:"Effectif des autres situations ?",a:2,tol:0},
       {q:"Effectif total : l'addition des quatre effectifs ?",a:20,tol:0,hints:[{v:8,say:"8 est l'effectif des disputes seulement. L'effectif total additionne les quatre types : 8 + 6 + 4 + 2."}],sol:"20, comme le nombre de cartes du registre : le contrôle est bon."}]},
   {t:"Effectif ou effectif total ?",
    apport:"Amina dit « il y a 8 situations en tout ». Soilihi dit « il y a 20 situations en tout ». Un seul des deux dit juste. Pour trancher, demande-toi : le nombre compte-t-il <b>un seul type</b> ou <b>tous les types</b> ?",
    q:[{q:"Combien de situations y a-t-il en tout dans le registre ?",a:20,tol:0,hints:[{v:8,say:"8 ne compte que les disputes : c'est un effectif, pas l'effectif total."}]},
       {q:"Quel est l'effectif des disputes ?",a:8,tol:0}]}],
  quiz:[{q:"Le nombre 8 (les cartes « dispute ») est :",o:["l'effectif des disputes","l'effectif total"],c:0,e:"8 compte un seul type : c'est un effectif. L'effectif total compte tous les types."},
        {q:"Le nombre 20 (toutes les cartes) est :",o:["l'effectif des disputes","l'effectif total"],c:1,e:"20 compte tous les types ensemble : c'est l'effectif total."},
        {q:"Pour vérifier l'effectif total, je le compare :",o:["au nombre de cartes du registre","à l'effectif des disputes"],c:0,e:"Si j'ai bien tout compté, l'addition des effectifs retombe sur le nombre de cartes."}],
  trace:"<b>Effectif</b> : combien il y en a dans un seul groupe, un seul type (exemple : 8 disputes).<br><b>Effectif total</b> : combien il y en a en tout, tous les types ensemble (exemple : 20 situations).<br>L'effectif total est l'<b>addition de tous les effectifs</b> : 8 + 6 + 4 + 2 = 20. Je vérifie qu'il est égal au nombre de cartes du registre."},
 {t:"De l'effectif au pourcentage, et retour",pdf:["registre-mediation-tcapm"],
  prob:"Le principal veut des pourcentages, pas des effectifs. Comment passer de l'un à l'autre, dans les deux sens ?",
  steps:[
   {t:"De l'effectif à la fréquence",
    apport:`<b>Fréquence</b> = ${fr("effectif","effectif total")} (un nombre entre 0 et 1). <b>Pourcentage</b> = fréquence × 100 (un nombre entre 0 et 100). Exemple, les disputes : ${fr("8","20")} = 0,4, puis 0,4 × 100 = 40 %. Avec la calculatrice, l'application Calculs donne la fréquence. Je vérifie : toutes les fréquences font 1, tous les pourcentages font 100 %.`,
    viz:"frequence",
    q:[{q:"Fréquence des insultes (6 sur 20), en nombre décimal ?",a:0.3,tol:0,hints:[{v:6,say:"6 est l'effectif. La fréquence est l'effectif sur l'effectif total, entre 0 et 1."},{v:30,say:"30, c'est le pourcentage. La fréquence est entre 0 et 1."}]},
       {q:"Pourcentage des insultes ?",a:30,tol:0,hints:[{v:0.3,say:"0,3 est la fréquence. Pour le pourcentage, multiplie par 100."}]},
       {q:"Fréquence des objets perdus ou volés (4 sur 20) ?",a:0.2,tol:0},
       {q:"Pourcentage des « autre » (2 sur 20) ?",a:10,tol:0,hints:[{v:0.1,say:"0,1 est la fréquence : multiplie par 100 pour le pourcentage."}]},
       {q:"Additionne les quatre pourcentages. Combien ?",a:100,tol:0,sol:"100 % : le tout. Si tu ne trouves pas 100 %, recompte."}]},
   {t:"Dans les deux sens",
    apport:`<b>Pourcentage → fréquence</b> : je prends la part de 100, c'est ${fr("pourcentage","100")}. Exemple : 40 % → ${fr("40","100")} = 0,4. <b>Fréquence → pourcentage</b> : je multiplie par 100. Exemple : 0,4 × 100 = 40 %. Fais glisser le curseur sur les deux règles.`,
    viz:"convertir",
    q:[{q:"35 % : quelle fréquence ?",a:0.35,tol:0,hints:[{v:3.5,say:"La fréquence est la part de 100 : 35 sur 100, donc 0,35."},{v:35,say:"35 est le pourcentage. La fréquence est entre 0 et 1."}]},
       {q:"5 % : quelle fréquence ?",a:0.05,tol:0,hints:[{v:0.5,say:"5 sur 100 s'écrit 0,05 : il y a un zéro de plus après la virgule."}]},
       {q:"60 % : quelle fréquence ?",a:0.6,tol:0},
       {q:"Fréquence 0,25 : quel pourcentage ?",a:25,tol:0},
       {q:"Fréquence 0,8 : quel pourcentage ?",a:80,tol:0,hints:[{v:8,say:"× 100 fait avancer la virgule de 2 rangs : 0,8 donne 80."}]},
       {q:"Fréquence 0,07 : quel pourcentage ?",a:7,tol:0,hints:[{v:70,say:"0,07 × 100 : la virgule avance de 2 rangs, 0,07 devient 7."}]}]},
   {t:"Le mois suivant",
    apport:`Le registre du mois suivant a <b>25 cartes</b>, et <b>20 %</b> sont des disputes. Pour retrouver un effectif à partir d'un pourcentage : d'abord la fréquence (20 % = ${fr("20","100")} = 0,2), puis <b>effectif = fréquence × effectif total</b>.`,
    viz:"moissuivant",
    q:[{q:"Quelle est la fréquence des disputes (20 %) ?",a:0.2,tol:0},
       {q:"Combien de cartes « dispute » y a-t-il sur les 25 cartes ?",a:5,tol:0,hints:[{v:20,say:"20 est le pourcentage. L'effectif, c'est la fréquence 0,2 × l'effectif total 25."},{v:0.2,say:"0,2 est la fréquence. Multiplie-la par l'effectif total (25)."}],sol:"0,2 × 25 = 5 cartes. Contre-épreuve : 5 sur 25 fait 0,2, soit 20 %."}]}],
  quiz:[{q:"35 % s'écrit, en fréquence :",o:["0,35","3,5","35"],c:0,e:"35 % = 35 sur 100 = 0,35 : la virgule recule de 2 rangs."},
        {q:"La fréquence 0,07 fait, en pourcentage :",o:["0,7 %","7 %","70 %"],c:1,e:"0,07 × 100 = 7 : la virgule avance de 2 rangs."},
        {q:"20 % de 25 cartes, c'est :",o:["5 cartes","20 cartes","0,2 carte"],c:0,e:"Effectif = fréquence × effectif total : 0,2 × 25 = 5."}],
  trace:`<b>Fréquence</b> = ${fr("effectif","effectif total")} : un nombre entre 0 et 1. <b>Pourcentage</b> = fréquence × 100 : un nombre entre 0 et 100.<br><b>Pourcentage → fréquence</b> : je prends la part de 100, ${fr("pourcentage","100")}. Exemple : 35 % = ${fr("35","100")} = 0,35.<br>La somme des fréquences est 1 ; la somme des pourcentages est 100 %.<br><b>Retrouver un effectif</b> : effectif = fréquence × effectif total. Exemple : 20 % de 25 cartes = 0,2 × 25 = 5 cartes.`},
 {t:"J'écris ma phrase",pdf:["registre-mediation-tcapm"],
  prob:"Un nombre seul ne suffit pas : pour que le principal comprenne, j'écris une phrase qui dit l'effectif total, l'effectif et le pourcentage.",
  steps:[
   {t:"La phrase récap",
    apport:"Pour communiquer, je ne donne pas seulement un nombre : j'écris une phrase qui dit <b>l'effectif total</b>, <b>l'effectif</b> et <b>le pourcentage</b>. Exemple (les disputes) : « Sur 20 situations, 8 sont des disputes : cela fait 40 % des situations. »"},
   {t:"À toi d'écrire",
    apport:"Compose chaque phrase en touchant les étiquettes. Chaque emplacement porte le nom de son rôle : si tu te trompes, le message dit lequel.",
    viz:"phrase",vd:{
      example:"« Sur <b>20</b> situations, <b>8</b> sont des disputes : cela fait <b>40 %</b> des situations. »",
      items:[
       {intro:"<b>a)</b> Écris la phrase pour <b>les insultes</b>.",
        parts:["Sur ",{s:"tot"}," situations, ",{s:"eff"}," sont des insultes : cela fait ",{s:"pct"}," des situations."],
        slots:{
          tot:{role:"effectif total",answer:"20",hint:"L'effectif total, c'est toutes les cartes du registre, tous les types ensemble."},
          eff:{role:"effectif",answer:"6",hint:"L'effectif des insultes : combien de cartes « insultes » ?"},
          pct:{role:"pourcentage",answer:"30 %",hint:(v)=>v==="0,3"?"0,3 est la fréquence. Le pourcentage est la fréquence × 100, avec le signe %.":"Le pourcentage des insultes : 6 sur 20, soit 0,3, puis × 100."}},
        chips:["20","6","8","30 %","0,3","40 %","25"]},
       {intro:"<b>b)</b> Quel est le type de situation le <b>plus fréquent</b> ? Écris une phrase avec son pourcentage.",
        parts:["Le type le plus fréquent est ",{s:"type"}," : sur ",{s:"tot"}," situations, ",{s:"eff"}," en font partie, soit ",{s:"pct"}," des situations."],
        slots:{
          type:{role:"type",answer:"les disputes",hint:"Compare les effectifs des quatre types : lequel est le plus grand ?"},
          tot:{role:"effectif total",answer:"20",hint:"L'effectif total est le nombre de toutes les cartes."},
          eff:{role:"effectif",answer:"8",hint:"L'effectif du type le plus fréquent : celui du plus haut bâton."},
          pct:{role:"pourcentage",answer:"40 %",hint:"Le pourcentage du type choisi : son effectif sur 20, × 100."}},
        chips:["les disputes","les insultes","les objets perdus ou volés","les autres","20","8","6","40 %","30 %"]},
       {intro:"<b>c)</b> Le principal veut une action contre <b>un seul type</b>. Lequel choisis-tu ? Compose la phrase qui explique pourquoi.",
        parts:["Je choisis d'agir contre ",{s:"type"}," : ",{s:"eff"}," situations sur ",{s:"tot"},", soit ",{s:"pct"}," des situations."],
        slots:{
          type:{role:"type",answer:Object.keys(PHRASE_BY),hint:"Choisis un des quatre types."},
          eff:{role:"effectif",answer:(vals)=>PHRASE_BY[vals.type].eff,hint:"L'effectif de ton type : combien de cartes de ce type ?"},
          tot:{role:"effectif total",answer:"20",hint:"L'effectif total est le nombre de toutes les cartes."},
          pct:{role:"pourcentage",answer:(vals)=>PHRASE_BY[vals.type].pct,hint:"Le pourcentage de ton type : son effectif sur 20, × 100."}},
        chips:["les disputes","les insultes","les objets perdus ou volés","les autres","8","6","4","2","20","40 %","30 %","20 %","10 %"],
        after:(vals)=>vals.type==="les disputes"?"Les disputes sont le type le plus fréquent : c'est le choix le plus logique pour une action.":"Ton choix peut se défendre, mais les disputes sont plus fréquentes (40 %). Une action contre le type le plus fréquent touche le plus de situations."}]},
    q:[{q:"Quel pourcentage des situations les disputes représentent-elles ?",a:40,tol:0},
       {q:"Quel est l'effectif total du registre ?",a:20,tol:0}]}],
  quiz:[{q:"Une bonne phrase récap donne :",o:["seulement le pourcentage","l'effectif total, l'effectif et le pourcentage","seulement l'effectif"],c:1,e:"Avec l'effectif total et l'effectif, le lecteur peut vérifier le pourcentage."},
        {q:"« Sur 20 situations, 6 sont des insultes : cela fait 30 % des situations. » Ici, 20 est :",o:["l'effectif","l'effectif total","le pourcentage"],c:1,e:"20 compte toutes les situations, tous les types ensemble."}],
  trace:"Pour communiquer, j'écris une phrase qui dit l'<b>effectif total</b>, l'<b>effectif</b> et le <b>pourcentage</b>.<br>Modèle : « Sur <b>20</b> situations, <b>8</b> sont des disputes : cela fait <b>40 %</b> des situations. »<br>Pour choisir une action, je regarde le type le <b>plus fréquent</b> : celui dont le pourcentage est le plus grand."}]}
;
