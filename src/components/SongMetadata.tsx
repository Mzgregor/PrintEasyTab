import React from 'react';
import { useSongStore } from '../store/useSongStore';
import { Plus, Minus, Save, Heart, ThumbsUp, User, Volume2, Wand2 } from 'lucide-react';
import { InstrumentSelectorModal } from './InstrumentSelectorModal';
import { AILoadingOverlay } from './AILoadingOverlay';
import * as aiService from '../services/aiService';

interface Props {
    songId: string;
}

export const SongMetadata: React.FC<Props> = ({ songId }) => {
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const {
        setTitle, setArtist, setCapo, saveSong,
        toggleFavorite, likeSong, currentUser,
        isReadOnly, t, chordInstrument, setChordInstrument,
        replaceSongContent
    } = useSongStore();

    const [savedMessage, setSavedMessage] = React.useState(false);
    const [showInstrumentSelector, setShowInstrumentSelector] = React.useState(false);

    // AI state
    const [isAILoading, setIsAILoading] = React.useState(false);
    const [aiError, setAiError] = React.useState<string | null>(null);
    const abortControllerRef = React.useRef<AbortController | null>(null);

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
    const canAIGenerate = !isReadOnly
        && song.mode === 'chords'
        && song.title.trim().length > 0
        && song.artist.trim().length > 0;

    // ── AI Generation ──────────────────────────────────────────────────────────

    const handleAIGenerate = async () => {
        if (!canAIGenerate || isAILoading) return;

        const controller = new AbortController();
        abortControllerRef.current = controller;
        setIsAILoading(true);
        setAiError(null);

        try {
            const result = await aiService.generateChords(
                song.title,
                song.artist,
                controller.signal
            );
            replaceSongContent(songId, result.sections, result.capo);
            // Brief success toast
            setSavedMessage(true);
            setTimeout(() => setSavedMessage(false), 3000);
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                // User cancelled — silent
                return;
            } else if (err instanceof aiService.AINotFoundError) {
                setAiError(err.message);
            } else {
                setAiError(err?.message || 'Unknown error');
            }
        } finally {
            setIsAILoading(false);
            abortControllerRef.current = null;
        }
    };

    const handleAIStop = () => {
        abortControllerRef.current?.abort();
        setIsAILoading(false);
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div className="metadata-area relative">

            {/* AI Loading Overlay */}
            {isAILoading && (
                <AILoadingOverlay
                    title={song.title}
                    artist={song.artist}
                    onStop={handleAIStop}
                />
            )}

            {/* AI Error Modal */}
            {aiError && (
                <div
                    className="fixed inset-0 z-[9998] flex items-center justify-center"
                    style={{
                        background: 'rgba(0,0,0,0.75)',
                        backdropFilter: 'blur(8px)',
                    }}
                    onClick={() => setAiError(null)}
                >
                    <div
                        className="relative bg-bg-secondary border-2 border-border-main rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 flex flex-col items-center gap-6 text-center"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            boxShadow: '0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset',
                        }}
                    >
                        {/* Icon */}
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2) 0%, rgba(239,68,68,0.05) 100%)', border: '1px solid rgba(239,68,68,0.3)' }}>
                            <Wand2 size={28} className="text-red-400" />
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-white tracking-wide">
                                {t('ai.error_title')}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {t('ai.error_message')}
                            </p>
                        </div>

                        <button
                            onClick={() => setAiError(null)}
                            className="ios-primary-btn !px-8 !h-[46px] w-full"
                        >
                            {t('ai.manual_btn')}
                        </button>
                    </div>
                </div>
            )}

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
                        <>
                            {/* Favorite Button */}
                            <button
                                onClick={() => toggleFavorite(songId)}
                                className={`ios-btn-icon !w-[46px] !h-[46px] ${song.isFavorite ? 'text-red-500 bg-red-500/10 border-red-500/30' : 'text-gray-400'}`}
                                title={song.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                <Heart size={20} fill={song.isFavorite ? "currentColor" : "none"} strokeWidth={2.5} />
                            </button>

                            {/* Instrument Selector Button */}
                            <button
                                onClick={() => setShowInstrumentSelector(true)}
                                className="ios-btn-icon !w-[46px] !h-[46px] text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                                title={t('settings.instrument')}
                            >
                                <Volume2 size={20} strokeWidth={2.5} />
                            </button>

                            {/* AI Magic Wand Button — Chords Mode only */}
                            {song.mode === 'chords' && (
                                <button
                                    onClick={handleAIGenerate}
                                    disabled={!canAIGenerate}
                                    title={canAIGenerate ? t('ai.generate') : t('ai.tooltip_disabled')}
                                    className={`ios-btn-icon !w-[46px] !h-[46px] transition-all duration-200 ${canAIGenerate
                                            ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/20 hover:scale-105 active:scale-95'
                                            : 'text-text-secondary/30 cursor-not-allowed opacity-40'
                                        }`}
                                >
                                    <Wand2 size={20} strokeWidth={2.5} />
                                </button>
                            )}

                            {/* Save Button — icon only */}
                            <button
                                onClick={handleSave}
                                className="ios-btn-icon !w-[46px] !h-[46px] text-text-secondary hover:text-accent hover:bg-accent/10 transition-all"
                                title={t('metadata.save')}
                            >
                                <Save size={20} strokeWidth={2.5} />
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
