import { v4 as uuidv4 } from 'uuid';
import type { Section, SectionType, Measure, ChordBlock } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIChordResult {
    capo: number;
    sections: Section[];
}

// AILyricsResult: same shape as AIChordResult — returns fully‑formed Section[]
// so we can call replaceSongContent just like the chords generator does.
export interface AILyricsResult {
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

// ─── Lyrics Sections helper ───────────────────────────────────────────────────

interface RawLyricsSection {
    type?: string;
    section?: string;
    label?: string;
    lyrics?: string;
}

function buildLyricsSections(rawSections: RawLyricsSection[]): Section[] {
    // Track how many times each type appears to auto-number (Verse 1, Verse 2…)
    const typeCount: Record<string, number> = {};

    return rawSections.map((rawSec) => {
        const rawType = rawSec.type || rawSec.section || 'Custom';
        const type = toSectionType(rawType);

        typeCount[type] = (typeCount[type] || 0) + 1;
        const count = typeCount[type];

        // Build label: "Verse 1", "Chorus", "Bridge", etc.
        const label = rawSec.label ||
            (count > 1 ? `${type} ${count}` : type);

        const defaultMeasure: Measure = {
            id: uuidv4(),
            timeSignature: 4,
            chords: [],
        };

        return {
            id: uuidv4(),
            type,
            label,
            measures: [defaultMeasure],
            lyrics: rawSec.lyrics || '',
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

// ─── Lyrics Prompt ────────────────────────────────────────────────────────────

function buildLyricsPrompt(title: string, artist: string): string {
    return `You are a professional lyrics transcriber with complete knowledge of song lyrics.
Return the COMPLETE official lyrics for the song below, organized by section, in JSON format.

Song: "${title}" by "${artist}"

CRITICAL RULES:
1. Return ONLY valid JSON — no markdown, no code blocks, no extra text.
2. Include EVERY section of the song in order (Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Outro, etc.).
3. Do NOT skip, merge, or abbreviate any section. Repeated sections (like two choruses) must each appear separately.
4. Use \\n to separate lines within a section's lyrics.
5. If the song is unknown or lyrics cannot be provided, return: {"error": "not_found"}.

Required JSON format:
{
  "sections": [
    { "type": "Verse", "label": "Verse 1", "lyrics": "Line 1\\nLine 2\\nLine 3" },
    { "type": "Chorus", "label": "Chorus", "lyrics": "Chorus line 1\\nChorus line 2" },
    { "type": "Verse", "label": "Verse 2", "lyrics": "Verse 2 line 1\\nVerse 2 line 2" },
    { "type": "Chorus", "label": "Chorus", "lyrics": "Chorus line 1\\nChorus line 2" }
  ]
}

Valid section types: Intro, Verse, Pre-Chorus, Chorus, Bridge, Solo, Outro, Custom.
`;
}

// ─── generateLyrics ───────────────────────────────────────────────────────────

export async function generateLyrics(
    title: string,
    artist: string,
    signal: AbortSignal
): Promise<AILyricsResult> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not configured. Please add it to your .env file.');
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const body = {
        contents: [
            {
                parts: [{ text: buildLyricsPrompt(title, artist) }]
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

    const rawText: string =
        json?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed: any;
    try {
        const cleaned = rawText
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();
        parsed = JSON.parse(cleaned);
    } catch {
        throw new AINotFoundError('Could not parse AI lyrics response as JSON');
    }

    if (parsed?.error === 'not_found') {
        throw new AINotFoundError(`Lyrics not found for "${title}" by "${artist}"`);
    }

    const rawSections: RawLyricsSection[] = parsed?.sections;

    if (!Array.isArray(rawSections) || rawSections.length === 0) {
        throw new AINotFoundError(`Lyrics not found for "${title}" by "${artist}"`);
    }

    const sections = buildLyricsSections(rawSections);
    return { sections };
}
