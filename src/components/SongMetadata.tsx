import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const songs = useSongStore(state => state.songs);
    const { setTitle, setArtist, setCapo, addSong, removeSong } = useSongStore();

    if (!song) return null;

    const index = songs.findIndex(s => s.id === songId);
    const songCount = songs.length;
    const isAtLimit = songCount >= 4;

    return (
        <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700 relative">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-200">
                    {song.title || `Song ${index + 1}`}
                </h2>
                {songCount > 1 && (
                    <button
                        onClick={() => removeSong(songId)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1"
                        title="Remove Song"
                    >
                        <Trash2 size={18} />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor={`title-${songId}`} className="text-sm font-medium text-slate-400">Song Title</label>
                    <input
                        id={`title-${songId}`}
                        type="text"
                        value={song.title}
                        onChange={(e) => setTitle(songId, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                        placeholder="e.g. Wonderwall"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor={`artist-${songId}`} className="text-sm font-medium text-slate-400">Artist</label>
                    <input
                        id={`artist-${songId}`}
                        type="text"
                        value={song.artist}
                        onChange={(e) => setArtist(songId, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                        placeholder="e.g. Oasis"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor={`capo-${songId}`} className="text-sm font-medium text-slate-400">Capodastre</label>
                    <div className="flex gap-2">
                        <input
                            id={`capo-${songId}`}
                            type="number"
                            min="0"
                            max="10"
                            value={song.capo}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const clamped = Math.min(Math.max(val, 0), 10);
                                setCapo(songId, clamped);
                            }}
                            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                            placeholder="0"
                        />

                        <button
                            onClick={addSong}
                            disabled={isAtLimit}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold text-sm whitespace-nowrap transition-colors
                                ${isAtLimit
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-slate-300 text-red-600 hover:bg-slate-200'
                                }`}
                            title={isAtLimit ? "Max 4 songs reached" : "Add another song to this sheet"}
                        >
                            <Plus size={16} />
                            Add Song
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
