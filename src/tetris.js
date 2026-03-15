/* ========================================
   TETRIS - Script principal complet
   
   Fonctionnalités :
   - 10 niveaux avec vitesse progressive
   - Score Standard Tetris
   - 5 meilleurs scores sauvegardés
   - Auto-répétition des touches (DAS/ARR)
   - Touches reconfigurables
   - Système audio (préparé)
   - Menus : Accueil, Pause, Options, Aide
   ======================================== */

// Les constantes CONFIG, COLORS, TETROMINOS, DEFAULT_OPTIONS et KEY_NAMES sont dans js/config.js

// ===========================================
// ÉTAT DU JEU
// ===========================================

let canvas, ctx, nextCanvas, nextCtx;
let arena = [];
let currentPiece = null;
let nextPiece = null;
let tetrominoSequence = [];
let gameRunning = false;
let gamePaused = false;
let gameOver = false;
let animationId = null;
let arenaLogicalWidth = 0;
let arenaLogicalHeight = 0;

// Statistiques
let gameStats = {
  score: 0,
  level: 1,
  lines: 0,
  startLevel: 1
};

// Options actuelles
let options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));

// État des menus
let currentMenu = 'accueil'; // 'accueil', 'pause', 'options', 'aide'
let previousMenu = null;
let waitingForKey = null; // Action en attente de nouvelle touche

// Timing pour la chute
let dropCounter = 0;
let lastTime = 0;

// Auto-répétition (DAS/ARR)
let keysPressed = {};
let dasTimers = {};
let arrIntervals = {};

// Animation de clignotement des lignes
let flashingRows = [];           // Indices des lignes qui clignotent
let flashPhase = false;          // true = blanc, false = couleur normale
let linesClearingAnimation = false; // true = animation en cours

// Audio
let audioMuted = false;

// ===========================================
// FONCTIONS UTILITAIRES
// ===========================================

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getKeyDisplayName(key) {
  return KEY_NAMES[key] || (key.length === 1 ? key.toUpperCase() : key);
}

function getDropInterval(level) {
  return Math.max(100, CONFIG.BASE_DROP_INTERVAL / (1 + (level - 1) * 0.5));
}

function getCellSize() {
  return arenaLogicalWidth / CONFIG.ARENA_WIDTH;
}

function getHalfBorderSize() {
  const fullBorder = getCellSize() * CONFIG.BORDER_SIZE / 100;
  return fullBorder / 2;
}

function getArenaPaddingPx() {
  return Math.ceil(getHalfBorderSize());
}

// ===========================================
// GESTION DES OPTIONS
// ===========================================

function loadOptions() {
  const saved = localStorage.getItem('tetrisOptions');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      options = { ...DEFAULT_OPTIONS, ...parsed };
      // S'assurer que keys existe
      options.keys = { ...DEFAULT_OPTIONS.keys, ...parsed.keys };
    } catch (e) {
      options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
    }
  }
  updateOptionsDisplay();
}

function saveOptions() {
  localStorage.setItem('tetrisOptions', JSON.stringify(options));
}

function resetOptions() {
  options = JSON.parse(JSON.stringify(DEFAULT_OPTIONS));
  saveOptions();
  updateOptionsDisplay();
}

function updateOptionsDisplay() {
  // Afficher les touches
  for (const action of ['moveLeft', 'moveRight', 'rotate', 'softDrop', 'hardDrop']) {
    const btn = document.getElementById(`key-${action}`);
    if (btn) {
      btn.textContent = getKeyDisplayName(options.keys[action]);
    }
  }
  
  // Afficher les valeurs numériques
  document.getElementById('dasDelay-value').textContent = `${options.dasDelay} ms`;
  document.getElementById('arrSpeed-value').textContent = `${options.arrSpeed} ms`;
  document.getElementById('sfxVolume-value').textContent = `${options.sfxVolume}%`;
  document.getElementById('musicVolume-value').textContent = `${options.musicVolume}%`;
  document.getElementById('musicType-value').textContent = `TYPE ${options.musicType}`;
}

