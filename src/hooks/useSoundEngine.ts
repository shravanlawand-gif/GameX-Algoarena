/**
 * Web Audio API War Synthesizer — zero external dependencies.
 * Generates all game sounds programmatically with spatial audio support.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let musicNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null;
let muted = false;
let musicIntensity = 0.3;

function getCtx() {
  if (!ctx) {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume();
  return { ctx, master: masterGain! };
}

/* ---------- Primitive synth helpers ---------- */

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15, detune = 0, panX = 0) {
  const { ctx: c, master } = getCtx();
  if (muted) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const pan = c.createStereoPanner();
  osc.type = type;
  osc.frequency.value = freq;
  osc.detune.value = detune;
  pan.pan.value = Math.max(-1, Math.min(1, panX));
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  osc.connect(gain).connect(pan).connect(master);
  osc.start();
  osc.stop(c.currentTime + duration);
}

function noise(duration: number, volume = 0.04) {
  const { ctx: c, master } = getCtx();
  if (muted) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * volume;
  const src = c.createBufferSource();
  const gain = c.createGain();
  src.buffer = buffer;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(gain).connect(master);
  src.start();
}

/** Low-pass filtered noise for rumble/explosion bass */
function filteredNoise(duration: number, volume = 0.1, cutoff = 200) {
  const { ctx: c, master } = getCtx();
  if (muted) return;
  const bufferSize = c.sampleRate * duration;
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1);
  const src = c.createBufferSource();
  const gain = c.createGain();
  const filter = c.createBiquadFilter();
  src.buffer = buffer;
  filter.type = "lowpass";
  filter.frequency.value = cutoff;
  filter.Q.value = 1;
  gain.gain.setValueAtTime(volume, c.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  src.connect(filter).connect(gain).connect(master);
  src.start();
}

/* ---------- Sound Effects ---------- */

