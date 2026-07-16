(() => {
  const cat = document.querySelector('.cat');
  const speech = document.querySelector('.speech');
  const hearts = document.querySelector('.hearts');
  const soundButton = document.querySelector('.sound-toggle');
  const soundLabel = document.querySelector('.sound-label');
  const chimes = [...document.querySelectorAll('.chime')];
  const eyes = [...document.querySelectorAll('.eye i')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let audioContext;
  let soundOn = false;
  let idleTimer;
  let snoreTimer;
  let welcomeTimer;
  let lastMeow = 0;

  document.getElementById('year').textContent = new Date().getFullYear();

  function ensureAudio() {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  }

  function tone(frequency, duration = 1.15, type = 'sine', volume = .018) {
    if (!soundOn) return;
    ensureAudio();
    const now = audioContext.currentTime;
    const master = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    master.gain.setValueAtTime(.0001, now);
    master.gain.exponentialRampToValueAtTime(volume, now + .008);
    master.gain.exponentialRampToValueAtTime(.0001, now + duration);
    filter.type = 'highpass';
    filter.frequency.value = 260;
    master.connect(filter).connect(audioContext.destination);

    [[1, 1], [2.01, .34], [3.92, .12]].forEach(([ratio, level]) => {
      const oscillator = audioContext.createOscillator();
      const partial = audioContext.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency * ratio, now);
      partial.gain.value = level;
      oscillator.connect(partial).connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  }

  function meow() {
    if (!soundOn || Date.now() - lastMeow < 900) return;
    lastMeow = Date.now();
    ensureAudio();
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(520, now);
    oscillator.frequency.exponentialRampToValueAtTime(760, now + .1);
    oscillator.frequency.exponentialRampToValueAtTime(430, now + .42);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.035, now + .04);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .45);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + .46);
  }

  soundButton.addEventListener('click', () => {
    soundOn = !soundOn;
    soundButton.setAttribute('aria-pressed', String(soundOn));
    soundButton.setAttribute('aria-label', soundOn ? 'Tắt âm thanh' : 'Bật âm thanh');
    soundLabel.textContent = soundOn ? 'Sound on' : 'Sound off';
    if (soundOn) { ensureAudio(); tone(784, .8, 'sine', .014); setTimeout(() => tone(1046.5, .9, 'sine', .012), 110); }
  });

  function releaseHearts() {
    for (let i = 0; i < 5; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      heart.textContent = '♥';
      heart.style.setProperty('--x', `${(Math.random() - .5) * 90}px`);
      heart.style.setProperty('--r', `${(Math.random() - .5) * 50}deg`);
      heart.style.animationDelay = `${i * 70}ms`;
      hearts.appendChild(heart);
      setTimeout(() => heart.remove(), 1700);
    }
  }

  function greet() {
    resetIdle();
    cat.classList.remove('sleeping', 'snoring');
    cat.classList.add('tilt', 'waving');
    speech.classList.add('show');
    releaseHearts();
    meow();
    clearTimeout(welcomeTimer);
    welcomeTimer = setTimeout(() => {
      cat.classList.remove('tilt', 'waving');
      speech.classList.remove('show');
    }, 2400);
  }
  cat.addEventListener('click', greet);

  function resetIdle() {
    clearTimeout(idleTimer);
    clearTimeout(snoreTimer);
    if (cat.classList.contains('sleeping')) cat.classList.remove('sleeping', 'snoring');
    idleTimer = setTimeout(() => cat.classList.add('sleeping'), 30000);
    snoreTimer = setTimeout(() => cat.classList.add('sleeping', 'snoring'), 60000);
  }
  ['pointerdown', 'keydown', 'scroll'].forEach(event => addEventListener(event, resetIdle, { passive: true }));
  resetIdle();

  if (!reducedMotion) {
    addEventListener('pointermove', event => {
      const rect = cat.getBoundingClientRect();
      const x = Math.max(-2.5, Math.min(2.5, (event.clientX - (rect.left + rect.width / 2)) / 70));
      const y = Math.max(-2, Math.min(2, (event.clientY - (rect.top + rect.height / 2)) / 70));
      eyes.forEach(eye => { eye.style.setProperty('--eye-x', `${x}px`); eye.style.setProperty('--eye-y', `${y}px`); });
    }, { passive: true });
  }

  chimes.forEach((chime, index) => {
    const hit = () => {
      chime.classList.remove('hit');
      void chime.offsetWidth;
      chime.classList.add('hit');
      const notes = [1046.5, 1174.7, 880, 784, 987.8, 698.5];
      tone(notes[index], 1.2, 'sine', .016);
    };
    chime.addEventListener('pointerenter', hit);
    chime.addEventListener('pointerdown', event => {
      event.preventDefault();
      chime.setPointerCapture?.(event.pointerId);
      hit();
    });
  });

  setInterval(() => {
    if (soundOn && document.visibilityState === 'visible' && !cat.classList.contains('sleeping') && Math.random() > .72) meow();
  }, 45000);
})();