function adjustOption(target, direction) {
  const dir = parseInt(direction);
  
  switch (target) {
    case 'dasDelay':
      options.dasDelay = Math.max(50, Math.min(300, options.dasDelay + dir * 10));
      break;
    case 'arrSpeed':
      options.arrSpeed = Math.max(10, Math.min(100, options.arrSpeed + dir * 5));
      break;
    case 'sfxVolume':
      options.sfxVolume = Math.max(0, Math.min(100, options.sfxVolume + dir * 10));
      break;
    case 'musicVolume':
      options.musicVolume = Math.max(0, Math.min(100, options.musicVolume + dir * 10));
      break;
    case 'musicType':
      options.musicType = Math.max(1, Math.min(3, options.musicType + dir));
      break;
  }
  
  saveOptions();
  updateOptionsDisplay();
}

// ===========================================
// GESTION DES HIGH SCORES
// ===========================================

function loadHighScores() {
  const saved = localStorage.getItem('tetrisHighScores');
  return saved ? JSON.parse(saved) : [];
}

function saveHighScore(score) {
  const scores = loadHighScores();
  scores.push(score);
  scores.sort((a, b) => b - a);
  const topScores = scores.slice(0, CONFIG.MAX_HIGH_SCORES);
  localStorage.setItem('tetrisHighScores', JSON.stringify(topScores));
  return topScores;
}

function resetHighScores() {
  localStorage.removeItem('tetrisHighScores');
  displayHighScores();
}

function displayHighScores() {
  const scores = loadHighScores();
  const container = document.getElementById('high-scores-list');
  if (!container) return;
  
  container.innerHTML = '';
  for (let i = 0; i < CONFIG.MAX_HIGH_SCORES; i++) {
    const entry = document.createElement('div');
    entry.className = 'score-entry';
    entry.textContent = scores[i] ? formatNumber(scores[i]) : '---';
    container.appendChild(entry);
  }
}

// ===========================================
// GESTION DES MENUS
// ===========================================

function showMenu(menuName) {
  // Cacher tous les menus
  document.getElementById('menu-accueil').classList.add('hidden');
  document.getElementById('menu-pause').classList.add('hidden');
  document.getElementById('menu-aide').classList.add('hidden');
  document.getElementById('menu-options').classList.add('hidden');
  
  // Afficher le menu demandé
  document.getElementById(`menu-${menuName}`).classList.remove('hidden');
  currentMenu = menuName;
}

function showPreviousMenu() {
  if (previousMenu) {
    showMenu(previousMenu);
    previousMenu = null;
  } else if (gameRunning && !gameOver) {
    showMenu('pause');
  } else {
    showMenu('accueil');
  }
}

// ===========================================
// GESTION DU TERRAIN
// ===========================================

function createArena() {
  arena = [];
  for (let i = 0; i < CONFIG.ARENA_HEIGHT; i++) {
    arena.push(new Array(CONFIG.ARENA_WIDTH).fill(0));
  }
}

// ===========================================
// GESTION DES TÉTROMINOS
// ===========================================

function generateSequence() {
  const pieces = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  while (pieces.length) {
    const idx = getRandomInt(0, pieces.length - 1);
    tetrominoSequence.push(pieces.splice(idx, 1)[0]);
  }
}

function getNextTetromino() {
  if (tetrominoSequence.length < 2) {
    generateSequence();
  }
  
  const name = tetrominoSequence.pop();
  const matrix = TETROMINOS[name].map(row => [...row]);
  const col = Math.floor(CONFIG.ARENA_WIDTH / 2) - Math.ceil(matrix[0].length / 2);
  
  // Calculer le nombre de lignes vides en haut de la matrice
  let emptyRows = 0;
  for (let r = 0; r < matrix.length; r++) {
    if (matrix[r].every(cell => cell === 0)) {
      emptyRows++;
    } else {
      break;
    }
  }
  const row = -emptyRows;
  
  return { name, matrix, row, col, rotationState: 0 };
}

function rotateMatrix(matrix) {
  const N = matrix.length - 1;
  return matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]));
}

// ===========================================
// COLLISIONS
// ===========================================

function isValidMove(matrix, pieceRow, pieceCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col]) {
        const newRow = pieceRow + row;
        const newCol = pieceCol + col;
        
        if (newCol < 0 || newCol >= CONFIG.ARENA_WIDTH || newRow >= CONFIG.ARENA_HEIGHT) {
          return false;
        }
        if (newRow >= 0 && arena[newRow][newCol]) {
          return false;
        }
      }
    }
  }
  return true;
}

// ===========================================
// ACTIONS DU JEU
// ===========================================

