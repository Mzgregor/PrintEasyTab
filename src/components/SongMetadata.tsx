import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Plus, Minus, Save, Heart } from 'lucide-react';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const { setTitle, setArtist, setCapo, saveSong, toggleFavorite, t } = useSongStore();
    const [savedMessage, setSavedMessage] = React.useState(false);

    if (!song) return null;

    const handleCapoChange = (delta: number) => {
        const newVal = Math.min(Math.max((song.capo || 0) + delta, 0), 10);
        setCapo(songId, newVal);
    };

    const handleSave = () => {
        saveSong(song);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const handleToggleFavorite = () => {
        toggleFavorite(songId);
    };

    return (
        <div className="metadata-area">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-4">
                {/* Title */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label htmlFor={`title-${songId}`} className="metadata-label !mb-0">{t('metadata.title')}</label>
                    <input
                        id={`title-${songId}`}
                        type="text"
                        value={song.title}
                        onChange={(e) => setTitle(songId, e.target.value)}
                        className="ios-input w-full !text-base !py-2.5"
                        placeholder={t('metadata.placeholder.title')}
                    />
                </div>

                {/* Artist */}
                <div className="flex-1 min-w-[200px] space-y-1.5">
                    <label htmlFor={`artist-${songId}`} className="metadata-label !mb-0">{t('metadata.artist')}</label>
                    <input
                        id={`artist-${songId}`}
                        type="text"
                        value={song.artist}
                        onChange={(e) => setArtist(songId, e.target.value)}
                        className="ios-input w-full !text-base !py-2.5"
                        placeholder={t('metadata.placeholder.artist')}
                    />
                </div>

                {/* Capo */}
                <div className="w-full lg:w-auto space-y-1.5">
                    <label className="metadata-label !mb-0">{t('metadata.capo')}</label>
                    <div className="capo-gear-box !h-[46px]">
                        <button
                            onClick={() => handleCapoChange(-1)}
                            disabled={song.capo <= 0}
                            className="capo-gear-btn"
                            title="Diminuer Capo"
                        >
                            <Minus size={14} strokeWidth={3} />
                        </button>

                        <div className="capo-gear-display px-3">
                            <span className="capo-gear-number !text-lg">{song.capo}</span>
                        </div>

                        <button
                            onClick={() => handleCapoChange(1)}
                            disabled={song.capo >= 10}
                            className="capo-gear-btn"
                            title="Augmenter Capo"
                        >
                            <Plus size={14} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 lg:pb-0.5">
                    <button
                        onClick={handleToggleFavorite}
                        className={`ios-btn-icon !w-[46px] !h-[46px] ${song.isFavorite ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-gray-400'}`}
                        title={song.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                        <Heart size={20} fill={song.isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                    </button>

                    <button
                        onClick={handleSave}
                        className="ios-primary-btn flex items-center gap-2 !px-5 !h-[46px] whitespace-nowrap shadow-lg shadow-blue-500/20"
                    >
                        <Save size={18} />
                        <span>{t('metadata.save')}</span>
                    </button>

                    {savedMessage && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce shadow-green-500/40 z-50">
                            <Save size={20} />
                            <span className="font-semibold">{t('metadata.saved')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
