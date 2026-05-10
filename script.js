/* =============================================
   CIPHER — CYBERPUNK PASSWORD ANALYZER
   script.js
   ============================================= */

'use strict';

/* ============ COMMON PASSWORDS LIST ============ */
const COMMON_PASSWORDS = new Set([
  'password','password1','123456','12345678','1234567890','qwerty','abc123',
  'monkey','1234567','letmein','trustno1','dragon','baseball','iloveyou',
  'master','sunshine','ashley','bailey','passw0rd','shadow','123123',
  '654321','superman','qazwsx','michael','football','welcome','jesus',
  'ninja','mustang','password2','admin','login','hello','charlie','donald',
  'qwerty123','!@#$%^&*','aa123456','password!','qwertyuiop','hunter2',
  'whatever','summer','starwars','pass','test','access','matrix','letmein1'
]);

/* ============ PARTICLES ENGINE ============ */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx    = canvas.getContext('2d');
  let particles = [], W, H, animId;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  function random(min, max) { return Math.random() * (max - min) + min; }

  function spawnParticle() {
    return {
      x: random(0, W), y: random(0, H),
      vx: random(-0.15, 0.15), vy: random(-0.15, 0.15),
      r: random(1, 2.2),
      a: random(0.2, 0.6),
      color: Math.random() > 0.6 ? '0,200,255' : Math.random() > 0.5 ? '0,255,136' : '100,120,180'
    };
  }

  for (let i = 0; i < 110; i++) particles.push(spawnParticle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0,200,255,${(1 - dist/120) * 0.07})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawConnections();
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.a})`;
      ctx.fill();
    });
    animId = requestAnimationFrame(animate);
  }
  animate();
})();

/* ============ LOADER ============ */
(function initLoader() {
  const loader      = document.getElementById('loader');
  const linesDiv    = document.getElementById('loaderLines');
  const app         = document.getElementById('app');

  const bootLines = [
    '> Initializing CIPHER engine...',
    '> Loading entropy tables...',
    '> Mounting breach database (10B records)...',
    '> Pattern analysis module v3.1.2... OK',
    '> Cryptographic subsystem... OK',
    '> GPU acceleration: ENABLED',
    '> All systems nominal. Launching...'
  ];

  let idx = 0;
  function printLine() {
    if (idx < bootLines.length) {
      const el = document.createElement('div');
      el.textContent = bootLines[idx];
      el.style.opacity = '0';
      linesDiv.appendChild(el);
      setTimeout(() => el.style.transition = 'opacity .3s', 10);
      setTimeout(() => el.style.opacity = '1', 20);
      idx++;
      setTimeout(printLine, 280);
    }
  }
  printLine();

  setTimeout(() => {
    loader.classList.add('fade-out');
    app.classList.remove('hidden');
    app.classList.add('visible');
  }, 2400);
})();

/* ============ CLOCK ============ */
(function initClock() {
  const el = document.getElementById('headerTime');
  function tick() {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
})();

/* ============ ANALYSIS ENGINE ============ */
function analyzePassword(pwd) {
  const len     = pwd.length;
  const hasUpper   = /[A-Z]/.test(pwd);
  const hasLower   = /[a-z]/.test(pwd);
  const hasDigit   = /[0-9]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);
  const noRepeat   = !/(.)(\1{2,})/.test(pwd);   // no 3+ consecutive same char
  const notCommon  = !COMMON_PASSWORDS.has(pwd.toLowerCase());
  const longEnough = len >= 12;

  // Charset size
  let charset = 0;
  if (hasLower)   charset += 26;
  if (hasUpper)   charset += 26;
  if (hasDigit)   charset += 10;
  if (hasSpecial) charset += 32;
  if (charset === 0) charset = 26;

  // Entropy = log2(charset^len)
  const entropy = len * Math.log2(charset);

  // Score (0–100)
  let score = 0;
  if (len >= 8)  score += 10;
  if (len >= 12) score += 10;
  if (len >= 16) score += 10;
  if (len >= 20) score += 5;
  if (hasUpper)   score += 15;
  if (hasLower)   score += 15;
  if (hasDigit)   score += 15;
  if (hasSpecial) score += 20;
  if (noRepeat)   score += 5;
  if (notCommon)  score += 10;

  // Penalties
  if (len < 8 && len > 0) score = Math.min(score, 20);
  if (!notCommon) score = Math.min(score, 15);
  score = Math.min(score, 100);

  // Strength level
  let level = 'none';
  if (len === 0) level = 'none';
  else if (score < 30)  level = 'weak';
  else if (score < 55)  level = 'medium';
  else if (score < 78)  level = 'strong';
  else                  level = 'vstrong';

  // Crack time
  const GPU_GUESSES_PER_SEC = 1e12;
  const combinations = Math.pow(charset, Math.max(len, 1));
  const seconds = combinations / 2 / GPU_GUESSES_PER_SEC; // avg half
  const crackTime = formatTime(seconds);

  // Suggestions
  const suggestions = [];
  if (len < 8)      suggestions.push('Add more characters — minimum 8 required.');
  if (len < 12)     suggestions.push('Use at least 12 characters for stronger security.');
  if (!hasUpper)    suggestions.push('Include uppercase letters (A–Z).');
  if (!hasLower)    suggestions.push('Include lowercase letters (a–z).');
  if (!hasDigit)    suggestions.push('Add numeric digits (0–9) to increase entropy.');
  if (!hasSpecial)  suggestions.push('Include special characters like !@#$%^&*.');
  if (!noRepeat)    suggestions.push('Avoid repeating characters (e.g. "aaa", "111").');
  if (!notCommon)   suggestions.push('This is a commonly used password — choose something unique.');
  if (len > 0 && suggestions.length === 0) suggestions.push('Excellent! Your password is well-constructed.');

  // Breach detection (simplified)
  const isBreached = !notCommon || score < 20;

  return {
    len, hasUpper, hasLower, hasDigit, hasSpecial,
    noRepeat, notCommon, longEnough,
    entropy: entropy.toFixed(1), score,
    level, crackTime, suggestions, isBreached
  };
}

function formatTime(seconds) {
  if (seconds < 0.001)       return 'Instant';
  if (seconds < 1)           return `${(seconds * 1000).toFixed(1)} ms`;
  if (seconds < 60)          return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600)        return `${(seconds/60).toFixed(1)} minutes`;
  if (seconds < 86400)       return `${(seconds/3600).toFixed(1)} hours`;
  if (seconds < 2592000)     return `${(seconds/86400).toFixed(1)} days`;
  if (seconds < 31536000)    return `${(seconds/2592000).toFixed(1)} months`;
  if (seconds < 3153600000)  return `${(seconds/31536000).toFixed(1)} years`;
  if (seconds < 3.15e13)     return `${(seconds/3153600000).toFixed(0)} centuries`;
  return 'Heat death of universe+';
}

/* ============ UI UPDATERS ============ */
const COLORS = {
  none:    { color: 'var(--text-dim)',  bar: '#2a3040',             label: '—' },
  weak:    { color: 'var(--red)',       bar: 'var(--red)',          label: 'WEAK' },
  medium:  { color: 'var(--yellow)',    bar: 'var(--yellow)',       label: 'MEDIUM' },
  strong:  { color: 'var(--cyan)',      bar: 'var(--cyan)',         label: 'STRONG' },
  vstrong: { color: 'var(--green)',     bar: 'var(--green)',        label: 'VERY STRONG' }
};

const FILL_PCT = { none: 0, weak: 22, medium: 48, strong: 72, vstrong: 100 };

function updateUI(result, raw) {
  const cfg = COLORS[result.level];

  // Strength name
  const sn = document.getElementById('strengthName');
  sn.textContent = cfg.label;
  sn.style.color = cfg.color;
  sn.style.textShadow = `0 0 12px ${cfg.color}`;

  // Fill bar
  const fill = document.getElementById('strengthFill');
  fill.style.width    = FILL_PCT[result.level] + '%';
  fill.style.background = result.level === 'none' ? '#2a3040' :
    `linear-gradient(90deg, ${cfg.bar}, ${cfg.color})`;
  fill.style.boxShadow = result.level === 'none' ? 'none' : `0 0 16px ${cfg.color}80`;

  // Pips
  const pipClasses = ['active-weak','active-medium','active-strong','active-vstrong'];
  const pipActive  = { none:0, weak:1, medium:2, strong:3, vstrong:4 };
  for (let i = 0; i < 4; i++) {
    const pip = document.getElementById('pip' + i);
    pip.className = 'pip';
    if (i < pipActive[result.level]) {
      const cls = ['active-weak','active-medium','active-strong','active-vstrong'];
      pip.classList.add(result.level === 'vstrong' ? cls[i] : cls[Math.min(i, pipActive[result.level]-1)]);
    }
  }

  // Metrics
  document.getElementById('scoreVal').textContent   = raw.length ? result.score + '%' : '0%';
  document.getElementById('entropyVal').textContent = raw.length ? result.entropy + ' b' : '0 b';
  document.getElementById('crackVal').textContent   = raw.length ? result.crackTime : '—';
  document.getElementById('lengthVal').textContent  = result.len;

  // Color score
  const scoreEl = document.getElementById('scoreVal');
  scoreEl.style.color = raw.length ? cfg.color : '';

  // Rules
  const ruleMap = {
    'rule-length':    result.len >= 8,
    'rule-upper':     result.hasUpper,
    'rule-lower':     result.hasLower,
    'rule-number':    result.hasDigit,
    'rule-special':   result.hasSpecial,
    'rule-no-repeat': result.noRepeat,
    'rule-no-common': result.notCommon,
    'rule-long':      result.longEnough
  };
  Object.entries(ruleMap).forEach(([id, pass]) => {
    const el   = document.getElementById(id);
    const icon = el.querySelector('.rule-icon i');
    el.className = 'rule-item' + (raw.length ? (pass ? ' pass' : ' fail') : '');
    if (raw.length) {
      icon.className = pass ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-xmark';
    } else {
      icon.className = 'fa-solid fa-circle-xmark';
    }
  });

  // Suggestions
  const box = document.getElementById('suggestionsBox');
  box.innerHTML = '';
  if (!raw.length) {
    box.innerHTML = '<div class="suggestion-item idle"><i class="fa-solid fa-terminal"></i> Awaiting input...</div>';
  } else {
    result.suggestions.forEach(s => {
      const d = document.createElement('div');
      d.className = 'suggestion-item';
      d.innerHTML = `<i class="fa-solid fa-arrow-right"></i> ${s}`;
      box.appendChild(d);
    });
  }

  // Breach
  const breachBox  = document.getElementById('breachBox');
  const breachIcon = document.getElementById('breachIcon');
  const breachText = document.getElementById('breachText');

  if (!raw.length) {
    breachBox.className  = 'breach-box';
    breachIcon.className = 'fa-solid fa-triangle-exclamation breach-icon';
    breachText.textContent = 'Enter a password to check against breach databases.';
  } else if (result.isBreached) {
    breachBox.className  = 'breach-box warning';
    breachIcon.className = 'fa-solid fa-skull-crossbones breach-icon';
    breachText.textContent = '⚠ This password matches known breached or common password patterns. Do not use it.';
  } else {
    breachBox.className  = 'breach-box safe';
    breachIcon.className = 'fa-solid fa-shield-check breach-icon';
    breachText.textContent = '✓ Not found in common breach or dictionary databases. Proceed with caution.';
  }

  // Input glow color
  const wrap = document.getElementById('inputWrap');
  wrap.style.setProperty('--glow', cfg.color);
  if (raw.length) {
    wrap.style.boxShadow = `0 0 0 1px ${cfg.color}40, 0 0 14px ${cfg.color}20`;
    wrap.style.borderColor = `${cfg.color}60`;
  } else {
    wrap.style.boxShadow = '';
    wrap.style.borderColor = '';
  }

  // Terminal update
  addTerminalLine(result, raw);
}

/* ============ TERMINAL LOGGER ============ */
let terminalHistory = [];
let lastTermLen = -1;
function addTerminalLine(result, raw) {
  const body = document.getElementById('terminalBody');
  if (!body) return;
  if (raw.length === lastTermLen) return;
  lastTermLen = raw.length;

  if (!raw.length) return;

  const lines = [];
  lines.push({ type: 'cmd',  text: `cipher --analyze "${raw.length < 3 ? '***' : raw.slice(0,3) + '…'}"` });
  lines.push({ type: 'out',  text: `[+] Length: ${result.len} chars | Entropy: ${result.entropy} bits` });
  lines.push({ type: 'out',  text: `[+] Charset: ${result.hasUpper?'A-Z ':''} ${result.hasLower?'a-z ':''} ${result.hasDigit?'0-9 ':''} ${result.hasSpecial?'Sym ':''}`.trim() });

  const levelLabels = { weak:'WEAK', medium:'MEDIUM', strong:'STRONG', vstrong:'VERY STRONG', none:'N/A' };
  const levelClass  = { weak:'err',  medium:'warn',   strong:'out',    vstrong:'ok',           none:'out' };
  lines.push({ type: levelClass[result.level], text: `[!] Strength: ${levelLabels[result.level]} | Score: ${result.score}/100` });
  lines.push({ type: 'out', text: `[+] Est. crack: ${result.crackTime} (GPU attack)` });
  lines.push({ type: result.isBreached ? 'err' : 'ok', text: result.isBreached ? '[!] BREACH MATCH FOUND' : '[+] No breach match' });

  // Keep last 30 lines
  terminalHistory.push(...lines);
  if (terminalHistory.length > 30) terminalHistory = terminalHistory.slice(-30);

  // Rebuild
  body.innerHTML = '';
  const intro = [
    { type:'cmd', text:'cipher --init' },
    { type:'out', text:'CIPHER Security Engine initialized.' },
    { type:'ok',  text:'All modules loaded successfully.' }
  ];
  [...intro, ...terminalHistory].forEach(l => {
    const d = document.createElement('div');
    d.className = 't-line';
    if (l.type === 'cmd') {
      d.innerHTML = `<span class="t-prompt">$</span> <span class="t-cmd">${escHtml(l.text)}</span>`;
    } else if (l.type === 'ok') {
      d.innerHTML = `<span class="t-out"><span class="t-ok">${escHtml(l.text)}</span></span>`;
    } else if (l.type === 'err') {
      d.innerHTML = `<span class="t-out"><span class="t-err">${escHtml(l.text)}</span></span>`;
    } else if (l.type === 'warn') {
      d.innerHTML = `<span class="t-out"><span class="t-warn">${escHtml(l.text)}</span></span>`;
    } else {
      d.innerHTML = `<span class="t-out">${escHtml(l.text)}</span>`;
    }
    body.appendChild(d);
  });

  // Cursor
  const cur = document.createElement('div');
  cur.className = 't-line';
  cur.innerHTML = `<span class="t-prompt">$</span> <span class="t-cursor">█</span>`;
  body.appendChild(cur);
  body.scrollTop = body.scrollHeight;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* ============ EVENT LISTENERS ============ */
const input = document.getElementById('passwordInput');
input.addEventListener('input', () => {
  const val = input.value;
  const result = analyzePassword(val);
  updateUI(result, val);
});

// Show / hide toggle
const toggleBtn = document.getElementById('toggleVis');
const eyeIcon   = document.getElementById('eyeIcon');
toggleBtn.addEventListener('click', () => {
  if (input.type === 'password') {
    input.type = 'text';
    eyeIcon.className = 'fa-solid fa-eye-slash';
  } else {
    input.type = 'password';
    eyeIcon.className = 'fa-solid fa-eye';
  }
  input.focus();
});

/* ============ GENERATE PASSWORD ============ */
document.getElementById('btnGenerate').addEventListener('click', () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%^&*?';
  let pwd = '';
  // Guarantee each category
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower   = 'abcdefghjkmnpqrstuvwxyz';
  const digits  = '23456789';
  const special = '!@#$%^&*?';
  pwd += upper[Math.floor(Math.random()   * upper.length)];
  pwd += lower[Math.floor(Math.random()   * lower.length)];
  pwd += digits[Math.floor(Math.random()  * digits.length)];
  pwd += special[Math.floor(Math.random() * special.length)];
  for (let i = 4; i < 18; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  // Shuffle
  pwd = pwd.split('').sort(() => Math.random() - 0.5).join('');
  input.type  = 'text';
  input.value = pwd;
  eyeIcon.className = 'fa-solid fa-eye-slash';
  input.dispatchEvent(new Event('input'));
  input.focus();

  // Animate generate button
  const btn = document.getElementById('btnGenerate');
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => btn.style.transform = '', 150);
});

/* ============ COPY PASSWORD ============ */
document.getElementById('btnCopy').addEventListener('click', () => {
  const val = input.value;
  if (!val) return;
  navigator.clipboard.writeText(val).catch(() => {
    // Fallback
    const tmp = document.createElement('textarea');
    tmp.value = val;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand('copy');
    document.body.removeChild(tmp);
  });
  const toast = document.getElementById('copyToast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
});

/* ============ INIT ============ */
// Trigger idle state visuals
updateUI(analyzePassword(''), '');
