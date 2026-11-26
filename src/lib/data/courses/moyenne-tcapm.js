import { fr } from '$lib/utils/frac.js';

// « Combien de situations par jour, en moyenne ? » — séance 5 du module Statistique à une
// variable (TC APM), deux heures. Source : fiches moyenne-1-tcapm (liste, à la main, NumWorks
// Calculs pour vérifier le total) et moyenne-2-tcapm (tableau d'effectifs, NumWorks Statistiques),
// séances 2026-12-01-moyenne-1/2-tcapm. Contexte : le service de médiation du lycée de Kahani.
// Nombres inventés pour l'exercice : portail 6, 4, 8, 5, 7 ; terrain de sport 3, 9, 2, 8, 3 ;
// CDI (20 jours) 0 situation 4 jours, 1 pendant 6, 2 pendant 7, 3 pendant 3.
// Complète « Mon stage en chiffres » (qui part d'un tableau d'effectifs déjà rangé) : ici on
// construit d'abord la moyenne à partir d'une simple liste.
// Programme CAP : moyenne, effectifs ; ni médiane, ni quartiles, ni étendue.
// Jamais le signe ÷ : fractions empilées (fr) ; les libellés de question disent « sur ».

const CDI = [[0, 4], [1, 6], [2, 7], [3, 3]];

