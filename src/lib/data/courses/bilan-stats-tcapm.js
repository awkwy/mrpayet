import { fr } from '$lib/utils/frac.js';

// « Bilan de la séquence Statistique à une variable » — séance 6 (TC APM) : bilan sur 20
// en quatre exercices (tableau et pourcentage, camembert, moyenne, décision), puis la trace
// écrite. Source : fiche bilan-stats-tcapm (séance 2026-12-03-bilan-stats-tcapm, 30 minutes
// de bilan + correction + trace). Barème : 5 points par exercice. Nombres inventés pour
// l'exercice, contexte : service de médiation du lycée de Kahani.
// Programme CAP : effectifs, pourcentages, camembert, moyenne ; ni médiane, ni quartiles.
// Jamais le signe ÷ : fractions empilées (fr) ; les libellés de question disent « sur ».

export default {id:"bilan-stats-tcapm",classe:"TC APM",mat:"Maths",titre:"Bilan de la statistique",
 desc:"Quatre exercices sur 20 — tableau et pourcentage, camembert, moyenne, décision — puis ma trace écrite : ce que je sais faire seul(e) en statistique.",
 pdf:"maths",
 obj:["Calculer un effectif total et un pourcentage dans un tableau",
      "Lire un diagramme circulaire : angle, fraction du tour, pourcentage, nombre de personnes",
      "Calculer une moyenne et contrôler qu'elle est entre le plus petit et le plus grand nombre",
      "Décider avec une phrase qui contient le nombre qui prouve",
      "Écrire ma trace écrite de la séquence"],
 seances:[
 {t:"Bilan sur 20 et trace écrite",pdf:["bilan-stats-tcapm-standard","bilan-stats-tcapm-accessible"],
  prob:"Qu'est-ce que je sais faire, seul(e), en statistique ? Quatre exercices, un par idée de la séquence : un tableau, un camembert, une moyenne, une décision.",
  steps:[
   {t:"Comment se passe le bilan",txt:"Le bilan est sur 20 points : quatre exercices de 5 points. Un exercice = une idée de la séquence. Les mots sont les mêmes que d'habitude : l'effectif est un nombre, le pourcentage est une part sur 100, la moyenne est le nombre « pour chaque jour ». À Kahani, on travaille avec le service de médiation du lycée. Les nombres sont inventés pour l'exercice. Essaie d'abord seul(e) : l'objectif est de savoir ce que tu sais faire."},
   {t:"Exercice 1 · Quand ont lieu les situations ?",
    apport:`Rappel : l'<b>effectif total</b> est l'addition de tous les effectifs. Le <b>pourcentage</b> d'une ligne est ${fr("partie","total")} puis « sur 100 ». Astuce : si le total est 25, multiplie par 4 pour arriver à 100 (25 × 4 = 100) : multiplie aussi la partie par 4.`,
    doc:{h:["Moment","Situations"],r:[["Le matin","8"],["La pause de midi","12"],["L'après-midi","5"]]},
    q:[{q:"Combien de situations en tout ? (effectif total : 8 + 12 + 5)",a:25,tol:0,hints:[{v:3,say:"3 est le nombre de lignes. L'effectif total additionne les situations : 8 + 12 + 5."}]},
       {q:"Pause de midi : 12 situations sur 25. Quel pourcentage ? (aide : 25 × 4 = 100)",a:48,tol:0,hints:[{v:0.48,say:"0,48 est la fréquence. Le pourcentage la multiplie par 100 : 48 %."},{v:12,say:"12 est l'effectif. Multiplie-le par 4, comme 25 pour arriver à 100 : 12 × 4."}]}]},
   {t:"Exercice 1 · Ma phrase",
    apport:"Une phrase avec un pourcentage dit <b>l'effectif</b>, <b>l'effectif total</b> et le <b>pourcentage</b>. Exemple : « 8 situations sur 25 ont lieu le matin : c'est 32 %. » Compose la phrase de la pause de midi.",
    viz:"phrase",vd:{
      example:"« <b>8</b> situations sur <b>25</b> ont lieu le matin : c'est <b>32 %</b>. »",
      items:[{
        intro:"Compose la phrase de la pause de midi.",
        parts:[{s:"eff"}," situations sur ",{s:"tot"}," ont lieu à la pause de midi : c'est ",{s:"pct"},"."],
        slots:{
          eff:{role:"effectif",answer:"12",hint:"C'est le nombre de situations de la pause de midi."},
          tot:{role:"effectif total",answer:"25",hint:"C'est le nombre de situations de toute la journée : 8 + 12 + 5."},
          pct:{role:"pourcentage",answer:"48 %",hint:(v)=>v==="0,48"?"0,48 est la fréquence. Le pourcentage s'écrit avec le signe % : 48 %.":"Le pourcentage est la part sur 100 : 12 sur 25 font 48 %."}},
        chips:["12","25","48 %","8","0,48","5"],
        after:"Tu as dit l'effectif, l'effectif total et le pourcentage : la phrase est complète."}]}},
   {t:"Exercice 2 · Le camembert",
    apport:"Un diagramme circulaire (camembert) fait un <b>tour complet de 360°</b>. 180° est la moitié du tour : 50 %. 90° est un quart : 25 %. Aide : 36° fait 10 % du tour. Pour un nombre de personnes, je prends le pourcentage du total : 10 % de 20 élèves, c'est 2 élèves.",
    img:{src:"/images/tcapm-camembert-retour.svg",alt:"camembert de 20 élèves interrogés sur leur retour à la maison : le bus 180°, à pied 108°, en voiture (déposé) 72°"},
    q:[{q:"Le bus : 180°. Quel pourcentage du tour ? (un tour = 360°)",a:50,tol:0,hints:[{v:180,say:"180 est l'angle. Un tour complet est 360° : 180° est la moitié du tour."}]},
       {q:"La voiture : 72°. Quel pourcentage ? (aide : 36° fait 10 %)",a:20,tol:0,hints:[{v:10,say:"36° fait 10 %. 72° est deux fois 36° : deux fois 10 %."},{v:0.2,say:"0,2 est la fréquence. Le pourcentage la multiplie par 100."}],hint:"72 = 36 + 36."},
       {q:"20 élèves sont interrogés. « À pied » fait 30 %. Combien d'élèves ? (aide : 10 % de 20 = 2)",a:6,tol:0,hints:[{v:30,say:"30 est le pourcentage. 10 % de 20 font 2 élèves : 30 %, c'est trois fois plus."},{v:600,say:"600, c'est 30 × 20. Pour 30 %, prends trois fois 10 % de 20, c'est-à-dire trois fois 2."}]}]},
   {t:"Exercice 3 · La moyenne",
    apport:`Rappel : <b>moyenne</b> = ${fr("total","effectif total")}. J'ajoute les nombres, je compte les jours, je pose le total sur l'effectif total.`,
    doc:{h:["Jour","Élèves reçus"],r:[["lundi","12"],["mardi","8"],["mercredi","10"],["jeudi","15"],["vendredi","5"]]},
    q:[{q:"Quel est le total des élèves reçus en 5 jours ? (12 + 8 + 10 + 15 + 5)",a:50,tol:0},
       {q:"Quelle est la moyenne par jour ? (50 sur 5)",a:10,tol:0,hints:[{v:50,say:"50 est le total. La moyenne est le total sur 5 jours."},{v:5,say:"5 est le nombre de jours. La moyenne est le total (50) sur 5."}]}]},
   {t:"Exercice 3 · Ma phrase",
    apport:"Une phrase avec la moyenne dit « en moyenne », le nombre, l'unité (par jour) et le lieu. Compose la phrase du service de médiation.",
    viz:"phrase",vd:{
      example:"« En moyenne, il y a <b>5 situations par jour</b> au terrain de sport. »",
      items:[{
        intro:"Compose la phrase de la moyenne des élèves reçus.",
        parts:[{s:"deb"}," ",{s:"nb"}," élèves par jour sont reçus au service de médiation."],
        slots:{
          deb:{role:"début de phrase",answer:"En moyenne,",hint:"On commence par « En moyenne, »."},
          nb:{role:"moyenne",answer:"10",hint:"C'est la moyenne de l'exercice : 50 sur 5 = 10."}},
        chips:["En moyenne,","10","50","5","15"],
        after:"La phrase donne la moyenne et son unité : elle est complète."}]}},
   {t:"Exercice 4 · Je décide",
    apport:"Pour décider, je donne <b>un choix</b>, <b>un nombre qui le prouve</b> et la <b>raison</b>. Et je contrôle : une moyenne est toujours entre le plus petit et le plus grand nombre de la liste.",
    txt:"Léo dit : « La moyenne est 15, car 15 est le plus grand nombre. » Les nombres sont 12, 8, 10, 15 et 5 (la moyenne trouvée à l'exercice 3 est 10).",
    q:[{q:"Léo a-t-il raison ? (oui / non)",a:"non",txt:true,sol:"Non : la moyenne (10) est entre le plus petit nombre (5) et le plus grand (15). Ce n'est pas le plus grand nombre.",hint:"Compare avec la moyenne que tu as calculée à l'exercice 3."},
       {q:"Un seul surveillant de plus : à quel moment le placer ? (matin, pause de midi ou après-midi)",a:["pause de midi","midi"],txt:true,sol:"À la pause de midi, car 12 situations sur 25 (48 %) ont lieu là : c'est le moment qui en a le plus.",hint:"Regarde le Tableau de l'exercice 1 : où y a-t-il le plus de situations ?"},
       {q:"Pour la phrase de décision, quel pourcentage prouve ton choix ?",a:48,tol:0,hints:[{v:12,say:"12 est l'effectif. Le nombre qui prouve est le pourcentage : 12 sur 25 font 48 %."}],sol:"« Je place le surveillant à la pause de midi, car 12 situations sur 25 (48 %) ont lieu là. »"}]}],
  quiz:[{q:"1 sur 5 : quel pourcentage ?",o:["20 %","5 %","15 %"],c:0,e:"1 sur 5 = 20 sur 100 = 20 %."},
        {q:"Une part de 90° dans un camembert : quelle fraction du tour ?",o:["un quart","la moitié","un dixième"],c:0,e:"90° est un quart de 360° : 25 %."},
        {q:"Les nombres 4 et 8 : quelle moyenne ?",o:["6","12","4"],c:0,e:"4 + 8 = 12, puis 12 sur 2 = 6."}],
  trace:`<b>Effectif total.</b> J'ajoute tous les effectifs. <b>Pourcentage</b> = ${fr("partie","total")} puis × 100 : par exemple ${fr("12","25")} = 48 %.<br><b>Camembert.</b> Un tour complet = 360°. 180° = ${fr("1","2")} = 50 %, 90° = ${fr("1","4")} = 25 %, 36° = 10 %.<br><b>Moyenne</b> = ${fr("total","effectif total")}, par exemple ${fr("50","5")} = 10. Elle est toujours <b>entre</b> le plus petit et le plus grand nombre.<br><b>Décider.</b> Une phrase avec le nombre qui prouve mon choix.`}]}
;
