/**
 * Graviton: Orbital Drift
 * Core Game Engine, Physics, Particles & Audio Synthesizer
 */

// --- AUDIO SYNTHESIZER ---
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (this.ctx) return;
    // Standard AudioContext initialization with fallback
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      this.ctx = new AudioContextClass();
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Play a UI click sound
  playClick() {
    if (!this.ctx || this.muted) return;
    this.resume();

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }

  // Play sound when entering orbit
  playLock() {
    if (!this.ctx || this.muted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.08);
    
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.08);
  }

  // Play sound when launching (slingshot)
  playSling() {
    if (!this.ctx || this.muted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(250, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.25);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  // Play sound when collecting crystal
  playCrystal() {
    if (!this.ctx || this.muted) return;
    
    const now = this.ctx.currentTime;
    
    // Play a dual-chime chord
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.03);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.15 + index * 0.03);
      
      gain.gain.setValueAtTime(0.08, now + index * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + index * 0.03);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + index * 0.03);
      osc.stop(now + 0.3);
    });
  }

  // Play sound when bouncing off wall
  playBounce() {
    if (!this.ctx || this.muted) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // Play explosion bass crash
  playCrash() {
    if (!this.ctx || this.muted) return;
    
    const now = this.ctx.currentTime;
    
    // Low frequency rumbler
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.8);
    
    // Sub bass
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.linearRampToValueAtTime(10, now + 0.6);
    
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    subGain.gain.setValueAtTime(0.5, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    
    osc.start();
    subOsc.start();
    osc.stop(now + 0.85);
    subOsc.stop(now + 0.65);
  }
}

// Instantiate Sound System
const synth = new SoundSynth();