export default {id:"moyenne-tcapm",classe:"TC APM",mat:"Maths",titre:"La moyenne, en liste puis en tableau",
 desc:"Au service de médiation du lycée de Kahani, combien de situations par jour en moyenne ? On calcule la moyenne d'une liste, puis d'un tableau d'effectifs, et on la vérifie avec la NumWorks.",
 pdf:"maths",
 obj:["Trouver l'effectif total (le nombre de jours) et le total (tout ajouter)",
      "Calculer une moyenne en trois temps : total, effectif total, total sur effectif total",
      "Contrôler qu'une moyenne est entre le plus petit et le plus grand nombre",
      "Calculer la moyenne d'un tableau d'effectifs (valeur × effectif), puis la vérifier avec la NumWorks",
      "Écrire une phrase avec la moyenne et décider avec elle"],
 seances:[
 {t:"La moyenne d'une liste",pdf:["moyenne-1-tcapm-standard","moyenne-1-tcapm-accessible"],
  prob:"Au service de médiation du lycée de Kahani, on note les situations au portail chaque jour. Chaque jour est différent : peut-on dire un seul nombre pour toute la semaine ?",
  steps:[
   {t:"La situation",txt:"Au service de médiation, on note chaque jour les situations au portail du lycée de Kahani, du lundi au vendredi. Une semaine : combien de situations en tout ? Et combien par jour ? (Nombres inventés pour l'exercice.) Trois mots à retenir : l'effectif total est le nombre de jours, le total est tout ce qu'on ajoute (6 + 4 + 8…), la moyenne est un nombre « pour chaque jour ».",
    doc:{h:["Jour","Situations au portail"],r:[["lundi","6"],["mardi","4"],["mercredi","8"],["jeudi","5"],["vendredi","7"]]}},
   {t:"Je compte les jours et j'ajoute",
    apport:"L'<b>effectif total</b> est le nombre de jours du tableau : je compte les lignes. Le <b>total</b> est le nombre de situations de toute la semaine : j'<b>ajoute</b> tous les nombres, un par un.",
    q:[{q:"Combien de jours y a-t-il dans le tableau ? (c'est l'effectif total)",a:5,tol:0,hint:"Compte les lignes : lundi, mardi, mercredi, jeudi, vendredi."},
       {q:"Combien de situations en tout sur les 5 jours ? (6 + 4 + 8 + 5 + 7)",a:30,tol:0,hints:[{v:5,say:"5 est le nombre de jours. Le total, c'est tout ajouter : 6 + 4 + 8 + 5 + 7."}],hint:"Ajoute un nombre après l'autre : 6 + 4 = 10, puis + 8…"}]},
   {t:"Chaque jour pareil",
    apport:`Imagine que <b>chaque jour</b> ait eu le <b>même nombre</b> de situations. Ces 30 situations seraient partagées entre les 5 jours. Ce nombre « pour chaque jour », c'est la <b>moyenne</b>. Je l'écris en fraction : ${fr("30","5")}, soit le total sur l'effectif total.`,
    q:[{q:"30 situations partagées entre 5 jours : combien par jour ?",a:6,tol:0,hints:[{v:35,say:"35, c'est 30 + 5. Pour partager, cherche : 5 fois combien font 30 ?"},{v:150,say:"150, c'est 30 × 5. Pour partager, on cherche : 5 fois combien font 30 ?"}],hint:"5 × ? = 30."}]},
   {t:"La moyenne en trois temps",
    apport:`Pour trouver une moyenne : <b>1)</b> j'ajoute tous les nombres (le total) ; <b>2)</b> je compte les jours (l'effectif total) ; <b>3)</b> je pose le <b>total sur l'effectif total</b>. Exemple avec 2, 4 et 6 situations en 3 jours : 2 + 4 + 6 = 12, puis ${fr("12","3")} = 4. Même méthode pour le terrain de sport de Kahani, la même semaine : 3, 9, 2, 8 et 3 situations.`,
    doc:{h:["Jour","Situations au terrain de sport"],r:[["lundi","3"],["mardi","9"],["mercredi","2"],["jeudi","8"],["vendredi","3"]]},
    q:[{q:"Terrain de sport : quel est le total des 5 jours ? (3 + 9 + 2 + 8 + 3)",a:25,tol:0},
       {q:"Terrain de sport : quelle est la moyenne ? (25 sur 5)",a:5,tol:0,hints:[{v:25,say:"25 est le total. La moyenne est le total sur l'effectif total : 25 sur 5."}]},
       {q:"Portail, même méthode : quelle est la moyenne ? (30 sur 5)",a:6,tol:0}]},
   {t:"Je contrôle ma moyenne",
    apport:"Une moyenne est <b>toujours entre le plus petit et le plus grand nombre</b> de la liste. Si elle est plus petite que le plus petit ou plus grande que le plus grand, j'ai fait une erreur de calcul.",
    q:[{q:"Terrain de sport : quel est le plus petit nombre de la liste ?",a:2,tol:0},
       {q:"Terrain de sport : quel est le plus grand nombre de la liste ?",a:9,tol:0},
       {q:"La moyenne du terrain (5) est-elle entre les deux ? (oui / non)",a:"oui",txt:true,sol:"Oui : 5 est entre 2 et 9. Le calcul est plausible."}]},
   {t:"Je vérifie le total avec la NumWorks",
    apport:"La calculatrice <b>vérifie</b> ton addition, elle ne la remplace pas. Dans <b>Calculs</b>, tape les cinq nombres du portail avec <b>+</b> : 6 + 4 + 8 + 5 + 7, puis appuie sur <b>EXE</b>. Tu dois retrouver le total que tu as calculé à la main.",
    calc:{mode:"stat1",series:[],start:"home",calculs:{expr:"6+4+8+5+7",expect:30,say:"Tape <b>6</b>, <b>+</b>, <b>4</b>, <b>+</b>, <b>8</b>, <b>+</b>, <b>5</b>, <b>+</b>, <b>7</b>, puis <b>EXE</b>.",done:"30 : c'est bien ton total du portail. La calculatrice a vérifié ton calcul."}},
    q:[{q:"Quel nombre la NumWorks affiche-t-elle ?",a:30,tol:0,hint:"Après EXE, lis le résultat en bas de l'écran."}]},
   {t:"Je compare et je décide",
    apport:"Une phrase avec la moyenne dit <b>« en moyenne »</b>, le <b>nombre par jour</b> et le <b>lieu</b>. Exemple pour le terrain de sport : « En moyenne, il y a 5 situations par jour au terrain de sport. » Compose la phrase du portail.",
    viz:"phrase",vd:{
      example:"« En moyenne, il y a <b>5 situations par jour</b> au terrain de sport. »",
      items:[{
        intro:"Compose la phrase de la moyenne du portail.",
        parts:[{s:"deb"}," il y a ",{s:"nb"}," situations par jour ",{s:"lieu"},"."],
        slots:{
          deb:{role:"début de phrase",answer:"En moyenne,",hint:"On commence par « En moyenne, » : la moyenne est un résumé."},
          nb:{role:"nombre par jour",answer:"6",hint:"C'est la moyenne du portail : 30 sur 5 = 6."},
          lieu:{role:"lieu",answer:"au portail",hint:"On parle du Tableau du portail."}},
        chips:["En moyenne,","6","30","5","au portail","au terrain de sport"],
        after:"Ta phrase donne la moyenne, l'unité (par jour) et le lieu : elle est complète."}]},
    q:[{q:"Portail : moyenne 6. Terrain de sport : moyenne 5. Où placer le surveillant de plus ?",a:"portail",txt:true,sol:"Au portail : sa moyenne est la plus grande (6 contre 5).",hint:"Compare les deux moyennes : la plus grande dit où il y a le plus de situations."},
       {q:"Le terrain a eu 9 situations un jour, plus que le portail ce jour-là (8). La moyenne dit-elle tout ? (oui / non)",a:"non",txt:true,sol:"Non : la moyenne résume toute la semaine, elle ne dit pas ce qui s'est passé chaque jour."}]}],
  quiz:[{q:"Une semaine de 3 jours : 2, 4 et 6 situations. Le total est :",o:["12","24","3"],c:0,e:"2 + 4 + 6 = 12."},
        {q:"Les jours : 10, 6 et 8 situations. La moyenne est :",o:["6","8","24"],c:1,e:"10 + 6 + 8 = 24, puis 24 sur 3 = 8."},
        {q:"Les jours : 3, 5 et 9. Quelle moyenne est impossible ?",o:["5","4","10"],c:2,e:"10 est plus grand que 9 : la moyenne est toujours entre 3 et 9."}],
  trace:`<b>La moyenne</b> = ${fr("total","effectif total")}. Exemple : ${fr("30","5")} = 6 situations par jour.<br><b>Trois temps.</b> J'ajoute tous les nombres (le total), je compte les jours (l'effectif total), je pose le total sur l'effectif total.<br><b>Phrase.</b> « En moyenne, il y a 6 situations par jour au portail. »<br><b>Contrôle.</b> La moyenne est toujours entre le plus petit et le plus grand nombre.`},
 {t:"La moyenne avec un tableau d'effectifs",pdf:["moyenne-2-tcapm-standard","moyenne-2-tcapm-accessible"],
  prob:"Au CDI, on a noté 20 jours de situations : 29 situations en tout. Quand le tableau est long, comment trouver la moyenne sans tout réécrire, et que fait la NumWorks pour toi ?",
  steps:[
   {t:"La situation",txt:"Au CDI (le centre de documentation) du lycée de Kahani, on a noté pendant 20 jours d'octobre combien de situations arrivaient chaque jour : 0, 1, 2 ou 3. Au lieu de 20 lignes, on a un tableau d'effectifs : une ligne par valeur, avec le nombre de jours. Exemple de lecture : 6 jours avec 1 situation. (Nombres inventés pour l'exercice.)",
    doc:{h:["Situations ce jour-là","Nombre de jours"],r:[["0","4"],["1","6"],["2","7"],["3","3"]]}},
   {t:"Je lis le tableau",
    apport:"La colonne « Nombre de jours » donne l'<b>effectif</b> de chaque ligne. L'<b>effectif total</b> est le nombre de jours en tout : j'ajoute toute la colonne.",
    q:[{q:"Combien de jours en tout ? (effectif total : 4 + 6 + 7 + 3)",a:20,tol:0,hints:[{v:4,say:"4 est le nombre de lignes, ou un seul effectif. L'effectif total additionne toute la colonne : 4 + 6 + 7 + 3."}]},
       {q:"Combien de jours avec 2 situations ?",a:7,tol:0},
       {q:"3 jours avec 3 situations chacun : combien de situations en tout ces jours-là ?",a:9,tol:0,hint:"Une ligne = situations × jours : 3 × 3."}]},
   {t:"Le total des situations",
    apport:"Sur chaque ligne, je <b>multiplie</b> les situations par le nombre de jours : c'est le nombre de situations de cette ligne. Puis j'<b>additionne</b> toutes les lignes pour avoir le total. Exemple : 3 jours avec 3 situations font 3 × 3 = 9.",
    doc:{h:["Situations","Jours","Situations en tout"],r:[["0","4","?"],["1","6","?"],["2","7","?"],["3","3","9"]]},
    q:[{q:"Ligne 0 : 0 situation pendant 4 jours. Combien en tout ?",a:0,tol:0},
       {q:"Ligne 1 : 1 situation pendant 6 jours. Combien en tout ?",a:6,tol:0},
       {q:"Ligne 2 : 2 situations pendant 7 jours. Combien en tout ?",a:14,tol:0,hints:[{v:9,say:"9, c'est 2 + 7. Une ligne = situations × jours : 2 × 7."}]},
       {q:"Total des situations en 20 jours : 0 + 6 + 14 + 9 ?",a:29,tol:0}]},
   {t:"Je devine avant de calculer",
    apport:"Avant de calculer, je <b>devine</b> où se trouve la moyenne. Si chaque jour avait 1 situation, 20 jours feraient 20 ; avec 2 situations par jour, 40. Notre total est 29 : entre les deux.",
    q:[{q:"20 jours avec 1 situation chacun : combien de situations en tout ?",a:20,tol:0},
       {q:"20 jours avec 2 situations chacun : combien de situations en tout ?",a:40,tol:0},
       {q:"29 est entre 20 et 40 : la moyenne est donc entre 1 et 2. Est-ce vrai ? (oui / non)",a:"oui",txt:true,sol:"Oui : la moyenne est entre 1 et 2."}]},
   {t:"Je calcule la moyenne avec la NumWorks",
    apport:"Dans <b>Statistiques</b>, l'onglet <b>Données</b> a deux colonnes : <b>Valeurs V1</b> (les situations : 0, 1, 2, 3) et <b>Effectifs N1</b> (les jours : 4, 6, 7, 3). Tape chaque valeur <b>une seule fois</b> dans V1 et son nombre de jours dans N1. Puis, dans l'onglet <b>Stats</b>, lis l'<b>effectif total</b> et la <b>moyenne</b>. Elle écrit un point (1.45) : toi, écris une virgule (1,45). <b>Compare toujours</b> l'effectif total de l'écran à ton tableau (20).",
    calc:{mode:"stat1",series:CDI,start:"home",unit:"situations"}},
   {t:"Je lis la NumWorks",
    apport:`Pour comprendre ce que la NumWorks a fait : ${fr("0 + 6 + 14 + 9","20")} = ${fr("29","20")} = 1,45. La moyenne n'est pas un jour réel : un jour a 0, 1, 2 ou 3 situations, jamais 1,45.`,
    q:[{q:"Quel effectif total la NumWorks affiche-t-elle ?",a:20,tol:0,hints:[{v:4,say:"Effectif total 4 : les effectifs N1 sont restés à 1. Tape les jours dans N1."},{v:6,say:"6 : les effectifs N1 ne sont pas tous remplis. Compare à ton tableau : 20."}],hint:"Compare avec ton tableau : l'effectif total est le nombre de jours."},
       {q:"Quelle moyenne la NumWorks affiche-t-elle ? (situations par jour)",a:1.45,tol:0,hints:[{v:1.5,say:"1,5 est la moyenne de 0, 1, 2 et 3 sans les effectifs : N1 n'a pas été rempli."},{v:29,say:"29 est le total des situations. La moyenne est ce total sur 20 jours."}],hint:"Lis la ligne Moyenne de l'onglet Stats. Elle est entre 1 et 2."},
       {q:"1,45 est-elle entre 1 et 2, comme tu l'avais deviné ? (oui / non)",a:"oui",txt:true,sol:"Oui : 1 est plus petit que 1,45, qui est plus petit que 2."}]},
   {t:"Je décide",
    apport:"Une phrase avec la moyenne dit « en moyenne », le nombre, l'unité et le lieu. Compose la phrase du CDI. Puis compare avec le portail.",
    viz:"phrase",vd:{
      example:"« En moyenne, il y a <b>6 situations par jour</b> au portail. »",
      items:[{
        intro:"Compose la phrase de la moyenne du CDI.",
        parts:[{s:"deb"}," il y a ",{s:"nb"}," situation par jour ",{s:"lieu"},"."],
        slots:{
          deb:{role:"début de phrase",answer:"En moyenne,",hint:"La moyenne est un résumé : on commence par « En moyenne, »."},
          nb:{role:"nombre par jour",answer:"1,45",hint:"C'est la moyenne lue sur la NumWorks. Écris la virgule : 1,45."},
          lieu:{role:"lieu",answer:"au CDI",hint:"On parle du CDI."}},
        chips:["En moyenne,","1,45","29","20","au CDI","au portail"],
        after:"La phrase donne la moyenne, l'unité et le lieu : elle est complète."}]},
    q:[{q:"Un jour du CDI peut-il avoir exactement 1,45 situation ? (oui / non)",a:"non",txt:true,sol:"Non : on compte des situations entières (0, 1, 2 ou 3). La moyenne est un résumé, pas un vrai jour."},
       {q:"Portail : 6 situations par jour. CDI : 1,45. Où placer le surveillant de plus ?",a:"portail",txt:true,sol:"Au portail : 6 est bien plus grand que 1,45."}]}],
  quiz:[{q:"1 situation pendant 2 jours et 3 situations pendant 4 jours. Combien de situations en tout ?",o:["14","6","24"],c:0,e:"1 × 2 + 3 × 4 = 2 + 12 = 14."},
        {q:"5 jours avec 0 situation et 5 jours avec 2 situations. L'effectif total est :",o:["10","2","5"],c:0,e:"5 + 5 = 10 jours."},
        {q:"La NumWorks affiche 1.45. Quelle phrase est juste ?",o:["En moyenne, il y a 1,45 situation par jour.","Chaque jour, il y a exactement 1,45 situation.","Il y a eu 145 situations."],c:0,e:"La moyenne est un résumé : on dit « en moyenne »."}],
  trace:`<b>Le total</b> avec un tableau : situations × jours, puis j'additionne les lignes : 0 + 6 + 14 + 9 = 29.<br><b>La moyenne</b> = ${fr("29","20")} = 1,45 (la NumWorks écrit 1.45).<br><b>Avec la NumWorks.</b> Statistiques : valeurs en V1, effectifs en N1. Onglet Stats : je lis l'effectif total (20, comme mon tableau) et la moyenne.<br><b>Phrase.</b> « En moyenne, il y a 1,45 situation par jour au CDI. » La moyenne est un résumé : ce n'est pas un vrai jour.`}]}
;
