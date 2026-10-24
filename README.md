# Site Renaissance Roleplay — version 3 « Archives du Directoire » (24/10/2026)

Troisième maquette, proposée par Claude (v1 et v2 laissées telles quelles). Le site est un dossier classifié
qu'on déclassifie en le parcourant. Style institutionnel : IBM Plex Sans / Sans Condensed / Mono, noir graphite,
blanc os, rouge « tampon » et violet de la pierre. Visuels : captures en jeu du Chiliad.

1. **Lampe torche** : le cratère est dans le noir, la souris l'éclaire (au toucher sur téléphone ; sans geste,
   la lampe balaie toute seule). Fiche du dossier et tampon « Classifié ».
2. **Rapport d'incident 1945** : les passages caviardés se lèvent un à un quand le rapport arrive à l'écran,
   puis le tampon « Déclassifié » tombe. Frise 1968 → 2022.
2 bis. **Le dossier illustré** (ajouté le 24/10/2026) : la BD du lore `heritage-38eme-parallele` se lit dans le site.
   Bouton « Lire la BD » (reprend où le visiteur s'était arrêté) et 10 vignettes (`images/bd/`, une par planche)
   qui ouvrent le lecteur plein écran directement à la planche (`#page-N` du lecteur de la BD, dans un cadre).
   « Fermer » ou Échap coupe les voix.
3. **Transmissions interceptées** : poste radio FM à régler (cadran, flèches du clavier, boutons − / +).
   7 signaux : 6 répliques de la BD `heritage-38eme-parallele` (`sons/`) passées dans un filtre radio,
   et un « signal non identifié » synthétisé. Écran, force du signal, oscilloscope réel, journal d'écoute
   (mémorisé dans le navigateur). Le son ne démarre qu'avec « Allumer le poste ».
4. **Le Mur** : la page est coupée par une bande de béton ; le Nord (interdit) au-dessus, le Sud (le serveur) dessous.
5. **Le Dossier Noir** : le visiteur choisit sa voie (mémorisée dans le navigateur).
6. **Fin du dossier** : rejoindre le Discord.

Liens : objet `LIENS` en haut de `app.js`. À publier : `index.html`, `style.css`, `app.js`, `images/`, `sons/` (pas `outils/`).
Prévisualiser : config « site-renaissance-v3 » de `.claude/launch.json` → http://localhost:8789/ ; `?capture` = page figée.
Test téléphone sans fenêtre : `outils/test-mobile.html?cible=<id>&decalage=<px>` (cadre 400 × 830, même origine).