function movePiece(direction) {
  if (!gameRunning || gamePaused || gameOver) return;
  
  const newCol = currentPiece.col + direction;
  if (isValidMove(currentPiece.matrix, currentPiece.row, newCol)) {
    currentPiece.col = newCol;
    // playSound('move');
  }
}

function rotatePiece() {
  if (!gameRunning || gamePaused || gameOver) return;
  
  // O ne tourne pas
  if (currentPiece.name === 'O') return;
  
  // S, Z, I : seulement 2 états (0 et 1)
  const hasTwoStates = ['S', 'Z', 'I'].includes(currentPiece.name);
  if (hasTwoStates && currentPiece.rotationState === 1) {
    // Retourner à l'état initial (rotation inverse)
    const rotated = rotateMatrix(rotateMatrix(rotateMatrix(currentPiece.matrix)));
    if (isValidMove(rotated, currentPiece.row, currentPiece.col)) {
      currentPiece.matrix = rotated;
      currentPiece.rotationState = 0;
      // playSound('rotate');
      return;
    }
    // Wall kick pour rotation inverse
    for (const kick of [-1, 1, -2, 2]) {
      if (isValidMove(rotated, currentPiece.row, currentPiece.col + kick)) {
        currentPiece.matrix = rotated;
        currentPiece.col += kick;
        currentPiece.rotationState = 0;
        // playSound('rotate');
        return;
      }
    }
    return;
  }
  
  const rotated = rotateMatrix(currentPiece.matrix);
  
  if (isValidMove(rotated, currentPiece.row, currentPiece.col)) {
    currentPiece.matrix = rotated;
    if (hasTwoStates) {
      currentPiece.rotationState = 1;
    } else {
      currentPiece.rotationState = (currentPiece.rotationState + 1) % 4;
    }
    // playSound('rotate');
    return;
  }
  
  // Wall kick
  for (const kick of [-1, 1, -2, 2]) {
    if (isValidMove(rotated, currentPiece.row, currentPiece.col + kick)) {
      currentPiece.matrix = rotated;
      currentPiece.col += kick;
      if (hasTwoStates) {
        currentPiece.rotationState = 1;
      } else {
        currentPiece.rotationState = (currentPiece.rotationState + 1) % 4;
      }
      // playSound('rotate');
      return;
    }
  }
}

function softDrop() {
  if (!gameRunning || gamePaused || gameOver || linesClearingAnimation) return;
  
  const newRow = currentPiece.row + 1;
  if (isValidMove(currentPiece.matrix, newRow, currentPiece.col)) {
    currentPiece.row = newRow;
    dropCounter = 0;
  } else {
    placePiece();
  }
}

function hardDrop() {
  if (!gameRunning || gamePaused || gameOver || linesClearingAnimation) return;
  
  while (isValidMove(currentPiece.matrix, currentPiece.row + 1, currentPiece.col)) {
    currentPiece.row++;
  }
  placePiece();
  // playSound('drop');
}

