import React from 'react';
import { Square } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

interface Props {
    title: string;
    artist: string;
    onStop: () => void;
}

export const AILoadingOverlay: React.FC<Props> = ({ title, artist, onStop }) => {
    const { t } = useSongStore();

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
            style={{
                background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.98) 100%)',
                backdropFilter: 'blur(16px)',
            }}
        >
            {/* Animated background glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite',
                }}
            />

            {/* Content */}
            <div className="relative flex flex-col items-center gap-10 px-8 max-w-lg w-full text-center">

                {/* Pulsing Logo */}
                <div className="relative">
                    {/* Outer glow ring */}
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
                            transform: 'scale(1.6)',
                            animation: 'pulse 2s ease-in-out infinite',
                        }}
                    />
                    {/* Inner shimmer ring */}
                    <div
                        className="absolute inset-0 rounded-full border-2 border-indigo-400/30"
                        style={{
                            transform: 'scale(1.25)',
                            animation: 'spin 8s linear infinite',
                        }}
                    />
                    <img
                        src="/LOGO_1_OMT.png"
                        alt="One More Tab"
                        className="relative h-40 w-auto object-contain drop-shadow-2xl"
                        style={{
                            animation: 'pulse 2s ease-in-out infinite',
                            filter: 'drop-shadow(0 0 30px rgba(99,102,241,0.6))',
                        }}
                    />
                </div>

                {/* Text */}
                <div className="space-y-3">
                    <h2
                        className="text-2xl font-black tracking-widest uppercase text-white"
                        style={{ textShadow: '0 0 30px rgba(99,102,241,0.8)' }}
                    >
                        {t('ai.loading_title')}
                    </h2>
                    <p className="text-sm font-semibold text-indigo-300 uppercase tracking-[0.2em]">
                        {t('ai.loading_sub')}
                    </p>
                    <p className="text-lg font-black text-white">
                        «&nbsp;{title}&nbsp;» — {artist}
                    </p>
                </div>

                {/* Animated dots */}
                <div className="flex items-center gap-3">
                    {[0, 1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-indigo-400"
                            style={{
                                animation: `bounce 1.4s ease-in-out ${i * 0.15}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* STOP button */}
                <button
                    onClick={onStop}
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                        boxShadow: '0 8px 32px rgba(239,68,68,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
                        color: 'white',
                    }}
                >
                    <Square size={18} fill="currentColor" />
                    <span>{t('ai.stop')}</span>
                </button>
            </div>

            {/* Keyframe animations via style tag */}
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
                    40% { transform: scale(1); opacity: 1; }
                }
                @keyframes spin {
                    from { transform: scale(1.25) rotate(0deg); }
                    to { transform: scale(1.25) rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
