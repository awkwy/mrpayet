export default {id:"fiche-outils",classe:"TC AEPE",mat:"Support",titre:"Fiche outils — calculer à la main",
 desc:"Aide-mémoire : les quatre opérations, la table de Pythagore, les astuces.",
 pdf:"maths",
 obj:["Poser une addition et une soustraction sans se tromper de retenue",
      "Multiplier en décomposant, sans connaître toutes ses tables",
      "Vérifier chaque résultat par l'opération inverse"],
 seances:[
 {t:"Les méthodes",pdf:["fiche-outils-calcul"],
  prob:"Les quatre opérations posées, à garder sous les yeux.",
  steps:[
   {t:"Addition posée",apport:"J'aligne les chiffres (unités sous unités). J'additionne colonne par colonne, <b>de droite à gauche</b>. Si une colonne dépasse 9, j'écris les unités et je <b>retiens</b> la dizaine.<br>Exemple : 47 + 38 → 7 + 8 = 15, j'écris 5 je retiens 1 ; 4 + 3 + 1 = 8. Résultat <b>85</b>.",
    q:[{q:"56 + 27",a:83,tol:0},{q:"148 + 76",a:224,tol:0}]},
   {t:"Soustraction — compter en avançant",apport:"Pour 82 − 47, je pars de 47 et j'avance : +3 → 50, +30 → 80, +2 → 82. Total avancé : 3 + 30 + 2 = <b>35</b>.",
    q:[{q:"71 − 48 (compte en avançant)",a:23,tol:0},{q:"100 − 63",a:37,tol:0}]},
   {t:"Multiplier en découpant un rectangle",viz:"multiplication",
    apport:"Pour 7 × 32, je coupe 32 en <b>30 + 2</b> : 7 × 30 = 210, 7 × 2 = 14, puis 210 + 14 = <b>224</b>. L'aire du grand rectangle est la somme des deux morceaux."},
   {t:"Multiplication — je décompose",
    q:[{q:"7 × 32 (décompose : 30 + 2)",a:224,tol:0},{q:"8 × 45",a:360,tol:0}]},
   {t:"Division — deux sens",apport:"<b>Partage :</b> 24 pour 4 → 6 chacun. <b>Groupement :</b> 24 par paquets de 4 → 6 paquets.<br>Pour trouver : « 4 fois combien font 24 ? » → je cherche dans la table de 4."}],
  trace:"Les quatre opérations posées suivent toujours la même logique : on aligne, on traite chiffre par chiffre, on gère la retenue ou l'emprunt, puis on <b>vérifie</b> — par l'opération inverse ou avec la calculatrice."}]}

;
