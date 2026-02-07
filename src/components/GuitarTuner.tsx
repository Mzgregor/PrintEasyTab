import React, { useState, useEffect, useRef } from 'react';

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
        // Pre-generate transient buffers for better performance and realism
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
        // Steel-string acoustic: Rich overtones + percussive pluck
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
        createPart(freq * 4, 0.04, duration * 0.2, 'triangle'); // Brighter top

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
        // FM Synthesis for Upright Piano: Metallic strike + wooden resonance
        // Carrier
        const carrier = ctx.createOscillator();
        carrier.type = 'sine';
        carrier.frequency.setValueAtTime(freq, now);

        // Modulator
        const modulator = ctx.createOscillator();
        modulator.type = 'sine';
        modulator.frequency.setValueAtTime(freq, now); // 1:1 ratio for piano-like bell/string tone

        // Modulation Index (Depth)
        const modGain = ctx.createGain();
        modGain.gain.setValueAtTime(freq * 2, now); // Initial bite
        modGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // Envelopes
        const mainGain = ctx.createGain();
        mainGain.gain.setValueAtTime(0, now);
        mainGain.gain.linearRampToValueAtTime(0.5, now + 0.005);
        mainGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        // Woody resonance filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 6, now);
        filter.frequency.exponentialRampToValueAtTime(freq * 1.5, now + duration);

        // Connections
        modulator.connect(modGain);
        modGain.connect(carrier.frequency);
        carrier.connect(filter);
        filter.connect(mainGain);
        mainGain.connect(ctx.destination);

        carrier.start(now);
        modulator.start(now);
        carrier.stop(now + duration + 0.1);
        modulator.stop(now + duration + 0.1);

        // Hammer Transient (Simpler blend)
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
        // High-Fidelity Female Singer: Better glottal pulse and 4 formants

        // Glottal Pulse Source (Band-limited Sawtooth)
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

        // Female Formants (Ah-ish vowel)
        // Values: F1: 800, F2: 2300, F3: 3200, F4: 3800
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

        // Master Volume (Boosted for better audibility)
        const out = ctx.createGain();
        out.gain.setValueAtTime(0, now);
        out.gain.linearRampToValueAtTime(0.6, now + 0.15); // Significant boost
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

        // Breathiness (High-passed air)
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
        }, 3000); // Slightly faster interval for better feedback
    };

    useEffect(() => {
        return () => stopAudio();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] h-full bg-bg-primary text-text-primary p-4 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full max-w-md bg-bg-secondary rounded-[32px] p-8 sm:p-10 shadow-2xl border border-border-main space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

                <div className="text-center space-y-4 relative z-10">
                    <h2 className="text-text-secondary text-xs font-bold uppercase tracking-[0.3em]">Reference Tuner</h2>

                    <div className="flex items-center justify-center p-1 bg-bg-tertiary/50 rounded-xl border border-border-main self-center mx-auto max-w-[280px]">
                        {(['guitar', 'piano', 'voice'] as InstrumentType[]).map((inst) => (
                            <button
                                key={inst}
                                onClick={() => {
                                    setInstrument(inst);
                                    if (activeString !== null) stopAudio();
                                }}
                                className={`
                                    flex-1 py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                                    ${instrument === inst
                                        ? 'bg-accent text-white shadow-sm'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                    }
                                `}
                            >
                                {inst}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-6 relative z-10">
                    {STRINGS.map((string, index) => (
                        <button
                            key={index}
                            onClick={() => playString(string.freq, index)}
                            className={`
                                relative group aspect-square flex flex-col items-center justify-center gap-1 rounded-full border transition-all duration-500 ease-out
                                ${activeString === index
                                    ? 'bg-accent border-accent text-white shadow-xl shadow-accent/40 scale-110'
                                    : 'bg-bg-tertiary border-border-main text-text-primary hover:border-accent/40 hover:bg-bg-tertiary/100 hover:scale-105 active:scale-95'
                                }
                            `}
                        >
                            <span className={`text-2xl sm:text-3xl font-black ${activeString === index ? 'text-white' : 'text-text-primary'}`}>
                                {string.note}
                            </span>
                            <span className="text-[9px] font-black uppercase opacity-50">String {string.number}</span>

                            {activeString === index ? (
                                <div className="absolute top-0 left-0 w-full h-full rounded-full border-2 border-white/20 animate-ping opacity-30" />
                            ) : null}
                        </button>
                    ))}
                </div>

                <div className="pt-4 relative z-10">
                    <button
                        onClick={stopAudio}
                        className={`
                            w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300
                            ${activeString !== null
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600'
                                : 'bg-bg-tertiary text-text-secondary border border-border-main opacity-50 cursor-default'
                            }
                        `}
                    >
                        Stop Reference Tone
                    </button>
                </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-2">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`w-1 h-1 rounded-full ${activeString !== null ? 'bg-accent animate-bounce' : 'bg-text-secondary/20'}`} style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
                <p className="text-text-secondary text-[10px] text-center max-w-xs uppercase tracking-widest font-black opacity-30">
                    {instrument} Tuning Reference
                </p>
            </div>
        </div>
    );
};
