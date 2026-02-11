import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Languages, Palette, Sun, Moon, Sparkles, Crown, Check, ArrowRight } from 'lucide-react';

export const ConfigurationView: React.FC = () => {
    const { theme, setTheme, language, setLanguage, t } = useSongStore();

    const themes = [
        { id: 'light', icon: Sun, label: 'theme.light' },
        { id: 'dark', icon: Moon, label: 'theme.dark' },
        { id: 'midnight', icon: Sparkles, label: 'theme.midnight' },
        { id: 'one-more-theme-studio', icon: Crown, label: 'theme.one-more-theme-studio' }
    ] as const;

    const languages = [
        { id: 'fr', label: 'Français' },
        { id: 'en', label: 'English' }
    ] as const;

    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] bg-bg-primary text-text-primary p-8 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-4xl skeuo-card p-12 space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-accent drop-shadow-lg">
                        {t('configuration.title')}
                    </h1>
                    <p className="text-text-secondary font-bold tracking-widest uppercase opacity-60 text-sm">
                        {t('configuration.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Language Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-accent border-b-2 border-border-main pb-4">
                            <Languages size={24} />
                            <h2 className="text-lg font-black uppercase tracking-widest">{t('configuration.language_section')}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {languages.map(({ id, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setLanguage(id)}
                                    className={`
                                        flex items-center justify-between p-6 rounded-2xl border-2 transition-all duration-300
                                        ${language === id
                                            ? 'bg-accent text-white border-accent shadow-xl scale-[1.02]'
                                            : 'bg-bg-secondary border-border-main hover:border-accent/50 text-text-primary'
                                        }
                                    `}
                                >
                                    <span className="font-black uppercase tracking-widest text-sm">{label}</span>
                                    {language === id ? <Check size={24} /> : <div className="w-6 h-6 rounded-full border-2 border-border-main" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Theme Selection */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-accent border-b-2 border-border-main pb-4">
                            <Palette size={24} />
                            <h2 className="text-lg font-black uppercase tracking-widest">{t('configuration.theme_section')}</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {themes.map(({ id, icon: Icon, label }) => (
                                <button
                                    key={id}
                                    onClick={() => setTheme(id)}
                                    className={`
                                        flex flex-col items-center gap-4 p-6 rounded-2xl border-2 transition-all duration-300
                                        ${theme === id
                                            ? 'bg-accent text-white border-accent shadow-xl scale-[1.02]'
                                            : 'bg-bg-secondary border-border-main hover:border-accent/50 text-text-primary'
                                        }
                                    `}
                                >
                                    <Icon size={32} className={theme === id ? 'animate-pulse' : ''} />
                                    <span className="font-black uppercase tracking-widest text-[10px] text-center">
                                        {id === 'one-more-theme-studio' ? 'ONE MORE' : t(label)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t-2 border-border-main flex justify-center">
                    <button
                        onClick={() => useSongStore.getState().setViewMode('editor')}
                        className="btn-skeuo flex items-center gap-3 px-10 py-4 rounded-full text-accent font-black uppercase tracking-widest hover:scale-105 transition-all"
                    >
                        {t('help.back')} <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
