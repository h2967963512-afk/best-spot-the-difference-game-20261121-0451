// Synthesized sound: no audio files, every effect is an oscillator through the Web Audio
// API. The context is created lazily on the first user gesture (browsers block audio
// before one), and everything is silent while muted.

export function createAudio() {
  let context = null;
  let muted = false;
  let musicTimer = null;
  let musicStep = 0;

  // A soft music-box loop: C major pentatonic, one note per beat, quiet underneath play.
  const MELODY = [523.25, 587.33, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33];

  function ensure() {
    if (context) return context;
    try {
      const AC = window.AudioContext ?? window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    } catch {
      return null;
    }
    return context;
  }

  function tone(freq, at, dur, type, gain) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      amp.gain.setValueAtTime(0.0001, at);
      amp.gain.exponentialRampToValueAtTime(gain, at + 0.02);
      amp.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(amp).connect(ctx.destination);
      osc.start(at);
      osc.stop(at + dur + 0.05);
    } catch {
      // Audio is decoration: a failure here never breaks the game.
    }
  }

  function now() {
    const ctx = ensure();
    return ctx ? ctx.currentTime : 0;
  }

  return {
    /** Call from a user gesture so the browser unlocks audio. */
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
    },
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopMusic();
      return muted;
    },
    /** A bright two-note chime when a difference is found. */
    found() {
      const t = now();
      tone(880.0, t, 0.18, 'sine', 0.22);
      tone(1318.5, t + 0.09, 0.28, 'sine', 0.2);
    },
    /** A dull buzz when a click lands on nothing. */
    wrong() {
      const t = now();
      tone(160, t, 0.16, 'square', 0.08);
      tone(120, t + 0.1, 0.2, 'square', 0.07);
    },
    /** A soft tick for buttons and the hint. */
    click() {
      tone(660, now(), 0.07, 'triangle', 0.12);
    },
    /** A short rising arpeggio when a level is cleared. */
    win() {
      const t = now();
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, t + i * 0.11, 0.3, 'triangle', 0.18));
    },
    /** One tick when the timer drops under ten seconds. */
    tick() {
      tone(1200, now(), 0.05, 'square', 0.05);
    },
    startMusic() {
      if (musicTimer || muted) return;
      musicTimer = window.setInterval(() => {
        if (muted) return;
        const f = MELODY[musicStep % MELODY.length];
        musicStep += 1;
        tone(f, now(), 0.5, 'sine', 0.045);
      }, 420);
    },
    stopMusic() {
      if (musicTimer) {
        window.clearInterval(musicTimer);
        musicTimer = null;
      }
    },
  };
}
