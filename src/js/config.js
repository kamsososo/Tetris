/* =====================================================
  TETRIS - Configuration du jeu
  Ce fichier centralise toutes les constantes, paramètres
  et fonctions utilitaires globales utilisées dans le projet.
  Modifiez ici pour changer les règles, couleurs, contrôles, etc.
  ===================================================== */

// -----------------------------------------------------
// === CONFIGURATION PRINCIPALE DU JEU ===

// === CLÉS DE STOCKAGE LOCAL ===
// Clé de stockage des statistiques globales dans localStorage
const GLOBAL_STATS_STORAGE_KEY = 'tetris_global_stats';

// Dimensions, niveaux, scores, vitesse, etc.
const CONFIG = {
  // === DIMENSIONS DU TERRAIN ===
  ARENA_WIDTH: 10,      // Largeur en cellules
  ARENA_HEIGHT: 18,     // Hauteur en cellules
  BORDER_SIZE: 10,     // Épaisseur des bordures en % de la taille d'une cellule
  BEVEL_PCT: 11.11,      // Épaisseur des bords 3D en % de la taille d'une cellule
  STRIPE_PCT: 11.11,     // Largeur des rayures du fond en % de la taille d'une cellule

  // === NIVEAUX ===
  MAX_LEVEL: 10,        // Niveau maximum
  LINES_PER_LEVEL: 10,  // Lignes pour monter de niveau

  // === HIGH SCORES ===
  MAX_HIGH_SCORES: 5,   // Nombre de scores sauvegardés

  // === VITESSE ===
  BASE_DROP_INTERVAL: 500,  // Intervalle de base (ms)

  // === SCORE (Standard Tetris) ===
  // Points = valeur × niveau actuel
  SCORE_TABLE: {
    1: 100,   // 1 ligne
    2: 300,   // 2 lignes
    3: 500,   // 3 lignes
    4: 800    // Tetris (4 lignes)
  }
};

// -----------------------------------------------------
// === COULEURS DES TÉTROMINOS ===
// Couleurs principales des pièces (synchronisées avec CSS)
const COLORS = {
  'I': '#ff6600', // Orange
  'O': '#ff0000', // Rouge
  'T': '#ffff00', // Jaune
  'S': '#00aaff', // Bleu clair
  'Z': '#00ff00', // Vert
  'J': '#cf0fff', // Magenta
  'L': '#0000ff'  // Bleu
};

/**
 * Cache des couleurs des tétriminos calculées à partir des variables CSS.
 * Permet d'éviter d'appeler getComputedStyle à chaque rendu.
 */
let tetrominoColorCache = null;

/**
 * Initialise le cache des couleurs des tétriminos à partir des variables CSS.
 * Appelé à la première utilisation de getTetrominoColor.
 */
function initTetrominoColorCache() {
  const styles = getComputedStyle(document.documentElement);
  tetrominoColorCache = {};
  Object.keys(COLORS).forEach((type) => {
    const cssVar = `--color-tetromino-${type}`;
    const fromCss = styles.getPropertyValue(cssVar);
    tetrominoColorCache[type] = (fromCss && fromCss.trim()) || COLORS[type] || '#888';
  });
}

/**
 * Retourne la couleur CSS d'un tétrimino (via variable CSS si dispo, sinon fallback JS)
 * Utilisé pour garantir la cohérence visuelle entre JS et CSS.
 * @param {string} type - Lettre du tétrimino (I, O, T, S, Z, J, L)
 * @returns {string} Couleur CSS
 */
function getTetrominoColor(type) {
  if (!tetrominoColorCache) {
    initTetrominoColorCache();
  }
  return tetrominoColorCache[type] || COLORS[type] || '#888';
}

// -----------------------------------------------------
// === FORMES DES TÉTROMINOS ===
// Matrices de forme pour chaque type de pièce
const TETROMINOS = {
  'I': [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ],
  'J': [
    [0, 0, 0],
    [1, 1, 1],
    [0, 0, 1]
  ],
  'L': [
    [0, 0, 0],
    [1, 1, 1],
    [1, 0, 0]
  ],
  'O': [
    [1, 1],
    [1, 1]
  ],
  'S': [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0]
  ],
  'Z': [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0]
  ],
  'T': [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0]
  ]
};

// -----------------------------------------------------
// === OPTIONS PAR DÉFAUT ===
// Touches, volumes, paramètres utilisateur par défaut
const DEFAULT_OPTIONS = {
  // Touches de contrôle
  keys: {
    moveLeft: 'ArrowLeft',
    moveRight: 'ArrowRight',
    rotate: 'ArrowUp',
    softDrop: 'ArrowDown',
    hardDrop: ' '  // Espace
  },
  
  // Auto-répétition (DAS = Delayed Auto Shift, ARR = Auto Repeat Rate)
  dasDelay: 60,    // Délai avant répétition (ms)
  arrSpeed: 60,     // Vitesse de répétition (ms)
  
  // Audio
  sfxVolume: 50,    // Volume effets (0-100)
  musicVolume: 50,  // Volume musique (0-100)
  musicType: 1      // Type de musique (1-3)
};

// -----------------------------------------------------
// === NOMS DES TOUCHES (pour affichage) ===
// Mapping pour affichage lisible des touches
const KEY_NAMES = {
  'ArrowLeft': 'FLÈCHE GAUCHE',
  'ArrowRight': 'FLÈCHE DROITE',
  'ArrowUp': 'FLÈCHE HAUT',
  'ArrowDown': 'FLÈCHE BAS',
  ' ': 'ESPACE',
  'Escape': 'ÉCHAP',
  'Enter': 'ENTRÉE',
  'Shift': 'MAJ',
  'Control': 'CTRL',
  'Alt': 'ALT'
};

// ------------------------------------------------------
// === CONSTANTES POUR LES THÈMES ===
// Gestion du thème graphique et des assets
const THEME_STORAGE_KEY = 'tetrisTheme';
const THEME_NONE_VALUE = '__none__';
const THEME_NONE_LABEL = 'aucun';
const THEME_BACKGROUND_CANDIDATES = ['background.png', 'background.jpeg'];
const THEME_LOGO_CANDIDATES = ['theme_LOGO.jpeg', 'theme_LOGO.png'];

// Source de vérité explicite des dossiers de thèmes et des assets connus.
// En navigateur, on ne peut pas lister les fichiers d'un dossier sans backend.
const THEME_ASSETS = {
  cat: [
    '_ (1).jpeg',
    '_ (2).jpeg',
    '_.jpeg',
    'background.png',
    'cold snap ;.jpeg',
    'oardefault-4223276156.jpg',
    'theme_LOGO.jpeg'
  ],
  manga: [
    'background.jpeg',
    'ddd.jpeg',
    'dw.jpeg',
    'dwwww.jpeg',
    'ffff.jpeg',
    'llll.jpeg',
    'lsls.jpeg',
    'theme_LOGO.jpeg'
  ]
};