async function placePiece() {
  for (let row = 0; row < currentPiece.matrix.length; row++) {
    for (let col = 0; col < currentPiece.matrix[row].length; col++) {
      if (currentPiece.matrix[row][col]) {
        const arenaRow = currentPiece.row + row;
        if (arenaRow < 0) {
          return triggerGameOver();
        }
        arena[arenaRow][currentPiece.col + col] = currentPiece.name;
      }
    }
  }
  
  const linesCleared = await clearLines();
  if (linesCleared > 0) {
    updateScore(linesCleared);
  }
  
  // Prochaine pièce
  currentPiece = nextPiece;
  nextPiece = getNextTetromino();
  drawNextPiece();
  
  if (!isValidMove(currentPiece.matrix, currentPiece.row, currentPiece.col)) {
    triggerGameOver();
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clearLines() {
  // Détecter les lignes complètes
  let fullRows = [];
  for (let row = CONFIG.ARENA_HEIGHT - 1; row >= 0; row--) {
    if (arena[row].every(cell => cell !== 0)) {
      fullRows.push(row);
    }
  }

  if (fullRows.length === 0) return 0;

  // Animation de clignotement
  linesClearingAnimation = true;
  flashingRows = fullRows;

  for (let i = 0; i < 3; i++) {
    flashPhase = true;   // Blanc
    draw();
    await delay(50);
    flashPhase = false;  // Couleur normale
    draw();
    await delay(50);
  }

  // Vider les lignes complètes (créer des "trous") sans les retirer de l'arène
  flashingRows = [];
  flashPhase = false;
  const fullRowSet = new Set(fullRows);
  for (const row of fullRows) {
    arena[row] = new Array(CONFIG.ARENA_WIDTH).fill(0);
  }

  // Calculer les décalages de chute pour chaque ligne non-vide
  const cellSize = getCellSize();
  const targetOffsets = {};
  for (let row = CONFIG.ARENA_HEIGHT - 1; row >= 0; row--) {
    if (fullRowSet.has(row)) continue; // Ligne vidée, pas de chute
    // Compter combien de lignes vidées se trouvent EN DESSOUS de cette ligne
    let gapBelow = 0;
    for (const fr of fullRows) {
      if (fr > row) gapBelow++;
    }
    if (gapBelow > 0) {
      targetOffsets[row] = gapBelow * cellSize;
    }
  }

  // Animer la chute progressive (50ms par ligne effacée)
  if (Object.keys(targetOffsets).length > 0) {
    const dropDuration = fullRows.length * 50;
    await animateDrop(targetOffsets, dropDuration);
  }

  // Finaliser l'arène : supprimer les lignes vides et ajouter en haut
  fullRows.sort((a, b) => b - a);
  for (const row of fullRows) {
    arena.splice(row, 1);
  }
  for (let i = 0; i < fullRows.length; i++) {
    arena.unshift(new Array(CONFIG.ARENA_WIDTH).fill(0));
  }

  linesClearingAnimation = false;

  // playSound(fullRows.length === 4 ? 'tetris' : 'clear');

  return fullRows.length;
}

function updateScore(linesCleared) {
  const points = (CONFIG.SCORE_TABLE[linesCleared] || 0) * gameStats.level;
  gameStats.score += points;
  gameStats.lines += linesCleared;
  
  const newLevel = gameStats.startLevel + Math.floor(gameStats.lines / CONFIG.LINES_PER_LEVEL);
  if (newLevel > gameStats.level && newLevel <= CONFIG.MAX_LEVEL) {
    gameStats.level = newLevel;
    // playSound('levelUp');
  }
  
  updateDisplay();
}

// ===========================================
// RENDU GRAPHIQUE
// ===========================================

// Pattern de fond rayé (créé une seule fois)

function isCellOccupied(boardCol, boardRow, matrix, offsetX, offsetY) {
  if (matrix) {
    const localRow = boardRow - offsetY;
    const localCol = boardCol - offsetX;
    if (
      localRow >= 0 &&
      localRow < matrix.length &&
      localCol >= 0 &&
      localCol < matrix[localRow].length &&
      matrix[localRow][localCol] !== 0
    ) {
      return true;
    }
  }

  if (
    boardRow < 0 ||
    boardRow >= CONFIG.ARENA_HEIGHT ||
    boardCol < 0 ||
    boardCol >= CONFIG.ARENA_WIDTH
  ) {
    return false;
  }

  return arena[boardRow][boardCol] !== 0;
}

function getCellNeighbors(boardCol, boardRow, matrix, offsetX, offsetY) {
  return {
    top: isCellOccupied(boardCol, boardRow - 1, matrix, offsetX, offsetY),
    bottom: isCellOccupied(boardCol, boardRow + 1, matrix, offsetX, offsetY),
    left: isCellOccupied(boardCol - 1, boardRow, matrix, offsetX, offsetY),
    right: isCellOccupied(boardCol + 1, boardRow, matrix, offsetX, offsetY)
  };
}

function draw() {
  // Fond transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const arenaPadding = getArenaPaddingPx();
  ctx.save();
  ctx.translate(arenaPadding, arenaPadding);

  const drawActivePiece = currentPiece && !gamePaused;
  const activeMatrix = drawActivePiece ? currentPiece.matrix : null;
  const activeCol = drawActivePiece ? currentPiece.col : 0;
  const activeRow = drawActivePiece ? currentPiece.row : 0;
  
  // Terrain
  for (let row = 0; row < CONFIG.ARENA_HEIGHT; row++) {
    for (let col = 0; col < CONFIG.ARENA_WIDTH; col++) {
      if (arena[row][col]) {
        const cellType = arena[row][col];
        const neighbors = getCellNeighbors(col, row, activeMatrix, activeCol, activeRow);
        // Flash blanc si la ligne est en cours de clignotement
        if (flashingRows.includes(row) && flashPhase) {
          drawCell(ctx, col, row, '#FFFFFF', neighbors);
        } else {
          drawCell(ctx, col, row, COLORS[cellType], neighbors);
        }
      }
    }
  }
  
  // Pièce actuelle
  if (drawActivePiece) {
    drawPiece(ctx, currentPiece.matrix, currentPiece.col, currentPiece.row, COLORS[currentPiece.name]);
  }

  ctx.restore();
}

// Dessine l'arène avec des décalages verticaux en pixels par ligne (pour l'animation de chute)
function drawArenaWithOffsets(rowOffsets) {

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const arenaPadding = getArenaPaddingPx();
  ctx.save();
  ctx.translate(arenaPadding, arenaPadding);

  for (let row = 0; row < CONFIG.ARENA_HEIGHT; row++) {
    for (let col = 0; col < CONFIG.ARENA_WIDTH; col++) {
      if (arena[row][col]) {
        const cellType = arena[row][col];
        const neighbors = getCellNeighbors(col, row);
        drawCell(ctx, col, row, COLORS[cellType], neighbors, rowOffsets[row] || 0);
      }
    }
  }

  ctx.restore();
}

// Anime la chute des lignes restantes après effacement
function animateDrop(targetOffsets, duration) {
  return new Promise(resolve => {
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolation linéaire des décalages
      const currentOffsets = {};
      for (const row in targetOffsets) {
        currentOffsets[row] = targetOffsets[row] * progress;
      }

      drawArenaWithOffsets(currentOffsets);

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}

function drawCell(context, col, row, color, neighbors, pixelOffsetY) {
  const cellSize = getCellSize();
  const x = Math.round(col * cellSize);
  const y = Math.round(row * cellSize + (pixelOffsetY || 0));
  const size = Math.round((col + 1) * cellSize) - x;
  const n = neighbors || { top: false, right: false, bottom: false, left: false };
  
  // Bordure calculée depuis BORDER_SIZE (% de la taille d'une cellule)
  const fullBorder = cellSize * CONFIG.BORDER_SIZE / 100;
  const halfBorder = fullBorder / 2;
  
  // Coeur de tuile strictement carre : inset constant sur les 4 cotes.
  const colorInset = halfBorder;
  const innerSize = Math.max(1, size - colorInset * 2);
  const ix = x + colorInset;
  const iy = y + colorInset;
  const iw = innerSize;
  const ih = innerSize;
  const bevel = Math.max(1, Math.min(Math.round(cellSize * CONFIG.BEVEL_PCT / 100), Math.floor(innerSize / 2)));

  // Demi-bordure noire interne constante (chaque tuile apporte sa moitie).
  context.fillStyle = '#000000';
  context.fillRect(x, y, size, size);

  // Cote expose: ajouter une demi-bordure externe pour retrouver une epaisseur complete.
  if (!n.top) {
    context.fillRect(x - halfBorder, y - halfBorder, size + halfBorder * 2, halfBorder);
  }
  if (!n.right) {
    context.fillRect(x + size, y - halfBorder, halfBorder, size + halfBorder * 2);
  }
  if (!n.bottom) {
    context.fillRect(x - halfBorder, y + size, size + halfBorder * 2, halfBorder);
  }
  if (!n.left) {
    context.fillRect(x - halfBorder, y - halfBorder, halfBorder, size + halfBorder * 2);
  }

  // Fond colore carre, independant des adjacences.
  context.fillStyle = color;
  context.fillRect(ix, iy, iw, ih);
  
  // Effet 3D - bord clair en haut (trapèze)
  context.fillStyle = 'rgba(255,255,255,0.35)';
  context.beginPath();
  context.moveTo(ix, iy);
  context.lineTo(ix + iw, iy);
  context.lineTo(ix + iw - bevel, iy + bevel);
  context.lineTo(ix + bevel, iy + bevel);
  context.closePath();
  context.fill();
  
  // Effet 3D - bord clair à droite (trapèze)
  context.beginPath();
  context.moveTo(ix + iw, iy);
  context.lineTo(ix + iw, iy + ih);
  context.lineTo(ix + iw - bevel, iy + ih - bevel);
  context.lineTo(ix + iw - bevel, iy + bevel);
  context.closePath();
  context.fill();
  
  // Effet 3D - bord sombre en bas (trapèze)
  context.fillStyle = 'rgba(0,0,0,0.25)';
  context.beginPath();
  context.moveTo(ix + iw, iy + ih);
  context.lineTo(ix, iy + ih);
  context.lineTo(ix + bevel, iy + ih - bevel);
  context.lineTo(ix + iw - bevel, iy + ih - bevel);
  context.closePath();
  context.fill();
  
  // Effet 3D - bord sombre à gauche (trapèze)
  context.beginPath();
  context.moveTo(ix, iy + ih);
  context.lineTo(ix, iy);
  context.lineTo(ix + bevel, iy + bevel);
  context.lineTo(ix + bevel, iy + ih - bevel);
  context.closePath();
  context.fill();
}

function drawPiece(context, matrix, offsetX, offsetY, color) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && offsetY + row >= 0) {
        const boardCol = offsetX + col;
        const boardRow = offsetY + row;
        const neighbors = getCellNeighbors(boardCol, boardRow, matrix, offsetX, offsetY);
        drawCell(context, offsetX + col, offsetY + row, color, neighbors);
      }
    }
  }
}

