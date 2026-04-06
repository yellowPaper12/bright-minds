// ════════════════════════════════════════════
//  BRIGHT MINDS — App Logic (v2)
// ════════════════════════════════════════════

// ── Sound System (Web Audio API — no files needed) ──────
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(frequency, duration, type = 'sine', gainVal = 0.4, delay = 0) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime + delay);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + delay);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + duration + 0.05);
  } catch(e) {}
}

// 🎉 Correct answer — cheerful rising jingle (3 notes)
function playCorrectSound() {
  playTone(523, 0.12, 'triangle', 0.45, 0.00);  // C5
  playTone(659, 0.12, 'triangle', 0.45, 0.13);  // E5
  playTone(784, 0.25, 'triangle', 0.45, 0.26);  // G5
  // add a shimmer overtone
  playTone(1046, 0.18, 'sine', 0.15, 0.26);      // C6
}

// 💪 Wrong answer — soft low "try again" boop (gentle, not harsh)
function playWrongSound() {
  playTone(330, 0.10, 'sine', 0.30, 0.00);  // E4
  playTone(294, 0.20, 'sine', 0.25, 0.12);  // D4
}

// 🏆 Result fanfare — triumphant 5-note chord arpeggio
function playResultSound(perfect) {
  if (perfect) {
    [523, 659, 784, 1046, 1318].forEach((f, i) => playTone(f, 0.3, 'triangle', 0.35, i * 0.1));
  } else {
    playTone(523, 0.15, 'triangle', 0.35, 0.0);
    playTone(659, 0.20, 'triangle', 0.30, 0.15);
    playTone(784, 0.25, 'triangle', 0.30, 0.30);
  }
}

let currentTier    = null;
let currentWorld   = null;
let currentQ       = 0;
let score          = 0;
let streak         = 0;
let mode           = 'child';
let answered       = false;
let questionOrder  = [];
let bestScores     = {};

// Load saved scores safely
try { bestScores = JSON.parse(localStorage.getItem('brightMindsBest') || '{}'); } catch(e) {}

// ── Helpers ─────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Age picker ────────────────────────────────
function pickAge(tier) {
  currentTier = tier;
  const t = AGE_TIERS[tier];

  // Apply tier body class for color theming
  document.body.className = t.bodyClass;

  // Build home screen
  document.getElementById('age-badge').textContent = t.emoji + ' Ages ' + t.label + ' ▸ Change';
  document.getElementById('home-greeting').textContent = t.greeting;
  document.getElementById('home-sub').textContent = t.sub;

  // Build world cards
  buildWorldGrid(tier);
  updateHomeStars();

  // Set mode toggle
  updateModeBtn();
  showScreen('home');
}

function goAge() {
  showScreen('age');
}

// ── Build world cards for the selected tier ───
function buildWorldGrid(tier) {
  const grid = document.getElementById('worlds-grid');
  grid.innerHTML = '';
  const worldIds = AGE_TIERS[tier].worlds;
  const colors = ['wc-a','wc-b','wc-c','wc-d','wc-e','wc-f'];

  worldIds.forEach((wId, i) => {
    const w = WORLDS[wId];
    if (!w) return;
    const card = document.createElement('div');
    card.className = 'world-card ' + colors[i % colors.length];
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', w.title);
    card.innerHTML =
      '<span class="w-icon">' + w.title.split(' ')[0] + '</span>' +
      '<div class="w-name">' + w.title.slice(w.title.indexOf(' ') + 1) + '</div>' +
      '<div class="w-desc">' + w.desc + '</div>' +
      '<div class="w-stars" id="stars-' + wId + '">☆☆☆</div>';
    card.onclick = () => startWorld(wId);
    card.addEventListener('keydown', e => { if (e.key === 'Enter') startWorld(wId); });
    grid.appendChild(card);
  });
}

// ── Mode toggle ────────────────────────────────
function toggleMode() {
  mode = mode === 'child' ? 'guide' : 'child';
  updateModeBtn();
  const banner = document.getElementById('guide-mode-banner');
  banner.style.display = mode === 'guide' ? 'block' : 'none';
}