const sounds = {
  hover() {
    playTone(2400, 0.08, "sine", 0.06);
    playTone(3200, 0.06, "sine", 0.03);
  },

  click() {
    playTone(800, 0.06, "square", 0.08);
    playTone(1200, 0.1, "sine", 0.1);
    noise(0.03, 0.03);
  },

  transition() {
    const { ctx: c, master } = getCtx();
    if (muted) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(200, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, c.currentTime + 0.15);
    osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.3);
    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.35);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(c.currentTime + 0.4);
    noise(0.12, 0.02);
  },

  /** Heavy energy beam with charge-up */
  beam(direction: "left" | "right" = "left") {
    const pan = direction === "left" ? -0.7 : 0.7;
    // Charge whine
    playTone(200, 0.3, "sawtooth", 0.06, 0, pan);
    setTimeout(() => {
      // Main beam
      playTone(150, 0.6, "sawtooth", 0.15, 0, pan);
      playTone(300, 0.5, "square", 0.08, 10, pan);
      playTone(600, 0.4, "sine", 0.06, -5, pan);
      filteredNoise(0.4, 0.06, 300);
    }, 100);
  },

  /** Heavy metal impact — deep thud with metallic crunch */
  heavyImpact(side: "left" | "right" = "left") {
    const pan = side === "left" ? -0.6 : 0.6;
    // Deep sub bass thud
    playTone(35, 0.5, "sine", 0.25, 0, pan);
    playTone(50, 0.4, "triangle", 0.2, 0, pan);
    // Metal crunch
    noise(0.2, 0.12);
    filteredNoise(0.6, 0.15, 150);
    // Debris scatter
    setTimeout(() => {
      noise(0.15, 0.05);
      playTone(2000 + Math.random() * 1000, 0.08, "sine", 0.03, 0, pan);
      playTone(3000 + Math.random() * 1000, 0.06, "sine", 0.02, 0, pan);
    }, 100);
    // Echo
    setTimeout(() => {
      playTone(40, 0.3, "sine", 0.08, 0, pan * 0.5);
      filteredNoise(0.3, 0.04, 100);
    }, 250);
  },

  /** Weapon charge — rising energy hum */
  weaponCharge(pan = 0) {
    const { ctx: c, master } = getCtx();
    if (muted) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(80, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, c.currentTime + 0.6);
    gain.gain.setValueAtTime(0.03, c.currentTime);
    gain.gain.linearRampToValueAtTime(0.1, c.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.7);
    const p = c.createStereoPanner();
    p.pan.value = pan;
    osc.connect(gain).connect(p).connect(master);
    osc.start();
    osc.stop(c.currentTime + 0.8);
    // High-pitched whine
    const osc2 = c.createOscillator();
    const gain2 = c.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1200, c.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(3000, c.currentTime + 0.5);
    gain2.gain.setValueAtTime(0.01, c.currentTime);
    gain2.gain.linearRampToValueAtTime(0.04, c.currentTime + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
    osc2.connect(gain2).connect(p).connect(master);
    osc2.start();
    osc2.stop(c.currentTime + 0.7);
  },

  /** Explosion — bass boom with shockwave */
  explosion() {
    playTone(30, 0.8, "sine", 0.3);
    playTone(45, 0.6, "triangle", 0.2);
    filteredNoise(0.8, 0.2, 200);
    noise(0.3, 0.1);
    // Shockwave whoosh
    setTimeout(() => {
      const { ctx: c, master } = getCtx();
      if (muted) return;
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(500, c.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, c.currentTime + 0.5);
      gain.gain.setValueAtTime(0.08, c.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.6);
      osc.connect(gain).connect(master);
      osc.start();
      osc.stop(c.currentTime + 0.7);
    }, 50);
  },

  /** Shield activation */
  shieldUp() {
    playTone(200, 0.3, "sine", 0.08);
    playTone(400, 0.25, "sine", 0.06);
    playTone(600, 0.2, "sine", 0.04);
    setTimeout(() => playTone(800, 0.4, "sine", 0.06), 100);
  },

  /** Shield break */
  shieldBreak() {
    noise(0.3, 0.1);
    playTone(1000, 0.15, "square", 0.08);
    setTimeout(() => playTone(500, 0.15, "square", 0.06), 50);
    setTimeout(() => playTone(200, 0.2, "sawtooth", 0.05), 100);
  },

  /** Armor crack */
  armorCrack() {
    playTone(2000, 0.05, "square", 0.08);
    noise(0.08, 0.06);
    playTone(100, 0.15, "triangle", 0.1);
  },

  /** Robot footstep — heavy mechanical thud */
  footstep(pan = 0) {
    playTone(40, 0.2, "sine", 0.12, 0, pan);
    filteredNoise(0.15, 0.06, 120);
  },

  /** Robot power up — dramatic activation */
  robotPowerUp() {
    const freqs = [50, 100, 200, 400, 600, 800, 1000, 1200];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        playTone(f, 0.3, "sine", 0.04 + i * 0.01);
        if (i > 4) playTone(f * 1.5, 0.2, "triangle", 0.02);
      }, i * 120);
    });
    setTimeout(() => filteredNoise(0.5, 0.08, 200), 400);
    setTimeout(() => {
      playTone(1600, 0.8, "sine", 0.08);
      noise(0.2, 0.04);
    }, 1000);
  },

  /** Mechanical servo movement */
  servo() {
    playTone(800 + Math.random() * 400, 0.06, "square", 0.03);
    playTone(200 + Math.random() * 100, 0.04, "triangle", 0.02);
  },

  /** Cooling vent hiss */
  coolingVent(pan = 0) {
    noise(0.4, 0.04);
    playTone(4000, 0.3, "sine", 0.02, 0, pan);
  },

  impact(side: "left" | "right" = "left") {
    sounds.heavyImpact(side);
  },

  damage() {
    playTone(120, 0.2, "sawtooth", 0.15);
    playTone(90, 0.3, "square", 0.1, 20);
    noise(0.2, 0.06);
    sounds.armorCrack();
  },

  correct() {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 80);
    setTimeout(() => playTone(784, 0.2, "sine", 0.14), 160);
    setTimeout(() => playTone(1047, 0.35, "sine", 0.1), 250);
  },

  wrong() {
    playTone(400, 0.12, "square", 0.1);
    setTimeout(() => playTone(300, 0.12, "square", 0.08), 100);
    setTimeout(() => playTone(200, 0.2, "sawtooth", 0.06), 200);
  },

  victory() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.4, "sine", 0.12), i * 120);
      setTimeout(() => playTone(n * 1.5, 0.3, "triangle", 0.06), i * 120 + 40);
    });
    setTimeout(() => sounds.explosion(), 500);
  },

  defeat() {
    playTone(400, 0.5, "sawtooth", 0.08);
    setTimeout(() => playTone(300, 0.5, "sawtooth", 0.07), 200);
    setTimeout(() => playTone(200, 0.6, "sawtooth", 0.06), 400);
    setTimeout(() => { playTone(100, 0.8, "sine", 0.1); sounds.explosion(); }, 600);
  },

  introBoot() {
    sounds.robotPowerUp();
  },

  /** War horn — dramatic battle start */
  fightStart() {
    // Deep war horn
    playTone(80, 1.2, "sawtooth", 0.12);
    playTone(120, 1.0, "sawtooth", 0.1);
    playTone(160, 0.8, "triangle", 0.08);
    setTimeout(() => {
      playTone(240, 0.5, "sine", 0.1);
      playTone(360, 0.4, "sine", 0.08);
      filteredNoise(0.5, 0.08, 200);
    }, 300);
    // Metallic clash
    setTimeout(() => {
      noise(0.15, 0.08);
      playTone(3000, 0.1, "square", 0.04);
    }, 600);
  },

  type() {
    playTone(1800 + Math.random() * 600, 0.03, "square", 0.02);
  },

  levelUp() {
    [523, 659, 784, 1047].forEach((n, i) => {
      setTimeout(() => {
        playTone(n, 0.25, "sine", 0.1);
        playTone(n * 2, 0.2, "triangle", 0.04);
      }, i * 100);
    });
  },

  /** Slow-motion activation sound */
  slowMo() {
    const { ctx: c, master } = getCtx();
    if (muted) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(600, c.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, c.currentTime + 0.8);
    gain.gain.setValueAtTime(0.06, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 1);
    osc.connect(gain).connect(master);
    osc.start();
    osc.stop(c.currentTime + 1.1);
  },

  /** Distant war ambience */
  distantExplosion() {
    setTimeout(() => {
      playTone(25, 0.6, "sine", 0.04);
      filteredNoise(0.4, 0.03, 80);
    }, Math.random() * 200);
  },
};