function drawNextPiece() {
  if (!nextCtx || !nextPiece) return;
  
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  
  const matrix = nextPiece.matrix;
  const color = COLORS[nextPiece.name];
  
  // Calculer les dimensions réelles de la pièce (sans lignes/colonnes vides)
  let minRow = matrix.length, maxRow = 0, minCol = matrix[0].length, maxCol = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }
  
  const pieceWidth = maxCol - minCol + 1;
  const pieceHeight = maxRow - minRow + 1;
  
  // Taille de cellule calculée dynamiquement depuis le canvas principal
  const cellSize = getCellSize();
  
  // Centrer la pièce
  const offsetX = (nextCanvas.width - pieceWidth * cellSize) / 2;
  const offsetY = (nextCanvas.height - pieceHeight * cellSize) / 2;

  nextCtx.save();
  nextCtx.translate(Math.round(offsetX), Math.round(offsetY));
  
  // Reutilise drawCell pour conserver exactement le meme rendu que le plateau.
  for (let r = minRow; r <= maxRow; r++) {
    for (let c = minCol; c <= maxCol; c++) {
      if (matrix[r][c]) {
        const localRow = r - minRow;
        const localCol = c - minCol;
        const hasTop    = r > 0 && matrix[r - 1][c] !== 0;
        const hasBottom = r < matrix.length - 1 && matrix[r + 1][c] !== 0;
        const hasLeft   = c > 0 && matrix[r][c - 1] !== 0;
        const hasRight  = c < matrix[r].length - 1 && matrix[r][c + 1] !== 0;

        drawCell(nextCtx, localCol, localRow, color, {
          top: hasTop,
          right: hasRight,
          bottom: hasBottom,
          left: hasLeft
        });
      }
    }
  }

  nextCtx.restore();
}

