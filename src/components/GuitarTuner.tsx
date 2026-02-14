import React, { useState, useEffect, useRef } from 'react';
import { Guitar, Music, Mic, Square } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';
import { playNote } from '../utils/audioEngine';

const STRINGS = [
    { note: 'E', freq: 82.41, label: 'Low E', number: 6 },
    { note: 'A', freq: 110.00, label: 'A', number: 5 },
    { note: 'D', freq: 146.83, label: 'D', number: 4 },
    { note: 'G', freq: 196.00, label: 'G', number: 3 },
    { note: 'B', freq: 246.94, label: 'B', number: 2 },
    { note: 'e', freq: 329.63, label: 'High E', number: 1 }
];

type InstrumentType = 'guitar' | 'piano' | 'voice';

export const GuitarTuner: React.FC = () => {
    const { t } = useSongStore();
    const [activeString, setActiveString] = useState<number | null>(null);
    const [instrument, setInstrument] = useState<InstrumentType>('guitar');
    const audioContext = useRef<AudioContext | null>(null);
    const intervalRef = useRef<number | null>(null);
    const activeOscillators = useRef<OscillatorNode[]>([]);
    const activeNodes = useRef<AudioNode[]>([]);

    const stopAudio = () => {
        if (intervalRef.current) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        activeOscillators.current.forEach(osc => {
            try { osc.stop(); osc.disconnect(); } catch (e) { }
        });
        activeNodes.current.forEach(node => {
            try { node.disconnect(); } catch (e) { }
        });

        activeOscillators.current = [];
        activeNodes.current = [];
        setActiveString(null);
    };

    const pluckString = (freq: number) => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContext.current;
        if (ctx.state === 'suspended') ctx.resume();

        const engineInstrument = instrument === 'guitar' ? 'acoustic-guitar' : instrument;
        playNote(ctx, engineInstrument, freq);
    };

    const playString = (freq: number, index: number) => {
        if (activeString === index) {
            stopAudio();
            return;
        }
        stopAudio();
        setActiveString(index);
        pluckString(freq);
        intervalRef.current = window.setInterval(() => {
            pluckString(freq);
        }, 3000); // 3 seconds loop
    };

    useEffect(() => {
        return () => stopAudio();
    }, []);

    const instruments = [
        { id: 'guitar', label: t('tuner.guitar'), icon: <Guitar size={18} /> },
        { id: 'piano', label: t('tuner.piano'), icon: <Music size={18} /> },
        { id: 'voice', label: t('tuner.voice'), icon: <Mic size={18} /> }
    ];

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-8 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Logo and Header */}
            <div className="relative mb-6 group">
                <div className="absolute inset-x-0 -inset-y-4 blur-3xl rounded-full opacity-30 bg-blue-500/20 group-hover:opacity-50 transition-opacity duration-1000"></div>
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab"
                    className="h-24 w-auto relative z-10 drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
            </div>

            <div className="w-full max-w-xl bg-bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                {/* Decorative background glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full transition-opacity duration-1000 group-hover:bg-blue-500/10 pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 blur-3xl rounded-full transition-opacity duration-1000 group-hover:bg-accent/10 pointer-events-none" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-6">
                        <h2 className="text-text-secondary text-xs font-black uppercase tracking-[0.4em] opacity-60">
                            {t('tuner.title')}
                        </h2>

                        {/* Premium Instrument Selector */}
                        <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl w-full border border-white/5">
                            {instruments.map((inst) => (
                                <button
                                    key={inst.id}
                                    onClick={() => {
                                        setInstrument(inst.id as InstrumentType);
                                        if (activeString !== null) stopAudio();
                                    }}
                                    className={`flex-1 py-3 flex flex-col items-center gap-2 rounded-xl transition-all duration-500
                                        ${instrument === inst.id
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 scale-105'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                        }`}
                                >
                                    <div className={`transition-transform duration-500 ${instrument === inst.id ? 'scale-110' : ''}`}>
                                        {React.cloneElement(inst.icon as any, { size: 24 })}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{inst.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Professional Note Selection Grid */}
                    <div className="grid grid-cols-3 gap-6 sm:gap-8">
                        {STRINGS.map((string, index) => (
                            <button
                                key={index}
                                onClick={() => playString(string.freq, index)}
                                className={`group/note relative flex flex-col items-center justify-center aspect-square rounded-3xl transition-all duration-500 border overflow-hidden
                                    ${activeString === index
                                        ? 'bg-blue-600/20 border-blue-400/50 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                                        : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                                    }`}
                            >
                                <span className={`text-4xl font-black transition-all duration-500 ${activeString === index ? 'text-blue-400 scale-125' : 'text-text-primary'}`}>
                                    {string.note}
                                </span>
                                <span className="text-[9px] font-black uppercase tracking-widest opacity-40 mt-1">
                                    {t('tuner.string')} {string.number}
                                </span>

                                {activeString === index && (
                                    <div className="absolute inset-0 bg-blue-400/10 animate-pulse pointer-events-none" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Stop Button Section */}
                    <div className="pt-2">
                        <button
                            onClick={stopAudio}
                            disabled={activeString === null}
                            className={`w-full py-5 flex items-center justify-center gap-3 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-sm transition-all duration-500
                                ${activeString !== null
                                    ? 'bg-white/10 text-white hover:bg-red-500/80 hover:scale-105 active:scale-95 border border-white/10'
                                    : 'bg-white/5 text-text-tertiary opacity-30 cursor-not-allowed border border-transparent'
                                }`}
                        >
                            <Square size={16} fill="currentColor" stroke="none" />
                            {t('tuner.stop')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Immersive Feedback Indicators */}
            <div className="mt-8 flex flex-col items-center gap-4">
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 
                                ${activeString !== null
                                    ? 'bg-blue-400 animate-bounce shadow-[0_0_12px_rgba(96,165,250,0.6)]'
                                    : 'bg-white/10'
                                }`}
                            style={{ animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>
                <p className="text-text-tertiary text-[10px] uppercase tracking-[0.4em] font-black opacity-30">
                    {instrument} {t('tuner.reference')}
                </p>
            </div>
        </div>
    );
};