function updateModeBtn() {
  const btn = document.getElementById('mode-toggle-btn');
  if (mode === 'guide') {
    btn.textContent = '👩‍🏫 Guide ON';
    btn.classList.add('guide-on');
    document.getElementById('guide-mode-banner').style.display = 'block';
  } else {
    btn.textContent = '👩‍🏫 Guide Mode';
    btn.classList.remove('guide-on');
    document.getElementById('guide-mode-banner').style.display = 'none';
  }
}

// ── Star display ────────────────────────────────
function updateHomeStars() {
  if (!currentTier) return;
  AGE_TIERS[currentTier].worlds.forEach(wId => {
    const el = document.getElementById('stars-' + wId);
    if (!el) return;
    const key = currentTier + '_' + wId;
    const best = bestScores[key] || 0;
    const total = WORLDS[wId] ? WORLDS[wId].questions.length : 8;
    const pct = best / total;
    if (best === 0)  { el.textContent = '☆☆☆'; return; }
    if (pct === 1)   { el.textContent = '⭐⭐⭐'; return; }
    if (pct >= 0.75) { el.textContent = '⭐⭐☆'; return; }
    el.textContent = '⭐☆☆';
  });
}

// ── Start world ─────────────────────────────────
function startWorld(wId) {
  currentWorld  = wId;
  currentQ      = 0;
  score         = 0;
  streak        = 0;
  answered      = false;
  const total   = WORLDS[wId].questions.length;
  questionOrder = shuffle([...Array(total).keys()]);
  showScreen('game');
  loadQuestion();
}

// ── Load question ────────────────────────────────
function loadQuestion() {
  const world = WORLDS[currentWorld];
  const qIdx  = questionOrder[currentQ];
  const q     = world.questions[qIdx];
  const total = world.questions.length;

  // Header
  document.getElementById('game-world-title').textContent = world.title;
  const pct = (currentQ / total) * 100;
  const fill = document.getElementById('progress-fill');
  fill.style.width = pct + '%';
  document.getElementById('q-counter').textContent = (currentQ + 1) + ' / ' + total;

  // Score & streak
  document.getElementById('score-display').textContent = '⭐ ' + score;
  const streakEl = document.getElementById('streak-display');
  streakEl.textContent = streak >= 3 ? '🔥 ' + streak + ' streak!' : '';

  // Guide tip
  const tipBox = document.getElementById('guide-tip-box');
  if (mode === 'guide') {
    tipBox.innerHTML = '👩‍🏫 <strong>Tip:</strong> ' + q.tip;
    tipBox.classList.add('visible');
  } else {
    tipBox.classList.remove('visible');
  }

  // Question icon
  const qIcon = document.getElementById('q-icon');
  qIcon.textContent = q.icon;
  qIcon.style.animation = 'none';
  void qIcon.offsetWidth;
  qIcon.style.animation = 'qpop 0.4s cubic-bezier(.34,1.56,.64,1)';

  document.getElementById('q-text').textContent = q.text;
  document.getElementById('q-sub').textContent  = q.sub;

  // Clear feedback
  const fb = document.getElementById('feedback-bar');
  fb.textContent = '';
  fb.className   = 'feedback-bar';

  // Choices
  answered = false;
  const grid = document.getElementById('choices');
  grid.innerHTML = '';
  shuffle(q.choices).forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.setAttribute('aria-label', c.l);
    // Tier 3: smaller emoji, bigger text
    if (currentTier === 3) {
      btn.innerHTML = '<span class="ci">' + c.e + '</span><span>' + c.l + '</span>';
    } else {
      btn.innerHTML = '<span class="ci">' + c.e + '</span><span>' + c.l + '</span>';
    }
    btn.onclick = () => handleAnswer(c.e, btn, q);
    grid.appendChild(btn);
  });
}

