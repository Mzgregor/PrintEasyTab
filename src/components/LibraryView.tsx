import React, { useState, useMemo, useEffect } from 'react';
import { useSongStore } from '../store/useSongStore';
import {
    Search, Trash2, Heart, Edit2, CheckSquare, Square, Eye, ThumbsUp
} from 'lucide-react';


export const LibraryView: React.FC = () => {
    const {
        librarySongs,
        allGlobalSongs,
        deleteFromLibrary,
        toggleFavorite,
        fetchAllGlobalSongs,
        likeSong,
        openSong,
        currentUser,
        t,
        language
    } = useSongStore();

    const [activeTab, setActiveTab] = useState<'my' | 'global'>('my');
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState<'title' | 'artist' | 'date' | 'favorite'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (activeTab === 'global') {
            fetchAllGlobalSongs();
        }
    }, [activeTab, fetchAllGlobalSongs]);

    const currentSongs = activeTab === 'my' ? librarySongs : allGlobalSongs;

    const filteredSongs = useMemo(() => {
        let result = currentSongs.filter(s =>
            s.title.toLowerCase().includes(search.toLowerCase()) ||
            s.artist.toLowerCase().includes(search.toLowerCase())
        );

        result.sort((a, b) => {
            let valA: any = a[sortBy === 'date' ? 'updatedAt' : sortBy === 'favorite' ? 'isFavorite' : sortBy] || '';
            let valB: any = b[sortBy === 'date' ? 'updatedAt' : sortBy === 'favorite' ? 'isFavorite' : sortBy] || '';

            if (sortBy === 'date') {
                return sortOrder === 'asc'
                    ? new Date(valA).getTime() - new Date(valB).getTime()
                    : new Date(valB).getTime() - new Date(valA).getTime();
            }

            if (sortBy === 'favorite') {
                return sortOrder === 'asc' ? (valA === valB ? 0 : valA ? 1 : -1) : (valA === valB ? 0 : valA ? -1 : 1);
            }

            return sortOrder === 'asc'
                ? valA.toString().localeCompare(valB.toString())
                : valB.toString().localeCompare(valA.toString());
        });

        return result;
    }, [currentSongs, search, sortBy, sortOrder]);

    const handleSelectAll = () => {
        if (selectedIds.length === filteredSongs.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredSongs.map(s => s.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleMassDelete = () => {
        if (window.confirm(t('library.confirm_delete_mass').replace('{count}', selectedIds.length.toString()))) {
            deleteFromLibrary(selectedIds);
            setSelectedIds([]);
        }
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                    <h1 className="text-3xl font-black uppercase tracking-widest text-primary flex items-center gap-3">
                        <div className="w-2 h-8 bg-accent rounded-full"></div>
                        {t('library.title')}
                    </h1>

                    <div className="flex bg-bg-secondary p-1 rounded-2xl border border-border-main">
                        <button
                            onClick={() => { setActiveTab('my'); setSelectedIds([]); }}
                            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'my' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        >
                            {t('library.my_library')}
                        </button>
                        <button
                            onClick={() => { setActiveTab('global'); setSelectedIds([]); }}
                            className={`px-6 py-2 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'global' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        >
                            {t('library.global_library')}
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input
                            type="text"
                            placeholder={t('library.search_placeholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="ios-input !pl-10 w-64 md:w-80"
                        />
                    </div>

                    <div className="flex bg-bg-tertiary rounded-xl p-1 border border-border-main">
                        <button
                            onClick={() => { setSortBy('date'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sortBy === 'date' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        >
                            {t('library.sort.date')} {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                        <button
                            onClick={() => { setSortBy('title'); setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc'); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${sortBy === 'title' ? 'bg-accent text-white shadow-lg' : 'text-secondary hover:text-primary'}`}
                        >
                            {t('library.sort.title')} {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mass Actions Bar */}
            {activeTab === 'my' && selectedIds.length > 0 && (
                <div className="bg-accent/10 border border-accent/30 rounded-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3">
                        <span className="bg-accent text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                            {selectedIds.length}
                        </span>
                        <span className="font-bold text-accent uppercase tracking-wider text-sm">{t('library.selected')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleMassDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-500 hover:bg-red-500/30 transition-all font-bold text-sm uppercase"
                        >
                            <Trash2 size={16} /> {t('common.delete')}
                        </button>
                        <button
                            onClick={() => setSelectedIds([])}
                            className="px-4 py-2 rounded-xl bg-bg-tertiary text-secondary hover:text-primary transition-all font-bold text-sm uppercase"
                        >
                            {t('library.cancel')}
                        </button>
                    </div>
                </div>
            )}

            <div className="skeuo-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-bottom border-border-main bg-bg-tertiary/50">
                                {activeTab === 'my' && (
                                    <th className="p-4 w-12">
                                        <button onClick={handleSelectAll} className="text-secondary hover:text-accent transition-colors">
                                            {selectedIds.length === filteredSongs.length && filteredSongs.length > 0
                                                ? <CheckSquare size={20} className="text-accent" />
                                                : <Square size={20} />
                                            }
                                        </button>
                                    </th>
                                )}
                                <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary">
                                    {activeTab === 'my' ? t('library.status') : t('library.creator')}
                                </th>
                                <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary">{t('library.title_artist')}</th>
                                {activeTab === 'my' ? (
                                    <>
                                        <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary">{t('library.creation')}</th>
                                        <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary">{t('library.modification')}</th>
                                    </>
                                ) : (
                                    <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary">{t('common.likes')}</th>
                                )}
                                <th className="p-4 uppercase text-[11px] font-black tracking-[0.2em] text-secondary text-right">{t('library.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main/50">
                            {filteredSongs.length > 0 ? filteredSongs.map((song, idx) => (
                                <tr key={song.id || idx} className={`hover:bg-accent/5 transition-colors group ${selectedIds.includes(song.id) ? 'bg-accent/10' : ''}`}>
                                    {activeTab === 'my' && (
                                        <td className="p-4">
                                            <button onClick={() => toggleSelect(song.id)} className="text-secondary group-hover:text-accent transition-colors">
                                                {selectedIds.includes(song.id) ? <CheckSquare size={20} className="text-accent" /> : <Square size={20} />}
                                            </button>
                                        </td>
                                    )}
                                    <td className="p-4">
                                        {activeTab === 'my' ? (
                                            <button
                                                onClick={() => toggleFavorite(song.id)}
                                                className={`transition-all transform hover:scale-110 ${song.isFavorite ? 'text-red-500' : 'text-secondary/30'}`}
                                            >
                                                <Heart size={20} fill={song.isFavorite ? "currentColor" : "none"} />
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-black text-xs uppercase">
                                                    {(song.creatorName || '?')[0]}
                                                </div>
                                                <span className="text-sm font-bold text-text-primary capitalize">{song.creatorName}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary group-hover:text-accent transition-colors">{song.title || t('library.no_title')}</span>
                                            <span className="text-xs text-secondary">{song.artist || t('library.unknown_artist')}</span>
                                        </div>
                                    </td>
                                    {activeTab === 'my' ? (
                                        <>
                                            <td className="p-4 text-xs font-mono text-secondary">
                                                {formatDate(song.createdAt)}
                                            </td>
                                            <td className="p-4 text-xs font-mono text-secondary">
                                                {formatDate(song.updatedAt)}
                                            </td>
                                        </>
                                    ) : (
                                        <td className="p-4">
                                            <div className="flex items-center gap-1.5 text-secondary">
                                                <ThumbsUp size={14} className={song.likes?.includes(currentUser?.id || 0) ? 'text-accent' : ''} />
                                                <span className="text-xs font-black">{song.likes?.length || 0}</span>
                                            </div>
                                        </td>
                                    )}
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {activeTab === 'my' ? (
                                                <>
                                                    <button
                                                        onClick={() => openSong(song, false)}
                                                        className="p-2 rounded-lg bg-bg-tertiary text-secondary hover:bg-accent hover:text-white transition-all shadow-sm"
                                                        title={t('common.modifier')}
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => { if (window.confirm(t('library.confirm_delete_single'))) deleteFromLibrary([song.id]) }}
                                                        className="p-2 rounded-lg bg-bg-tertiary text-secondary hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                        title={t('common.delete')}
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => openSong(song, true)}
                                                        className="p-2 rounded-lg bg-bg-tertiary text-secondary hover:bg-accent hover:text-white transition-all shadow-sm"
                                                        title={t('library.view_song')}
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleFavorite(song.id)}
                                                        className={`p-2 rounded-lg bg-bg-tertiary transition-all shadow-sm ${song.isFavorite ? 'text-red-500 bg-red-500/10' : 'text-secondary hover:text-red-500'}`}
                                                        title={t('library.add_to_favorites')}
                                                    >
                                                        <Heart size={16} fill={song.isFavorite ? "currentColor" : "none"} />
                                                    </button>
                                                    <button
                                                        onClick={() => likeSong(song.id)}
                                                        className={`p-2 rounded-lg bg-bg-tertiary transition-all shadow-sm ${song.likes?.includes(currentUser?.id || 0) ? 'text-accent bg-accent/10' : 'text-secondary hover:text-accent'}`}
                                                        title="Like"
                                                    >
                                                        <ThumbsUp size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={activeTab === 'my' ? 6 : 4} className="p-12 text-center text-secondary">
                                        <div className="flex flex-col items-center gap-4">
                                            <Search size={48} className="opacity-10" />
                                            <p className="font-bold uppercase tracking-widest opacity-50">{t('library.empty')}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
