import React from 'react';
import { X, ArrowLeft } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

interface ChordSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectChord: (chord: string) => void;
    currentChord?: string;
}

// Base notes with French equivalents
const BASE_NOTES = [
    { note: 'C', french: 'Do' },
    { note: 'D', french: 'Ré' },
    { note: 'E', french: 'Mi' },
    { note: 'F', french: 'Fa' },
    { note: 'G', french: 'Sol' },
    { note: 'A', french: 'La' },
    { note: 'B', french: 'Si' }
];

// Chord variant categories with all classic types
const CHORD_VARIANTS = {
    basic: [
        { suffix: '', label: 'Major' },
        { suffix: 'm', label: 'Minor' }
    ],
    power: [
        { suffix: '5', label: 'Power' }
    ],
    seventh: [
        { suffix: '7', label: 'Dominant 7' },
        { suffix: 'maj7', label: 'Major 7' },
        { suffix: 'm7', label: 'Minor 7' },
        { suffix: 'm(maj7)', label: 'Minor Major 7' }
    ],
    suspended: [
        { suffix: 'sus2', label: 'Sus 2' },
        { suffix: 'sus4', label: 'Sus 4' }
    ],
    diminished: [
        { suffix: 'dim', label: 'Diminished' },
        { suffix: 'dim7', label: 'Diminished 7' },
        { suffix: 'aug', label: 'Augmented' }
    ],
    sixth: [
        { suffix: '6', label: 'Major 6' },
        { suffix: 'm6', label: 'Minor 6' }
    ],
    extended: [
        { suffix: '9', label: 'Dominant 9' },
        { suffix: 'maj9', label: 'Major 9' },
        { suffix: 'm9', label: 'Minor 9' },
        { suffix: '11', label: '11' },
        { suffix: '13', label: '13' }
    ]
};

export const ChordSelector: React.FC<ChordSelectorProps> = ({
    isOpen,
    onClose,
    onSelectChord,
    currentChord
}) => {
    const { language, t } = useSongStore();

    // Local state to toggle between base note selection and variants
    const [showBaseSelection, setShowBaseSelection] = React.useState(false);

    // Reset view when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setShowBaseSelection(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    // Extract base note from current chord
    const getBaseNote = (chord: string): string | null => {
        if (!chord) return null;
        const match = chord.match(/^([A-G][#b]?)/);
        return match ? match[1] : null;
    };

    const baseNote = getBaseNote(currentChord || '');
    const isEmpty = !currentChord || currentChord.trim() === '';

    // Determine what to show
    const isSelectingBase = isEmpty || showBaseSelection;

    // Handle base note selection
    const handleBaseNoteSelect = (note: string) => {
        onSelectChord(note);
        // If we were selecting base intentionally to switch, maybe we want to keep modal open?
        // But user flow usually implies picking a base note starts the variant selection.
        // If I update chord to 'C', parent re-renders, 'currentChord' becomes 'C'.
        // 'isEmpty' becomes false. 'showBaseSelection' is false (unless we reset it?)
        // If I keep 'showBaseSelection' as true, we stay in grid.
        // We want to go to variants.
        setShowBaseSelection(false);
        // Note: IF the parent closes the modal on select (it doesn't seems so), this is fine.
        // But logic says: Base Note -> Variant.
        // If I'm just changing base, I probably want to see variants next.
    };

    // Handle variant selection
    const handleVariantSelect = (suffix: string) => {
        if (baseNote) {
            onSelectChord(baseNote + suffix);
            onClose();
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[300] animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[301] flex items-center justify-center p-6 pointer-events-none">
                <div
                    className="bg-bg-secondary border-2 border-accent/30 rounded-[2rem] shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 fade-in duration-200 pointer-events-auto relative skeuo-card max-h-[80vh] overflow-y-auto custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary hover:text-text-primary z-10"
                    >
                        <X size={20} />
                    </button>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary mb-6">
                            {isSelectingBase ? t('chord.select_base') : t('chord.select_variant')}
                        </h2>

                        {!isSelectingBase && baseNote && (
                            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
                                {/* Current Chord Display - Professional Look */}
                                <div className="bg-bg-tertiary/50 border border-border-main rounded-2xl p-4 min-w-[120px] shadow-lg backdrop-blur-sm">
                                    <p className="text-xs text-text-secondary uppercase tracking-widest font-bold mb-1">
                                        {t('chord.current')}
                                    </p>
                                    <p className="text-4xl font-black text-accent drop-shadow-sm">
                                        {currentChord}
                                    </p>
                                </div>

                                {/* Change Base Note Button - More Visible */}
                                <button
                                    onClick={() => setShowBaseSelection(true)}
                                    className="group flex items-center gap-2 px-5 py-2.5 bg-bg-tertiary hover:bg-accent hover:text-white text-text-secondary rounded-full transition-all duration-300 shadow-md hover:shadow-accent/20 border border-border-main hover:border-accent"
                                >
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-semibold text-sm uppercase tracking-wide">{t('chord.change_base')}</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Base Note Selection */}
                    {isSelectingBase && (
                        <div className="grid grid-cols-7 gap-3 animate-in fade-in slide-in-from-left-4 duration-200">
                            {BASE_NOTES.map(({ note, french }) => (
                                <button
                                    key={note}
                                    onClick={() => handleBaseNoteSelect(note)}
                                    className="aspect-square flex flex-col items-center justify-center gap-1 bg-bg-tertiary border-2 border-border-main rounded-xl font-black text-2xl text-text-primary hover:border-accent hover:bg-accent/10 hover:scale-105 transition-all active:scale-95 shadow-lg"
                                >
                                    <span>{note}</span>
                                    <span className="text-[10px] text-text-secondary font-normal">
                                        {language === 'fr' ? french : note}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Variant Selection */}
                    {!isSelectingBase && baseNote && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                            {/* Major & Minor */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {t('chord.category.basic')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.basic.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-blue-500 hover:bg-blue-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Power Chord */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    {t('chord.category.power')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.power.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-purple-500 hover:bg-purple-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 7th Chords */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    {t('chord.category.seventh')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.seventh.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-orange-500 hover:bg-orange-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Suspended */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {t('chord.category.suspended')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.suspended.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-green-500 hover:bg-green-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Diminished & Augmented */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {t('chord.category.diminished')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.diminished.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-red-500 hover:bg-red-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 6th Chords */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                                    {t('chord.category.sixth')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.sixth.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-pink-500 hover:bg-pink-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Extended Chords */}
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-text-secondary mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                    {t('chord.category.extended')}
                                </h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {CHORD_VARIANTS.extended.map(({ suffix }) => (
                                        <button
                                            key={suffix}
                                            onClick={() => handleVariantSelect(suffix)}
                                            className="px-4 py-3 bg-bg-tertiary border border-border-main rounded-lg font-bold text-lg text-text-primary hover:border-cyan-500 hover:bg-cyan-500/10 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {baseNote}{suffix}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
