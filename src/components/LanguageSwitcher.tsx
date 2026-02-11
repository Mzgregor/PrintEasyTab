import { Languages, Check } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useSongStore();

    const languages = [
        { id: 'fr', label: 'Français' },
        { id: 'en', label: 'English' }
    ] as const;

    return (
        <div className="relative group/lang">
            <button
                className="btn-skeuo-dark p-0 rounded-2xl hover:text-accent transition-all duration-300 h-16 w-16 flex items-center justify-center border-2 border-border-main shadow-xl hover:scale-105 active:scale-95"
                title="Change Language"
            >
                <Languages size={28} />
            </button>

            <div className="absolute right-0 top-full mt-4 w-48 bg-bg-secondary border-2 border-border-main rounded-2xl shadow-2xl opacity-0 invisible group-hover/lang:opacity-100 group-hover/lang:visible transition-all z-[102] overflow-hidden backdrop-blur-xl">
                <div className="p-3 space-y-2">
                    {languages.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setLanguage(id)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all ${language === id ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-primary'}`}
                        >
                            <span className="font-bold text-[10px] uppercase tracking-wider">{label}</span>
                            {language === id && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
