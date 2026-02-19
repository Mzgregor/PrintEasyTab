import { v4 as uuidv4 } from 'uuid';
import type { Section, SectionType, Measure, ChordBlock } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIChordResult {
    capo: number;
    sections: Section[];
}

export class AINotFoundError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AINotFoundError';
    }
}

// ─── Raw AI response shapes ───────────────────────────────────────────────────

interface RawChord {
    text: string;
    duration?: number;
}

interface RawMeasure {
    chords: RawChord[];
    timeSignature?: number;
}

interface RawSection {
    type?: string;
    section?: string; // Fallback for some AI responses
    label?: string;
    measures?: RawMeasure[];
    chords?: string[]; // Fallback for flat chord lists
}

interface RawAIResponse {
    capo?: number;
    sections: RawSection[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const VALID_SECTION_TYPES: SectionType[] = [
    'Intro', 'Verse', 'Chorus', 'Pre-Chorus', 'Bridge', 'Outro', 'Solo', 'Custom'
];

function toSectionType(raw: string): SectionType {
    const lower = (raw || '').toLowerCase();
    if (lower.includes('intro')) return 'Intro';
    if (lower.includes('verse') || lower.includes('couplet')) return 'Verse';
    if (lower.includes('pre-chorus') || lower.includes('pre chorus')) return 'Pre-Chorus';
    if (lower.includes('chorus') || lower.includes('refrain')) return 'Chorus';
    if (lower.includes('bridge') || lower.includes('pont')) return 'Bridge';
    if (lower.includes('solo')) return 'Solo';
    if (lower.includes('outro')) return 'Outro';

    // Check exact match as fallback
    const exact = VALID_SECTION_TYPES.find(t => t.toLowerCase() === lower);
    return exact || 'Custom';
}

function buildSections(rawSections: RawSection[]): Section[] {
    return rawSections.map((rawSec, index) => {
        const rawType = rawSec.type || rawSec.section || 'Part';
        const type = toSectionType(rawType);

        let measures: Measure[] = [];

        // CASE A: Structured measures returned
        if (rawSec.measures && Array.isArray(rawSec.measures) && rawSec.measures.length > 0) {
            measures = rawSec.measures.map(rawMeasure => {
                const chords: ChordBlock[] = (rawMeasure.chords || []).map(c => ({
                    id: uuidv4(),
                    text: c.text || '',
                    duration: typeof c.duration === 'number' ? c.duration : 4,
                }));
                return {
                    id: uuidv4(),
                    timeSignature: rawMeasure.timeSignature || 4,
                    chords,
                };
            });
        }
        // CASE B: Flat list of chords returned (Fallback)
        else if (rawSec.chords && Array.isArray(rawSec.chords)) {
            // Strategy: Create 1 measure per chord, duration 4 (whole note)
            // Or better: try to pack 2 chords per measure if possible? 
            // Let's stick to 1 chord per measure for simplicity, or 2 if short names?
            // Safer: 1 measure per chord.
            measures = rawSec.chords.map((chordName) => ({
                id: uuidv4(),
                timeSignature: 4,
                chords: [{
                    id: uuidv4(),
                    text: typeof chordName === 'string' ? chordName : (chordName as any).text || '?',
                    duration: 4
                }]
            }));
        }
        // CASE C: No data
        else {
            measures = [{ id: uuidv4(), timeSignature: 4, chords: [] }];
        }

        return {
            id: uuidv4(),
            type,
            label: rawSec.label || type + (type === 'Verse' ? ' ' + (index + 1) : ''), // heuristic numbering
            measures,
            lyrics: '',
            lyricsSize: 14,
            lyricsColor: '',
            lyricsAlign: 'left',
            lyricsFont: 'Inter',
            lyricsBold: false,
            lyricsItalic: false,
            lyricsBackground: '',
        };
    });
}

// ─── Prompt ───────────────────────────────────────────────────────────────────

function buildPrompt(title: string, artist: string): string {
    return `You are a music expert. Given a song title and artist, return the chord chart in a specific JSON format.

Song: "${title}" by "${artist}"

IMPORTANT RULES:
1. Return ONLY valid JSON, no markdown, no code blocks.
2. Use real guitar chords (e.g. "Am", "G", "C", "Em7", "D/F#").
3. Organize into sections (Intro, Verse, Chorus, etc.).
4. Break down each section into measures.
5. Identify the Capo position (0 if none).
6. If the song is unknown, return {"error": "not_found"}.

Required JSON Structure:
{
  "capo": 0,
  "sections": [
    {
      "type": "Verse",
      "measures": [
        { "chords": [{"text": "Am", "duration": 2}, {"text": "G", "duration": 2}] },
        { "chords": [{"text": "C", "duration": 4}] }
      ]
    }
  ]
}
`;
}

// ─── Main function ────────────────────────────────────────────────────────────

export async function generateChords(
    title: string,
    artist: string,
    signal: AbortSignal
): Promise<AIChordResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    // Using gemini-flash-latest for better availability/cost balance
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                parts: [{ text: buildPrompt(title, artist) }]
            }
        ],
        generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: 'application/json',
        }
    };

    let response: Response;
    try {
        response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal,
        });
    } catch (err: any) {
        if (err?.name === 'AbortError') throw err;
        throw new Error(`Network error: ${err?.message || 'Unknown error'}`);
    }

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`Gemini API error ${response.status}: ${errorText}`);
    }

    let json: any;
    try {
        json = await response.json();
    } catch {
        throw new Error('Failed to parse API response');
    }

    // Extract the text content from Gemini's response
    const rawText: string =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed: any;
    try {
        // Gemini may wrap with ```json ... ``` or just ``` ... ```
        const cleaned = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        parsed = JSON.parse(cleaned);
    } catch {
        throw new AINotFoundError('Could not parse AI response as JSON');
    }

    // Check explicit "not found" signal from AI
    // Some models return just { error: ... }
    if (parsed?.error === 'not_found') {
        throw new AINotFoundError(`Chords not found for "${title}" by "${artist}"`);
    }

    // Check availability of sections
    if (!parsed?.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
        throw new AINotFoundError(`Chords not found for "${title}" by "${artist}"`);
    }

    const raw = parsed as RawAIResponse;
    const sections = buildSections(raw.sections);
    const capo = typeof raw.capo === 'number' ? Math.max(0, Math.min(10, raw.capo)) : 0;

    return { capo, sections };
}
