/**
 * SoundFont Audio Service
 * High-quality audio using soundfont-player with CDN-hosted SoundFonts
 * Provides Songsterr-quality samples with simple API
 */

import Soundfont from 'soundfont-player';

// ==========================================
// TYPES
// ==========================================

export type InstrumentType = 'acoustic-guitar' | 'electric-guitar' | 'piano' | '12-string-acoustic' | 'voice';

// ==========================================
// GLOBAL STATE
// ==========================================

let audioContext: AudioContext | null = null;
let instruments: Map<string, any> = new Map();
let loadingInstruments: Set<string> = new Set();

// Instrument mapping to SoundFont names
const INSTRUMENT_MAP: Record<string, string> = {
    'acoustic-guitar': 'acoustic_guitar_steel',
    'electric-guitar': 'electric_guitar_jazz',
    'piano': 'acoustic_grand_piano',
    '12-string-acoustic': 'acoustic_guitar_steel', // Use same as acoustic
    'voice': 'choir_aahs'
};

// ==========================================
// INITIALIZATION
// ==========================================

/**
 * Get or create AudioContext
 */
const getAudioContext = (): AudioContext => {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
};

/**
 * Load instrument if not already loaded
 */
const loadInstrument = async (instrumentType: InstrumentType): Promise<any> => {
    const sfName = INSTRUMENT_MAP[instrumentType];

    // Return if already loaded
    if (instruments.has(sfName)) {
        return instruments.get(sfName);
    }

    // Wait if currently loading
    if (loadingInstruments.has(sfName)) {
        // Poll until loaded
        while (loadingInstruments.has(sfName)) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        return instruments.get(sfName);
    }

    // Load the instrument
    loadingInstruments.add(sfName);

    try {
        const ctx = getAudioContext();
        console.log(`Loading SoundFont: ${sfName}...`);

        const instrument = await Soundfont.instrument(ctx, sfName, {
            soundfont: 'MusyngKite', // High-quality SoundFont from CDN
            gain: 1.0
        });

        instruments.set(sfName, instrument);
        console.log(`✓ Loaded: ${sfName}`);

        return instrument;
    } catch (error) {
        console.error(`Failed to load ${sfName}:`, error);
        throw error;
    } finally {
        loadingInstruments.delete(sfName);
    }
};

// ==========================================
// PLAYBACK FUNCTIONS
// ==========================================

/**
 * Play a single note using SoundFont
 */
export const playNote = async (
    ctx: AudioContext,
    instrumentType: InstrumentType,
    freq: number,
    _now: number = 0,
    duration: number = 0.5
): Promise<void> => {
    try {
        // Load instrument
        const instrument = await loadInstrument(instrumentType);

        // Convert frequency to MIDI note
        const midiNote = Math.round(69 + 12 * Math.log2(freq / 440));

        // Play note
        const audioNode = instrument.play(midiNote, ctx.currentTime, {
            duration: duration,
            gain: 1.0
        });

        // Handle 12-string doubling
        if (instrumentType === '12-string-acoustic') {
            const pairNote = midiNote < 59 ? midiNote + 12 : midiNote;

            // Slight delay for strumming effect
            setTimeout(() => {
                instrument.play(pairNote, ctx.currentTime, {
                    duration: duration,
                    gain: 0.7 // Lighter touch for paired string
                });
            }, 25);
        }

    } catch (error) {
        console.error('Failed to play note:', error);
    }
};

/**
 * Stop all playing notes
 */
export const stopAllNotes = (): void => {
    instruments.forEach(instrument => {
        if (instrument && typeof instrument.stop === 'function') {
            instrument.stop();
        }
    });
};

/**
 * Clean up resources
 */
export const cleanup = (): void => {
    stopAllNotes();
    instruments.clear();
    loadingInstruments.clear();

    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }
};
