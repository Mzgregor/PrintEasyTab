import { Plus } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const EditorOptionsPanel: React.FC = () => {
    const { songs, addSong } = useSongStore();
    const isAtLimit = songs.length >= 4;

    return (
        <div className="flex items-center justify-end gap-3 p-3 bg-bg-secondary/50 backdrop-blur-md border border-border-main rounded-2xl shadow-sm mb-6 w-full">
            {/* Action Group */}
            <div className="flex items-center gap-2">
                <div className={`flex items-center bg-bg-tertiary border py-1.5 px-3 rounded-lg transition-all shadow-inner
                    ${isAtLimit ? 'border-zinc-700' : 'border-border-main'}`}
                >
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] 
                        ${isAtLimit ? 'text-zinc-500' : 'text-text-secondary'}`}
                    >
                        {songs.length} <span className="opacity-30">/</span> 4
                    </span>
                </div>

                <button
                    onClick={addSong}
                    disabled={isAtLimit}
                    className={`group flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all border
                    ${isAtLimit
                            ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-not-allowed opacity-50'
                            : 'bg-red-500 text-white border-red-400 hover:bg-red-600 active:scale-95 shadow-lg shadow-red-500/20'
                        }`}
                >
                    <Plus size={14} strokeWidth={4} />
                    <span>Ajouter</span>
                </button>
            </div>
        </div>
    );
};
