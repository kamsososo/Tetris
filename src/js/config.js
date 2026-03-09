/* ========================================
   TETRIS - Configuration du jeu
   Contient toutes les constantes et paramètres
   ======================================== */

const CONFIG = {
  // === DIMENSIONS DU TERRAIN ===
  ARENA_WIDTH: 10,      // Largeur en cellules
  ARENA_HEIGHT: 18,     // Hauteur en cellules
  BORDER_SIZE: 7,     // Épaisseur des bordures en % de la taille d'une cellule
  BEVEL_PCT: 11.11,      // Épaisseur des bords 3D en % de la taille d'une cellule
  STRIPE_PCT: 11.11,     // Largeur des rayures du fond en % de la taille d'une cellule

  // === NIVEAUX ===
  MAX_LEVEL: 10,        // Niveau maximum
  LINES_PER_LEVEL: 10,  // Lignes pour monter de niveau

  // === HIGH SCORES ===
  MAX_HIGH_SCORES: 10,   // Nombre de scores sauvegardés

  // === VITESSE ===
  BASE_DROP_INTERVAL: 750,  // Intervalle de base (ms)

  // === SCORE (Standard Tetris) ===
  // Points = valeur × niveau actuel
  SCORE_TABLE: {
    1: 100,   // 1 ligne
    2: 300,   // 2 lignes
    3: 500,   // 3 lignes
    4: 800    // Tetris (4 lignes)
  }
};

// === COULEURS DES TÉTROMINOS ===
const COLORS = {
  'I': '#ff6600', // Orange
  'O': '#ff0000', // Rouge
  'T': '#ffff00', // Jaune
  'S': '#00aaff', // Bleu clair
  'Z': '#00ff00', // Vert
  'J': '#cf0fff', // Magenta
  'L': '#0000ff'  // Bleu
};

// === FORMES DES TÉTROMINOS ===
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

// === OPTIONS PAR DÉFAUT ===
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
  dasDelay: 170,    // Délai avant répétition (ms)
  arrSpeed: 50,     // Vitesse de répétition (ms)
  
  // Audio
  sfxVolume: 50,    // Volume effets (0-100)
  musicVolume: 50,  // Volume musique (0-100)
  musicType: 1      // Type de musique (1-3)
};

// === NOMS DES TOUCHES (pour affichage) ===
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

/**
 * Obtient le nom lisible d'une touche
 */
function getKeyDisplayName(key) {
  if (KEY_NAMES[key]) {
    return KEY_NAMES[key];
  }
  // Pour les lettres et chiffres, retourner en majuscules
  if (key.length === 1) {
    return key.toUpperCase();
  }
  return key.toUpperCase();
}
