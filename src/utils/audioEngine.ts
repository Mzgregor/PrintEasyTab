/**
 * Audio Engine utilizing Web Audio API
 * Centralizes instrument synthesis for consistency and performance.
 */

// ==========================================
// CONSTANTS & TYPES
// ==========================================

export type InstrumentType = 'acoustic-guitar' | 'piano' | 'voice';

// Global shared buffers (generated once)
let sharedNoiseBuffer: AudioBuffer | null = null;
let sharedHammerBuffer: AudioBuffer | null = null;

// ==========================================
// UTILITIES
// ==========================================

const createBuffer = (ctx: AudioContext, currBuffer: AudioBuffer | null, length: number, filler: (data: Float32Array) => void): AudioBuffer => {
    if (currBuffer) return currBuffer;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
    filler(buffer.getChannelData(0));
    return buffer;
};

const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    sharedNoiseBuffer = createBuffer(ctx, sharedNoiseBuffer, 0.5, (data) => {
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
    });
    return sharedNoiseBuffer;
};

const getHammerBuffer = (ctx: AudioContext): AudioBuffer => {
    // Thud-like percussive noise
    sharedHammerBuffer = createBuffer(ctx, sharedHammerBuffer, 0.1, (data) => {
        for (let i = 0; i < data.length; i++) {
            // Exponential decay noise
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i * 0.05);
        }
    });
    return sharedHammerBuffer;
};

// ==========================================
// PIANO SYNTHESIS
// ==========================================

/**
 * Creates a physically modeled Grand Piano sound.
 * Features:
 * - Inharmonicity (Stiff strings stretch harmonics)
 * - Hammer Strike Noise
 * - Three-string unison (Detuned "Choir" effect)
 * - Frequency-dependent decay
 */
export const createPianoVoice = (
    ctx: AudioContext,
    freq: number,
    now: number,
    duration: number = 2.5
): void => {
    // 1. HAMMER NOISE
    const noise = ctx.createBufferSource();
    noise.buffer = getHammerBuffer(ctx);

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 400 + (freq * 0.5); // Brighter hammer for higher notes

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); // Short thud

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);

    // 2. STRING SYNTHESIS
    // Piano strings are stiff. Harmonics are not perfect integers (f, 2f, 3f...),
    // they are slightly sharp: f_n = n * f0 * sqrt(1 + B * n^2)
    // We simulate this with additive synthesis for lower partials and FM/Wave shaping for body.

    // Inharmonicity Coefficient (B) - determines "metallicness"
    // Higher for small pianos/low strings. Lower for grand pianos.
    let B = 0.0004;
    if (freq < 100) B = 0.0008; // Bass strings are stiffer

    const partials = [1, 2, 3, 4, 5, 6];

    // Unison Detuning (Choir Effect)
    // 3 strings per key for mid/highs. 1 or 2 for bass.
    const unisons = freq < 100 ? [0] : [-1.5, 0, 1.5]; // Cents

    unisons.forEach((detuneCents) => {
        // Calculate detuned fundamental
        const detuneRatio = Math.pow(2, detuneCents / 1200);
        const f0 = freq * detuneRatio;

        partials.forEach((n) => {
            // Calculate Stretched Harmonic Frequency
            // fn = n * f0 * sqrt(1 + B * n^2)
            const stretch = Math.sqrt(1 + B * (n * n));
            const fn = n * f0 * stretch;

            // Amplitude falloff for harmonics (low harmonics stronger)
            let amp = 1.0 / Math.pow(n, 1.5);

            // Higher frequencies decay faster
            const releaseTime = duration / Math.sqrt(n);

            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(fn, now);

            const g = ctx.createGain();

            // Envelope
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(amp * 0.3, now + 0.01); // Quick attack
            g.gain.exponentialRampToValueAtTime(amp * 0.1, now + 0.1); // Initial decay
            g.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime); // Long tail

            osc.connect(g);
            g.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + releaseTime + 0.1);
        });
    });
};

// ==========================================
// ACOUSTIC GUITAR SYNTHESIS (Ported & Cleaned)
// ==========================================

export const createAcousticGuitarVoice = (
    ctx: AudioContext,
    freq: number,
    now: number,
    duration: number = 3.5
): void => {
    // Fundamental
    const createHarmonic = (ratio: number, gain: number, decay: number) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.frequency.setValueAtTime(freq * ratio, now);

        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gain, now + 0.005);
        g.gain.exponentialRampToValueAtTime(gain * 0.6, now + 0.05); // Pluck snap
        g.gain.exponentialRampToValueAtTime(0.0001, now + decay);

        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + decay + 0.1);
    };

    createHarmonic(1, 0.4, duration);
    createHarmonic(2, 0.2, duration * 0.7);
    createHarmonic(3, 0.1, duration * 0.5);
    createHarmonic(4, 0.05, duration * 0.4);

    // Pick Noise (Attack)
    const noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;

    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0, now);
    nGain.gain.linearRampToValueAtTime(0.15, now + 0.002);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(ctx.destination);
    noise.start(now);
};

// ==========================================
// VOICE SYNTHESIS (Ported)
// ==========================================

export const createVoiceVoice = (
    ctx: AudioContext,
    freq: number,
    now: number,
    duration: number = 2.5
): void => {
    const source = ctx.createOscillator();
    source.type = 'sawtooth';
    source.frequency.setValueAtTime(freq, now);

    const vibrato = ctx.createOscillator();
    vibrato.frequency.setValueAtTime(5.8, now);
    const vg = ctx.createGain();
    vg.gain.setValueAtTime(freq * 0.015, now);
    vibrato.connect(vg);
    vg.connect(source.frequency);
    vibrato.start(now);

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, now);
    out.gain.linearRampToValueAtTime(0.6, now + 0.15);
    out.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Formant Filters (Ah/Oh sound vowel approx)
    const formants = [
        { f: 800, q: 10, g: 1.2 },
        { f: 1200, q: 10, g: 0.8 }, // Adjusted for generic choir
        { f: 2500, q: 15, g: 0.4 }
    ];

    formants.forEach(fmt => {
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(fmt.f, now);
        filter.Q.setValueAtTime(fmt.q, now);
        const g = ctx.createGain();
        g.gain.setValueAtTime(fmt.g, now);

        source.connect(filter);
        filter.connect(g);
        g.connect(out);
    });

    out.connect(ctx.destination);
    source.start(now);
    source.stop(now + duration + 0.5);
    vibrato.stop(now + duration + 0.5);
};

// ==========================================
// GENERIC PLAY FUNCTION
// ==========================================

export const playNote = (
    ctx: AudioContext,
    instrument: InstrumentType,
    freq: number,
    now: number = 0,
    durationOverride?: number
): void => {
    const startTime = now || ctx.currentTime;

    switch (instrument) {
        case 'piano':
            createPianoVoice(ctx, freq, startTime, durationOverride);
            break;
        case 'acoustic-guitar':
            createAcousticGuitarVoice(ctx, freq, startTime, durationOverride);
            break;
        case 'voice':
            createVoiceVoice(ctx, freq, startTime, durationOverride ?? 2.5);
            break;
    }
};
