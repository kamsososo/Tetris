# Tetris

Un clone fidèle de **Tetris N-Blox**, développé en HTML5 / CSS3 / JavaScript vanilla — sans aucune dépendance externe.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## Fonctionnalités

- **10 niveaux** avec vitesse de chute progressive
- **Scoring standard Tetris** (100 / 300 / 500 / 800 points × niveau)
- **Tableau des meilleurs scores** sauvegardés en `localStorage`
- **Auto-répétition des touches** (DAS / ARR) configurable
- **Touches reconfigurables** depuis le menu Options
- **Système audio** avec effets sonores et musique (préparé)
- **Menus complets** : Accueil, Pause, Options, Aide
- **Rendu Canvas** avec effets 3D biseautés sur les pièces
- **Police personnalisée** (FFF Forward)

## Structure du projet

```
Tetris/
├── README.md
├── notes.md              # Notes de développement & idées futures
└── src/
    ├── index.html         # Page principale
    ├── style.css          # Styles complets
    ├── tetris.js          # Logique du jeu
    ├── font/              # Police custom (FFF Forward)
    ├── img/               # Images & logos
    └── js/
        ├── config.js      # Constantes, couleurs, formes des tétrominos
        └── audio.js       # Gestionnaire audio (sons & musique)
```

## Lancement

Aucun serveur ni build n'est requis. Il suffit d'ouvrir le fichier HTML dans un navigateur :

```bash
open src/index.html        # macOS
# ou
xdg-open src/index.html   # Linux
```

> **Astuce :** pour le support audio complet, utilisez un serveur local (ex. `npx serve src` ou l'extension *Live Server* de VS Code).

## Contrôles par défaut

| Touche | Action |
|--------|--------|
| ← | Déplacer à gauche |
| → | Déplacer à droite |
| ↑ | Rotation |
| ↓ | Descente douce |
| Espace | Descente rapide (hard drop) |
| Échap | Pause |

Les touches sont modifiables dans le menu **Options**.

## Captures d'écran

*À venir*

## Améliorations prévues

- Bordures noires des pièces
- Animation de clignotement lors de l'effacement des lignes
- Photos dynamiques qui changent à chaque ligne effacée
- Système de combos avec visuels arcade
- Images pour les niveaux (au lieu de nombres)
- Écran de fin de partie avec score et pseudo
- Fenêtre statistiques par joueur (parties jouées, lignes, temps, meilleur score)

## Licence

Projet personnel — usage éducatif.
