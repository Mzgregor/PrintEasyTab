/**
 * Chord Audio Synthesis Utility
 * Parses chord names and synthesizes audio using Web Audio API
 */

// Instrument types for chord playback
export type ChordInstrument = 'acoustic-guitar' | 'piano';

// Note frequencies in Hz (A4 = 440Hz standard tuning)
const NOTE_FREQUENCIES: Record<string, number> = {
    'C': 261.63,
    'C#': 277.18,
    'Db': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'Eb': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'Gb': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'Ab': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'Bb': 466.16,
    'B': 493.88
};

// Chord formulas: semitone intervals from root note
const CHORD_FORMULAS: Record<string, number[]> = {
    // Basic
    '': [0, 4, 7],              // Major (C E G)
    'm': [0, 3, 7],             // Minor (C Eb G)

    // Power
    '5': [0, 7],                // Power chord (C G)

    // Seventh
    '7': [0, 4, 7, 10],         // Dominant 7 (C E G Bb)
    'maj7': [0, 4, 7, 11],      // Major 7 (C E G B)
    'm7': [0, 3, 7, 10],        // Minor 7 (C Eb G Bb)
    'm(maj7)': [0, 3, 7, 11],   // Minor Major 7 (C Eb G B)

    // Suspended
    'sus2': [0, 2, 7],          // Sus 2 (C D G)
    'sus4': [0, 5, 7],          // Sus 4 (C F G)

    // Sixth
    '6': [0, 4, 7, 9],          // Major 6 (C E G A)
    'm6': [0, 3, 7, 9],         // Minor 6 (C Eb G A)

    // Extended
    '9': [0, 4, 7, 10, 14],     // Dominant 9 (C E G Bb D)
    'maj9': [0, 4, 7, 11, 14],  // Major 9 (C E G B D)
    'm9': [0, 3, 7, 10, 14],    // Minor 9 (C Eb G Bb D)
    '11': [0, 4, 7, 10, 14, 17], // 11 (C E G Bb D F)
    '13': [0, 4, 7, 10, 14, 21]  // 13 (C E G Bb D A)
};

interface ParsedChord {
    root: string;
    suffix: string;
}

/**
 * Parse a chord name into root note and suffix
 * Examples: "C" -> {root: "C", suffix: ""}
 *           "Em7" -> {root: "E", suffix: "m7"}
 *           "F#maj7" -> {root: "F#", suffix: "maj7"}
 */
function parseChord(chordName: string): ParsedChord | null {
    if (!chordName || typeof chordName !== 'string') return null;

    // Match root note (A-G with optional # or b)
    const rootMatch = chordName.match(/^([A-G][#b]?)/);
    if (!rootMatch) return null;

    const root = rootMatch[1];
    const suffix = chordName.slice(root.length);

    return { root, suffix };
}

/**
 * Get frequencies for all notes in a chord
 */
function getChordFrequencies(chordName: string): number[] {
    const parsed = parseChord(chordName);
    if (!parsed) return [];

    const { root, suffix } = parsed;
    const rootFreq = NOTE_FREQUENCIES[root];
    if (!rootFreq) return [];

    // Get intervals for this chord type (default to major if unknown)
    const intervals = CHORD_FORMULAS[suffix] ?? CHORD_FORMULAS[''];

    // Calculate frequency for each note in the chord
    return intervals.map(semitones =>
        rootFreq * Math.pow(2, semitones / 12)
    );
}

/**
 * Create an acoustic guitar voice for a single frequency
 * Warm, natural sound with percussive attack and quick decay
 */
/**
 * Create a nylon string acoustic guitar voice for a single frequency
 * Warm, mellow sound with soft attack and rich lower harmonics
 */
/**
 * Create a classical guitar voice (Nylon) for a single frequency
 * DISTINCT PLUCK, WOODEN BODY RESONANCE, WARMTH
 */
function createAcousticGuitarVoice(
    ctx: AudioContext,
    freq: number,
    now: number,
    duration: number = 3.5
): void {
    const createPart = (
        f: number,
        gainVal: number,
        decay: number,
        type: OscillatorType = 'sine',
        detune: number = 0
    ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(f, now);
        if (detune !== 0) osc.detune.setValueAtTime(detune, now);

        // DISTINCT PLUCK ENVELOPE (Fingernail on Nylon)
        g.gain.setValueAtTime(0, now);
        // Very fast attack for the initial "tick" of the nail against string
        g.gain.linearRampToValueAtTime(gainVal, now + 0.002);
        // Quick decay to sustain level (the "pluck" transient)
        g.gain.exponentialRampToValueAtTime(gainVal * 0.6, now + 0.04);
        // Long, warm sustain with slow exponential decay
        g.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(g);
        g.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.1);
    };

    // 1. FUNDAMENTAL (The core note) - Warm sine
    createPart(freq, 0.45, duration, 'sine');

    // 2. BODY RESONANCE (The wooden box) - Low warmth
    // A slightly detuned sine at fundamental adds "wood" character
    createPart(freq, 0.15, duration * 0.8, 'sine', 2);
    createPart(freq, 0.15, duration * 0.8, 'sine', -2);

    // 3. THE PLUCK (Transient harmonics)
    // Stronger upper harmonics that decay faster = clearer attack
    createPart(freq * 2, 0.25, duration * 0.7, 'sine'); // Octave
    createPart(freq * 3, 0.15, duration * 0.5, 'sine'); // Fifth
    createPart(freq * 4, 0.05, duration * 0.3, 'triangle'); // Double octave (Triangle for bite)

    // 4. "FINGER NOISE" / TRANSIENT
    // High frequency burst for the nail hitting the string
    const noiseOsc = ctx.createOscillator();
    const noiseGain = ctx.createGain();
    noiseOsc.type = 'triangle';
    noiseOsc.frequency.setValueAtTime(freq * 8, now); // High pitched transient
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.03, now + 0.001);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03); // Very short
    noiseOsc.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseOsc.start(now);
    noiseOsc.stop(now + 0.05);
}

