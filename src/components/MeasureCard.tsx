import React, { useState, useEffect } from 'react';
import type { Measure, ChordBlock } from '../types';
import { useSongStore } from '../store/useSongStore';
import { v4 as uuidv4 } from 'uuid';
import { ChordSelector } from './ChordSelector';
import { Play, Volume2 } from 'lucide-react';
import { playChord, isValidChord } from '../utils/chordAudio';

interface Props {
    songId: string;
    sectionId: string;
    measure: Measure;
    index: number;
}

export const MeasureCard: React.FC<Props> = ({ songId, sectionId, measure, index }) => {
    const { updateMeasure, removeMeasure, isReadOnly, t, chordInstrument } = useSongStore();

    // Local state for formatted text representation (e.g. "C Am7")
    const [text, setText] = useState('');
    const [showChordSelector, setShowChordSelector] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    // Get song mode to determine if we're in chords mode
    const songMode = useSongStore((state: any) => state.songs.find((s: any) => s.id === songId)?.mode);
    const isChordsMode = songMode === 'chords';

    useEffect(() => {
        setText(measure.chords.map(c => c.text).join(' '));
    }, [measure.chords]);

    const handleBlur = () => {
        if (isReadOnly) return;
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
        if (isReadOnly) return;
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
        if (e.key === 'Backspace' && text === '' && measure.chords.length === 0) {
            removeMeasure(songId, sectionId, measure.id);
        }
    };

    // Handle chord selection from ChordSelector
    const handleChordSelect = (chord: string) => {
        const newChords: ChordBlock[] = [{
            id: uuidv4(),
            text: chord,
            duration: 4
        }];
        updateMeasure(songId, sectionId, measure.id, newChords);
        setText(chord);
    };

    // Handle measure click to open chord selector
    const handleMeasureClick = () => {
        if (isChordsMode && !isReadOnly) {
            setShowChordSelector(true);
        }
    };

    // Handle play chord audio
    const handlePlayChord = (e: React.MouseEvent) => {
        e.stopPropagation();

        if (!text || isPlaying || !isValidChord(text)) {
            return;
        }

        setIsPlaying(true);
        playChord(text, chordInstrument); // Use selected instrument

        // Reset playing state after 2 seconds
        setTimeout(() => {
            setIsPlaying(false);
        }, 2000);
    };

    // Check if measure has a valid chord
    const hasValidChord = text && text.trim() !== '' && text !== '-' && isValidChord(text);

    return (
        <>
            <div
                className={`relative aspect-[4/3] skeuo-inset group transition-all duration-300 ${isReadOnly ? 'opacity-90' : ''} ${isChordsMode && !isReadOnly ? 'cursor-pointer hover:border-accent' : ''} ${isPlaying ? 'border-accent shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]' : ''}`}
                onClick={handleMeasureClick}
            >
                <span className="absolute top-1.5 left-2.5 text-[9px] text-text-secondary select-none font-black uppercase tracking-widest opacity-40">
                    M{index + 1}
                </span>

                {!isReadOnly && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            removeMeasure(songId, sectionId, measure.id);
                        }}
                        className="absolute top-1 right-1 text-text-secondary hover:text-red-400 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all duration-200 p-2 bg-black/30 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm z-10"
                        title={t('measure.remove')}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                )}

                {/* Play Button - appears when measure has a valid chord */}
                {hasValidChord && (
                    <button
                        onClick={handlePlayChord}
                        disabled={isPlaying}
                        className={`absolute bottom-1 left-1 transition-all duration-200 p-2 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm z-10
                            ${isPlaying
                                ? 'text-accent bg-accent/20 opacity-100 animate-pulse border border-accent/50'
                                : 'text-text-secondary hover:text-accent hover:bg-accent/10 opacity-0 group-hover:opacity-100 bg-black/30'
                            }`}
                        title={isPlaying ? t('measure.playing') : t('measure.play')}
                    >
                        {isPlaying ? (
                            <Volume2 size={14} fill="currentColor" />
                        ) : (
                            <Play size={14} fill="currentColor" />
                        )}
                    </button>
                )}

                <div className="w-full h-full flex items-center justify-center p-2">
                    <input
                        className="w-full h-full bg-transparent text-center font-black text-2xl sm:text-4xl text-text-primary focus:outline-none placeholder-text-secondary/20 caret-accent p-0 leading-none tracking-tighter uppercase drop-shadow-sm disabled:cursor-default"
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => {
                            // Prevent opening selector when clicking on input to type
                            if (!isChordsMode) {
                                e.stopPropagation();
                            }
                        }}
                        placeholder="-"
                        disabled={isReadOnly}
                    />
                </div>
            </div >

            {/* Chord Selector Modal */}
            <ChordSelector
                isOpen={showChordSelector}
                onClose={() => setShowChordSelector(false)}
                onSelectChord={handleChordSelect}
                currentChord={text}
            />
        </>
    );
};
