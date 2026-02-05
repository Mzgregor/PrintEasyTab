import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Trash2 } from 'lucide-react';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const songs = useSongStore(state => state.songs);
    const { setTitle, setArtist, setCapo, removeSong } = useSongStore();

    if (!song) return null;

    const songCount = songs.length;

    return (
        <div className="space-y-6 relative">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                    {song.title || <span className="text-[#636366] italic">New Song</span>}
                </h2>
                {songCount > 1 && (
                    <button
                        onClick={() => removeSong(songId)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#2c2c2e] hover:bg-red-500/20 text-[#8e8e93] hover:text-red-500 transition-all"
                        title="Remove Song"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            {/* Inputs Row - Title, Artist, Capo */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                <div className="md:col-span-5 space-y-1.5">
                    <label htmlFor={`title-${songId}`} className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide ml-1">Title</label>
                    <input
                        id={`title-${songId}`}
                        type="text"
                        value={song.title}
                        onChange={(e) => setTitle(songId, e.target.value)}
                        className="ios-input w-full"
                        placeholder="Song Title"
                    />
                </div>
                <div className="md:col-span-5 space-y-1.5">
                    <label htmlFor={`artist-${songId}`} className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide ml-1">Artist</label>
                    <input
                        id={`artist-${songId}`}
                        type="text"
                        value={song.artist}
                        onChange={(e) => setArtist(songId, e.target.value)}
                        className="ios-input w-full"
                        placeholder="Artist Name"
                    />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                    <label htmlFor={`capo-${songId}`} className="text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wide ml-1">Capo</label>
                    <div className="relative">
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
                            className="ios-input w-full text-center font-mono"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>


        </div>
    );
};
