const form = document.getElementById('bmiForm');
const resetBtn = document.getElementById('resetBtn');
const bmiValueEl = document.getElementById('bmiValue');
const bmiStatusEl = document.getElementById('bmiStatus');
const bmiBar = document.getElementById('bmiBar');
const detailsEl = document.getElementById('details');
const suggestionsEl = document.getElementById('suggestions');

const sexEl = document.getElementById('sex');
const ageEl = document.getElementById('age');
const heightFtEl = document.getElementById('heightFt');
const heightInEl = document.getElementById('heightIn');
const weightEl = document.getElementById('weight');

const unitRadios = Array.from(document.querySelectorAll('input[name="unit"]'));

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function toMeters(feet, inches) {
  const totalInches = feet * 12 + inches;
  return totalInches * 0.0254;
}

function poundsToKg(lb) {
  return lb * 0.453592;
}

function getBmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function getCategoryClass(category) {
  const map = {
    'Underweight': 'is-underweight',
    'Normal weight': 'is-normal',
    'Overweight': 'is-overweight',
    'Obese': 'is-obese'
  };
  return map[category] || '';
}

function getPointerPosition(bmi) {
  // Map 0..40+ to 0..100%
  const capped = clamp(bmi, 0, 40);
  return (capped / 40) * 100;
}

function formatNumber(n, digits = 1) {
  if (!isFinite(n)) return '—';
  return n.toFixed(digits);
}

function currentUnit() {
  const checked = unitRadios.find(r => r.checked);
  return checked ? checked.value : 'kg';
}

function validateInputs() {
  const errors = [];
  const age = Number(ageEl.value);
  const ft = Number(heightFtEl.value);
  const inch = Number(heightInEl.value);
  const wt = Number(weightEl.value);

  if (ageEl.value && (age < 0 || age > 120)) errors.push('Age must be between 0 and 120.');
  if (!(ft > 0 || inch > 0)) errors.push('Please enter your height.');
  if (inch < 0 || inch > 11) errors.push('Inches must be between 0 and 11.');
  if (!(wt > 0)) errors.push('Please enter a valid weight.');

  return { valid: errors.length === 0, errors };
}

function calculate() {
  const unit = currentUnit();
  const sex = sexEl.value.trim();
  const age = Number(ageEl.value);
  const feet = Number(heightFtEl.value) || 0;
  const inches = Number(heightInEl.value) || 0;
  let weight = Number(weightEl.value) || 0;

  let heightMeters = toMeters(feet, inches);
  if (unit === 'lb') {
    weight = poundsToKg(weight);
  }

  const bmi = weight && heightMeters ? weight / (heightMeters * heightMeters) : NaN;
  return { unit, sex, age, feet, inches, weightKg: weight, heightMeters, bmi };
}

function render(result) {
  const { bmi, weightKg, heightMeters, sex, age, feet, inches } = result;

  if (!isFinite(bmi)) {
    bmiValueEl.textContent = '—';
    bmiStatusEl.textContent = 'Fill the form and hit Calculate.';
    detailsEl.textContent = '';
    bmiBar.style.left = '0%';
    if (suggestionsEl) suggestionsEl.innerHTML = '';
    return;
  }

  const category = getBmiCategory(bmi);
  bmiValueEl.textContent = formatNumber(bmi, 1);
  bmiStatusEl.textContent = category;
  // apply badge category class
  bmiStatusEl.classList.remove('is-underweight','is-normal','is-overweight','is-obese');
  const catClass = getCategoryClass(category);
  if (catClass) bmiStatusEl.classList.add(catClass);
  bmiBar.style.left = `${getPointerPosition(bmi)}%`;

  const sexPart = sex ? `Sex: ${sex}. ` : '';
  const agePart = age ? `Age: ${age}. ` : '';
  const heightPart = `Height: ${feet} ft ${inches} in (${formatNumber(heightMeters, 2)} m). `;
  const weightPart = `Weight: ${formatNumber(weightKg, 1)} kg.`;
  detailsEl.textContent = sexPart + agePart + heightPart + weightPart;

  if (suggestionsEl) {
    const tips = getSuggestions(category);
    suggestionsEl.innerHTML = `<h3>Suggestions</h3><ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>`;
  }
}

