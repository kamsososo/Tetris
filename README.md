# Tetris

Un clone de **Tetris N-Blox**, développé en HTML5 / CSS3 / JavaScript vanilla.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Fonctionnalités

- **10 niveaux** avec vitesse de chute progressive
- **Scoring standard Tetris** (100 / 300 / 500 / 800 points × niveau)
- **Tableau des meilleurs scores** sauvegardés en `localStorage`
- **Auto-répétition des touches** (DAS / ARR) configurable
- **Touches reconfigurables** depuis le menu Options
- **Système audio** avec effets sonores et musiques (préparé)
- **Menus** : Accueil, Pause, Options, Statistiques
- **Police** :FFF Forward

## Structure du projet

```
Tetris/
├── README.md
└── src/
    ├── index.html         # Page principale
    ├── style.css          # Styles complets
    ├── tetris.js          # Logique du jeu
    ├── font/              # Police custom (FFF Forward)
    ├── img/               # Images, logo et icones
    ├── audio/             # Musiques et effets sonores
    └── js/
        ├── config.js      # Constantes, couleurs, formes des tétrominos
        └── audio.js       # Gestionnaire audio
```

## Lancement

Il suffit d'ouvrir le fichier HTML dans un navigateur :

```bash
open src/index.html        # macOS
# ou
xdg-open src/index.html   # Linux
```

## Licence

Projet personnel — usage éducatif.
