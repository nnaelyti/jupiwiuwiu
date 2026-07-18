/* ============================================================
   UNLOCK MY HEART — SCRIPT.JS
   Modular vanilla JS. Sections are numbered and commented.
   ============================================================ */

'use strict';

/* ============================================================
   0. CONFIG — edit these to customize the experience
   ============================================================ */
const CONFIG = {
  audio: {
    music:   'assets/music.mp3',
    click:   'assets/click.mp3',
    success: 'assets/success.mp3'
  },
  finalLetter:
`Aku tahu kamu suka main.

Dan aku nggak pernah minta kamu berhenti melakukan hal yang kamu suka.

Aku cuma berharap...

di sela-sela waktu luangmu,

ada sedikit waktu yang bisa kamu luangin buat aku.

Karena buat aku,

sesederhana ngobrol beberapa menit sama kamu,

itu udah bikin hariku terasa jauh lebih indah.

Kalau nanti kamu lagi free,

boleh ya kita habisin sedikit waktu bareng?

❤️`,
  totalLevels: 5
};

/* ============================================================
   1. SCREEN MANAGER
   ============================================================ */
const ScreenManager = (() => {
  let current = null;

  function show(id, { instant = false } = {}) {
    const next = document.getElementById(id);
    if (!next) return;
    const prev = current;

    if (prev && prev !== next) {
      if (instant || typeof gsap === 'undefined') {
        prev.classList.remove('active');
        next.classList.add('active');
      } else {
        gsap.to(prev, {
          opacity: 0, duration: 0.5, ease: 'power2.inOut',
          onComplete: () => {
            prev.classList.remove('active');
            prev.style.opacity = '';
            next.classList.add('active');
            gsap.fromTo(next, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
          }
        });
      }
    } else {
      next.classList.add('active');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(next, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' });
      }
    }
    current = next;
  }

  return { show };
})();

/* ============================================================
   2. AUDIO MANAGER (Howler.js)
   ============================================================ */
const AudioManager = (() => {
  let music, sfxClick, sfxSuccess;
  let ready = false;

  function init() {
    if (typeof Howl === 'undefined') return;
    music = new Howl({ src: [CONFIG.audio.music], loop: true, volume: 0 });
    sfxClick = new Howl({ src: [CONFIG.audio.click], volume: 0.35 });
    sfxSuccess = new Howl({ src: [CONFIG.audio.success], volume: 0.4 });
    ready = true;
  }

  function playMusic() {
    if (!ready || !music) return;
    music.play();
    music.fade(0, 0.45, 1800); // fade in on start
  }

  function click() { if (ready) sfxClick && sfxClick.play(); }
  function success() { if (ready) sfxSuccess && sfxSuccess.play(); }
  // Wrong / level-complete / reveal reuse click & success softly to keep the
  // asset list small; swap in dedicated files under assets/ if you have them.
  function wrong() { click(); }
  function levelComplete() { success(); }
  function reveal() { success(); }

  function setVolume(v) { if (music) music.volume(v); }
  function toggleMute() {
    if (!music) return false;
    const muted = !music.mute();
    music.mute(muted);
    return muted;
  }
  function togglePlay() {
    if (!music) return;
    if (music.playing()) music.pause(); else music.play();
  }
  function getMusic() { return music; }

  return { init, playMusic, click, success, wrong, levelComplete, reveal, setVolume, toggleMute, togglePlay, getMusic };
})();

/* ============================================================
   3. BACKGROUND — GALAXY CANVAS (stars + shooting stars + parallax)
   ============================================================ */
const Galaxy = (() => {
  let canvas, ctx, stars = [], w, h;
  let mouseX = 0, mouseY = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function makeStars(count) {
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3,
        tw: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.4 + 0.1
      });
    }
  }

  let shootingStar = null;
  function maybeSpawnShootingStar() {
    if (shootingStar || Math.random() > 0.003) return;
    shootingStar = {
      x: Math.random() * w * 0.6,
      y: Math.random() * h * 0.3,
      vx: 8 + Math.random() * 6,
      vy: 4 + Math.random() * 3,
      life: 1
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const parallaxX = (mouseX - w / 2) / w;
    const parallaxY = (mouseY - h / 2) / h;

    stars.forEach(s => {
      s.tw += s.speed * 0.02;
      const alpha = 0.4 + Math.sin(s.tw) * 0.4;
      ctx.beginPath();
      ctx.fillStyle = `rgba(244,240,255,${Math.max(0, alpha)})`;
      ctx.arc(s.x + parallaxX * 18, s.y + parallaxY * 18, s.r, 0, Math.PI * 2);
      ctx.fill();
    });

    maybeSpawnShootingStar();
    if (shootingStar) {
      const s = shootingStar;
      const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 8, s.y - s.vy * 8);
      grad.addColorStop(0, 'rgba(255,255,255,0.9)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
      ctx.stroke();
      s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      if (s.life <= 0 || s.x > w || s.y > h) shootingStar = null;
    }
    requestAnimationFrame(draw);
  }

  function init() {
    canvas = document.getElementById('galaxy-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    resize();
    makeStars(Math.min(160, Math.floor((w * h) / 9000)));
    window.addEventListener('resize', () => { resize(); makeStars(Math.min(160, Math.floor((w * h) / 9000))); });
    window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    requestAnimationFrame(draw);
  }

  return { init };
})();

