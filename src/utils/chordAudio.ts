/**
 * Chord Audio Synthesis Utility
 * Parses chord names and synthesizes audio using SoundFont
 */
import { playNote } from './soundfontAudio';

// Instrument types for chord playback
export type ChordInstrument = 'acoustic-guitar' | 'electric-guitar' | 'piano' | '12-string-acoustic';

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
                // 80ms delay gives a more "sweeping" feel like Stairway intro
                const strumDelay = 0.08;
                const noteStartTime = now + (index * strumDelay);

                // Longer duration for resonance (letting notes ring out)
                // Varying duration slightly adds human feel
                const varyDuration = 4.5 + Math.random() * 0.8;

                playNote(ctx, 'acoustic-guitar', freq, noteStartTime, varyDuration);
            } else {
                // GRAND PIANO ARPEGGIO
                // "Note per note" effect as requested (40ms spacing)
                const arpeggioDelay = 0.04;
                playNote(ctx, 'piano', freq, now + (index * arpeggioDelay), 3.0);
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