// ── Handle answer ─────────────────────────────────
function handleAnswer(chosen, btn, q) {
  if (answered) return;
  answered = true;
  const correct = chosen === q.answer;

  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.querySelector('.ci').textContent === q.answer) b.classList.add('correct');
    else b.classList.add('wrong');
  });

  const fb = document.getElementById('feedback-bar');
  if (correct) {
    score++;
    streak++;
    playCorrectSound();
    document.getElementById('score-display').textContent = '⭐ ' + score;
    const streakEl = document.getElementById('streak-display');
    streakEl.textContent = streak >= 3 ? '🔥 ' + streak + ' streak!' : '';
    fb.textContent = q.praise || '🎉 Correct!';
    fb.className   = 'feedback-bar correct-fb';
    confetti();
  } else {
    streak = 0;
    playWrongSound();
    document.getElementById('streak-display').textContent = '';
    fb.textContent = '💪 Good try! The right answer is highlighted.';
    fb.className   = 'feedback-bar wrong-fb';
  }

  setTimeout(() => {
    currentQ++;
    if (currentQ < WORLDS[currentWorld].questions.length) {
      loadQuestion();
    } else {
      showResult();
    }
  }, 1700);
}

// ── Result ─────────────────────────────────────────
function showResult() {
  const total = WORLDS[currentWorld].questions.length;
  const pct   = score / total;

  // Save best
  const key  = currentTier + '_' + currentWorld;
  const prev = bestScores[key] || 0;
  if (score > prev) {
    bestScores[key] = score;
    try { localStorage.setItem('brightMindsBest', JSON.stringify(bestScores)); } catch(e) {}
  }

  let icon, msg, sub, stars;
  if (pct === 1) {
    icon = '🏆'; msg = 'Perfect score!';
    sub  = 'Every answer correct — you\'re incredible!';
    stars = '⭐⭐⭐';
  } else if (pct >= 0.75) {
    icon = '🎉'; msg = 'Fantastic work!';
    sub  = 'You got ' + score + ' out of ' + total + ' — brilliant!';
    stars = '⭐⭐⭐';
  } else if (pct >= 0.5) {
    icon = '😊'; msg = 'Great effort!';
    sub  = 'You got ' + score + ' out of ' + total + ' — keep going!';
    stars = '⭐⭐';
  } else {
    icon = '💪'; msg = 'Good try!';
    sub  = 'You got ' + score + ' out of ' + total + '. Practice makes perfect!';
    stars = '⭐';
  }

  const best = bestScores[key] || score;
  document.getElementById('result-icon').textContent   = icon;
  document.getElementById('result-msg').textContent    = msg;
  document.getElementById('result-sub').textContent    = sub;
  document.getElementById('result-stars').textContent  = stars;
  document.getElementById('result-detail').textContent =
    'Your best in this world: ' + best + ' / ' + total;

  showScreen('result');
  playResultSound(pct === 1);
  setTimeout(confetti, 150);
}

function replayWorld() { startWorld(currentWorld); }

function goHome() {
  showScreen('home');
  updateHomeStars();
}

// ── Confetti ────────────────────────────────────────
function confetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#FF6B6B','#FFD166','#4ECDC4','#A259FF','#FF6B9D','#5B8DEF','#06D6A0','#FFE66D'];
  for (let i = 0; i < 26; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.cssText = [
      'left:'   + (Math.random() * 100) + '%',
      'top:-14px',
      'background:' + colors[Math.floor(Math.random() * colors.length)],
      'animation-delay:'    + (Math.random() * 0.8) + 's',
      'animation-duration:' + (1.3 + Math.random() * 0.7) + 's',
      'transform:rotate('   + (Math.random() * 360) + 'deg)',
      'border-radius:'  + (Math.random() > 0.5 ? '50%' : '3px'),
      'width:'  + (7 + Math.floor(Math.random() * 7)) + 'px',
      'height:' + (7 + Math.floor(Math.random() * 7)) + 'px',
    ].join(';');
    container.appendChild(p);
    setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 2800);
  }
}

// ── Init ─────────────────────────────────────────────
// Start on age picker — no auto-load
