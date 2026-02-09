import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Trash2, Plus, Minus } from 'lucide-react';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const { setTitle, setArtist, setCapo } = useSongStore();

    if (!song) return null;

    const handleCapoChange = (delta: number) => {
        const newVal = Math.min(Math.max((song.capo || 0) + delta, 0), 10);
        setCapo(songId, newVal);
    };

    return (
        <div className="metadata-area">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Title & Artist Card Style */}
                <div className="md:col-span-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label htmlFor={`title-${songId}`} className="metadata-label">Titre de la chanson</label>
                        <input
                            id={`title-${songId}`}
                            type="text"
                            value={song.title}
                            onChange={(e) => setTitle(songId, e.target.value)}
                            className="ios-input w-full !text-lg !py-3"
                            placeholder="Ex: Stairway to Heaven"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor={`artist-${songId}`} className="metadata-label">Artiste / Groupe</label>
                        <input
                            id={`artist-${songId}`}
                            type="text"
                            value={song.artist}
                            onChange={(e) => setArtist(songId, e.target.value)}
                            className="ios-input w-full !text-lg !py-3"
                            placeholder="Ex: Led Zeppelin"
                        />
                    </div>
                </div>

                {/* Capo Gear Selector */}
                <div className="md:col-span-2">
                    <span className="metadata-label text-center">Capodastre</span>
                    <div className="capo-gear-box mx-auto">
                        <button
                            onClick={() => handleCapoChange(-1)}
                            disabled={song.capo <= 0}
                            className="capo-gear-btn"
                            title="Diminuer Capo"
                        >
                            <Minus size={16} strokeWidth={3} />
                        </button>

                        <div className="capo-gear-display">
                            <span className="capo-gear-number">{song.capo}</span>
                            <span className="capo-gear-text">Frette</span>
                        </div>

                        <button
                            onClick={() => handleCapoChange(1)}
                            disabled={song.capo >= 10}
                            className="capo-gear-btn"
                            title="Augmenter Capo"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
