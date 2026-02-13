import React from 'react';
import { useSongStore } from '../store/useSongStore';
import type { ChordInstrument } from '../utils/chordAudio';
import { playChord } from '../utils/chordAudio';
import { Guitar, Music, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentInstrument: ChordInstrument;
    onSelectInstrument: (instrument: ChordInstrument) => void;
}

interface InstrumentOption {
    id: ChordInstrument;
    icon: React.ReactNode;
    labelKey: string;
    descriptionKey: string;
}

const INSTRUMENTS: InstrumentOption[] = [
    {
        id: 'acoustic-guitar',
        icon: <Guitar size={32} />,
        labelKey: 'instrument.acoustic_guitar',
        descriptionKey: 'instrument.acoustic_guitar_desc'
    },
    {
        id: 'piano',
        icon: <Music size={32} />,
        labelKey: 'instrument.piano',
        descriptionKey: 'instrument.piano_desc'
    }
];

export const InstrumentSelectorModal: React.FC<Props> = ({
    isOpen,
    onClose,
    currentInstrument,
    onSelectInstrument
}) => {
    const { t } = useSongStore();

    if (!isOpen) return null;

    const handleTestInstrument = (instrument: ChordInstrument) => {
        // Play a C major chord as a test
        playChord('C', instrument);
    };

    const handleSelectInstrument = (instrument: ChordInstrument) => {
        onSelectInstrument(instrument);
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-bg-secondary border border-border-main rounded-2xl p-6 max-w-2xl w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary">
                        {t('instrument.select')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-bg-tertiary rounded-xl transition-colors"
                    >
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Instrument Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INSTRUMENTS.map((instrument) => {
                        const isActive = currentInstrument === instrument.id;

                        return (
                            <div
                                key={instrument.id}
                                className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer group
                                    ${isActive
                                        ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                                        : 'border-border-main hover:border-accent/50 hover:bg-bg-tertiary'
                                    }`}
                                onClick={() => handleSelectInstrument(instrument.id)}
                            >
                                {/* Icon */}
                                <div className={`mb-4 ${isActive ? 'text-accent' : 'text-text-secondary group-hover:text-accent'} transition-colors`}>
                                    {instrument.icon}
                                </div>

                                {/* Label */}
                                <h3 className="text-lg font-black uppercase tracking-wider text-text-primary mb-2">
                                    {t(instrument.labelKey)}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-text-secondary mb-4">
                                    {t(instrument.descriptionKey)}
                                </p>

                                {/* Test Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleTestInstrument(instrument.id);
                                    }}
                                    className={`w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-all
                                        ${isActive
                                            ? 'bg-accent text-white hover:bg-accent-light'
                                            : 'bg-bg-tertiary border border-border-main text-text-secondary hover:border-accent hover:text-accent'
                                        }`}
                                >
                                    {t('instrument.test')}
                                </button>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute top-3 right-3 w-3 h-3 bg-accent rounded-full shadow-lg shadow-accent/50" />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
