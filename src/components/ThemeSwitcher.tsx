import { Sun, Moon, Sparkles, Crown } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useSongStore();

    const themes = [
        { id: 'light', icon: Sun, label: 'Light' },
        { id: 'dark', icon: Moon, label: 'Dark' },
        { id: 'midnight', icon: Sparkles, label: 'Midnight' },
        { id: 'one-more-theme-studio', icon: Crown, label: 'ONE MORE' }
    ] as const;

    return (
        <div className="flex items-center gap-1 bg-bg-tertiary/80 backdrop-blur-md rounded-full p-1 border border-border-main shadow-inner">
            {themes.map(({ id, icon: Icon, label }) => (
                <button
                    key={id}
                    onClick={() => setTheme(id)}
                    className={`
                        relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-tight transition-all duration-300 ease-out isolate
                        ${theme === id
                            ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-100 z-10'
                            : 'text-text-secondary hover:text-text-primary hover:bg-bg-primary/50 scale-95 hover:scale-100'
                        }
                    `}
                    title={label}
                >
                    <Icon size={14} className={`${theme === id ? 'animate-pulse' : ''}`} />
                    <span className="hidden lg:inline uppercase">{label}</span>
                    {theme === id && (
                        <span className="absolute inset-0 rounded-full bg-white/10 animate-ping opacity-20 pointer-events-none -z-10" />
                    )}
                </button>
            ))}
        </div>
    );
};