function getSuggestions(category) {
  switch (category) {
    case 'Underweight':
      return [
        'Aim for frequent, balanced meals with whole grains, proteins, and healthy fats.',
        'Add calorie-dense snacks (nuts, yogurt, smoothies) between meals.',
        'Incorporate strength training to build muscle mass.',
        'If weight loss was unintentional, consider consulting a clinician.'
      ];
    case 'Normal weight':
      return [
        'Maintain a balanced plate: vegetables, lean protein, whole grains.',
        'Stay active: at least 150 minutes of moderate activity per week.',
        'Prioritize sleep and hydration to sustain your progress.'
      ];
    case 'Overweight':
      return [
        'Consider a slight calorie deficit with high-fiber, high-protein foods.',
        'Add regular cardio and 2–3 strength sessions weekly.',
        'Track habits (steps, meals) to build consistency.',
        'If you have concerns or symptoms, speak with a healthcare professional.'
      ];
    case 'Obese':
      return [
        'Start with small, sustainable changes to nutrition and daily movement.',
        'Combine moderate cardio with low-impact strength training.',
        'Discuss tailored options with a clinician or registered dietitian.',
        'Manage stress and sleep; they significantly affect weight management.'
      ];
    default:
      return [];
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const { valid, errors } = validateInputs();
  if (!valid) {
    alert(errors.join('\n'));
    return;
    }
  const result = calculate();
  render(result);
  const resultsCard = document.querySelector('.results');
  if (resultsCard && resultsCard.classList.contains('is-hidden')) {
    resultsCard.classList.remove('is-hidden');
  }
});

resetBtn.addEventListener('click', () => {
  form.reset();
  bmiValueEl.textContent = '—';
  bmiStatusEl.textContent = 'Fill the form and hit Calculate.';
  bmiBar.style.left = '0%';
  detailsEl.textContent = '';
  const resultsCard = document.querySelector('.results');
  if (resultsCard) resultsCard.classList.add('is-hidden');
});

// Live UX niceties
unitRadios.forEach(r => r.addEventListener('change', () => {
  weightEl.placeholder = r.value === 'lb' && r.checked ? '154' : '70';
}));

// Initial render
render({ bmi: NaN });

// -------------------------------
// Loading overlay with Gooey Text
// -------------------------------
(function setupGooeyLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;
  const t1 = document.getElementById('gooeyText1');
  const t2 = document.getElementById('gooeyText2');
  if (!t1 || !t2) return;

  const texts = ['BMI', 'Calculator', 'Healthy', 'You'];
  const morphTime = 1.0; // seconds
  const cooldownTime = 0.25; // seconds

  let textIndex = texts.length - 1;
  let time = new Date();
  let morph = 0;
  let cooldown = cooldownTime;

  t1.textContent = texts[textIndex % texts.length];
  t2.textContent = texts[(textIndex + 1) % texts.length];

  function setMorph(fraction) {
    if (!t1 || !t2) return;
    const f1 = Math.max(0.0001, fraction);
    t2.style.filter = `blur(${Math.min(8 / f1 - 8, 100)}px)`;
    t2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    const inv = 1 - fraction;
    const f2 = Math.max(0.0001, inv);
    t1.style.filter = `blur(${Math.min(8 / f2 - 8, 100)}px)`;
    t1.style.opacity = `${Math.pow(inv, 0.4) * 100}%`;
  }

  function doCooldown() {
    morph = 0;
    if (!t1 || !t2) return;
    t2.style.filter = '';
    t2.style.opacity = '100%';
    t1.style.filter = '';
    t1.style.opacity = '0%';
  }

  function doMorph() {
    morph -= cooldown;
    cooldown = 0;
    let fraction = morph / morphTime;
    if (fraction > 1) {
      cooldown = cooldownTime;
      fraction = 1;
    }
    setMorph(fraction);
  }

  function animate() {
    const newTime = new Date();
    const shouldIncrementIndex = cooldown > 0;
    const dt = (newTime.getTime() - time.getTime()) / 1000;
    time = newTime;
    cooldown -= dt;
    if (cooldown <= 0) {
      if (shouldIncrementIndex) {
        textIndex = (textIndex + 1) % texts.length;
        t1.textContent = texts[textIndex % texts.length];
        t2.textContent = texts[(textIndex + 1) % texts.length];
      }
      doMorph();
    } else {
      doCooldown();
    }
    if (overlay.parentElement) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  // Hide overlay after fonts are ready or a timeout as fallback
  const hide = () => {
    // Reveal content then fade out overlay
    document.body.classList.remove('is-loading');
    overlay.style.transition = 'opacity 400ms ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 450);
    // Pause background animations shortly after reveal to avoid jank
    const pathsHost = document.getElementById('animatedPaths');
    if (pathsHost) setTimeout(() => pathsHost.classList.add('paused'), 800);
  };

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => setTimeout(hide, 900));
  } else {
    setTimeout(hide, 1200);
  }
})();

