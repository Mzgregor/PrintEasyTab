import React from 'react';
import { Plus, Settings, Music, Guitar, Mic, Radio } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

export const EditorOptionsPanel: React.FC = () => {
    const { songs, addSong, setMode, viewMode, setViewMode } = useSongStore();
    const isAtLimit = songs.length >= 4;
    const currentSong = songs[0];

    return (
        <div className="bg-bg-secondary border border-border-main rounded-xl p-4 mb-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                    <Settings size={16} className="text-accent" />
                    Editor Options
                </h2>
                <span className="text-xs text-text-secondary font-medium">
                    {songs.length} / 4 Songs
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                <button
                    onClick={addSong}
                    disabled={isAtLimit}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all
                        ${isAtLimit
                            ? 'bg-bg-tertiary text-text-secondary cursor-not-allowed opacity-50'
                            : 'bg-bg-tertiary text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80 border border-border-main'
                        }`}
                >
                    <Plus size={18} />
                    {isAtLimit ? "Limit Reached" : "Add Song"}
                </button>

                <button
                    onClick={() => {
                        if (currentSong) {
                            setMode(currentSong.id, 'chords');
                            setViewMode('editor');
                        }
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border
                        ${currentSong?.mode === 'chords' && viewMode === 'editor'
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                            : 'bg-bg-tertiary border-border-main text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
                        }`}
                >
                    <Guitar size={18} />
                    Chords Mode
                </button>

                <button
                    onClick={() => {
                        if (currentSong) {
                            setMode(currentSong.id, 'lyrics');
                            setViewMode('editor');
                        }
                    }}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border
                        ${currentSong?.mode === 'lyrics' && viewMode === 'editor'
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                            : 'bg-bg-tertiary border-border-main text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
                        }`}
                >
                    <Mic size={18} />
                    Lyrics Mode
                </button>

                <button
                    onClick={() => setViewMode('metronome')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border
                        ${viewMode === 'metronome'
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                            : 'bg-bg-tertiary border-border-main text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
                        }`}
                >
                    <Music size={18} />
                    Metronome
                </button>

                <button
                    onClick={() => setViewMode('tuner')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all border
                        ${viewMode === 'tuner'
                            ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                            : 'bg-bg-tertiary border-border-main text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/80'
                        }`}
                >
                    <Radio size={18} />
                    Guitar Tuner
                </button>
            </div>
        </div>
    );
};
