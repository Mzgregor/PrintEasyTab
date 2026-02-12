import React from 'react';
import { Plus, Music, Star, Zap } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

interface WelcomeScreenProps {
    onCreateTab: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onCreateTab }) => {
    const { language, songs, activeSongId, editorModeFallback } = useSongStore();

    const currentSong = songs.find(s => s.id === activeSongId) || songs[0];
    const isLyricsMode = (currentSong ? currentSong.mode === 'lyrics' : editorModeFallback === 'lyrics');

    const themeColor = isLyricsMode ? '#8b5cf6' : 'var(--accent)';
    const shadowColor = isLyricsMode ? 'rgba(139, 92, 246, 0.3)' : 'rgba(56, 189, 248, 0.3)';
    const shadowHoverColor = isLyricsMode ? 'rgba(139, 92, 246, 0.5)' : 'rgba(56, 189, 248, 0.5)';

    return (
        <div className="flex flex-col items-center justify-center min-h-full w-full py-8 px-6 text-center animate-in fade-in duration-700">
            {/* Logo Container with Glow effect */}
            <div className="relative mb-12 group">
                <div
                    className="absolute inset-x-0 -inset-y-4 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000"
                    style={{ backgroundColor: isLyricsMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)' }}
                ></div>
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab"
                    className="h-48 w-auto relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.3)] transform group-hover:scale-105 transition-transform duration-700 ease-out"
                />
            </div>

            {/* Welcome Text */}
            <div className="space-y-4 mb-10 max-w-2xl">
                <h1 className="text-5xl font-black uppercase tracking-tighter text-text-primary leading-tight">
                    {language === 'fr' ? (
                        <>Prêt pour votre prochaine <span className="underline decoration-8 underline-offset-8 transition-colors duration-500" style={{ color: themeColor, textDecorationColor: isLyricsMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)' }}>création</span> ?</>
                    ) : (
                        <>Ready for your next <span className="underline decoration-8 underline-offset-8 transition-colors duration-500" style={{ color: themeColor, textDecorationColor: isLyricsMode ? 'rgba(139, 92, 246, 0.2)' : 'rgba(37, 99, 235, 0.2)' }}>creation</span> ?</>
                    )}
                </h1>
                <p className="text-xl text-text-secondary font-medium leading-relaxed opacity-80">
                    {language === 'fr'
                        ? "Commencez à composer votre partition personnalisée en quelques clics. Tabs, accords ou paroles : tout est possible."
                        : "Start composing your personalized score in just a few clicks. Tabs, chords, or lyrics: everything is possible."
                    }
                </p>
            </div>

            {/* Primary Action Button */}
            <button
                onClick={onCreateTab}
                className="group relative flex items-center gap-4 px-12 py-6 text-white rounded-[2.5rem] font-black uppercase text-lg tracking-[0.2em] hover:scale-105 hover:-translate-y-1 active:scale-95 transition-all duration-300 overflow-hidden"
                style={{
                    backgroundColor: themeColor,
                    boxShadow: `0 20px 40px ${shadowColor}`
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 25px 50px ${shadowHoverColor}`;
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 20px 40px ${shadowColor}`;
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
                <div className="p-2 bg-white/20 rounded-full group-hover:rotate-90 transition-transform duration-500">
                    <Plus size={32} strokeWidth={3} />
                </div>
                <span>{language === 'fr' ? 'Créer une tab' : 'Create a tab'}</span>
            </button>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-4xl">
                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-bg-secondary/40 border border-white/5 backdrop-blur-sm group hover:bg-bg-secondary/60 transition-colors">
                    <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                        <Music size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-text-primary">Éditeur Intelligent</h3>
                    <p className="text-xs text-text-tertiary leading-relaxed">Saisie simplifiée des accords et structure intuitive par sections.</p>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-bg-secondary/40 border border-white/5 backdrop-blur-sm group hover:bg-bg-secondary/60 transition-colors">
                    <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
                        <Star size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-text-primary">Finition Premium</h3>
                    <p className="text-xs text-text-tertiary leading-relaxed">Générez des partitions PDF de haute qualité prêtes à imprimer.</p>
                </div>

                <div className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-bg-secondary/40 border border-white/5 backdrop-blur-sm group hover:bg-bg-secondary/60 transition-colors">
                    <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="font-bold text-sm uppercase tracking-widest text-text-primary">Accès Instantané</h3>
                    <p className="text-xs text-text-tertiary leading-relaxed">Vos créations sont sauvegardées et accessibles n'importe où.</p>
                </div>
            </div>
        </div >
    );
};
