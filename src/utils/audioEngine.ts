/**
 * Audio Engine utilizing smplr for realistic playback
 * Falls back to Web Audio API synthesis if samples are not loaded.
 */

import { Soundfont } from 'smplr';

// ==========================================
// CONSTANTS & TYPES
// ==========================================

export type InstrumentType = 'acoustic-guitar' | 'piano' | 'voice';

// Global shared instances
// Global shared instances and state
let guitarInstrument: any | null = null;
let pianoInstrument: any | null = null;
let currentContext: AudioContext | null = null; // Track the context used for initialization

// Loading states
let isGuitarLoaded = false;
let isPianoLoaded = false;
let isGuitarLoading = false;
let isPianoLoading = false;

// Initialize instruments lazy-loaded, rebuilding if context changes
const initInstruments = (ctx: AudioContext) => {
    // If we have a new context, valid or not, we might need to re-init
    // But soundfonts bind to a specific AudioContext. If the context passed is different 
    // from the one we have, we must re-create the instruments.
    if (currentContext !== ctx) {
        // Context changed! Reset everything.
        // console.log("AudioContext changed, reloading instruments...");

        // Use the new context
        currentContext = ctx;

        // Reset instruments
        guitarInstrument = null;
        pianoInstrument = null;
        isGuitarLoaded = false;
        isPianoLoaded = false;
        isGuitarLoading = false;
        isPianoLoading = false;
    }

    // Initialize Guitar
    if (!guitarInstrument && !isGuitarLoading) {
        isGuitarLoading = true;
        // console.log("Initializing Acoustic Guitar...");
        const guitar = new Soundfont(ctx, {
            instrument: 'acoustic_guitar_steel',
        });

        guitar.load.then(() => {
            // console.log("Acoustic Guitar loaded!");
            guitarInstrument = guitar;
            isGuitarLoaded = true;
            isGuitarLoading = false;
        }).catch((e: any) => {
            console.error('Failed to load guitar samples', e);
            isGuitarLoading = false;
            // Optionally set error state or just leave it null to keep trying/using fallback
        });
    }

    // Initialize Piano
    if (!pianoInstrument && !isPianoLoading) {
        isPianoLoading = true;
        // console.log("Initializing Acoustic Grand Piano...");
        const piano = new Soundfont(ctx, {
            instrument: 'acoustic_grand_piano',
        });

        piano.load.then(() => {
            // console.log("Acoustic Grand Piano loaded!");
            pianoInstrument = piano;
            isPianoLoaded = true;
            isPianoLoading = false;
        }).catch((e: any) => {
            console.error('Failed to load piano samples', e);
            isPianoLoading = false;
        });
    }
};

// ... (Rest of utilities remain the same, so we skip re-declaring them here if they are unchanged)

// ==========================================
// UTILITIES (Fallback Synthesis)
// ==========================================

// Global shared buffers (generated once)
let sharedNoiseBuffer: AudioBuffer | null = null;
let sharedHammerBuffer: AudioBuffer | null = null;

const createBuffer = (ctx: AudioContext, currBuffer: AudioBuffer | null, length: number, filler: (data: Float32Array) => void): AudioBuffer => {
    // Re-create buffer if it belongs to a different context or doesn't exist
    // Actually AudioBuffers are context-dependent in strict implementations 
    // but usually can be shared if created with *a* context. 
    // Safer to recreate if context is new, but for efficiency let's try to reuse if compatible, 
    // or just checking if `currBuffer` exists is usually enough as simple buffers are just data.
    // However, `createBuffer` is a method OF ctx, so it's tied.
    if (currBuffer) return currBuffer; // Optimization: AudioBuffers are often portable but strictness varies.
    const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
    filler(buffer.getChannelData(0));
    return buffer;
};

const getNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    // We might need to recreate if context sample rate differs significantly, 
    // but typically safe to cache. If we want to be 100% safe:
    if (!sharedNoiseBuffer || sharedNoiseBuffer.sampleRate !== ctx.sampleRate) {
        sharedNoiseBuffer = createBuffer(ctx, null, 0.5, (data) => {
            for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);
        });
    }
    return sharedNoiseBuffer!;
};

const getHammerBuffer = (ctx: AudioContext): AudioBuffer => {
    if (!sharedHammerBuffer || sharedHammerBuffer.sampleRate !== ctx.sampleRate) {
        sharedHammerBuffer = createBuffer(ctx, null, 0.1, (data) => {
            for (let i = 0; i < data.length; i++) {
                // Exponential decay noise
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i * 0.05);
            }
        });
    }
    return sharedHammerBuffer!;
};

// ==========================================
// SYNTHESIS FALLBACKS
// ==========================================

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
    let B = 0.0004;
    if (freq < 100) B = 0.0008; // Bass strings are stiffer

    const partials = [1, 2, 3, 4, 5, 6];
    const unisons = freq < 100 ? [0] : [-1.5, 0, 1.5]; // Cents

    unisons.forEach((detuneCents) => {
        const detuneRatio = Math.pow(2, detuneCents / 1200);
        const f0 = freq * detuneRatio;

        partials.forEach((n) => {
            const stretch = Math.sqrt(1 + B * (n * n));
            const fn = n * f0 * stretch;
            let amp = 1.0 / Math.pow(n, 1.5);
            const releaseTime = duration / Math.sqrt(n);

            const osc = ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(fn, now);

            const g = ctx.createGain();
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(amp * 0.3, now + 0.01);
            g.gain.exponentialRampToValueAtTime(amp * 0.1, now + 0.1);
            g.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

            osc.connect(g);
            g.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + releaseTime + 0.1);
        });
    });
};

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
        g.gain.exponentialRampToValueAtTime(gain * 0.6, now + 0.05);
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

    const formants = [
        { f: 800, q: 10, g: 1.2 },
        { f: 1200, q: 10, g: 0.8 },
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

    // Ensure instruments are initialized for this context
    // This will trigger a reload if the context has changed
    initInstruments(ctx);

    // Convert frequency to MIDI note for sampler
    // MIDI note = 69 + 12 * log2(f / 440)
    const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));

    switch (instrument) {
        case 'piano':
            // Check if loaded AND if the instrument instance matches the current context
            // (Though initInstruments handles the reset, we DOUBLE CHECK to fallback if not ready)
            if (isPianoLoaded && pianoInstrument) {
                try {
                    pianoInstrument.start({
                        note: midiNote,
                        time: startTime,
                        duration: durationOverride || 3.0,
                        velocity: 80
                    });
                } catch (e) {
                    // Fallback if smplr crashes or fails
                    console.warn("Piano sample failed, falling back", e);
                    createPianoVoice(ctx, freq, startTime, durationOverride);
                }
            } else {
                // Determine if we should wait or fallback.
                // For real-time playing, we MUST fallback immediately.
                createPianoVoice(ctx, freq, startTime, durationOverride);
            }
            break;
        case 'acoustic-guitar':
            if (isGuitarLoaded && guitarInstrument) {
                try {
                    guitarInstrument.start({
                        note: midiNote,
                        time: startTime,
                        duration: durationOverride || 4.0,
                        velocity: 90
                    });
                } catch (e) {
                    console.warn("Guitar sample failed, falling back", e);
                    createAcousticGuitarVoice(ctx, freq, startTime, durationOverride);
                }
            } else {
                createAcousticGuitarVoice(ctx, freq, startTime, durationOverride);
            }
            break;
        case 'voice':
            createVoiceVoice(ctx, freq, startTime, durationOverride ?? 2.5);
            break;
    }
};
