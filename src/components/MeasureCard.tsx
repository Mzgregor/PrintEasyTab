import React, { useState, useEffect } from 'react';
import type { Measure, ChordBlock } from '../types';
import { useSongStore } from '../store/useSongStore';
import { v4 as uuidv4 } from 'uuid';

interface Props {
    songId: string;
    sectionId: string;
    measure: Measure;
    index: number;
}

export const MeasureCard: React.FC<Props> = ({ songId, sectionId, measure, index }) => {
    const { updateMeasure, removeMeasure } = useSongStore();

    // Local state for formatted text representation (e.g. "C Am7")
    const [text, setText] = useState('');

    useEffect(() => {
        setText(measure.chords.map(c => c.text).join(' '));
    }, [measure.chords]);

    const handleBlur = () => {
        const chordTexts = text.trim().split(/\s+/).filter(Boolean);

        if (chordTexts.length === 0) {
            updateMeasure(songId, sectionId, measure.id, []);
            return;
        }

        const count = chordTexts.length;
        // Simple logic: equal division of 4 beats
        const beatsPerChord = 4 / count;

        const newChords: ChordBlock[] = chordTexts.map((t, i) => ({
            id: measure.chords[i]?.id || uuidv4(),
            text: t,
            duration: beatsPerChord
        }));

        updateMeasure(songId, sectionId, measure.id, newChords);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
        if (e.key === 'Backspace' && text === '' && measure.chords.length === 0) {
            removeMeasure(songId, sectionId, measure.id);
        }
    };

    return (
        <div className="relative aspect-[4/3] bg-slate-800 border border-slate-700 rounded-md hover:border-indigo-500/50 transition-colors group">
            <span className="absolute top-1 left-1.5 text-[10px] text-slate-500 select-none font-mono">
                {index + 1}
            </span>

            <button
                onClick={() => removeMeasure(songId, sectionId, measure.id)}
                className="absolute top-1 right-1 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove Measure"
            >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-2">
                <input
                    className="w-full bg-transparent text-center font-bold text-lg text-slate-100 focus:outline-none placeholder-slate-700"
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    placeholder="-"
                />
            </div>
        </div>
    );
};