/* ============================================================
   4. PARTICLES.JS INIT (floating ambient particles)
   ============================================================ */
function initParticles() {
  if (typeof particlesJS === 'undefined') return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 45, density: { enable: true, value_area: 900 } },
      color: { value: ['#ec4899', '#22d3ee', '#7c3aed', '#ffcf6b'] },
      shape: { type: 'circle' },
      opacity: { value: 0.35, random: true },
      size: { value: 2.4, random: true },
      line_linked: { enable: false },
      move: { enable: true, speed: 0.5, direction: 'top', random: true, straight: false, out_mode: 'out' }
    },
    interactivity: {
      detect_on: 'window',
      events: { onhover: { enable: true, mode: 'repulse' }, resize: true },
      modes: { repulse: { distance: 60, duration: 0.4 } }
    },
    retina_detect: true
  });
}

/* ============================================================
   5. CURSOR GLOW + MOUSE TRAIL + RIPPLE
   ============================================================ */
const CursorFX = (() => {
  let glow, trailCanvas, tctx, trail = [];

  function initGlow() {
    glow = document.getElementById('cursor-glow');
    window.addEventListener('mousemove', e => {
      if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
      trail.push({ x: e.clientX, y: e.clientY, life: 1 });
    });
    window.addEventListener('mouseleave', () => { if (glow) glow.style.opacity = 0; });
    window.addEventListener('mouseenter', () => { if (glow) glow.style.opacity = 1; });
  }

  function initTrail() {
    trailCanvas = document.getElementById('trail-canvas');
    if (!trailCanvas) return;
    tctx = trailCanvas.getContext('2d');
    const resize = () => { trailCanvas.width = window.innerWidth; trailCanvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    function loop() {
      tctx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trail = trail.filter(p => p.life > 0);
      trail.forEach(p => {
        tctx.beginPath();
        tctx.fillStyle = `rgba(255,93,143,${p.life * 0.5})`;
        tctx.arc(p.x, p.y, 3 * p.life, 0, Math.PI * 2);
        tctx.fill();
        p.life -= 0.045;
      });
      if (trail.length > 40) trail.splice(0, trail.length - 40);
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  function initRipple() {
    document.addEventListener('click', e => {
      const r = document.createElement('div');
      r.className = 'ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 650);
    });
  }

  function init() { initGlow(); initTrail(); initRipple(); }
  return { init };
})();

/* ============================================================
   6. SOUND + HOVER BINDING HELPER
   ============================================================ */
function bindSoundToButtons() {
  document.querySelectorAll('.btn, .option-btn, .memory-tile, .puzzle-piece').forEach(el => {
    el.addEventListener('mouseenter', () => AudioManager.click && AudioManager.click());
  });
}

/* ============================================================
   7. BOOT SEQUENCE (terminal typing + progress + locked message)
   ============================================================ */
function runBootSequence() {
  const log = document.getElementById('boot-log');
  const fill = document.getElementById('boot-progress-fill');
  const label = document.getElementById('boot-progress-label');
  const lockedMsg = document.getElementById('boot-locked-msg');
  const lines = ['Initializing...', 'Loading Memories...', 'Please Wait...'];
  let lineIndex = 0, charIndex = 0;

  function typeNextChar() {
    if (lineIndex >= lines.length) {
      animateProgress();
      return;
    }
    const line = lines[lineIndex];
    if (charIndex <= line.length) {
      const typedSoFar = lines.slice(0, lineIndex).join('\n') +
        (lineIndex > 0 ? '\n' : '') + line.slice(0, charIndex);
      log.textContent = typedSoFar;
      charIndex++;
      setTimeout(typeNextChar, 28);
    } else {
      lineIndex++; charIndex = 0;
      setTimeout(typeNextChar, 260);
    }
  }

  function animateProgress() {
    let pct = 0;
    const timer = setInterval(() => {
      pct += Math.random() * 14 + 6;
      if (pct >= 100) { pct = 100; clearInterval(timer); setTimeout(showLocked, 400); }
      fill.style.width = pct + '%';
      label.textContent = Math.floor(pct) + '%';
    }, 160);
  }

  function showLocked() {
    lockedMsg.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(lockedMsg, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
  }

  typeNextChar();
}

/* ============================================================
   8. LEVEL MANAGER
   ============================================================ */
const LevelManager = (() => {
  let level = 1;

  function updateProgressBar() {
    const pct = ((level - 1) / CONFIG.totalLevels) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('level-label').textContent = `Level ${level} / ${CONFIG.totalLevels}`;
  }

  function showLevel(n) {
    document.querySelectorAll('.level-panel').forEach(p => p.classList.add('hidden'));
    const panel = document.getElementById('level-' + n);
    panel.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(panel, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.out' });
    }
    updateProgressBar();

    // kick off level-specific init
    if (n === 2) MemoryGame.start();
    if (n === 4) SlidePuzzle.start();
    if (n === 5) QuickChallenge.reset();
  }

  function next() {
    AudioManager.levelComplete();
    level++;
    if (level > CONFIG.totalLevels) {
      document.getElementById('progress-fill').style.width = '100%';
      document.getElementById('level-label').textContent = `Level ${CONFIG.totalLevels} / ${CONFIG.totalLevels}`;
      setTimeout(() => DecryptSequence.start(), 900);
    } else {
      showLevel(level);
    }
  }

  function reset() { level = 1; }

  return { showLevel, next, reset, current: () => level };
})();

/* ============================================================
   9. LEVEL 1 — QUIZ
   ============================================================ */
function initQuizLevel() {
  const buttons = document.querySelectorAll('#quiz-options .option-btn');
  const feedback = document.getElementById('quiz-feedback');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.answer === 'true';
      if (correct) {
        btn.classList.add('correct');
        feedback.textContent = 'Betul! Waktu emang yang paling berharga. ✨';
        feedback.style.color = 'var(--neon-cyan)';
        buttons.forEach(b => b.disabled = true);
        setTimeout(() => LevelManager.next(), 900);
      } else {
        btn.classList.add('wrong');
        AudioManager.wrong();
        feedback.textContent = 'Hmm, coba lagi deh~ 😅';
        feedback.style.color = 'var(--heart-pink)';
        setTimeout(() => btn.classList.remove('wrong'), 500);
      }
    });
  });
}

