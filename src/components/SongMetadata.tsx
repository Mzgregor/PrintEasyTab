import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Plus, Minus, Save, Heart, ThumbsUp, User, Volume2 } from 'lucide-react';
import { InstrumentSelectorModal } from './InstrumentSelectorModal';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const { setTitle, setArtist, setCapo, saveSong, toggleFavorite, likeSong, currentUser, isReadOnly, t, chordInstrument, setChordInstrument } = useSongStore();
    const [savedMessage, setSavedMessage] = React.useState(false);
    const [showInstrumentSelector, setShowInstrumentSelector] = React.useState(false);

    if (!song) return null;

    const handleCapoChange = (delta: number) => {
        if (isReadOnly) return;
        const newVal = Math.min(Math.max((song.capo || 0) + delta, 0), 10);
        setCapo(songId, newVal);
    };

    const handleSave = () => {
        if (isReadOnly) return;
        saveSong(song);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const isLiked = song.likes?.includes(currentUser?.id || 0);

    return (
        <div className="metadata-area relative">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-6">

                {isReadOnly ? (
                    /* ReadOnly Mode: Single line text format */
                    <div className="flex-1 flex items-center gap-4 bg-bg-tertiary/40 px-6 py-4 rounded-2xl border border-border-main/50 backdrop-blur-md">
                        <div className="flex items-center gap-2 text-accent">
                            <User size={18} />
                            <span className="text-xs font-black uppercase tracking-widest">{song.creatorName || 'Unknown'}</span>
                        </div>
                        <div className="h-4 w-[1px] bg-border-main" />
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black text-text-primary uppercase tracking-tight">{song.title || t('library.no_title')}</span>
                            <span className="text-sm font-bold text-text-secondary">|</span>
                            <span className="text-lg font-bold text-text-secondary uppercase">{song.artist || t('library.unknown_artist')}</span>
                        </div>
                        <div className="ml-auto bg-bg-primary/50 px-3 py-1 rounded-lg border border-border-main text-[10px] font-black uppercase tracking-widest text-accent">
                            {t('metadata.capo')} {song.capo || 0}
                        </div>
                    </div>
                ) : (
                    /* Edit Mode: Labeled Inputs */
                    <>
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
                    </>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 lg:pb-0.5">
                    {isReadOnly ? (
                        <button
                            onClick={() => likeSong(song.id)}
                            className={`flex items-center gap-3 px-6 h-[54px] rounded-2xl border transition-all font-black uppercase tracking-widest text-xs active:scale-95 shadow-xl ${isLiked ? 'bg-accent text-white border-accent shadow-accent/20' : 'bg-bg-tertiary text-text-secondary border-border-main hover:text-accent hover:border-accent hover:bg-accent/5'}`}
                            title={isLiked ? "Unlike" : "Like"}
                        >
                            <ThumbsUp size={22} fill={isLiked ? "currentColor" : "none"} />
                            <span>{song.likes?.length || 0}</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => toggleFavorite(songId)}
                            className={`ios-btn-icon !w-[46px] !h-[46px] ${song.isFavorite ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-gray-400'}`}
                            title={song.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                            <Heart size={20} fill={song.isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                    )}

                    {!isReadOnly && (
                        <>
                            {/* Instrument Selector Button */}
                            <button
                                onClick={() => setShowInstrumentSelector(true)}
                                className="ios-btn-icon !w-[46px] !h-[46px] text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                                title={t('settings.instrument')}
                            >
                                <Volume2 size={20} strokeWidth={2.5} />
                            </button>

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                className="ios-primary-btn flex items-center gap-2 !px-5 !h-[46px] whitespace-nowrap shadow-lg shadow-blue-500/20"
                            >
                                <Save size={18} />
                                <span>{t('metadata.save')}</span>
                            </button>
                        </>
                    )}

                    {savedMessage && (
                        <div className="fixed bottom-8 right-8 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce shadow-green-500/40 z-50">
                            <Save size={20} />
                            <span className="font-semibold">{t('metadata.saved')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Instrument Selector Modal */}
            <InstrumentSelectorModal
                isOpen={showInstrumentSelector}
                onClose={() => setShowInstrumentSelector(false)}
                currentInstrument={chordInstrument}
                onSelectInstrument={(instrument) => {
                    setChordInstrument(instrument);
                    setShowInstrumentSelector(false);
                }}
            />
        </div>
    );
};