/* ---------- Ambient Background ---------- */

function startAmbient() {
  const { ctx: c, master } = getCtx();
  if (ambientOsc) return;

  ambientGain = c.createGain();
  ambientGain.gain.value = 0.015;
  ambientGain.connect(master);

  ambientOsc = c.createOscillator();
  ambientOsc.type = "sine";
  ambientOsc.frequency.value = 55;
  const lfo = c.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.15;
  const lfoGain = c.createGain();
  lfoGain.gain.value = 8;
  lfo.connect(lfoGain).connect(ambientOsc.frequency);
  lfo.start();
  ambientOsc.connect(ambientGain);
  ambientOsc.start();

  const shimmer = c.createOscillator();
  shimmer.type = "sine";
  shimmer.frequency.value = 880;
  const shimGain = c.createGain();
  shimGain.gain.value = 0.005;
  const shimLfo = c.createOscillator();
  shimLfo.type = "sine";
  shimLfo.frequency.value = 0.08;
  const shimLfoGain = c.createGain();
  shimLfoGain.gain.value = 3;
  shimLfo.connect(shimLfoGain).connect(shimmer.frequency);
  shimLfo.start();
  shimmer.connect(shimGain).connect(master);
  shimmer.start();
}

function stopAmbient() {
  try { ambientOsc?.stop(); } catch {}
  ambientOsc = null;
  ambientGain = null;
}

/* ---------- Dynamic Battle Music ---------- */

function startBattleMusic() {
  const { ctx: c, master } = getCtx();
  if (musicNodes) return;

  const gain = c.createGain();
  gain.gain.value = 0.04 * musicIntensity;
  gain.connect(master);

  const oscs: OscillatorNode[] = [];

  // Heavy bass pulse
  const bass = c.createOscillator();
  bass.type = "sawtooth";
  bass.frequency.value = 40;
  const bassGain = c.createGain();
  bassGain.gain.value = 0.7;
  const bassLfo = c.createOscillator();
  bassLfo.type = "square";
  bassLfo.frequency.value = 1.5;
  const bassLfoGain = c.createGain();
  bassLfoGain.gain.value = 0.6;
  bassLfo.connect(bassLfoGain).connect(bassGain.gain);
  bassLfo.start();
  bass.connect(bassGain).connect(gain);
  bass.start();
  oscs.push(bass, bassLfo);

  // War pad
  const pad = c.createOscillator();
  pad.type = "triangle";
  pad.frequency.value = 80;
  const padGain = c.createGain();
  padGain.gain.value = 0.35;
  pad.connect(padGain).connect(gain);
  pad.start();
  oscs.push(pad);

  // Tension drone
  const drone = c.createOscillator();
  drone.type = "sine";
  drone.frequency.value = 220;
  const droneGain = c.createGain();
  droneGain.gain.value = 0.06;
  const droneLfo = c.createOscillator();
  droneLfo.type = "sine";
  droneLfo.frequency.value = 0.3;
  const droneLfoGain = c.createGain();
  droneLfoGain.gain.value = 0.04;
  droneLfo.connect(droneLfoGain).connect(droneGain.gain);
  droneLfo.start();
  drone.connect(droneGain).connect(gain);
  drone.start();
  oscs.push(drone, droneLfo);

  // Sub rumble
  const sub = c.createOscillator();
  sub.type = "sine";
  sub.frequency.value = 30;
  const subGain = c.createGain();
  subGain.gain.value = 0.15;
  sub.connect(subGain).connect(gain);
  sub.start();
  oscs.push(sub);

  musicNodes = { oscs, gain };
}

function setMusicIntensity(value: number) {
  musicIntensity = Math.max(0, Math.min(1, value));
  if (musicNodes) {
    musicNodes.gain.gain.linearRampToValueAtTime(0.04 * musicIntensity, (ctx?.currentTime ?? 0) + 0.3);
  }
}

function stopBattleMusic() {
  if (!musicNodes) return;
  try { musicNodes.oscs.forEach(o => { try { o.stop(); } catch {} }); } catch {}
  musicNodes = null;
}

/* ---------- Hook ---------- */

export function useSoundEngine() {
  return {
    sounds,
    startAmbient,
    stopAmbient,
    startBattleMusic,
    stopBattleMusic,
    setMusicIntensity,
    setMuted(v: boolean) { muted = v; },
    isMuted() { return muted; },
    unlock() { getCtx(); },
  };
}

export type SoundEngine = ReturnType<typeof useSoundEngine>;
