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
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-bg-primary text-text-primary p-8">
            <div className="w-full max-w-md skeuo-card p-10 space-y-10">
                <div className="text-center space-y-2">
                    <h2 className="text-text-secondary text-sm font-bold uppercase tracking-[0.2em]">{t('metronome.title')}</h2>
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={() => changeBpm(-1)}
                            className="btn-skeuo-dark p-3 rounded-full"
                        >
                            <Minus size={24} />
                        </button>

                        <div className="relative group">
                            <input
                                type="number"
                                value={bpm}
                                onChange={(e) => setBpm(Math.min(Math.max(parseInt(e.target.value) || 40, 40), 240))}
                                className="bg-transparent text-8xl font-black text-center w-48 focus:outline-none focus:text-accent transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-text-primary"
                            />
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-text-secondary">{t('metronome.bpm')}</div>
                        </div>

                        <button
                            onClick={() => changeBpm(1)}
                            className="btn-skeuo-dark p-3 rounded-full"
                        >
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-8">
                    {/* Sound Selection */}
                    <div className="flex bg-bg-primary p-1 rounded-xl w-full border border-border-main">
                        {(['electronic', 'woodblock', 'clap', 'shaker'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setSoundType(type)}
                                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all
                                    ${soundType === type
                                        ? 'bg-bg-tertiary text-accent shadow-lg'
                                        : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                {t(`metronome.${type}`)}
                            </button>
                        ))}
                    </div>

                    <input
                        type="range"
                        min="40"
                        max="240"
                        value={bpm}
                        onChange={(e) => setBpm(parseInt(e.target.value))}
                        className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                    />

                    <button
                        onClick={handleStartStop}
                        className={`w-24 h-24 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-xl skeuo-btn
                            ${isPlaying
                                ? 'bg-red-600 hover:bg-red-500 shadow-red-500/30'
                                : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30'
                            }`}
                    >
                        {isPlaying ? <Square size={32} fill="white" stroke="none" /> : <Play size={32} fill="white" stroke="none" className="ml-1" />}
                    </button>
                </div>

                {/* Visual Pulse */}
                <div className="flex justify-center gap-4 skeuo-inset p-4">
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className={`w-5 h-5 rounded-full transition-all duration-75 
                                ${!isPlaying
                                    ? 'bg-black/40'
                                    : currentBeat === i
                                        ? i === 0 ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)] scale-125' : 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] scale-110'
                                        : 'bg-black/40'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <p className="mt-8 text-text-secondary text-sm text-center max-w-xs">
                {t('metronome.description')}
            </p>
        </div>
    );
};