// ===========================================
// BOUCLE DE JEU
// ===========================================

function gameLoop(timestamp = 0) {
  if (!gameRunning || gamePaused) return;
  
  // Ne pas avancer le jeu pendant l'animation de clignotement
  if (linesClearingAnimation) {
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  const delta = timestamp - lastTime;
  lastTime = timestamp;
  dropCounter += delta;
  
  if (dropCounter > getDropInterval(gameStats.level)) {
    softDrop();
    dropCounter = 0;
  }

  if (!gameRunning) return;

  draw();
  animationId = requestAnimationFrame(gameLoop);
}

// ===========================================
// CONTRÔLE DU JEU
// ===========================================

function startGame() {
  createArena();
  tetrominoSequence = [];
  
  gameStats = {
    score: 0,
    level: gameStats.startLevel,
    lines: 0,
    startLevel: gameStats.startLevel
  };
  
  gameOver = false;
  gamePaused = false;
  gameRunning = true;
  dropCounter = 0;
  lastTime = 0;
  
  // Préparer les pièces
  nextPiece = getNextTetromino();
  currentPiece = getNextTetromino();
  
  // Afficher le jeu
  document.querySelector('.game-container').classList.add('playing');
  
  updateDisplay();
  drawNextPiece();
  
  animationId = requestAnimationFrame(gameLoop);
}

function pauseGame() {
  if (!gameRunning || gameOver) return;
  
  gamePaused = true;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  document.querySelector('.game-container').classList.add('paused');
  showMenu('pause');
}

function resumeGame() {
  if (!gameRunning || gameOver) return;
  
  gamePaused = false;
  document.querySelector('.game-container').classList.remove('paused');
  document.getElementById('menu-pause').classList.add('hidden');
  lastTime = performance.now();
  animationId = requestAnimationFrame(gameLoop);
}

function quitGame() {
  gameRunning = false;
  gamePaused = false;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  document.querySelector('.game-container').classList.remove('playing', 'paused');
  createArena();
  draw();
  showMenu('accueil');
  displayHighScores();
}

function triggerGameOver() {
  gameOver = true;
  gameRunning = false;
  
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  
  saveHighScore(gameStats.score);
  // playSound('gameOver');
  
  // Afficher Game Over sur le canvas (positions et tailles en % du canvas)
  const cw = canvas.width;
  const ch = canvas.height;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, ch * 0.5 - ch * 0.0772, cw, ch * 0.1543);
  
  ctx.fillStyle = '#ff4444';
  ctx.font = `${Math.round(ch * 0.037)}px pixel bold`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('GAME OVER', cw / 2, ch * 0.5 - ch * 0.0231);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `${Math.round(ch * 0.0216)}px Arial`;
  ctx.fillText(`Score: ${formatNumber(gameStats.score)}`, cw / 2, ch * 0.5 + ch * 0.0231);
  
  ctx.font = `${Math.round(ch * 0.0185)}px Arial`;
  ctx.fillStyle = '#aaaaaa';
  ctx.fillText('Appuyez sur ESPACE pour rejouer', cw / 2, ch * 0.5 + ch * 0.0617);
}