/**
 * Create a piano voice for a single frequency
 * Rich sound with harmonics and longer sustain
 */
/**
 * Create a piano voice (using the previous "Nylon Guitar" profile per user request)
 * The user preferred the warm, mellow sound for the piano.
 */
function createPianoVoice(
    ctx: AudioContext,
    freq: number,
    now: number,
    duration: number = 2.5
): void {
    const createPart = (
        f: number,
        gainVal: number,
        decay: number,
        type: OscillatorType = 'sine'
    ) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(f, now);

        // PREVIOUS NYLON ENVELOPE (Now used for Piano)
        // Softer attack (0.02s) acts like a felt hammer
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(gainVal, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(g);
        g.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.1);
    };

    // Harmonics from previous "Nylon Guitar" (Now Piano)
    // This creates a very warm, intimate piano sound ("Felt Piano")
    createPart(freq, 0.4, duration);
    createPart(freq * 2, 0.2, duration * 0.85);
    createPart(freq * 3, 0.1, duration * 0.7);
    createPart(freq * 4, 0.02, duration * 0.5);
    createPart(freq * 5, 0.01, duration * 0.3);
}

/**
 * Play a chord by synthesizing all its notes
 */
export function playChord(
    chordName: string,
    instrument: ChordInstrument = 'acoustic-guitar'
): void {
    if (!chordName || chordName.trim() === '' || chordName === '-') {
        console.warn('Cannot play empty or invalid chord');
        return;
    }

    const frequencies = getChordFrequencies(chordName);

    if (frequencies.length === 0) {
        console.warn(`Could not parse chord: ${chordName}`);
        return;
    }

    try {
        // Create or reuse AudioContext
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Resume if suspended (browser autoplay policy)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;

        // Play each note in the chord
        // Sort frequencies low to high for natural down-stroke strum
        const sortedFrequencies = [...frequencies].sort((a, b) => a - b);

        sortedFrequencies.forEach((freq, index) => {
            if (instrument === 'acoustic-guitar') {
                // ENHANCED CLASSICAL GUITAR STRUMMING
                // Classical arpeggios are very distinct. 
                // 60ms delay between strings gives a clear, articulated "rolled" chord.
                const strumDelay = 0.06;
                const noteStartTime = now + (index * strumDelay);

                // Longer duration for classical guitar resonance
                // Varying duration slightly adds human feel
                const varyDuration = 3.5 + Math.random() * 0.5;

                createAcousticGuitarVoice(ctx, freq, noteStartTime, varyDuration);
            } else {
                // PIANO (using previous Nylon profile): 
                // Slight flam (5ms) makes the chord sound less robotic/MIDI-like
                const flam = index * 0.005;
                createPianoVoice(ctx, freq, now + flam, 3.0);
            }
        });

        // Cleanup: close context after sound finishes
        setTimeout(() => {
            if (ctx.state !== 'closed') {
                ctx.close();
            }
        }, 4000); // Extended timeout for longer sustain

    } catch (error) {
        console.error('Error playing chord:', error);
    }
}

/**
 * Check if a chord name is valid
 */
export function isValidChord(chordName: string): boolean {
    if (!chordName || chordName.trim() === '' || chordName === '-') {
        return false;
    }

    const frequencies = getChordFrequencies(chordName);
    return frequencies.length > 0;
}
