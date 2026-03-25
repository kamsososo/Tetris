# Tetris

Un clone de **Tetris N-Blox**, développé en HTML5 / CSS3 / JavaScript vanilla.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Fonctionnalités

- **10 niveaux** avec vitesse de chute progressive
- **Calcul des scores standard** 100 / 300 / 500 / 800 points × niveau
- **Statistiques de jeu** depuis le menu Statistiques
- **Auto-répétition des touches** (DAS / ARR) configurable
- **Touches reconfigurables** depuis le menu Options
- **Système audio** avec effets sonores et musiques (custom)
- **Menus** : Accueil, Pause, Options, Statistiques
- **Police** :FFF Forward

## Structure du projet

```
Tetris/
├── README.md
└── src/
    ├── index.html         # Page principale
    ├── style.css          # Styles (variables CSS, responsive)
    ├── js/
    │   ├── config.js      # Constantes, couleurs, formes, utilitaires
    │   ├── tetris.js      # Logique du jeu (moteur principal)
    │   └── audio.js       # Gestionnaire audio
    └── assets/
        ├── font/          # Police custom (FFF Forward)
        ├── img/           
        │   ├── icons/     # Icônes
        │   └── theme/     # Thèmes du jeu
        └── audio/         # Musiques et effets sonores
```

> **Remarque :** Tous les assets sont dans `src/assets/` pour une meilleure organisation.


## Installation et lancement

Ouvrir le fichier HTML dans un navigateur moderne :

```bash
open src/index.html        # macOS
# ou
xdg-open src/index.html   # Linux
# ou
start src/index.html      # Windows
```

> Aucun serveur ou dépendance externe n'est requis.

## Thèmes

Convention de nommage (dans src/img/theme/nom_du_theme/) :
- Fond global du site : background.png puis background.jpeg (priorité dans cet ordre).
- Logo du thème : theme_LOGO.png puis theme_LOGO.jpeg (priorité dans cet ordre).
- Fonds du plateau : toute autre image du dossier, hors exclusions ci-dessous.

Exclusions strictes pour le fond aléatoire du plateau :
- background.png, background.jpeg, background.jpg
- theme_LOGO.png, theme_LOGO.jpeg, theme_LOGO.jpg


### Ajouter un thème personnalisé
- Créer un dossier dans `src/assets/img/theme/` avec le nom du thème (ce nom sera affiché dans la liste).
- Ajouter les images du thème dans ce dossier selon la convention ci-dessus.
- Déclarer le thème et ses fichiers dans `THEME_ASSETS` dans `src/js/config.js`.

Fallbacks appliqués :
- Si le fond global du thème est absent, le style de fond CSS existant est conservé.
- Si le logo du thème est absent, le logo par défaut assets/img/LOGO.png est utilisé.
- Si aucune image éligible n'existe pour le plateau, le fond actuel du canvas est conservé.

## Personnalisation des contrôles

Dans le menu **Options**, vous pouvez :
- Reconfigurer chaque touche (gauche, droite, rotation, descente douce, descente rapide)
- Régler le délai et la vitesse d’auto-répétition (DAS/ARR)
- Régler le volume des effets et de la musique

## Contribution

Les contributions sont bienvenues ! Merci de respecter la structure du projet et les conventions de nommage. Pour toute suggestion ou bug, ouvrez une issue ou une pull request.

## Licence

Projet personnel — usage éducatif uniquement.
