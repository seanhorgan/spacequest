// Retro Audio Synthesizer for Space Quest I Web Tribute
// Uses native Web Audio API to generate IBM PC/Tandy-like sound effects and melodies

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playTone(frequency, duration, type = 'square', volume = 0.1) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    // Smooth fade-out to prevent clicks
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error("Audio playback error:", e);
  }
}

export function playLaser() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

    gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error(e);
  }
}

export function playExplosion() {
  try {
    const ctx = getAudioContext();
    const duration = 1.0;
    
    // Create noise source or a very low oscillator rumble with sweeping filter
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(10, ctx.currentTime + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + duration);

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

export function playLaunch() {
  try {
    const ctx = getAudioContext();
    const duration = 2.0;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + duration);

    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.error(e);
  }
}

export function playScoreSound() {
  // Classic 8-bit positive fanfare/chime
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.15, 'triangle', 0.1);
    }, idx * 100);
  });
}

export function playDeathSound() {
  // Melancholy descending game over arpeggio
  const notes = [392.00, 349.23, 311.13, 261.63, 196.00]; // G4, F4, Eb4, C4, G3
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.3, 'square', 0.15);
    }, idx * 200);
  });
}

export function playBeep() {
  playTone(880, 0.05, 'sine', 0.05);
}

export function playSuccess() {
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      playTone(freq, 0.1, 'sine', 0.08);
    }, idx * 80);
  });
}

// Global variable to keep track of theme music loop
let themeInterval = null;

export function playThemeMusic() {
  try {
    const ctx = getAudioContext();
    if (themeInterval) clearInterval(themeInterval);

    // Simplistic retro arpeggiation/melody of space theme
    // Notes: C4, G4, Eb4, D4, C4, G4...
    const melody = [
      { f: 261.63, d: 0.3 }, // C4
      { f: 392.00, d: 0.3 }, // G4
      { f: 311.13, d: 0.3 }, // Eb4
      { f: 293.66, d: 0.3 }, // D4
      { f: 261.63, d: 0.3 }, // C4
      { f: 392.00, d: 0.3 }, // G4
      { f: 466.16, d: 0.6 }, // Bb4
      { f: 523.25, d: 0.6 }, // C5
    ];

    let current = 0;
    const playNext = () => {
      const note = melody[current];
      playTone(note.f, note.d, 'triangle', 0.08);
      current = (current + 1) % melody.length;
    };

    playNext();
    themeInterval = setInterval(playNext, 400);
  } catch (e) {
    console.error(e);
  }
}

export function stopThemeMusic() {
  if (themeInterval) {
    clearInterval(themeInterval);
    themeInterval = null;
  }
}