// ===========================================
// AFFICHAGE
// ===========================================

function updateDisplay() {
  document.getElementById('score').textContent = formatNumber(gameStats.score);
  document.getElementById('current-level').textContent = gameStats.level;
  document.getElementById('lines').textContent = gameStats.lines;
}

function updateLevelDisplay() {
  document.getElementById('level-display').textContent = `niveau ${gameStats.startLevel}`;
}

// ===========================================
// AUTO-RÉPÉTITION (DAS/ARR)
// ===========================================

function startDAS(action) {
  if (dasTimers[action] || !gameRunning || gamePaused) return;
  
  // Action immédiate
  executeAction(action);
  
  // Délai initial (DAS)
  dasTimers[action] = setTimeout(() => {
    // Répétition (ARR)
    arrIntervals[action] = setInterval(() => {
      executeAction(action);
    }, options.arrSpeed);
  }, options.dasDelay);
}

function stopDAS(action) {
  if (dasTimers[action]) {
    clearTimeout(dasTimers[action]);
    delete dasTimers[action];
  }
  if (arrIntervals[action]) {
    clearInterval(arrIntervals[action]);
    delete arrIntervals[action];
  }
}

function executeAction(action) {
  if (linesClearingAnimation) return;
  switch (action) {
    case 'moveLeft': movePiece(-1); break;
    case 'moveRight': movePiece(1); break;
    case 'rotate': rotatePiece(); break;
    case 'softDrop': softDrop(); break;
    case 'hardDrop': hardDrop(); break;
  }
}

// ===========================================
// GESTION DES TOUCHES
// ===========================================

function handleKeyDown(e) {
  const key = e.key;
  
  // Si on attend une nouvelle touche pour la configuration
  if (waitingForKey) {
    e.preventDefault();
    if (key !== 'Escape') {
      options.keys[waitingForKey] = key;
      saveOptions();
      updateOptionsDisplay();
    }
    document.querySelector('.key-btn.listening')?.classList.remove('listening');
    waitingForKey = null;
    return;
  }
  
  // Touche Échap = Pause
  if (key === 'Escape') {
    if (gameRunning && !gameOver) {
      if (gamePaused) {
        if (currentMenu === 'pause') {
          resumeGame();
        } else {
          showMenu('pause');
        }
      } else {
        pauseGame();
      }
    }
    return;
  }
  
  // Espace pour rejouer après Game Over
  if (key === ' ' && gameOver) {
    startGame();
    return;
  }
  
  // Actions de jeu avec DAS
  if (!keysPressed[key]) {
    keysPressed[key] = true;
    
    for (const [action, actionKey] of Object.entries(options.keys)) {
      if (key === actionKey) {
        if (action === 'hardDrop' || action === 'rotate') {
          // Hard drop et rotation sans répétition
          executeAction(action);
        } else {
          // DAS uniquement pour moveLeft, moveRight, softDrop
          startDAS(action);
        }
        e.preventDefault();
        break;
      }
    }
  }
}

