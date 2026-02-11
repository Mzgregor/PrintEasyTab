import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { ArrowLeft } from 'lucide-react';

export const HelpPage: React.FC = () => {
    const { setViewMode, t } = useSongStore();

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
            {/* Logo taking half the height/width visually */}
            <div className="w-full max-w-4xl flex justify-center mb-12">
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab Logo"
                    className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] max-h-[50vh]"
                />
            </div>

            <div className="space-y-8 max-w-2xl">
                <h1 className="text-4xl font-black uppercase tracking-widest text-accent">{t('help.title')}</h1>
                <p className="text-text-secondary text-lg leading-relaxed">
                    {t('help.desc').split('**').map((part, i) => i % 2 === 1 ? <strong key={i}>{part}</strong> : part)}
                </p>

                <button
                    onClick={() => setViewMode('editor')}
                    className="btn-glossy-blue px-10 py-4 text-sm uppercase tracking-[0.2em] group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span>{t('help.back')}</span>
                </button>
            </div>
        </div>
    );
};
