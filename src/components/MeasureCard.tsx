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
        <div className="relative aspect-[4/3] bg-bg-tertiary/40 border border-border-main rounded-lg hover:border-accent transition-all group shadow-sm">
            <span className="absolute top-1 left-2 text-[10px] text-text-secondary select-none font-medium">
                {index + 1}
            </span>

            <button
                onClick={() => removeMeasure(songId, sectionId, measure.id)}
                className="absolute top-1 right-1 text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                title="Remove Measure"
            >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>

            <div className="w-full h-full flex items-center justify-center p-0.5">
                <input
                    className="w-full h-full bg-transparent text-center font-bold text-3xl sm:text-5xl text-text-primary focus:outline-none placeholder-text-secondary caret-accent p-0 leading-none tracking-tight"
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
