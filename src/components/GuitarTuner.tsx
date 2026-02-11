import React, { useState, useEffect, useRef } from 'react';
import { Guitar, Music, Mic, Square } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

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

    const transients = useRef<{ pluck: AudioBuffer | null, hammer: AudioBuffer | null, breath: AudioBuffer | null }>({
        pluck: null, hammer: null, breath: null
    });

    useEffect(() => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

        const generateBuffer = (length: number, type: 'noise' | 'percussive' | 'breath') => {
            const buffer = ctx.createBuffer(1, ctx.sampleRate * length, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) {
                if (type === 'noise') data[i] = (Math.random() * 2 - 1) * 0.5;
                else if (type === 'percussive') data[i] = (Math.random() * 2 - 1) * Math.exp(-i * 0.01);
                else if (type === 'breath') data[i] = (Math.random() * 2 - 1) * 0.2;
            }
            return buffer;
        };

        transients.current.pluck = generateBuffer(0.1, 'noise');
        transients.current.hammer = generateBuffer(0.1, 'percussive');
        transients.current.breath = generateBuffer(0.4, 'breath');

        return () => {
            if (ctx.state !== 'closed') ctx.close();
        };
    }, []);

    const createGuitarVoice = (ctx: AudioContext, freq: number, now: number) => {
        const duration = 3.5;
        const createPart = (f: number, gainVal: number, decay: number, type: OscillatorType = 'sine') => {
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(f, now);
            g.gain.setValueAtTime(0, now);
            g.gain.linearRampToValueAtTime(gainVal, now + 0.01);
            g.gain.exponentialRampToValueAtTime(0.001, now + decay);
            osc.connect(g);
            g.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + decay + 0.1);
            activeOscillators.current.push(osc);
            activeNodes.current.push(g);
        };

        createPart(freq, 0.45, duration);
        createPart(freq * 2, 0.15, duration * 0.7);
        createPart(freq * 3, 0.08, duration * 0.4);
        createPart(freq * 4, 0.04, duration * 0.2, 'triangle');

        if (transients.current.pluck) {
            const pluck = ctx.createBufferSource();
            pluck.buffer = transients.current.pluck;
            const pg = ctx.createGain();
            pg.gain.setValueAtTime(0.2, now);
            pg.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            pluck.connect(pg);
            pg.connect(ctx.destination);
            pluck.start(now);
        }
    };

    const createPianoVoice = (ctx: AudioContext, freq: number, now: number) => {
        const duration = 2.5;
        const carrier = ctx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(freq, now);
        const modulator = ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq, now);
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(freq * 2, now);
        modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.5, now + 0.005);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);
        carrier.start(now);
        modulator.start(now);
        carrier.stop(now + duration + 0.1);
        modulator.stop(now + duration + 0.1);

        if (transients.current.hammer) {
            const hammer = ctx.createBufferSource();
            hammer.buffer = transients.current.hammer;
            const hg = ctx.createGain();
            hg.gain.setValueAtTime(0.3, now);
            hg.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            hammer.connect(hg);
            hg.connect(ctx.destination);
            hammer.start(now);
        }

        activeOscillators.current.push(carrier, modulator);
        activeNodes.current.push(modGain, mainGain, filter);
    };

    const createVoiceVoice = (ctx: AudioContext, freq: number, now: number) => {
        const duration = 2.5;
        const source = ctx.createOscillator();
        source.type = 'sawtooth';
        source.frequency.setValueAtTime(freq, now);
        const vibrato = ctx.createOscillator();
        vibrato.frequency.setValueAtTime(5.8, now);
        const vg = ctx.createGain();
        vg.gain.setValueAtTime(freq * 0.015, now);
        vibrato.connect(vg);
        vg.connect(source.frequency);
        vibrato.start(now);

        const createFormant = (f: number, q: number, gainVal: number) => {
            const filter = ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(f, now);
            filter.Q.setValueAtTime(q, now);
            const g = ctx.createGain();
            g.gain.setValueAtTime(gainVal, now);
            filter.connect(g);
            return { filter, g };
        };

        const f1 = createFormant(800, 10, 1.2);
        const f2 = createFormant(2300, 12, 0.6);
        const f3 = createFormant(3200, 15, 0.3);
        const f4 = createFormant(3800, 15, 0.2);

        const out = ctx.createGain();
        out.gain.setValueAtTime(0, now);
        out.gain.linearRampToValueAtTime(0.6, now + 0.15);
        out.gain.exponentialRampToValueAtTime(0.001, now + duration);

        source.connect(f1.filter);
        source.connect(f2.filter);
        source.connect(f3.filter);
        source.connect(f4.filter);
        f1.g.connect(out);
        f2.g.connect(out);
        f3.g.connect(out);
        f4.g.connect(out);
        out.connect(ctx.destination);

        source.start(now);
        source.stop(now + duration + 0.5);
        vibrato.stop(now + duration + 0.5);

        if (transients.current.breath) {
            const breath = ctx.createBufferSource();
            breath.buffer = transients.current.breath;
            const bFilter = ctx.createBiquadFilter();
            bFilter.type = 'highpass';
            bFilter.frequency.setValueAtTime(2000, now);
            const bg = ctx.createGain();
            bg.gain.setValueAtTime(0.05, now);
            bg.gain.exponentialRampToValueAtTime(0.001, now + duration);
            breath.connect(bFilter);
            bFilter.connect(bg);
            bg.connect(ctx.destination);
            breath.start(now);
        }

        activeOscillators.current.push(source, vibrato);
        activeNodes.current.push(f1.filter, f1.g, f2.filter, f2.g, f3.filter, f3.g, f4.filter, f4.g, out, vg);
    };

    const pluckString = (freq: number) => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const ctx = audioContext.current;
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        if (instrument === 'guitar') createGuitarVoice(ctx, freq, now);
        else if (instrument === 'piano') createPianoVoice(ctx, freq, now);
        else if (instrument === 'voice') createVoiceVoice(ctx, freq, now);

        setTimeout(() => {
            activeOscillators.current = activeOscillators.current.filter(o => {
                try { return o.frequency.value > 0; } catch (e) { return false; }
            });
        }, 4000);
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
        }, 3000);
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
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full bg-bg-primary text-text-primary p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full max-w-lg bg-bg-secondary rounded-[32px] p-8 sm:p-12 shadow-2xl border border-border-main space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-48 h-48 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-6 relative z-10 flex flex-col items-center">
                    <h2 className="text-text-secondary text-[11px] font-black uppercase tracking-[0.4em] opacity-50">{t('tuner.title')}</h2>

                    {/* Pro Instrument Selector */}
                    <div className="tuner-selector">
                        {instruments.map((inst) => (
                            <button
                                key={inst.id}
                                onClick={() => {
                                    setInstrument(inst.id as InstrumentType);
                                    if (activeString !== null) stopAudio();
                                }}
                                className={`tuner-btn-pro ${instrument === inst.id ? 'active' : ''}`}
                            >
                                {inst.icon}
                                <span>{inst.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Professional Note Pastilles */}
                <div className="grid grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {STRINGS.map((string, index) => (
                        <button
                            key={index}
                            onClick={() => playString(string.freq, index)}
                            className={`tuner-note-btn ${activeString === index ? 'active' : ''}`}
                        >
                            <span className="note-text">{string.note}</span>
                            <span className="note-sub">{t('tuner.string')} {string.number}</span>

                            {activeString === index && (
                                <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping opacity-30" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tactical Stop Button */}
                <div className="pt-2 relative z-10">
                    <button
                        onClick={stopAudio}
                        disabled={activeString === null}
                        className={`tuner-stop-btn ${activeString !== null ? 'active' : 'disabled'}`}
                    >
                        <Square size={16} fill="currentColor" />
                        {t('tuner.stop')}
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3">
                <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeString !== null ? 'bg-accent animate-bounce shadow-[0_0_8px_var(--accent)]' : 'bg-text-secondary/20'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <p className="text-text-secondary text-[10px] text-center max-w-xs uppercase tracking-[0.2em] font-black opacity-30">
                    {instrument} {t('tuner.reference')}
                </p>
            </div>
        </div>
    );
};
