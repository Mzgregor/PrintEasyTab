import React from 'react';
import { useSongStore } from '../store/useSongStore';

export const SongMetadata: React.FC = () => {
    const { song, setTitle, setArtist } = useSongStore();

    return (
        <div className="space-y-4 p-4 bg-slate-800 rounded-lg border border-slate-700">
            <h2 className="text-lg font-semibold text-slate-200">Song Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium text-slate-400">Song Title</label>
                    <input
                        id="title"
                        type="text"
                        value={song.title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                        placeholder="e.g. Wonderwall"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="artist" className="text-sm font-medium text-slate-400">Artist</label>
                    <input
                        id="artist"
                        type="text"
                        value={song.artist}
                        onChange={(e) => setArtist(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-100 placeholder-slate-500"
                        placeholder="e.g. Oasis"
                    />
                </div>
            </div>
        </div>
    );
};
