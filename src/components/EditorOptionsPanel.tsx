import React from 'react';
import { Plus, Settings, Music } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const EditorOptionsPanel: React.FC = () => {
    const { songs, addSong, toggleMode, viewMode, setViewMode } = useSongStore();
    const isAtLimit = songs.length >= 4;

    return (
        <div className="bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Settings size={16} className="text-[#0a84ff]" />
                    Editor Options
                </h2>
                <span className="text-xs text-[#636366] font-medium">
                    {songs.length} / 4 Songs
                </span>
            </div>

            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={addSong}
                        disabled={isAtLimit}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all
                            ${isAtLimit
                                ? 'bg-[#2c2c2e] text-[#636366] cursor-not-allowed'
                                : 'bg-[#0a84ff]/10 hover:bg-[#0a84ff]/20 text-[#0a84ff] border border-[#0a84ff]/30'
                            }`}
                    >
                        <Plus size={18} />
                        {isAtLimit ? "Song Limit Reached" : "Add Another Song"}
                    </button>

                    <button
                        onClick={() => {
                            if (songs.length > 0) {
                                toggleMode(songs[0].id);
                            }
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border border-[#3a3a3c]
                            ${songs[0]?.mode === 'lyrics'
                                ? 'bg-[#2c2c2e] text-[#0a84ff]'
                                : 'bg-[#2c2c2e] text-[#636366] hover:text-white'
                            }`}
                    >
                        <Settings size={18} className={songs[0]?.mode === 'lyrics' ? "text-[#0a84ff]" : "text-[#636366]"} />
                        {songs[0]?.mode === 'lyrics' ? 'Lyrics Mode Active' : 'Switch to Lyrics Mode'}
                    </button>
                </div>

                <button
                    onClick={() => setViewMode(viewMode === 'metronome' ? 'editor' : 'metronome')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border
                        ${viewMode === 'metronome'
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-500'
                            : 'bg-[#2c2c2e] border-[#3a3a3c] text-[#636366] hover:text-white'
                        }`}
                >
                    <Music size={18} />
                    {viewMode === 'metronome' ? 'Back to Editor' : 'Open Metronome'}
                </button>
            </div>
        </div>
    );
};
