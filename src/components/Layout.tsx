import React, { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useSongStore } from '../store/useSongStore';
import {
    Menu, X, User, Settings, FileText, LogOut, HelpCircle,
    Type, AlignLeft, AlignCenter, AlignRight,
    Music, Guitar, Mic, Radio, Library, ThumbsUp
} from 'lucide-react';
import { ConfigurationView } from './ConfigurationView';
import { AdminPanel } from './AdminPanel';
import { SettingsPage } from './SettingsPage';
import { HelpPage } from './HelpPage';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
    pdfAction?: React.ReactNode;
}

import { StyledLogoutDialog } from './StyledLogoutDialog';

export const Layout: React.FC<LayoutProps> = ({ editor, preview, pdfAction }) => {
    const {
        theme,
        songs, activeSongId, setMode,
        globalLyricsFontSize, setGlobalLyricsFontSize,
        globalLyricsAlignment, setGlobalLyricsAlignment,
        setViewMode, viewMode,
        editorModeFallback, setEditorModeFallback,
        isReadOnly, likeSong,
        logout, currentUser, t
    } = useSongStore();

    const currentSong = songs.find(s => s.id === activeSongId) || songs[0];
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const profileRef = React.useRef<HTMLDivElement>(null);
    const isSplitView = viewMode !== 'configuration' && viewMode !== 'library' && songs.length > 0;

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };

        if (isProfileOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileOpen]);

    const handleLogout = () => {
        logout();
        setIsLogoutDialogOpen(false);
        setIsMenuOpen(false);
    };

    return (
        <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden font-sans selection:bg-accent selection:text-white relative">

            {/* Custom Logout Confirmation Dialog */}
            <StyledLogoutDialog
                isOpen={isLogoutDialogOpen}
                onClose={() => setIsLogoutDialogOpen(false)}
                onConfirm={handleLogout}
            />

            {/* Burger Menu Sidebar / Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            <aside className={`fixed top-0 left-0 h-full w-80 bg-bg-secondary border-r border-border-main z-[101] shadow-2xl transition-transform duration-300 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black uppercase tracking-widest text-accent">{t('nav.admin')}</h2>
                        <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-bg-tertiary rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="space-y-2 flex-1 overflow-y-auto no-scrollbar">
                        <button
                            onClick={() => {
                                setViewMode('settings');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                        >
                            <User className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">{t('nav.settings')}</span>
                        </button>

                        <div className="py-4 px-4 space-y-4 bg-bg-tertiary/30 rounded-2xl border border-border-main/50">
                            <div className="flex items-center gap-4 text-accent">
                                <Settings size={20} />
                                <span className="font-bold text-sm tracking-wide uppercase">{t('nav.settings')}</span>
                            </div>

                            <div className="space-y-4 pl-9">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <Type size={12} /> {t('editor.lyrics_font_size')} ({globalLyricsFontSize}px)
                                    </label>
                                    <input
                                        type="range" min="12" max="32"
                                        value={globalLyricsFontSize}
                                        onChange={(e) => setGlobalLyricsFontSize(parseInt(e.target.value))}
                                        className="w-full accent-accent bg-border-main h-1.5 rounded-full cursor-pointer"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <AlignLeft size={12} /> {t('editor.lyrics_alignment')}
                                    </label>
                                    <div className="flex bg-bg-primary p-1 rounded-lg border border-border-main">
                                        {(['left', 'center', 'right'] as const).map((align) => (
                                            <button
                                                key={align}
                                                onClick={() => setGlobalLyricsAlignment(align)}
                                                className={`flex-1 flex justify-center py-1.5 rounded-md transition-all ${globalLyricsAlignment === align ? 'bg-accent text-white shadow-sm' : 'hover:bg-bg-tertiary text-text-secondary'}`}
                                            >
                                                {align === 'left' && <AlignLeft size={16} />}
                                                {align === 'center' && <AlignCenter size={16} />}
                                                {align === 'right' && <AlignRight size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setViewMode('library');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                        >
                            <Library className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">{t('nav.library')}</span>
                        </button>

                        <button
                            onClick={() => {
                                setViewMode('editor');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                        >
                            <FileText className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">{t('nav.editor')} Tab/Lyrics</span>
                        </button>

                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setViewMode('admin');
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group bg-accent/5 border border-accent/20"
                            >
                                <Settings className="text-accent transition-colors" size={20} />
                                <span className="font-bold text-sm tracking-wide text-accent">{t('nav.admin')}</span>
                            </button>
                        )}
                    </nav>

                    <button
                        onClick={() => {
                            setViewMode('help');
                            setIsMenuOpen(false);
                        }}
                        className="mt-auto w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                    >
                        <HelpCircle className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                        <span className="font-bold text-sm tracking-wide">{t('nav.help')}</span>
                    </button>
                </div>
            </aside>

            {/* Main Header - Iconic Bold Edition */}
            <header className="h-56 flex items-center justify-between px-12 bg-bg-secondary border-b border-border-main relative z-[100] shadow-2xl">
                {/* Left: Logo */}
                <div className="flex justify-start items-center flex-1">
                    <button
                        onClick={() => setViewMode('editor')}
                        className="hover:opacity-80 transition-opacity focus:outline-none"
                        title="Retour à l'accueil"
                    >
                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab Logo"
                            className="h-44 w-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                        />
                    </button>
                </div>

                {/* Center: Compact Navigation Console */}
                <div className="flex justify-center flex-1">
                    <div className="nav-console animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="nav-group p-1.5 bg-bg-tertiary/60 backdrop-blur-xl border-2 border-border-main rounded-[2.5rem] shadow-2xl">
                            <button
                                onClick={() => {
                                    if (currentSong) setMode(currentSong.id, 'chords');
                                    else setEditorModeFallback('chords');
                                    setViewMode('editor');
                                }}
                                className={`nav-btn-pro btn-blue !h-16 !w-16 ${(viewMode === 'editor' && (currentSong ? currentSong.mode === 'chords' : editorModeFallback === 'chords')) ? 'nav-btn-pro-active' : ''}`}
                                title="Chords Mode"
                            >
                                <Guitar size={28} />
                            </button>
                            <button
                                onClick={() => {
                                    if (currentSong) setMode(currentSong.id, 'lyrics');
                                    else setEditorModeFallback('lyrics');
                                    setViewMode('editor');
                                }}
                                className={`nav-btn-pro btn-violet !h-16 !w-16 ${(viewMode === 'editor' && (currentSong ? currentSong.mode === 'lyrics' : editorModeFallback === 'lyrics')) ? 'nav-btn-pro-active' : ''}`}
                                title="Lyrics Mode"
                            >
                                <Mic size={28} />
                            </button>
                            <button
                                onClick={() => setViewMode('metronome')}
                                className={`nav-btn-pro btn-pink !h-16 !w-16 ${viewMode === 'metronome' ? 'nav-btn-pro-active' : ''}`}
                                title="Metronome"
                            >
                                <Music size={28} />
                            </button>
                            <button
                                onClick={() => setViewMode('tuner')}
                                className={`nav-btn-pro btn-orange !h-16 !w-16 ${viewMode === 'tuner' ? 'nav-btn-pro-active' : ''}`}
                                title="Tuner"
                            >
                                <Radio size={28} />
                            </button>
                            <button
                                onClick={() => setViewMode('library')}
                                className={`nav-btn-pro !h-16 !w-16 ${viewMode === 'library' ? 'nav-btn-pro-active !bg-emerald-500 !bg-gradient-to-br from-emerald-400 to-emerald-600' : 'btn-orange'}`}
                                style={{ boxShadow: viewMode === 'library' ? '0 0 35px rgba(16, 185, 129, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.3)' : '' }}
                                title="Library"
                            >
                                <Library size={28} />
                            </button>
                            <button
                                onClick={() => setViewMode('configuration')}
                                className={`nav-btn-pro btn-blue !h-16 !w-16 ${viewMode === 'configuration' ? 'nav-btn-pro-active' : ''}`}
                                title="Configuration"
                            >
                                <Settings size={28} />
                            </button>
                        </div>

                        <div className="nav-mode-indicator mt-4 bg-bg-tertiary/60 backdrop-blur-md px-6 py-1.5 rounded-full border border-border-main shadow-lg">
                            <span className="nav-mode-title text-xs font-black tracking-[0.3em] uppercase opacity-80">
                                {viewMode === 'metronome' ? t('nav.metronome') :
                                    viewMode === 'tuner' ? t('nav.tuner') :
                                        viewMode === 'library' ? t('nav.library') :
                                            viewMode === 'configuration' ? t('nav.configuration') :
                                                (currentSong ? currentSong.mode === 'lyrics' : editorModeFallback === 'lyrics') ? t('nav.lyrics') : t('nav.chords')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Burger Menu Call to Action & Like button in ReadOnly */}
                <div className="flex justify-end items-center flex-1 gap-4">
                    {isReadOnly && currentSong && (
                        <div className="flex items-center gap-3 bg-bg-tertiary/60 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-accent/30 shadow-lg animate-in fade-in zoom-in duration-300">
                            <button
                                onClick={() => likeSong(currentSong.id)}
                                className={`flex items-center gap-2 transition-all transform hover:scale-110 active:scale-95 ${currentSong.likes?.includes(currentUser?.id || 0) ? 'text-accent' : 'text-text-secondary hover:text-accent'}`}
                            >
                                <ThumbsUp size={24} fill={currentSong.likes?.includes(currentUser?.id || 0) ? "currentColor" : "none"} />
                                <span className="text-lg font-black">{currentSong.likes?.length || 0}</span>
                            </button>
                        </div>
                    )}

                    {/* Profile Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`btn-skeuo-dark p-0 rounded-2xl hover:text-accent transition-all duration-300 h-20 w-20 flex items-center justify-center border-2 border-border-main shadow-2xl hover:scale-110 active:scale-90 group ${isProfileOpen ? 'text-accent ring-2 ring-accent/30' : 'text-text-primary'}`}
                            title="Mon Profil"
                        >
                            <User size={40} className="group-hover:scale-110 transition-transform" />
                        </button>

                        {isProfileOpen && (
                            <div className="absolute top-24 right-0 w-64 bg-bg-secondary border-2 border-border-main rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] py-3 z-[110] animate-in fade-in zoom-in-95 duration-200 skeuo-card">
                                <div className="px-6 py-4 mb-2 border-b border-border-main/50">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary mb-1">Connecté en tant que</p>
                                    <p className="font-black text-accent truncate">{currentUser?.username || currentUser?.email}</p>
                                </div>

                                <button
                                    onClick={() => {
                                        setViewMode('settings');
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bg-tertiary transition-colors group"
                                >
                                    <div className="p-2 bg-accent/10 rounded-xl group-hover:bg-accent group-hover:text-white transition-colors">
                                        <User size={18} />
                                    </div>
                                    <span className="font-bold text-sm">Voir mon profil</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsLogoutDialogOpen(true);
                                        setIsProfileOpen(false);
                                    }}
                                    className="w-full flex items-center gap-4 px-6 py-4 hover:bg-bg-tertiary transition-colors text-red-400 group"
                                >
                                    <div className="p-2 bg-red-400/10 rounded-xl group-hover:bg-red-400 group-hover:text-white transition-colors">
                                        <LogOut size={18} />
                                    </div>
                                    <span className="font-bold text-sm">Se déconnecter</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="btn-skeuo-dark p-0 rounded-2xl hover:text-accent transition-all duration-300 text-text-primary h-20 w-20 flex items-center justify-center border-2 border-border-main shadow-2xl hover:scale-110 active:scale-90 group"
                        title="Menu"
                    >
                        <Menu size={40} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            <div className="flex-1 min-h-0">
                <PanelGroup orientation="horizontal">
                    {/* Editor Panel - Sidebar Style */}
                    <Panel
                        defaultSize={isSplitView ? 70 : 100}
                        className="flex flex-col border-r border-border-main bg-bg-primary"
                    >
                        <div className={`flex-1 overflow-y-auto custom-scrollbar w-full ${(songs.length === 0 || viewMode === 'metronome' || viewMode === 'tuner') ? '' : 'px-6 py-6 space-y-8'}`}>
                            {viewMode === 'configuration' ? (
                                <ConfigurationView />
                            ) : (
                                <div className={`${(songs.length === 0 || viewMode === 'metronome' || viewMode === 'tuner') ? 'h-full' : 'skeuo-inset min-h-full p-6'}`}>
                                    {editor}
                                </div>
                            )}
                        </div>
                    </Panel>

                    {isSplitView && (
                        <PanelResizeHandle className="w-1 bg-bg-secondary hover:bg-accent transition-colors flex items-center justify-center cursor-col-resize group z-50">
                            <div className="w-0.5 h-8 bg-border-main group-hover:bg-white rounded-full transition-colors" />
                        </PanelResizeHandle>
                    )}

                    {isSplitView && (
                        /* Preview Panel - Main Content Style */
                        <Panel
                            defaultSize={30}
                            className="flex flex-col relative bg-bg-secondary"
                        >
                            {/* Dedicated Options Toolbar */}
                            <header className="px-6 py-3 border-b border-border-main bg-bg-secondary flex items-center z-20 w-full flex-shrink-0 min-h-[64px] shadow-md">
                                <div className="flex-1">
                                    <h2 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">{t('editor.live_preview')}</h2>
                                </div>

                                <div className="flex-1 flex justify-center">
                                    {pdfAction}
                                </div>

                                <div className="flex-1" />
                            </header>

                            {/* Center the Content based on View Mode - Removed padding to maximize PDF space */}
                            <div className="flex-1 overflow-hidden flex items-center justify-center bg-bg-primary w-full">
                                {viewMode === 'admin' ? <AdminPanel /> :
                                    viewMode === 'settings' ? <SettingsPage /> :
                                        viewMode === 'help' ? <HelpPage /> :
                                            preview}
                            </div>
                        </Panel>
                    )}
                </PanelGroup>
            </div>
        </div>
    );
};