/* ============================================================
   10. LEVEL 2 — MEMORY GAME
   ============================================================ */
const MemoryGame = (() => {
  const colors = ['pink', 'cyan', 'violet', 'gold'];
  let sequence = [], userInput = [], locked = true;

  function tileEl(color) { return document.querySelector(`.memory-tile[data-color="${color}"]`); }

  function flash(color, duration = 550) {
    return new Promise(resolve => {
      const el = tileEl(color);
      el.classList.add('lit');
      setTimeout(() => { el.classList.remove('lit'); setTimeout(resolve, 180); }, duration);
    });
  }

  async function playSequence() {
    locked = true;
    document.getElementById('memory-status').textContent = 'Perhatikan baik-baik...';
    await new Promise(r => setTimeout(r, 500));
    for (const c of sequence) await flash(c);
    locked = false;
    document.getElementById('memory-status').textContent = 'Giliran kamu! Ulangi urutannya.';
  }

  function start() {
    sequence = [];
    userInput = [];
    const length = 4;
    for (let i = 0; i < length; i++) sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    playSequence();
  }

  function handleTileClick(color) {
    if (locked) return;
    flash(color, 250);
    userInput.push(color);
    const idx = userInput.length - 1;
    if (userInput[idx] !== sequence[idx]) {
      AudioManager.wrong();
      document.getElementById('memory-status').textContent = 'Salah urutan, coba lagi ya!';
      setTimeout(start, 900);
      return;
    }
    if (userInput.length === sequence.length) {
      document.getElementById('memory-status').textContent = 'Sip, urutannya bener! 🎉';
      locked = true;
      setTimeout(() => LevelManager.next(), 700);
    }
  }

  function bind() {
    colors.forEach(c => tileEl(c).addEventListener('click', () => handleTileClick(c)));
    document.getElementById('memory-replay').addEventListener('click', () => { if (locked) return; playSequence(); });
  }

  return { start, bind };
})();

