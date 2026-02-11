import { useSongStore } from '../store/useSongStore';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useSongStore();

    const languages = [
        { id: 'fr', label: 'FR' },
        { id: 'en', label: 'EN' }
    ] as const;

    return (
        <div className="flex items-center gap-1 bg-bg-tertiary/80 backdrop-blur-md rounded-full p-1 border border-border-main shadow-inner">
            {languages.map(({ id, label }) => (
                <button
                    key={id}
                    onClick={() => setLanguage(id)}
                    className={`
                        relative flex items-center justify-center w-10 h-8 rounded-full text-[11px] font-black tracking-tighter transition-all duration-300 ease-out isolate
                        ${language === id
                            ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-100 z-10'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 scale-95 hover:scale-100'
                        }
                    `}
                    title={id === 'fr' ? 'Français' : 'English'}
                >
                    <span className="uppercase">{label}</span>
                    {language === id && (
                        <span className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-20 pointer-events-none -z-10" />
                    )}
                </button>
            ))}
        </div>
    );
};
