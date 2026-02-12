import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Minus, Plus } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const Metronome: React.FC = () => {
    const { t } = useSongStore();
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0);
    const [soundType, setSoundType] = useState<'electronic' | 'woodblock' | 'clap' | 'shaker'>('electronic');

    // Audio references
    const audioContext = useRef<AudioContext | null>(null);
    const noiseBuffer = useRef<AudioBuffer | null>(null);
    const timerID = useRef<number | null>(null);
    const nextNoteTime = useRef(0.0);
    const bpmRef = useRef(bpm);
    const isPlayingRef = useRef(false);
    const beatNumber = useRef(0);
    const soundTypeRef = useRef(soundType);
    const scheduleAheadTime = 0.1; // How far ahead to schedule audio (seconds)
    const lookahead = 25.0; // How frequently to check if we need to schedule (ms)

    // Keep refs in sync with state
    useEffect(() => {
        bpmRef.current = bpm;
    }, [bpm]);

    useEffect(() => {
        isPlayingRef.current = isPlaying;
    }, [isPlaying]);

    useEffect(() => {
        soundTypeRef.current = soundType;
    }, [soundType]);

    // Create noise buffer for percussion sounds
    const createNoiseBuffer = (ctx: AudioContext) => {
        if (noiseBuffer.current) return;
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noiseBuffer.current = buffer;
    };

    const handleStartStop = () => {
        if (!isPlaying) {
            // Start
            if (!audioContext.current) {
                audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
                createNoiseBuffer(audioContext.current);
            }
            if (audioContext.current.state === 'suspended') {
                audioContext.current.resume();
            }

            nextNoteTime.current = audioContext.current.currentTime;
            beatNumber.current = 0;
            setIsPlaying(true);
            isPlayingRef.current = true;
            scheduler();
        } else {
            // Stop
            if (timerID.current) {
                window.clearTimeout(timerID.current);
            }
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCurrentBeat(0);
        }
    };

    const scheduleNote = (beatNum: number, time: number) => {
        if (!audioContext.current) return;

        const isDownbeat = beatNum % 4 === 0;
        const currentSound = soundTypeRef.current;

        if (currentSound === 'electronic' || currentSound === 'woodblock') {
            const osc = audioContext.current.createOscillator();
            const envelope = audioContext.current.createGain();

            if (currentSound === 'electronic') {
                osc.frequency.value = isDownbeat ? 880 : 700; // Subtle pitch difference
                envelope.gain.setValueAtTime(1, time); // Anchored to scheduled time
                envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
            } else {
                // Woodblock
                osc.frequency.value = isDownbeat ? 1200 : 900; // Subtle pitch difference
                envelope.gain.setValueAtTime(1, time); // Anchored to scheduled time
                envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            }

            osc.connect(envelope);
            envelope.connect(audioContext.current.destination);
            osc.start(time);
            osc.stop(time + 0.1);
        } else {
            // Noise based sounds: Clap, Shaker
            if (!noiseBuffer.current) return;
            const noise = audioContext.current.createBufferSource();
            noise.buffer = noiseBuffer.current;
            const filter = audioContext.current.createBiquadFilter();
            const envelope = audioContext.current.createGain();

            if (currentSound === 'clap') {
                filter.type = 'highpass';
                filter.frequency.value = isDownbeat ? 1000 : 1400; // Subtle filter difference
                envelope.gain.setValueAtTime(1, time); // Anchored to scheduled time
                envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
            } else {
                // Shaker
                filter.type = 'bandpass';
                filter.frequency.value = isDownbeat ? 3000 : 3500; // Subtle filter difference
                envelope.gain.setValueAtTime(0.8, time); // Anchored to scheduled time
                envelope.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
            }

            noise.connect(filter);
            filter.connect(envelope);
            envelope.connect(audioContext.current.destination);
            noise.start(time);
            noise.stop(time + 0.2);
        }

        // Schedule visual update
        const delay = (time - audioContext.current.currentTime) * 1000;
        setTimeout(() => {
            if (isPlayingRef.current) {
                setCurrentBeat(beatNum % 4);
            }
        }, delay);
    };

    const scheduler = () => {
        if (!audioContext.current) return;

        while (nextNoteTime.current < audioContext.current.currentTime + scheduleAheadTime) {
            scheduleNote(beatNumber.current, nextNoteTime.current);
            const secondsPerBeat = 60.0 / bpmRef.current;
            nextNoteTime.current += secondsPerBeat;
            beatNumber.current++;
        }
        timerID.current = window.setTimeout(scheduler, lookahead);
    };

    useEffect(() => {
        return () => {
            if (timerID.current) window.clearTimeout(timerID.current);
            if (audioContext.current) audioContext.current.close();
        };
    }, []);

    const changeBpm = (delta: number) => {
        setBpm(prev => {
            const next = prev + delta;
            return Math.min(Math.max(next, 40), 240);
        });
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-full py-8 px-6 text-center animate-in fade-in duration-700">
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
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full transition-opacity duration-1000 group-hover:bg-blue-500/10" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/5 blur-3xl rounded-full transition-opacity duration-1000 group-hover:bg-accent/10" />

                <div className="relative z-10 space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-text-secondary text-xs font-black uppercase tracking-[0.4em] opacity-60">
                            {t('metronome.title')}
                        </h2>

                        <div className="flex items-center justify-center gap-8">
                            <button
                                onClick={() => changeBpm(-5)}
                                className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/5 transition-all flex items-center justify-center group/btn active:scale-90"
                            >
                                <Minus size={24} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                            </button>

                            <div className="relative">
                                <input
                                    type="number"
                                    value={bpm}
                                    onChange={(e) => setBpm(Math.min(Math.max(parseInt(e.target.value) || 40, 40), 240))}
                                    className="bg-transparent text-9xl font-black text-center w-64 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-text-primary tracking-tighter"
                                    style={{
                                        textShadow: isPlaying ? '0 0 40px rgba(59, 130, 246, 0.3)' : 'none'
                                    }}
                                />
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-black uppercase tracking-widest text-text-tertiary">
                                    {t('metronome.bpm')}
                                </div>
                            </div>

                            <button
                                onClick={() => changeBpm(5)}
                                className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/5 transition-all flex items-center justify-center group/btn active:scale-90"
                            >
                                <Plus size={24} strokeWidth={3} className="group-hover/btn:scale-110 transition-transform" />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-10">
                        {/* Sound Selection - Premium Strip */}
                        <div className="flex bg-black/20 backdrop-blur-md p-1.5 rounded-2xl w-full border border-white/5">
                            {(['electronic', 'woodblock', 'clap', 'shaker'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setSoundType(type)}
                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-300
                                        ${soundType === type
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                        }`}
                                >
                                    {t(`metronome.${type}`)}
                                </button>
                            ))}
                        </div>

                        {/* Premium Range Slider */}
                        <div className="w-full px-4">
                            <input
                                type="range"
                                min="40"
                                max="240"
                                value={bpm}
                                onChange={(e) => setBpm(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
                            />
                        </div>

                        {/* Main Action Button */}
                        <button
                            onClick={handleStartStop}
                            className={`group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 active:scale-90 shadow-2xl
                                ${isPlaying
                                    ? 'bg-red-500 hover:bg-red-400 shadow-red-500/25'
                                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/25'
                                }`}
                        >
                            <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 scale-110 transition-all duration-500"></div>
                            {isPlaying ? (
                                <Square size={32} fill="white" stroke="none" className="relative z-10" />
                            ) : (
                                <Play size={32} fill="white" stroke="none" className="relative z-10 ml-1.5" />
                            )}
                        </button>
                    </div>

                    {/* Pro Visual Pulse Indicators */}
                    <div className="flex justify-center gap-6 py-2">
                        {[0, 1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-full transition-all duration-150 
                                    ${!isPlaying
                                        ? 'bg-white/5 shadow-inner'
                                        : currentBeat === i
                                            ? i === 0
                                                ? 'bg-blue-400 scale-150 shadow-[0_0_20px_rgba(96,165,250,0.8)]'
                                                : 'bg-white/60 scale-125 shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                                            : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <p className="mt-8 text-text-secondary text-sm font-medium tracking-wide opacity-50 max-w-sm leading-relaxed">
                {t('metronome.description')}
            </p>
        </div >
    );
};