function handleKeyUp(e) {
  const key = e.key;
  keysPressed[key] = false;
  
  // Arrêter le DAS pour cette touche
  for (const [action, actionKey] of Object.entries(options.keys)) {
    if (key === actionKey) {
      stopDAS(action);
      break;
    }
  }
}

// ===========================================
// ÉCOUTEURS D'ÉVÉNEMENTS
// ===========================================

function initEventListeners() {
  // Menu Accueil
  document.getElementById('play-btn').addEventListener('click', startGame);
  
  document.getElementById('level-down').addEventListener('click', () => {
    if (gameStats.startLevel > 1) {
      gameStats.startLevel--;
      updateLevelDisplay();
    }
  });
  
  document.getElementById('level-up').addEventListener('click', () => {
    if (gameStats.startLevel < CONFIG.MAX_LEVEL) {
      gameStats.startLevel++;
      updateLevelDisplay();
    }
  });
  
  document.getElementById('settings-btn').addEventListener('click', () => {
    previousMenu = 'accueil';
    showMenu('options');
  });
  
  document.getElementById('help-btn').addEventListener('click', () => {
    previousMenu = 'accueil';
    showMenu('aide');
  });
  
  // Menu Pause
  document.getElementById('resume-btn').addEventListener('click', resumeGame);
  
  document.getElementById('pause-options-btn').addEventListener('click', () => {
    previousMenu = 'pause';
    showMenu('options');
  });
  
  document.getElementById('pause-help-btn').addEventListener('click', () => {
    previousMenu = 'pause';
    showMenu('aide');
  });
  
  document.getElementById('quit-btn').addEventListener('click', quitGame);
  
  // Menu Aide
  document.getElementById('help-done-btn').addEventListener('click', showPreviousMenu);
  
  // Menu Options
  document.getElementById('options-done-btn').addEventListener('click', showPreviousMenu);
  document.getElementById('reset-scores-btn').addEventListener('click', resetHighScores);
  document.getElementById('reset-options-btn').addEventListener('click', resetOptions);
  
  // Boutons de configuration des touches
  document.querySelectorAll('.key-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.id.replace('key-', '');
      waitingForKey = action;
      document.querySelectorAll('.key-btn').forEach(b => b.classList.remove('listening'));
      btn.classList.add('listening');
    });
  });
  
  // Boutons d'ajustement des options
  document.querySelectorAll('.adjust-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      adjustOption(btn.dataset.target, btn.dataset.dir);
    });
  });
  
  // Contrôles en jeu
  document.getElementById('pause-btn').addEventListener('click', () => {
    if (gameRunning && !gameOver) {
      if (gamePaused) {
        resumeGame();
      } else {
        pauseGame();
      }
    }
  });
  
  document.getElementById('sound-toggle').addEventListener('click', () => {
    audioMuted = !audioMuted;
    const btn = document.getElementById('sound-toggle');
    btn.textContent = audioMuted ? '🔇' : '🔊';
    btn.classList.toggle('muted', audioMuted);
  });
  
  // Clavier
  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup', handleKeyUp);
}

// ===========================================
// INITIALISATION
// ===========================================

function init() {
  canvas = document.getElementById('tetris');
  ctx = canvas.getContext('2d');

  arenaLogicalWidth = canvas.width;
  arenaLogicalHeight = canvas.height;
  const arenaPadding = getArenaPaddingPx();
  canvas.width = arenaLogicalWidth + arenaPadding * 2;
  canvas.height = arenaLogicalHeight + arenaPadding * 2;
  ctx = canvas.getContext('2d');
  
  nextCanvas = document.getElementById('next-piece');
  nextCtx = nextCanvas.getContext('2d');
  
  loadOptions();
  createArena();
  displayHighScores();
  updateDisplay();
  updateLevelDisplay();
  initEventListeners();
  
  draw();
  
  console.log('Tetris initialisé !');
}

document.addEventListener('DOMContentLoaded', init);