// --- PARTICLE SYSTEM ---
class Particle {
  constructor(x, y, color, size, vx, vy, life, decay = 0.02) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.vx = vx;
    this.vy = vy;
    this.life = life; // 0.0 to 1.0
    this.decay = decay;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }

  draw(ctx, cameraY, centerY, height) {
    const screenY = centerY - (this.y - cameraY);
    if (screenY < -50 || screenY > height + 50) return;

    ctx.save();
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.shadowBlur = this.size * 2;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, screenY, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// --- GAME LOGIC ENGINE ---
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Base Resolution config for responsive coordinate scaling
    this.width = 450;
    this.height = 800;
    this.pixelRatio = 1;
    
    // Game state tracking
    this.state = GameState.MENU;
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('graviton_highscore')) || 0;
    
    // Physics & Camera constants
    this.cameraY = 0;
    this.cameraYSmooth = 0;
    this.centerY = 0; // Relative target center Y on screen
    
    // Game Entities
    this.player = null;
    this.nodes = [];
    this.crystals = [];
    this.obstacles = [];
    this.particles = [];
    this.stars = [];
    
    // Controls & Interactions
    this.isPressing = false;
    this.screenShake = 0;
    
    // Generators
    this.maxSpawnedY = 0;
    this.nodeIdCounter = 0;
    
    // Bind UI DOM Elements
    this.currentScoreEl = document.getElementById('current-score');
    this.soundBtn = document.getElementById('sound-btn');
    this.soundOnIcon = document.getElementById('sound-on-icon');
    this.soundOffIcon = document.getElementById('sound-off-icon');
    this.pauseBtn = document.getElementById('pause-btn');
    
    this.menuOverlay = document.getElementById('menu-overlay');
    this.playBtn = document.getElementById('play-btn');
    this.menuHighScoreEl = document.getElementById('menu-high-score');
    
    this.pauseOverlay = document.getElementById('pause-overlay');
    this.resumeBtn = document.getElementById('resume-btn');
    this.restartPauseBtn = document.getElementById('restart-from-pause-btn');
    
    this.gameOverOverlay = document.getElementById('game-over-overlay');
    this.restartBtn = document.getElementById('restart-btn');
    this.finalScoreEl = document.getElementById('final-score');
    this.gameOverHighScoreEl = document.getElementById('game-over-high-score');
    this.highscoreBanner = document.getElementById('highscore-banner');
    
    this.setupResponsiveness();
    this.setupEvents();
    this.generateParallaxStars();
    this.updateUI();
    
    // Initialize standard values
    this.resetGame();
    
    // Start Game Loop
    this.lastTime = 0;
    requestAnimationFrame((t) => this.loop(t));
  }

  // Handle high-dpi Canvas displays & exact styling widths
  setupResponsiveness() {
    this.pixelRatio = window.devicePixelRatio || 1;
    
    const resize = () => {
      // Calculate responsive screen boundary sizing
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Keep viewport locked to a vertical aspect ratio profile matching phone screens
      let targetW = viewportWidth;
      let targetH = viewportHeight;
      
      // Calculate canvas bounds
      this.canvas.width = targetW * this.pixelRatio;
      this.canvas.height = targetH * this.pixelRatio;
      
      this.ctx.scale(this.pixelRatio, this.pixelRatio);
      
      // Adapt internal coordinate space based on physical screen dimensions
      this.width = targetW;
      this.height = targetH;
      this.centerY = this.height * 0.65; // Place player low-middle screen
      
      // Regen layout stars if screen resized significantly
      if (this.stars.length === 0) {
        this.generateParallaxStars();
      }
    };
    
    window.addEventListener('resize', resize);
    resize();
  }

  // Set up all interactive event listeners (mouse & touch)
  setupEvents() {
    const press = (e) => {
      e.preventDefault();
      
      // Initialize synth audio context on first user interaction
      synth.resume();
      
      if (this.state !== GameState.PLAYING) return;
      
      this.isPressing = true;
      this.lockToNearestNode();
    };

    const release = (e) => {
      e.preventDefault();
      if (this.state !== GameState.PLAYING) return;
      
      this.isPressing = false;
      this.releaseSlingshot();
    };

    // Apply interaction to window elements to capture quick movements
    window.addEventListener('mousedown', press, { passive: false });
    window.addEventListener('mouseup', release, { passive: false });
    window.addEventListener('touchstart', press, { passive: false });
    window.addEventListener('touchend', release, { passive: false });

    // UI Buttons Binding
    this.playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      synth.playClick();
      this.startGame();
    });

    this.restartBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      synth.playClick();
      this.resetGame();
      this.startGame();
    });

    this.resumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      synth.playClick();
      this.togglePause();
    });

    this.restartPauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      synth.playClick();
      this.togglePause();
      this.resetGame();
      this.startGame();
    });

    this.pauseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      synth.playClick();
      this.togglePause();
    });

    this.soundBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isMuted = synth.toggleMute();
      this.soundOnIcon.classList.toggle('hidden', isMuted);
      this.soundOffIcon.classList.toggle('hidden', !isMuted);
      
      // Visual Feedback click if not muted
      if (!isMuted) {
        synth.playClick();
      }
    });
  }

  generateParallaxStars() {
    this.stars = [];
    const count = 120;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height * 2, // Double height for vertical wraps
        size: Math.random() * 1.5 + 0.5,
        parallax: Math.random() * 0.4 + 0.1, // speed factor
        opacity: Math.random() * 0.6 + 0.2
      });
    }
  }

  updateUI() {
    this.menuHighScoreEl.textContent = this.formatScore(this.highScore);
    this.gameOverHighScoreEl.textContent = this.formatScore(this.highScore);
  }

  formatScore(score) {
    return String(Math.floor(score)).padStart(4, '0');
  }

  resetGame() {
    this.score = 0;
    this.cameraY = 0;
    this.cameraYSmooth = 0;
    this.isPressing = false;
    this.screenShake = 0;
    this.maxSpawnedY = 0;
    this.nodeIdCounter = 0;
    
    // Clear Entity Pools
    this.nodes = [];
    this.crystals = [];
    this.obstacles = [];
    this.particles = [];
    
    // Initialize Player at bottom center
    this.player = {
      x: this.width / 2,
      y: 150,
      radius: 10,
      vx: 0,
      vy: 1.5, // Slow initial hover upward
      speed: 6.5,
      trail: [],
      
      // Orbit states
      orbitNode: null,
      orbitAngle: 0,
      orbitRadius: 0,
      orbitSpeed: 0.06, // Angular speed
      orbitDirection: 1 // 1 for CCW, -1 for CW
    };
    
    // Spawn baseline starting platform node (completely safe anchor)
    const startNode = {
      id: this.nodeIdCounter++,
      x: this.width / 2,
      y: 150,
      radius: 35,
      glowColor: '#00f2fe',
      pulseSpeed: 0.02,
      pulseValue: 0
    };
    this.nodes.push(startNode);
    this.player.orbitNode = startNode;
    this.player.orbitRadius = 75;
    this.player.orbitAngle = Math.PI / 2;
    this.player.orbitSpeed = 0.055;
    
    this.maxSpawnedY = 150;
    
    // Seed initial nodes immediately
    this.generateWorld(true);
    
    // Reset HUD display
    this.currentScoreEl.textContent = "0000";
    this.currentScoreEl.style.color = "var(--neon-blue)";
  }

  startGame() {
    this.state = GameState.PLAYING;
    
    // Toggle overlays
    this.menuOverlay.classList.remove('active');
    this.gameOverOverlay.classList.remove('active');
    document.getElementById('game-hud').classList.remove('hidden');
  }

  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      this.pauseOverlay.classList.add('active');
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this.pauseOverlay.classList.remove('active');
    }
  }

  triggerGameOver() {
    this.state = GameState.GAMEOVER;
    this.screenShake = 15;
    synth.playCrash();
    
    // Spawn rich death particle burst
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push(new Particle(
        this.player.x,
        this.player.y,
        Math.random() > 0.4 ? 'var(--neon-blue)' : 'var(--neon-pink)',
        Math.random() * 4 + 2,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        1.0,
        Math.random() * 0.015 + 0.01
      ));
    }
    
    // Update Score state
    const currentFinal = Math.floor(this.score);
    this.finalScoreEl.textContent = this.formatScore(currentFinal);
    
    if (currentFinal > this.highScore) {
      this.highScore = currentFinal;
      localStorage.setItem('graviton_highscore', this.highScore);
      this.highscoreBanner.classList.remove('hidden');
      this.finalScoreEl.classList.add('highlight');
      this.finalScoreEl.style.color = 'var(--neon-gold)';
    } else {
      this.highscoreBanner.classList.add('hidden');
      this.finalScoreEl.classList.remove('highlight');
      this.finalScoreEl.style.color = 'var(--neon-blue)';
    }
    
    this.updateUI();
    
    // Display screen
    this.gameOverOverlay.classList.add('active');
    document.getElementById('game-hud').classList.add('hidden');
  }

  // --- PROCEDURAL WORLD GENERATOR ---
  generateWorld(initial = false) {
    const spawnThreshold = this.player.y + this.height * 1.5;
    
    while (this.maxSpawnedY < spawnThreshold) {
      // Set adaptive vertical intervals (gets slightly tighter/tougher as score rises)
      const diffMultiplier = Math.min(1.5, 1 + this.score / 2000);
      const verticalGap = (Math.random() * 120 + 220) / diffMultiplier;
      
      this.maxSpawnedY += verticalGap;
      
      // Coordinate horizontal boundaries safely
      const padding = 60;
      const nodeX = Math.random() * (this.width - padding * 2) + padding;
      
      // Determine neon aesthetic
      const neonColors = ['#00f2fe', '#9b51e0', '#ff007f', '#ffd700'];
      const chosenColor = neonColors[Math.floor(Math.random() * neonColors.length)];
      
      // Create node
      const nodeRadius = Math.random() * 12 + 18;
      const node = {
        id: this.nodeIdCounter++,
        x: nodeX,
        y: this.maxSpawnedY,
        radius: nodeRadius,
        glowColor: chosenColor,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseValue: Math.random() * Math.PI,
        // Gravity field radius
        fieldRadius: nodeRadius * 3.8
      };
      
      this.nodes.push(node);
      
      // Spawn Crystals around the node
      const crystalChance = 0.85;
      if (Math.random() < crystalChance) {
        const count = Math.random() > 0.6 ? 2 : 1;
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = node.radius + Math.random() * 40 + 25;
          this.crystals.push({
            x: node.x + Math.cos(angle) * dist,
            y: node.y + Math.sin(angle) * dist,
            radius: 6,
            collected: false,
            pulseOffset: Math.random() * 10
          });
        }
      }
      
      // Spawn Space Debris / Obstacles (Avoid starting zone)
      if (!initial && this.score > 100) {
        const obstacleChance = Math.min(0.65, 0.2 + this.score / 1500);
        if (Math.random() < obstacleChance) {
          // Put obstacle in between nodes
          const obsX = Math.random() * (this.width - 80) + 40;
          const obsY = node.y - verticalGap / 2 + (Math.random() * 40 - 20);
          
          this.obstacles.push({
            x: obsX,
            y: obsY,
            radius: Math.random() * 8 + 10,
            vx: (Math.random() * 2 - 1) * (1 + this.score / 1000),
            vy: (Math.random() * 0.4 - 0.2),
            pulseOffset: Math.random() * 100
          });
        }
      }
    }
    
    // Garbage collection of entities that passed below screen
    const despawnBuffer = 300;
    this.nodes = this.nodes.filter(n => n.y > this.player.y - despawnBuffer || n.id === (this.player.orbitNode?.id));
    this.crystals = this.crystals.filter(c => c.y > this.player.y - despawnBuffer);
    this.obstacles = this.obstacles.filter(o => o.y > this.player.y - despawnBuffer);
  }

  // --- CORE GAME PHYSICS ENGINE ---
  lockToNearestNode() {
    let closestNode = null;
    let minDistance = Infinity;
    
    // Look for node within reach range
    this.nodes.forEach(node => {
      const dx = this.player.x - node.x;
      const dy = this.player.y - node.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist < node.fieldRadius && dist < minDistance) {
        minDistance = dist;
        closestNode = node;
      }
    });
    
    if (closestNode) {
      this.player.orbitNode = closestNode;
      const dx = this.player.x - closestNode.x;
      const dy = this.player.y - closestNode.y;
      
      this.player.orbitRadius = Math.max(closestNode.radius + 15, Math.min(closestNode.fieldRadius * 0.9, minDistance));
      this.player.orbitAngle = Math.atan2(dy, dx);
      
      // Calculate seamless rotation direction using cross product (position cross velocity)
      // Tangent vector
      const tx = -Math.sin(this.player.orbitAngle);
      const ty = Math.cos(this.player.orbitAngle);
      // Dot product with velocity
      const dot = this.player.vx * tx + this.player.vy * ty;
      
      this.player.orbitDirection = dot >= 0 ? 1 : -1;
      
      // Lock orbit speed matching absolute tangent speed
      const playerSpeed = Math.hypot(this.player.vx, this.player.vy);
      this.player.orbitSpeed = Math.max(0.04, Math.min(0.095, playerSpeed / this.player.orbitRadius));
      
      synth.playLock();
      
      // Orbit transition sparks
      for (let i = 0; i < 8; i++) {
        const spAngle = this.player.orbitAngle + Math.PI/2 * this.player.orbitDirection + (Math.random() * 0.5 - 0.25);
        this.particles.push(new Particle(
          this.player.x,
          this.player.y,
          '#fff',
          Math.random() * 2 + 1,
          Math.cos(spAngle) * 3,
          Math.sin(spAngle) * 3,
          0.8,
          0.04
        ));
      }
    }
  }

  releaseSlingshot() {
    if (!this.player.orbitNode) return;
    
    // Calculate tangent velocity vectors on release
    const speed = this.player.orbitRadius * this.player.orbitSpeed;
    
    // Perpendicular vector to radius
    this.player.vx = -Math.sin(this.player.orbitAngle) * speed * this.player.orbitDirection;
    this.player.vy = Math.cos(this.player.orbitAngle) * speed * this.player.orbitDirection;
    
    this.player.orbitNode = null;
    
    synth.playSling();
    
    // Blast trail particles
    const blastAngle = Math.atan2(this.player.vy, this.player.vx) + Math.PI; // back direction
    for (let i = 0; i < 15; i++) {
      const spreadAngle = blastAngle + (Math.random() * 0.6 - 0.3);
      const blastSpeed = Math.random() * 5 + 2;
      this.particles.push(new Particle(
        this.player.x,
        this.player.y,
        'var(--neon-blue)',
        Math.random() * 3 + 1.5,
        Math.cos(spreadAngle) * blastSpeed,
        Math.sin(spreadAngle) * blastSpeed,
        0.9,
        0.03
      ));
    }
  }

  update(dt) {
    if (this.state !== GameState.PLAYING) return;
    
    // Handle Screen Shake dampening
    if (this.screenShake > 0) {
      this.screenShake -= 0.6;
      if (this.screenShake < 0) this.screenShake = 0;
    }
    
    // --- PLAYER MOVEMENT ---
    if (this.player.orbitNode) {
      // Orbit Math
      const node = this.player.orbitNode;
      this.player.orbitAngle += this.player.orbitSpeed * this.player.orbitDirection * dt;
      
      this.player.x = node.x + Math.cos(this.player.orbitAngle) * this.player.orbitRadius;
      this.player.y = node.y + Math.sin(this.player.orbitAngle) * this.player.orbitRadius;
      
      // Keep velocity updated for visual rendering/engine trails
      this.player.vx = -Math.sin(this.player.orbitAngle) * (this.player.orbitRadius * this.player.orbitSpeed) * this.player.orbitDirection;
      this.player.vy = Math.cos(this.player.orbitAngle) * (this.player.orbitRadius * this.player.orbitSpeed) * this.player.orbitDirection;
    } else {
      // Normal flight
      this.player.x += this.player.vx * dt;
      this.player.y += this.player.vy * dt;
      
      // Visual drag / gravity pull simulation slightly downwards
      this.player.vy -= 0.03 * dt;
    }
    
    // Wall Bouncing
    const bounceFactor = 0.75;
    if (this.player.x < this.player.radius) {
      this.player.x = this.player.radius;
      this.player.vx = -this.player.vx * bounceFactor;
      this.triggerWallBounceEffect(true);
    } else if (this.player.x > this.width - this.player.radius) {
      this.player.x = this.width - this.player.radius;
      this.player.vx = -this.player.vx * bounceFactor;
      this.triggerWallBounceEffect(false);
    }
    
    // Camera follow (Lerp smoothly)
    // Camera centers vertically below the player to let players see what's coming up
    const targetCameraY = this.player.y - 120;
    this.cameraY += (targetCameraY - this.cameraY) * 0.1 * dt;
    
    // Score updates based on max height achieved
    if (this.player.y > this.score) {
      this.score = this.player.y;
      this.currentScoreEl.textContent = this.formatScore(this.score);
    }
    
    // Fall below screen bounds = Game Over
    const screenBottomY = this.cameraY - (this.height - this.centerY);
    if (this.player.y < screenBottomY - 100) {
      this.triggerGameOver();
    }
    
    // --- DEBRIS MOVEMENT & INTERPOLATION ---
    this.obstacles.forEach(obs => {
      obs.x += obs.vx * dt;
      obs.y += obs.vy * dt;
      
      // Wrap around walls
      if (obs.x < -obs.radius) obs.x = this.width + obs.radius;
      if (obs.x > this.width + obs.radius) obs.x = -obs.radius;
      
      // Collision with player
      const dist = Math.hypot(this.player.x - obs.x, this.player.y - obs.y);
      if (dist < this.player.radius + obs.radius) {
        this.triggerGameOver();
      }
    });
    
    // --- CRYSTAL COLLECTION CHECK ---
    this.crystals.forEach(c => {
      if (c.collected) return;
      
      const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
      if (dist < this.player.radius + c.radius) {
        c.collected = true;
        this.score += 50; // Big bonus points
        this.currentScoreEl.textContent = this.formatScore(this.score);
        
        // Glow golden color feedback
        this.currentScoreEl.style.color = "var(--neon-gold)";
        setTimeout(() => {
          if (this.state === GameState.PLAYING) {
            this.currentScoreEl.style.color = "var(--neon-blue)";
          }
        }, 300);
        
        synth.playCrystal();
        
        // Spawn chime collection particles
        for (let i = 0; i < 12; i++) {
          const pAngle = Math.random() * Math.PI * 2;
          const pSpeed = Math.random() * 4 + 1.5;
          this.particles.push(new Particle(
            c.x,
            c.y,
            'var(--neon-gold)',
            Math.random() * 3 + 1.5,
            Math.cos(pAngle) * pSpeed,
            Math.sin(pAngle) * pSpeed,
            1.0,
            0.035
          ));
        }
      }
    });
    
    // --- GENERATE FURTHER WORLD ON THE FLY ---
    this.generateWorld();
    
    // --- PARTICLE EMIT & DECAY ---
    // Player movement trails
    if (Math.random() < 0.7) {
      const offsetAngle = Math.atan2(this.player.vy, this.player.vx) + Math.PI;
      this.particles.push(new Particle(
        this.player.x + (Math.random() * 6 - 3),
        this.player.y + (Math.random() * 6 - 3),
        this.player.orbitNode ? 'var(--neon-purple)' : 'var(--neon-blue)',
        Math.random() * 3.2 + 1,
        Math.cos(offsetAngle) * 1.5 + (Math.random() * 0.4 - 0.2),
        Math.sin(offsetAngle) * 1.5 + (Math.random() * 0.4 - 0.2),
        0.8,
        0.02
      ));
    }
    
    // Update active particles
    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => p.life > 0);
  }

  triggerWallBounceEffect(isLeftWall) {
    this.screenShake = 5;
    synth.playBounce();
    
    // Spawn spark particles on wall
    const wallX = isLeftWall ? 0 : this.width;
    const sparkDirection = isLeftWall ? 1 : -1;
    
    for (let i = 0; i < 10; i++) {
      const angle = (Math.random() * Math.PI/2 - Math.PI/4) + (isLeftWall ? 0 : Math.PI);
      const speed = Math.random() * 5 + 2;
      this.particles.push(new Particle(
        wallX,
        this.player.y,
        'var(--neon-pink)',
        Math.random() * 2.5 + 1,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        0.8,
        0.035
      ));
    }
  }

  // --- RENDERING ROUTINES ---
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply camera translating logic
    this.ctx.save();
    
    // Implement screen shake wrapping
    if (this.screenShake > 0) {
      const dx = (Math.random() * 2 - 1) * this.screenShake;
      const dy = (Math.random() * 2 - 1) * this.screenShake;
      this.ctx.translate(dx, dy);
    }
    
    // Draw Space Background stars first (Static with Parallax)
    this.drawStars();
    
    // Draw Gravity Field rings (Dotted neon guides)
    this.nodes.forEach(node => {
      this.drawNodeGravityField(node);
    });
    
    // Draw Crystals
    this.crystals.forEach(c => {
      if (!c.collected) {
        this.drawCrystal(c);
      }
    });
    
    // Draw Space Debris Obstacles
    this.obstacles.forEach(obs => {
      this.drawObstacle(obs);
    });
    
    // Draw Active Particles
    this.particles.forEach(p => {
      p.draw(this.ctx, this.cameraY, this.centerY, this.height);
    });
    
    // Draw Orbital node cores (Planets)
    this.nodes.forEach(node => {
      this.drawNodeCore(node);
    });
    
    // Draw Player Orb
    this.drawPlayer();
    
    this.ctx.restore();
  }

  drawStars() {
    this.ctx.save();
    this.stars.forEach(star => {
      // Calculate slow vertical scrolling parallax
      let scY = star.y - (this.cameraY * star.parallax);
      
      // Vertical Infinite Wrap
      const border = this.height * 2;
      scY = ((scY % border) + border) % border;
      
      // Draw star dots
      this.ctx.fillStyle = `rgba(245, 246, 250, ${star.opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(star.x, scY - this.height, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.restore();
  }

  drawNodeGravityField(node) {
    const screenY = this.centerY - (node.y - this.cameraY);
    if (screenY < -150 || screenY > this.height + 150) return;
    
    this.ctx.save();
    
    // Glow influence boundary line
    const isPlayerTarget = this.player.orbitNode?.id === node.id;
    this.ctx.strokeStyle = isPlayerTarget ? 'var(--neon-blue)' : node.glowColor;
    this.ctx.globalAlpha = isPlayerTarget ? 0.35 : 0.08;
    this.ctx.lineWidth = isPlayerTarget ? 2 : 1;
    this.ctx.setLineDash([6, 8]);
    
    this.ctx.beginPath();
    this.ctx.arc(node.x, screenY, node.fieldRadius, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Draw lock-on indicator line to connected node
    if (isPlayerTarget) {
      this.ctx.beginPath();
      this.ctx.moveTo(node.x, screenY);
      const pScreenY = this.centerY - (this.player.y - this.cameraY);
      this.ctx.lineTo(this.player.x, pScreenY);
      this.ctx.strokeStyle = 'var(--neon-blue)';
      this.ctx.globalAlpha = 0.15;
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawNodeCore(node) {
    const screenY = this.centerY - (node.y - this.cameraY);
    if (screenY < -80 || screenY > this.height + 80) return;
    
    // Update node pulses
    node.pulseValue += node.pulseSpeed;
    const dynamicRad = node.radius + Math.sin(node.pulseValue) * 2.2;
    
    this.ctx.save();
    
    // Outer shadow glow
    this.ctx.shadowBlur = 18;
    this.ctx.shadowColor = node.glowColor;
    
    // Orbit node boundary base
    const grad = this.ctx.createRadialGradient(node.x, screenY, node.radius * 0.1, node.x, screenY, dynamicRad);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.35, node.glowColor);
    grad.addColorStop(1, 'rgba(11, 12, 16, 0.9)');
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(node.x, screenY, dynamicRad, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Subtle white inner ring overlay
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
    this.ctx.beginPath();
    this.ctx.arc(node.x, screenY, node.radius * 0.65, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.restore();
  }

  drawCrystal(c) {
    const screenY = this.centerY - (c.y - this.cameraY);
    if (screenY < -30 || screenY > this.height + 30) return;
    
    c.pulseOffset += 0.08;
    const hoverOffset = Math.sin(c.pulseOffset) * 3;
    
    this.ctx.save();
    this.ctx.shadowBlur = 12;
    this.ctx.shadowColor = 'var(--neon-gold)';
    this.ctx.fillStyle = 'var(--neon-gold)';
    
    // Render dynamic glowing rhombus/diamond crystal shape
    const cx = c.x;
    const cy = screenY + hoverOffset;
    const size = c.radius;
    
    this.ctx.beginPath();
    this.ctx.moveTo(cx, cy - size * 1.5);
    this.ctx.lineTo(cx + size, cy);
    this.ctx.lineTo(cx, cy + size * 1.5);
    this.ctx.lineTo(cx - size, cy);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Sparkly center
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawObstacle(obs) {
    const screenY = this.centerY - (obs.y - this.cameraY);
    if (screenY < -50 || screenY > this.height + 50) return;
    
    obs.pulseOffset += 0.05;
    const pulseRad = obs.radius + Math.sin(obs.pulseOffset) * 1.5;
    
    this.ctx.save();
    this.ctx.shadowBlur = 14;
    this.ctx.shadowColor = 'var(--neon-pink)';
    
    // Draw spiky hazard rocks
    this.ctx.strokeStyle = 'var(--neon-pink)';
    this.ctx.lineWidth = 2.5;
    this.ctx.fillStyle = '#140c15';
    
    const points = 7;
    this.ctx.beginPath();
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2 + obs.pulseOffset * 0.1;
      const modRad = pulseRad + (i % 2 === 0 ? 3 : -3);
      const px = obs.x + Math.cos(angle) * modRad;
      const py = screenY + Math.sin(angle) * modRad;
      if (i === 0) {
        this.ctx.moveTo(px, py);
      } else {
        this.ctx.lineTo(px, py);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw high energy pulsing danger core
    this.ctx.fillStyle = '#fff';
    this.ctx.beginPath();
    this.ctx.arc(obs.x, screenY, pulseRad * 0.3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  drawPlayer() {
    if (this.state === GameState.GAMEOVER) return;
    
    const screenY = this.centerY - (this.player.y - this.cameraY);
    
    this.ctx.save();
    
    // Apply intense shadow blur glow effect
    this.ctx.shadowBlur = 20;
    
    const activeColor = this.player.orbitNode ? 'var(--neon-purple)' : 'var(--neon-blue)';
    this.ctx.shadowColor = activeColor;
    
    // Draw outer core gradient
    const grad = this.ctx.createRadialGradient(
      this.player.x, screenY, this.player.radius * 0.1,
      this.player.x, screenY, this.player.radius * 1.4
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.4, activeColor);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, screenY, this.player.radius * 1.4, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Inner white sharp orb
    this.ctx.fillStyle = '#ffffff';
    this.ctx.beginPath();
    this.ctx.arc(this.player.x, screenY, this.player.radius * 0.7, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  // --- CORE SYSTEM LOOP ---
  loop(time) {
    if (!this.lastTime) this.lastTime = time;
    
    // Calculate delta time capped to normal frames
    let dt = (time - this.lastTime) / 16.666;
    if (dt > 4) dt = 4; // Avoid physics explosion on tab hibernation
    
    this.lastTime = time;
    
    this.update(dt);
    this.draw();
    
    requestAnimationFrame((t) => this.loop(t));
  }
}

// Launch Game on load
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
