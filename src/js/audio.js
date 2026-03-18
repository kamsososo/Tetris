/* ========================================
   TETRIS - Gestionnaire Audio
   Gère les effets sonores et la musique
   ======================================== */

class AudioManager {
  constructor() {
    this.sounds = {};
    this.music = {};
    this.currentMusic = null;
    this.sfxVolume = 0.5;
    this.musicVolume = 0.5;
    this.muted = false;
    
    // Chemins des fichiers audio (à fournir)
    this.soundPaths = {
      rotate: 'audio/rotate.mp3',
      drop: 'audio/drop.mp3',
      clear: 'audio/clear.mp3',
      tetris: 'audio/tetris.mp3',
      levelUp: 'audio/levelup.mp3',
      gameOver: 'audio/game over.mp3'
    };
    
    this.musicPaths = {
      1: 'audio/music1.mp3',
      2: 'audio/music2.mp3',
    };
  }

  /**
   * Charge tous les sons
   */
  async loadSounds() {
    for (const [name, path] of Object.entries(this.soundPaths)) {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds[name] = audio;
      } catch (e) {
        console.warn(`Impossible de charger le son: ${path}`);
      }
    }
    
    for (const [type, path] of Object.entries(this.musicPaths)) {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        audio.loop = true;
        this.music[type] = audio;
      } catch (e) {
        console.warn(`Impossible de charger la musique: ${path}`);
      }
    }
  }

  /**
   * Joue un effet sonore
   */
  play(soundName) {
    if (this.muted || this.sfxVolume === 0) return;
    
    const sound = this.sounds[soundName];
    if (sound) {
      // Clone pour permettre plusieurs sons simultanés
      const clone = sound.cloneNode();
      clone.volume = this.sfxVolume;
      clone.play().catch(() => {});
    }
  }

  /**
   * Démarre la musique
   */
  playMusic(type = 1) {
    this.stopMusic();
    
    if (this.muted || this.musicVolume === 0) return;
    
    const music = this.music[type];
    if (music) {
      music.volume = this.musicVolume;
      music.currentTime = 0;
      music.play().catch(() => {});
      this.currentMusic = music;
    }
  }

  /**
   * Arrête la musique
   */
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic.currentTime = 0;
      this.currentMusic = null;
    }
  }

  /**
   * Met en pause/reprend la musique
   */
  toggleMusicPause(paused) {
    if (this.currentMusic) {
      if (paused) {
        this.currentMusic.pause();
      } else {
        this.currentMusic.play().catch(() => {});
      }
    }
  }

  /**
   * Active/désactive le son
   */
  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopMusic();
    }
    return this.muted;
  }

  /**
   * Définit le volume des effets sonores (0-100)
   */
  setSfxVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(100, volume)) / 100;
  }

  /**
   * Définit le volume de la musique (0-100)
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(100, volume)) / 100;
    if (this.currentMusic) {
      this.currentMusic.volume = this.musicVolume;
    }
  }
}

// Instance globale
const audioManager = new AudioManager();
