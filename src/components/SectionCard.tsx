import { useState, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Highlighter, Type as TypeIcon, Palette, Play, Square } from 'lucide-react';
import type { Section } from '../types';
import { useSongStore } from '../store/useSongStore';
import { MeasureCard } from './MeasureCard';
import { Plus } from 'lucide-react';
import { playChord, isValidChord } from '../utils/chordAudio';

interface Props {
    songId: string;
    section: Section;
}

export const SectionCard: React.FC<Props> = ({ songId, section }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const {
        removeSection,
        duplicateSection,
        updateSection,
        addMeasure,
        isReadOnly,
        t,
        chordInstrument,
        songs
    } = useSongStore();

    const song = songs.find(s => s.id === songId);
    if (!song) return null;
    const { globalLyricsFontSize, globalLyricsAlignment, theme } = useSongStore();
    const songMode = useSongStore((state: any) => state.songs.find((s: any) => s.id === songId)?.mode);
    const isChordsMode = songMode === 'chords';

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [playingMeasureIndex, setPlayingMeasureIndex] = useState<number | null>(null);
    const playbackRef = useRef<any>(null);

    const handlePlayStructure = () => {
        if (isPlaying) {
            // Stop logic
            if (playbackRef.current) clearTimeout(playbackRef.current);
            setIsPlaying(false);
            setPlayingMeasureIndex(null);
            return;
        }

        setIsPlaying(true);
        let currentIndex = 0;
        const measures = section.measures;
        const BPM = 90;
        const MS_PER_BEAT = 60000 / BPM;
        const BEATS_PER_MEASURE = 4; // Default to 4/4
        const MEASURE_DURATION = MS_PER_BEAT * BEATS_PER_MEASURE;

        const playNext = () => {
            if (currentIndex >= measures.length) {
                setIsPlaying(false);
                setPlayingMeasureIndex(null);
                return;
            }

            setPlayingMeasureIndex(currentIndex);

            // Audio Playback
            const measure = measures[currentIndex];
            // Play first valid chord or all chords in measure? 
            // Request says: "lancer le son de l'accord défini à l'intérieur"
            // "Les accords sont entendus les uns après les autres" - sounds like one chord per measure or all chords?
            // "Play chord of the measure" singular implies the main chord or sequential?
            // Implementation Plan said: "Iterate through section.measures... Play the chord"
            // Let's play the chords in the measure. If multiple, we might need a sub-loop or just play the first/main one for now as per "l'accord" (singular) in prompt, 
            // OR if the measure has multiple chords, we should probably schedule them?
            // The prompt says "hearing the sound of the chords I entered in my cell measures"... "played one after another".
            // If a measure has "C G", do we play C then G within the measure duration?
            // For simplicity and "visual repair", let's play the chords in the measure sequentially or just the first one if simpler.
            // Given "Vitesse de lecture est de 90 BPM" and "Measure duration", let's try to play the chords in the measure.
            // If there are multiple chords, we divide the measure duration.

            if (measure.chords && measure.chords.length > 0) {
                const chordCount = measure.chords.length;
                const durationPerChord = MEASURE_DURATION / chordCount;

                measure.chords.forEach((chord, i) => {
                    if (isValidChord(chord.text)) {
                        setTimeout(() => {
                            // Only play if still playing this measure (handling stop is tricky with timeouts, but this is short term)
                            // Better: Use AudioContext scheduling, but we are using `playChord` which plays immediately.
                            // We'll just schedule timeouts relative to start of measure.
                            // Check if still playing globally is hard inside here without ref, but `playChord` is fire-and-forget.
                            // To avoid noise if stopped, we could use a ref check.
                            if (playbackRef.current) { // coarse check
                                playChord(chord.text, chordInstrument, song.capo || 0);
                            }
                        }, i * durationPerChord);
                    }
                });
            }

            playbackRef.current = setTimeout(() => {
                currentIndex++;
                playNext();
            }, MEASURE_DURATION);
        };

        playNext();
    };

    // Dynamic color fallback based on theme

    // Dynamic color fallback based on theme
    const defaultColor = theme === 'light' ? '#1f2937' : '#ffffff';
    const activeColor = section.lyricsColor || defaultColor;

    const getSectionDotClass = (label: string) => {
        const lowerLabel = label.toLowerCase();
        if (lowerLabel.includes('intro')) return 'section-intro-dot';
        if (lowerLabel.includes('verse') || lowerLabel.includes('couplet')) return 'section-verse-dot';
        if (lowerLabel.includes('chorus') || lowerLabel.includes('refrain')) return 'section-chorus-dot';
        if (lowerLabel.includes('bridge') || lowerLabel.includes('pont')) return 'section-bridge-dot';
        if (lowerLabel.includes('solo')) return 'section-solo-dot';
        if (lowerLabel.includes('outro') || lowerLabel.includes('fin')) return 'section-outro-dot';
        return 'bg-zinc-500';
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="skeuo-card overflow-hidden group transition-all"
        >
            <div className="flex flex-wrap items-center p-3 bg-white/5 border-b border-white/5 gap-3">
                <div className="flex items-center gap-3">
                    {/* Drag Handle */}
                    <button
                        {...attributes}
                        {...listeners}
                        disabled={isReadOnly}
                        className={`text-text-secondary hover:text-text-primary ${isReadOnly ? 'cursor-default opacity-30 px-2' : 'cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/5 transition-colors'}`}
                    >
                        <GripVertical size={16} />
                    </button>

                    <div className={`section-dot ${getSectionDotClass(section.label)}`} />

                    {/* Section Label */}
                    <input
                        value={section.label}
                        onChange={(e) => updateSection(songId, section.id, { label: e.target.value })}
                        disabled={isReadOnly}
                        className="bg-transparent text-text-primary font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-accent/50 rounded px-2 py-0.5 w-full max-w-[150px] placeholder-text-secondary text-xs"
                    />
                </div>

                {/* Lyrics Settings Controls - Enhanced */}
                {songMode === 'lyrics' && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <div className="h-6 w-[1px] bg-border-main mx-1" />

                        {/* Font Family */}
                        <div className="flex items-center bg-bg-tertiary rounded-lg border border-border-main px-2 py-1 gap-2">
                            <TypeIcon size={14} className="text-text-secondary" />
                            <select
                                value={section.lyricsFont || 'Inter'}
                                onChange={(e) => updateSection(songId, section.id, { lyricsFont: e.target.value })}
                                disabled={isReadOnly}
                                className="bg-transparent text-text-primary text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer disabled:cursor-default"
                            >
                                <option value="Inter">{t('section.font_sans')}</option>
                                <option value="Georgia, serif">{t('section.font_serif')}</option>
                                <option value="monospace">{t('section.font_mono')}</option>
                            </select>
                        </div>

                        {/* Font Size */}
                        <div className="flex items-center bg-bg-tertiary rounded-lg border border-border-main px-2 py-1 gap-2">
                            <span className="text-[10px] font-bold text-text-secondary uppercase">Px</span>
                            <input
                                type="number"
                                value={section.lyricsSize || globalLyricsFontSize}
                                onChange={(e) => updateSection(songId, section.id, { lyricsSize: parseInt(e.target.value) })}
                                disabled={isReadOnly}
                                className="w-8 bg-transparent text-text-primary text-[10px] font-bold outline-none"
                            />
                        </div>

                        {/* Alignment */}
                        <div className="flex bg-bg-tertiary rounded-lg border border-border-main p-0.5">
                            {(['left', 'center', 'right'] as const).map((align) => (
                                <button
                                    key={align}
                                    onClick={() => updateSection(songId, section.id, { lyricsAlign: align })}
                                    disabled={isReadOnly}
                                    className={`p-1 rounded-md transition-all ${(section.lyricsAlign || globalLyricsAlignment) === align
                                        ? 'bg-accent text-white'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                                        } ${isReadOnly ? 'opacity-50 cursor-default' : ''}`}
                                >
                                    {align === 'left' && <AlignLeft size={14} />}
                                    {align === 'center' && <AlignCenter size={14} />}
                                    {align === 'right' && <AlignRight size={14} />}
                                </button>
                            ))}
                        </div>

                        {/* Bold / Italic */}
                        <div className="flex bg-bg-tertiary rounded-lg border border-border-main p-0.5">
                            <button
                                onClick={() => updateSection(songId, section.id, { lyricsBold: !section.lyricsBold })}
                                disabled={isReadOnly}
                                className={`p-1 rounded-md transition-all ${section.lyricsBold ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                                    } ${isReadOnly ? 'opacity-50 cursor-default' : ''}`}
                            >
                                <Bold size={14} />
                            </button>
                            <button
                                onClick={() => updateSection(songId, section.id, { lyricsItalic: !section.lyricsItalic })}
                                disabled={isReadOnly}
                                className={`p-1 rounded-md transition-all ${section.lyricsItalic ? 'bg-accent text-white' : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary'
                                    } ${isReadOnly ? 'opacity-50 cursor-default' : ''}`}
                            >
                                <Italic size={14} />
                            </button>
                        </div>

                        {/* Colors */}
                        <div className={`flex items-center gap-2 px-1 ${isReadOnly ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="relative group/color" title="Text Color">
                                <Palette size={14} className="text-text-secondary" />
                                <input
                                    type="color"
                                    value={activeColor}
                                    onChange={(e) => updateSection(songId, section.id, { lyricsColor: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <div className="w-4 h-1 mt-0.5 rounded-full" style={{ backgroundColor: activeColor }} />
                            </div>

                            <div className="relative group/highlight" title="Highlight Color">
                                <Highlighter size={14} className="text-text-secondary" />
                                <input
                                    type="color"
                                    value={section.lyricsBackground || '#ffff00'}
                                    onChange={(e) => updateSection(songId, section.id, { lyricsBackground: e.target.value })}
                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        updateSection(songId, section.id, { lyricsBackground: '' });
                                    }}
                                    className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full flex items-center justify-center text-[6px] text-white opacity-0 group-hover/highlight:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                                <div className="w-4 h-1 mt-0.5 rounded-full" style={{ backgroundColor: section.lyricsBackground || 'transparent', border: !section.lyricsBackground ? '1px dashed currentColor' : 'none' }} />
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    {!isReadOnly && (
                        <>
                            {isChordsMode && (
                                <button
                                    onClick={handlePlayStructure}
                                    className={`btn-skeuo-dark p-2 transition-all ${isPlaying ? 'border-red-400/50' : 'hover:text-accent'}`}
                                    style={{ color: isPlaying ? '#f87171' : undefined }}
                                    title={isPlaying ? "Arrêter la lecture" : "Écouter la structure"}
                                >
                                    {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
                                </button>
                            )}
                            <button
                                onClick={() => duplicateSection(songId, section.id)}
                                className="btn-skeuo-dark p-2"
                                title={t('section.duplicate')}
                            >
                                <Copy size={16} />
                            </button>
                            <button
                                onClick={() => removeSection(songId, section.id)}
                                className="btn-skeuo-dark p-2 hover:text-red-500 hover:border-red-500/50"
                                title={t('section.delete')}
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className={`p-4 bg-bg-secondary ${songMode === 'lyrics' ? '' : 'flex justify-center'}`}>
                {songMode === 'lyrics' ? (
                    <textarea
                        value={section.lyrics || ''}
                        onChange={(e) => updateSection(songId, section.id, { lyrics: e.target.value })}
                        disabled={isReadOnly}
                        className="w-full h-auto min-h-[150px] skeuo-inset text-text-primary p-4 focus:outline-none focus:ring-1 focus:ring-accent/50 resize-y whitespace-pre-wrap transition-all shadow-inner disabled:opacity-80"
                        style={{
                            fontSize: `${(section.lyricsSize || globalLyricsFontSize) * 2}px`,
                            textAlign: section.lyricsAlign || globalLyricsAlignment,
                            color: activeColor,
                            backgroundColor: section.lyricsBackground || 'transparent',
                            fontWeight: section.lyricsBold ? 'bold' : 'normal',
                            fontStyle: section.lyricsItalic ? 'italic' : 'normal',
                            fontFamily: section.lyricsFont || 'inherit',
                            lineHeight: '1.5',
                        }}
                        placeholder={t('section.lyrics_placeholder')}
                    />
                ) : (
                    <div className="flex flex-wrap justify-center gap-2 w-full max-w-5xl">
                        {section.measures.map((measure, index) => (
                            <div key={measure.id} className="w-[23%] sm:w-[11.5%] min-w-[80px]">
                                <MeasureCard
                                    songId={songId}
                                    sectionId={section.id}
                                    measure={measure}
                                    index={index}
                                    isHighlighted={index === playingMeasureIndex}
                                />
                            </div>
                        ))}

                        {!isReadOnly && (
                            <div className="w-[23%] sm:w-[11.5%] min-w-[80px]">
                                <button
                                    onClick={() => addMeasure(songId, section.id)}
                                    className="w-full aspect-[4/3] border border-dashed border-border-main hover:border-accent rounded-lg flex items-center justify-center text-text-secondary hover:text-accent transition-colors bg-bg-tertiary/10 hover:bg-bg-tertiary/40"
                                    title={t('measure.add')}
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
