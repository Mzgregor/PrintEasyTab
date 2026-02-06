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

    const createGuitarVoice = (ctx: AudioContext, freq: number, now: number) => {
        const createOsc = (f: number, type: OscillatorType, gainValue: number, decay: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(f * 3, now);
            filter.frequency.exponentialRampToValueAtTime(f * 1.5, now + decay);

            osc.type = type;
            osc.frequency.setValueAtTime(f, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(gainValue, now + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + decay + 0.1);
            activeOscillators.current.push(osc);
            activeNodes.current.push(gain, filter);
        };

        createOsc(freq, 'sine', 0.5, 3);
        createOsc(freq * 2, 'triangle', 0.15, 2);
        createOsc(freq * 3, 'sine', 0.05, 1.5);
    };

    const createPianoVoice = (ctx: AudioContext, freq: number, now: number) => {
        const createOsc = (f: number, detune: number, gainValue: number, decay: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now);
            osc.detune.setValueAtTime(detune, now);

            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(gainValue, now + 0.005);
            gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now);
            osc.stop(now + decay + 0.1);
            activeOscillators.current.push(osc);
            activeNodes.current.push(gain);
        };

        createOsc(freq, 0, 0.6, 2.5);
        createOsc(freq, 4, 0.2, 2);
        createOsc(freq * 2, -2, 0.1, 1.5);
    };

    const createVoiceVoice = (ctx: AudioContext, freq: number, now: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        vibrato.frequency.setValueAtTime(5.2, now);
        vibratoGain.gain.setValueAtTime(freq * 0.006, now);
        vibrato.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibrato.start(now);

        const f1 = ctx.createBiquadFilter();
        f1.type = 'bandpass';
        f1.frequency.setValueAtTime(700, now);
        f1.Q.setValueAtTime(6, now);

        const f2 = ctx.createBiquadFilter();
        f2.type = 'bandpass';
        f2.frequency.setValueAtTime(1100, now);
        f2.Q.setValueAtTime(6, now);

        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(3500, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

        osc.connect(f1);
        osc.connect(f2);
        f1.connect(lp);
        f2.connect(lp);
        lp.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 3.1);
        vibrato.stop(now + 3.1);

        activeOscillators.current.push(osc, vibrato);
        activeNodes.current.push(gain, f1, f2, lp, vibratoGain);
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
        }, 3200);
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