// ----------------------------------------
// Animated Background Paths (FloatingPaths)
// ----------------------------------------
(function renderAnimatedPaths() {
  const host = document.getElementById('animatedPaths');
  if (!host) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function createLayer(position) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 696 316');
    svg.setAttribute('fill', 'none');

    const isMobile = window.matchMedia && window.matchMedia('(max-width: 720px)').matches;
    const PATH_COUNT = isMobile ? 14 : 24;

    for (let i = 0; i < PATH_COUNT; i++) {
      const d = `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${684 - i * 5 * position} ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke-width', String(0.5 + i * 0.03));
      path.style.strokeOpacity = String(0.1 + i * 0.03);
      // Consistent duration with slight staggered delays for smoothness
      const duration = isMobile ? 28 : 32;
      const delay = (i * 0.35) % 6; // small stagger
      path.style.animationDuration = `${duration}s, ${duration}s`;
      path.style.animationDelay = `${delay}s, ${delay / 2}s`;
      svg.appendChild(path);
    }
    return svg;
  }

  host.appendChild(createLayer(1));
  host.appendChild(createLayer(-1));
})();

// ---------------------------------
// WebGL Shader Background (grayscale)
// ---------------------------------
(function shaderBackground() {
  const canvas = document.getElementById('shaderBg');
  if (!canvas) return;

  // Respect reduced motion
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const bg = document.querySelector('.bg');
    if (bg) bg.style.display = '';
    return;
  }

  const gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) {
    const bg = document.querySelector('.bg');
    if (bg) bg.style.display = '';
    return;
  }

  const vsSource = `
    attribute vec4 aVertexPosition;
    void main() { gl_Position = aVertexPosition; }
  `;

  // Grayscale-optimized fragment shader (mild params for smoothness)
  const fsSource = `
    precision highp float;
    uniform vec2 iResolution; uniform float iTime;
    const float overallSpeed = 0.18;
    const float gridSmoothWidth = 0.015;
    const float axisWidth = 0.05;
    const float majorLineWidth = 0.02;
    const float minorLineWidth = 0.01;
    const float majorLineFrequency = 5.0; const float minorLineFrequency = 1.0;
    const float scale = 5.0;
    const vec4 lineColor = vec4(0.85);
    const float minLineWidth = 0.01; const float maxLineWidth = 0.16;
    const float lineSpeed = 1.0 * overallSpeed; const float lineAmplitude = 1.0; const float lineFrequency = 0.2;
    const float warpSpeed = 0.18 * overallSpeed; const float warpFrequency = 0.5; const float warpAmplitude = 0.8;
    const float offsetFrequency = 0.5; const float offsetSpeed = 1.2 * overallSpeed;
    const float minOffsetSpread = 0.5; const float maxOffsetSpread = 1.6;
    const int linesPerGroup = 12;
    #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
    #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
    #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
    #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))
    float drawGridLines(float axis) { return drawCrispLine(0.0, axisWidth, axis) + drawPeriodicLine(majorLineFrequency, majorLineWidth, axis) + drawPeriodicLine(minorLineFrequency, minorLineWidth, axis); }
    float random(float t) { return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0; }
    float getPlasmaY(float x, float horizontalFade, float offset) { return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset; }
    void main() {
      vec2 fragCoord = gl_FragCoord.xy; vec2 uv = fragCoord / iResolution;
      vec2 space = (fragCoord - iResolution * 0.5) / iResolution.x * 2.0 * scale;
      float horizontalFade = 1.0 - (cos(uv.x * 6.28318) * 0.5 + 0.5);
      float verticalFade = 1.0 - (cos(uv.y * 6.28318) * 0.5 + 0.5);
      space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
      space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;
      vec4 lines = vec4(0.0);
      vec4 bgColor1 = vec4(0.10, 0.10, 0.10, 1.0);
      vec4 bgColor2 = vec4(0.18, 0.18, 0.18, 1.0);
      for (int l = 0; l < linesPerGroup; l++) {
        float normalizedLineIndex = float(l) / float(linesPerGroup);
        float offsetTime = iTime * offsetSpeed;
        float offsetPosition = float(l) + space.x * offsetFrequency;
        float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
        float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) * 0.5;
        float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
        float linePosition = getPlasmaY(space.x, horizontalFade, offset);
        float line = drawSmoothLine(linePosition, halfWidth, space.y) * 0.5 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);
        float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
        vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
        float circle = drawCircle(circlePosition, 0.01, space) * 3.0;
        lines += (line + circle) * lineColor * rand;
      }
      vec4 fragColor = mix(bgColor1, bgColor2, uv.x);
      fragColor *= verticalFade; fragColor += lines; gl_FragColor = fragColor;
    }
  `;

  function compile(gl, type, src) {
    const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(sh)); gl.deleteShader(sh); return null; }
    return sh;
  }
  function link(gl, vs, fs) {
    const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); return null; }
    return prog;
  }

  const vs = compile(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;
  const prog = link(gl, vs, fs); if (!prog) return;
  gl.useProgram(prog);

  const posLoc = gl.getAttribLocation(prog, 'aVertexPosition');
  const resLoc = gl.getUniformLocation(prog, 'iResolution');
  const timeLoc = gl.getUniformLocation(prog, 'iTime');

  const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([ -1,-1, 1,-1, -1,1, 1,1 ]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // cap for perf
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h; canvas.style.width = '100vw'; canvas.style.height = '100vh';
      gl.viewport(0, 0, w, h);
    }
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  let rafId = 0; let start = performance.now();
  function frame(now) {
    const t = (now - start) / 1000;
    gl.clearColor(0,0,0,1); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(timeLoc, t);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    rafId = requestAnimationFrame(frame);
  }

  // Visibility handling
  function onVis() {
    if (document.hidden) { cancelAnimationFrame(rafId); rafId = 0; }
    else if (!rafId) { start = performance.now(); rafId = requestAnimationFrame(frame); }
  }
  document.addEventListener('visibilitychange', onVis);

  // Context lost/restored handling
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); cancelAnimationFrame(rafId); }, false);
  canvas.addEventListener('webglcontextrestored', () => { resize(); rafId = requestAnimationFrame(frame); }, false);

  // Start
  rafId = requestAnimationFrame(frame);

  // Hide gradient bg to avoid stacking
  const gradientBg = document.querySelector('.bg');
  if (gradientBg) gradientBg.style.display = 'none';
})();