/* ============================================================
   11. LEVEL 3 — EMOJI PUZZLE
   ============================================================ */
function initEmojiLevel() {
  const buttons = document.querySelectorAll('#emoji-options .option-btn');
  const feedback = document.getElementById('emoji-feedback');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const correct = btn.dataset.answer === 'true';
      if (correct) {
        btn.classList.add('correct');
        feedback.textContent = 'Tepat sekali! 💗';
        feedback.style.color = 'var(--neon-cyan)';
        buttons.forEach(b => b.disabled = true);
        setTimeout(() => LevelManager.next(), 900);
      } else {
        btn.classList.add('wrong');
        AudioManager.wrong();
        feedback.textContent = 'Bukan itu... coba pilihan lain.';
        feedback.style.color = 'var(--heart-pink)';
        setTimeout(() => btn.classList.remove('wrong'), 500);
      }
    });
  });
}

/* ============================================================
   12. LEVEL 4 — SLIDE PUZZLE (3x3, assembles a generated heart image)
   ============================================================ */

// Build an original heart illustration at runtime (no external image file
// needed, no copyright concerns) and encode it as a data URI so the puzzle
// pieces can slice a single coherent picture instead of a plain gradient.
function buildHeartImageDataURI() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="bg" cx="50%" cy="45%" r="75%">
          <stop offset="0%" stop-color="#241542"/>
          <stop offset="100%" stop-color="#0b0620"/>
        </radialGradient>
        <linearGradient id="heartFill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#ff5d8f"/>
          <stop offset="55%" stop-color="#ec4899"/>
          <stop offset="100%" stop-color="#ffcf6b"/>
        </linearGradient>
        <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="10" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="300" height="300" fill="url(#bg)"/>
      ${Array.from({ length: 22 }, () => {
        const x = (Math.random() * 300).toFixed(1);
        const y = (Math.random() * 300).toFixed(1);
        const r = (Math.random() * 1.4 + 0.4).toFixed(1);
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" opacity="${(Math.random() * 0.5 + 0.2).toFixed(2)}"/>`;
      }).join('')}
      <g filter="url(#glow)">
        <path d="M150,235 C60,175 25,120 25,80 C25,45 55,20 90,20
                 C115,20 138,33 150,55 C162,33 185,20 210,20
                 C245,20 275,45 275,80 C275,120 240,175 150,235 Z"
              fill="url(#heartFill)"/>
      </g>
      <path d="M150,235 C60,175 25,120 25,80 C25,45 55,20 90,20
               C115,20 138,33 150,55 C162,33 185,20 210,20
               C245,20 275,45 275,80 C275,120 240,175 150,235 Z"
            fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="2"/>
    </svg>`.trim();
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

const SlidePuzzle = (() => {
  const size = 3;
  let tiles = [], board, heartImage = null;

  function isSolvable(arr) {
    let inversions = 0;
    const flat = arr.filter(n => n !== 0);
    for (let i = 0; i < flat.length; i++)
      for (let j = i + 1; j < flat.length; j++)
        if (flat[i] > flat[j]) inversions++;
    return inversions % 2 === 0;
  }

  function shuffledTiles() {
    let arr;
    do {
      arr = Array.from({ length: size * size }, (_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    } while (!isSolvable(arr) || arr.every((v, i) => v === i));
    return arr;
  }

  function render() {
    board.innerHTML = '';
    board.style.setProperty('--puzzle-size', size);
    tiles.forEach((val, idx) => {
      const piece = document.createElement('div');
      piece.className = 'puzzle-piece' + (val === 0 ? ' empty' : '');
      piece.dataset.index = idx;
      if (val !== 0) {
        const row = Math.floor(val / size), col = val % size;
        piece.style.backgroundImage = `url("${heartImage}")`;
        piece.style.backgroundPosition = `${(col * 100) / (size - 1)}% ${(row * 100) / (size - 1)}%`;
        const badge = document.createElement('span');
        badge.className = 'puzzle-piece-badge';
        badge.textContent = val;
        piece.appendChild(badge);
        piece.addEventListener('click', () => tryMove(idx));
      }
      board.appendChild(piece);
    });
  }

  function tryMove(idx) {
    const emptyIdx = tiles.indexOf(0);
    const row = Math.floor(idx / size), col = idx % size;
    const eRow = Math.floor(emptyIdx / size), eCol = emptyIdx % size;
    const adjacent = (Math.abs(row - eRow) + Math.abs(col - eCol)) === 1;
    if (!adjacent) return;

    AudioManager.click();
    [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
    render();

    // subtle pop so the swap reads as motion rather than an instant jump
    const moved = board.querySelector(`[data-index="${emptyIdx}"]`);
    if (moved && typeof gsap !== 'undefined') {
      gsap.fromTo(moved, { scale: 0.85, opacity: 0.5 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' });
    }
    checkWin();
  }

  function checkWin() {
    const solved = tiles.every((v, i) => v === i);
    if (solved) {
      document.getElementById('puzzle-status').textContent = 'Bentuk hati selesai! 💖';
      board.classList.add('solved');
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(board, { filter: 'brightness(1)' }, { filter: 'brightness(1.25)', duration: 0.6, yoyo: true, repeat: 1 });
      }
      setTimeout(() => LevelManager.next(), 900);
    }
  }

  function start() {
    board = document.getElementById('puzzle-board');
    board.classList.remove('solved');
    document.getElementById('puzzle-status').textContent = 'Klik potongan yang bersebelahan dengan slot kosong.';
    if (!heartImage) heartImage = buildHeartImageDataURI();
    tiles = shuffledTiles();
    render();
  }

  return { start };
})();


/* ============================================================
   13. LEVEL 5 — QUICK CHALLENGE (click the heart before time's up)
   ============================================================ */
const QuickChallenge = (() => {
  const target = 8;
  const duration = 15;
  let score = 0, timeLeft = duration, timerId = null, spawnId = null, running = false;

  function reset() {
    score = 0; timeLeft = duration; running = false;
    document.getElementById('challenge-score').textContent = score;
    document.getElementById('challenge-timer').textContent = timeLeft;
    const arena = document.getElementById('challenge-arena');
    arena.querySelectorAll('.challenge-heart').forEach(h => h.remove());
    const startBtn = document.getElementById('challenge-start');
    startBtn.classList.remove('hidden');
    startBtn.textContent = 'Mulai';
    startBtn.disabled = false;
  }

  function spawnHeart() {
    const arena = document.getElementById('challenge-arena');
    const heart = document.createElement('button');
    heart.className = 'challenge-heart';
    heart.textContent = '❤️';
    const maxX = arena.clientWidth - 40, maxY = arena.clientHeight - 40;
    heart.style.left = Math.random() * Math.max(maxX, 10) + 'px';
    heart.style.top = Math.random() * Math.max(maxY, 10) + 'px';
    heart.addEventListener('click', () => {
      score++;
      document.getElementById('challenge-score').textContent = score;
      AudioManager.click();
      heart.remove();
      if (score >= target) finish(true);
    });
    arena.appendChild(heart);
    setTimeout(() => heart.remove(), 900);
  }

  function tick() {
    timeLeft--;
    document.getElementById('challenge-timer').textContent = Math.max(timeLeft, 0);
    if (timeLeft <= 0) finish(score >= target);
  }

  function finish(success) {
    if (!running) return;
    running = false;
    clearInterval(timerId);
    clearInterval(spawnId);
    const arena = document.getElementById('challenge-arena');
    arena.querySelectorAll('.challenge-heart').forEach(h => h.remove());
    if (success) {
      setTimeout(() => LevelManager.next(), 500);
    } else {
      const startBtn = document.getElementById('challenge-start');
      startBtn.textContent = 'Coba Lagi';
      startBtn.disabled = false;
      startBtn.classList.remove('hidden');
    }
  }

  function start() {
    running = true;
    document.getElementById('challenge-start').classList.add('hidden');
    timerId = setInterval(tick, 1000);
    spawnId = setInterval(spawnHeart, 750);
  }

  function bind() {
    document.getElementById('challenge-start').addEventListener('click', start);
  }

  return { reset, bind };
})();

/* ============================================================
   14. DECRYPT TRANSITION SCREEN
   ============================================================ */
const DecryptSequence = (() => {
  const noiseChars = '01#$%&アイウエオﾊﾟｽﾜｰﾄﾞ*+-<>[]{}';
  let noiseTimer;

  function randomNoiseLine(len) {
    let out = '';
    for (let i = 0; i < len; i++) out += noiseChars[Math.floor(Math.random() * noiseChars.length)];
    return out;
  }

  function runNoise() {
    const el = document.getElementById('decrypt-noise');
    noiseTimer = setInterval(() => {
      el.textContent = [randomNoiseLine(28), randomNoiseLine(22), randomNoiseLine(30)].join('\n');
    }, 90);
  }

  function runProgress(callback) {
    const steps = [0, 10, 25, 45, 70, 100];
    const fill = document.getElementById('decrypt-progress-fill');
    const label = document.getElementById('decrypt-progress-label');
    let i = 0;
    const interval = setInterval(() => {
      fill.style.width = steps[i] + '%';
      label.textContent = steps[i] + '%';
      i++;
      if (i >= steps.length) {
        clearInterval(interval);
        clearInterval(noiseTimer);
        document.getElementById('decrypt-noise').textContent = '';
        setTimeout(callback, 500);
      }
    }, 500);
  }

  function typeReveal() {
    const target = document.getElementById('decrypt-typed');
    if (typeof Typed !== 'undefined') {
      new Typed('#decrypt-typed', {
        strings: ['Hi...', 'Hi...^500 Aku mau ngomong sesuatu...'],
        typeSpeed: 45,
        backSpeed: 0,
        showCursor: true,
        cursorChar: '▌',
        onComplete: () => setTimeout(() => LetterScene.start(), 1200)
      });
    } else {
      target.textContent = 'Hi... Aku mau ngomong sesuatu...';
      setTimeout(() => LetterScene.start(), 1500);
    }
  }

  function start() {
    ScreenManager.show('screen-decrypt');
    document.getElementById('decrypt-progress-fill').style.width = '0%';
    document.getElementById('decrypt-progress-label').textContent = '0%';
    document.getElementById('decrypt-typed').textContent = '';
    runNoise();
    setTimeout(() => runProgress(typeReveal), 400);
  }

  return { start };
})();

/* ============================================================
   15. FINAL LETTER SCENE (envelope + typewriter letter)
   ============================================================ */
const LetterScene = (() => {
  function typewrite(el, text, speed = 22) {
    return new Promise(resolve => {
      let i = 0;
      el.textContent = '';
      (function step() {
        if (i <= text.length) {
          el.textContent = text.slice(0, i);
          i++;
          setTimeout(step, speed);
        } else resolve();
      })();
    });
  }

  function openEnvelope() {
    const envelope = document.getElementById('envelope');
    if (envelope.classList.contains('open')) return;
    envelope.classList.add('open');
    document.getElementById('envelope-hint').classList.add('hidden');
    AudioManager.reveal();

    setTimeout(() => {
      const sheet = document.getElementById('paper-sheet');
      sheet.classList.remove('hidden');
      gsap && gsap.to(sheet, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
      typewrite(document.getElementById('letter-text'), CONFIG.finalLetter, 20).then(() => {
        const btn = document.getElementById('btn-final');
        btn.classList.remove('hidden');
        gsap && gsap.fromTo(btn, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6 });
      });
    }, 900);
  }

  function bind() {
    document.getElementById('envelope').addEventListener('click', openEnvelope);
  }

  function start() {
    ScreenManager.show('screen-letter');
  }

  return { bind, start };
})();

/* ============================================================
   16. FINAL BUTTON — CONFETTI + HEART RAIN + THANKS SCREEN
   ============================================================ */
function spawnFloatingHeart() {
  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  heart.textContent = '❤️';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.fontSize = (14 + Math.random() * 20) + 'px';
  document.body.appendChild(heart);
  const duration = 3 + Math.random() * 2.5;
  if (typeof gsap !== 'undefined') {
    gsap.to(heart, {
      y: -window.innerHeight - 100,
      x: `+=${(Math.random() - 0.5) * 120}`,
      rotation: (Math.random() - 0.5) * 90,
      duration, ease: 'power1.out',
      onComplete: () => heart.remove()
    });
  } else {
    heart.style.transition = `transform ${duration}s linear`;
    requestAnimationFrame(() => { heart.style.transform = `translateY(-110vh)`; });
    setTimeout(() => heart.remove(), duration * 1000);
  }
}

function heartRain(count = 40) {
  for (let i = 0; i < count; i++) setTimeout(spawnFloatingHeart, i * 90);
}

function fireConfetti() {
  if (typeof confetti === 'undefined') return;
  const colors = ['#ff5d8f', '#ffcf6b', '#7c3aed', '#22d3ee'];
  confetti({ particleCount: 140, spread: 90, origin: { y: 0.6 }, colors });
  setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 }, colors }), 200);
  setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 }, colors }), 200);
}

function bindFinalButton() {
  document.getElementById('btn-final').addEventListener('click', () => {
    fireConfetti();
    heartRain(45);
    AudioManager.reveal();
    setTimeout(() => ScreenManager.show('screen-thanks'), 1400);
  });
}

/* ============================================================
   17. EASTER EGG — Konami Code + double-click title
   ============================================================ */
function initEasterEgg() {
  const toast = document.getElementById('easter-toast');
  const funnyMessages = [
    'Eh ketauan iseng-iseng klik ya? 😏',
    'Konami code aktif! Kamu emang niat banget ya cari yang tersembunyi 💗',
    'Psst... makin lama makin sayang lho 👀'
  ];

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(toast, { opacity: 0, y: -14 }, { opacity: 1, y: 0, duration: 0.5 });
      gsap.to(toast, { opacity: 0, y: -14, duration: 0.5, delay: 2.6, onComplete: () => toast.classList.add('hidden') });
    } else {
      setTimeout(() => toast.classList.add('hidden'), 2600);
    }
  }

  // Konami: up up down down left right left right b a
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let progress = 0;
  window.addEventListener('keydown', e => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === konami[progress]) {
      progress++;
      if (progress === konami.length) {
        progress = 0;
        showToast(funnyMessages[1]);
        heartRain(20);
      }
    } else {
      progress = (key === konami[0]) ? 1 : 0;
    }
  });

  // double-click the menu title heart
  const menuTitle = document.querySelector('.menu-title');
  if (menuTitle) {
    menuTitle.addEventListener('dblclick', () => {
      showToast(funnyMessages[Math.floor(Math.random() * funnyMessages.length)]);
    });
  }
}

/* ============================================================
   18. MUSIC PLAYER UI
   ============================================================ */
function initMusicPlayerUI() {
  const player = document.getElementById('music-player');
  const playPauseBtn = document.getElementById('music-play-pause');
  const muteBtn = document.getElementById('music-mute');
  const volumeSlider = document.getElementById('music-volume');
  const progressTrack = document.getElementById('music-progress-track');
  const progressFill = document.getElementById('music-progress-fill');
  const icon = document.getElementById('music-icon');

  function togglePlayback() {
    AudioManager.togglePlay();
    const music = AudioManager.getMusic();
    const playing = music && music.playing();
    playPauseBtn.innerHTML = playing ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-play"></i>';
    icon.classList.toggle('paused', !playing);
  }
  playPauseBtn.addEventListener('click', togglePlayback);
  document.getElementById('music-toggle').addEventListener('click', togglePlayback);

  muteBtn.addEventListener('click', () => {
    const muted = AudioManager.toggleMute();
    muteBtn.innerHTML = muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
  });

  volumeSlider.addEventListener('input', e => {
    AudioManager.setVolume(e.target.value / 100);
  });

  progressTrack.addEventListener('click', e => {
    const music = AudioManager.getMusic();
    if (!music || !music.duration()) return;
    const rect = progressTrack.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    music.seek(pct * music.duration());
  });

  setInterval(() => {
    const music = AudioManager.getMusic();
    if (music && music.playing() && music.duration()) {
      const pct = (music.seek() / music.duration()) * 100;
      progressFill.style.width = pct + '%';
    }
  }, 500);

  function reveal() { player.classList.remove('hidden'); }
  return { reveal };
}

/* ============================================================
   19. BOOTSTRAP — wire everything together
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  Galaxy.init();
  initParticles();
  CursorFX.init();
  AudioManager.init();
  bindSoundToButtons();
  initEasterEgg();

  const musicUI = initMusicPlayerUI();

  runBootSequence();

  document.getElementById('btn-start').addEventListener('click', () => {
    AudioManager.playMusic();
    musicUI.reveal();
    if (typeof gsap !== 'undefined') {
      gsap.to('#screen-boot', {
        scale: 6, opacity: 0, duration: 1, ease: 'power2.in',
        onComplete: () => ScreenManager.show('screen-menu', { instant: true })
      });
    } else {
      ScreenManager.show('screen-menu');
    }
  });

  document.getElementById('btn-begin').addEventListener('click', () => {
    LevelManager.reset();
    ScreenManager.show('screen-game');
    LevelManager.showLevel(1);
  });

  document.getElementById('btn-replay').addEventListener('click', () => {
    LevelManager.reset();
    ScreenManager.show('screen-menu');
  });

  // level init
  initQuizLevel();
  MemoryGame.bind();
  initEmojiLevel();
  QuickChallenge.bind();
  LetterScene.bind();
  bindFinalButton();
});
