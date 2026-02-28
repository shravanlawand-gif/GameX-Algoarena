/**
 * Web Audio API Synthesizer — zero external dependencies.
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

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "sine",
  volume = 0.15,
  detune = 0,
  panX = 0
) {
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

/* ---------- Sound Effects ---------- */

const sounds = {
  /** UI hover — light crystal ping */
  hover() {
    playTone(2400, 0.08, "sine", 0.06);
    playTone(3200, 0.06, "sine", 0.03);
  },

  /** UI click — satisfying snap */
  click() {
    playTone(800, 0.06, "square", 0.08);
    playTone(1200, 0.1, "sine", 0.1);
    noise(0.03, 0.03);
  },

  /** Page transition — whoosh sweep */
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

  /** Energy beam — laser zap */
  beam(direction: "left" | "right" = "left") {
    const pan = direction === "left" ? -0.7 : 0.7;
    playTone(300, 0.5, "sawtooth", 0.12, 0, pan);
    playTone(600, 0.4, "square", 0.06, 10, pan);
    setTimeout(() => playTone(900, 0.3, "sine", 0.08, -5, pan), 50);
    noise(0.25, 0.04);
  },

  /** Impact hit — thud + crackle */
  impact(side: "left" | "right" = "left") {
    const pan = side === "left" ? -0.6 : 0.6;
    playTone(80, 0.3, "sine", 0.2, 0, pan);
    playTone(60, 0.4, "triangle", 0.15, 0, pan);
    noise(0.15, 0.08);
    setTimeout(() => noise(0.1, 0.04), 80);
  },

  /** Damage taken — distorted crunch */
  damage() {
    playTone(120, 0.2, "sawtooth", 0.15);
    playTone(90, 0.3, "square", 0.1, 20);
    noise(0.2, 0.06);
  },

  /** Correct answer — melodic chime */
  correct() {
    playTone(523, 0.15, "sine", 0.12);
    setTimeout(() => playTone(659, 0.15, "sine", 0.12), 80);
    setTimeout(() => playTone(784, 0.2, "sine", 0.14), 160);
    setTimeout(() => playTone(1047, 0.35, "sine", 0.1), 250);
  },

  /** Wrong answer — descending buzz */
  wrong() {
    playTone(400, 0.12, "square", 0.1);
    setTimeout(() => playTone(300, 0.12, "square", 0.08), 100);
    setTimeout(() => playTone(200, 0.2, "sawtooth", 0.06), 200);
  },

  /** Victory fanfare */
  victory() {
    const notes = [523, 659, 784, 1047, 1319];
    notes.forEach((n, i) => {
      setTimeout(() => playTone(n, 0.4, "sine", 0.12), i * 120);
      setTimeout(() => playTone(n * 1.5, 0.3, "triangle", 0.06), i * 120 + 40);
    });
    setTimeout(() => noise(0.3, 0.03), 500);
  },

  /** Defeat — dark descend */
  defeat() {
    playTone(400, 0.5, "sawtooth", 0.08);
    setTimeout(() => playTone(300, 0.5, "sawtooth", 0.07), 200);
    setTimeout(() => playTone(200, 0.6, "sawtooth", 0.06), 400);
    setTimeout(() => playTone(100, 0.8, "sine", 0.1), 600);
  },

  /** Intro boot — digital startup */
  introBoot() {
    const freqs = [200, 400, 600, 800, 1200, 1600];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        playTone(f, 0.12, "square", 0.05);
        playTone(f * 1.01, 0.12, "sine", 0.03);
      }, i * 80);
    });
    setTimeout(() => noise(0.2, 0.03), 500);
    setTimeout(() => playTone(2000, 0.5, "sine", 0.08), 600);
  },

  /** Fight start — dramatic horn */
  fightStart() {
    playTone(200, 0.6, "sawtooth", 0.15);
    playTone(300, 0.5, "sawtooth", 0.12);
    playTone(400, 0.4, "square", 0.1);
    setTimeout(() => {
      playTone(600, 0.3, "sine", 0.12);
      playTone(800, 0.4, "sine", 0.1);
      noise(0.2, 0.05);
    }, 200);
  },

  /** Typing character — tiny tick */
  type() {
    playTone(1800 + Math.random() * 600, 0.03, "square", 0.02);
  },

  /** Level up chime */
  levelUp() {
    [523, 659, 784, 1047].forEach((n, i) => {
      setTimeout(() => {
        playTone(n, 0.25, "sine", 0.1);
        playTone(n * 2, 0.2, "triangle", 0.04);
      }, i * 100);
    });
  },
};

/* ---------- Ambient Background ---------- */

function startAmbient() {
  const { ctx: c, master } = getCtx();
  if (ambientOsc) return;

  ambientGain = c.createGain();
  ambientGain.gain.value = 0.015;
  ambientGain.connect(master);

  // Deep drone
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

  // High shimmer
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

  // Bass pulse
  const bass = c.createOscillator();
  bass.type = "sawtooth";
  bass.frequency.value = 55;
  const bassGain = c.createGain();
  bassGain.gain.value = 0.6;
  const bassLfo = c.createOscillator();
  bassLfo.type = "square";
  bassLfo.frequency.value = 2;
  const bassLfoGain = c.createGain();
  bassLfoGain.gain.value = 0.5;
  bassLfo.connect(bassLfoGain).connect(bassGain.gain);
  bassLfo.start();
  bass.connect(bassGain).connect(gain);
  bass.start();
  oscs.push(bass, bassLfo);

  // Pad
  const pad = c.createOscillator();
  pad.type = "triangle";
  pad.frequency.value = 110;
  const padGain = c.createGain();
  padGain.gain.value = 0.3;
  pad.connect(padGain).connect(gain);
  pad.start();
  oscs.push(pad);

  // High tension
  const hi = c.createOscillator();
  hi.type = "sine";
  hi.frequency.value = 440;
  const hiGain = c.createGain();
  hiGain.gain.value = 0.08;
  const hiLfo = c.createOscillator();
  hiLfo.type = "sine";
  hiLfo.frequency.value = 0.5;
  const hiLfoGain = c.createGain();
  hiLfoGain.gain.value = 0.06;
  hiLfo.connect(hiLfoGain).connect(hiGain.gain);
  hiLfo.start();
  hi.connect(hiGain).connect(gain);
  hi.start();
  oscs.push(hi, hiLfo);

  musicNodes = { oscs, gain };
}

function setMusicIntensity(value: number) {
  musicIntensity = Math.max(0, Math.min(1, value));
  if (musicNodes) {
    musicNodes.gain.gain.linearRampToValueAtTime(
      0.04 * musicIntensity,
      (ctx?.currentTime ?? 0) + 0.3
    );
  }
}

function stopBattleMusic() {
  if (!musicNodes) return;
  try {
    musicNodes.oscs.forEach(o => { try { o.stop(); } catch {} });
  } catch {}
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
    /** Ensure AudioContext is unlocked (call on first user gesture) */
    unlock() { getCtx(); },
  };
}

export type SoundEngine = ReturnType<typeof useSoundEngine>;
