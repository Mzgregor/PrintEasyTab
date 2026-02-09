import React, { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useSongStore } from '../store/useSongStore';
import {
    Menu, X, User, Settings, FileText, LogOut, HelpCircle,
    Type, AlignLeft, AlignCenter, AlignRight,
    Sun, Moon, Ghost, Palette, Music, Guitar, Mic, Radio
} from 'lucide-react';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
    pdfAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ editor, preview, pdfAction }) => {
    const {
        theme, setTheme,
        songs, activeSongId, setMode,
        globalLyricsFontSize, setGlobalLyricsFontSize,
        globalLyricsAlignment, setGlobalLyricsAlignment,
        setViewMode, viewMode,
        logout, currentUser
    } = useSongStore();

    const currentSong = songs.find(s => s.id === activeSongId) || songs[0];
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="h-screen flex flex-col bg-bg-primary text-text-primary overflow-hidden font-sans selection:bg-accent selection:text-white relative">

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
                        <h2 className="text-xl font-black uppercase tracking-widest text-accent">Menu</h2>
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
                            <span className="font-bold text-sm tracking-wide">Mon Profil</span>
                        </button>

                        <div className="py-4 px-4 space-y-4 bg-bg-tertiary/30 rounded-2xl border border-border-main/50">
                            <div className="flex items-center gap-4 text-accent">
                                <Settings size={20} />
                                <span className="font-bold text-sm tracking-wide uppercase">Paramètres</span>
                            </div>

                            <div className="space-y-4 pl-9">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                        <Type size={12} /> Police Paroles ({globalLyricsFontSize}px)
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
                                        <AlignLeft size={12} /> Alignement Texte
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
                                setViewMode('editor');
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                        >
                            <FileText className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">Mes Tabs/Lyrics</span>
                        </button>

                        {/* Admin Panel - Only visible to admins */}
                        {currentUser?.role === 'admin' && (
                            <button
                                onClick={() => {
                                    setViewMode('admin');
                                    setIsMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group bg-accent/5 border border-accent/20"
                            >
                                <Settings className="text-accent transition-colors" size={20} />
                                <span className="font-bold text-sm tracking-wide text-accent">Panneau Admin</span>
                            </button>
                        )}

                        <button
                            onClick={() => {
                                logout();
                                setIsMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group text-red-400"
                        >
                            <LogOut className="group-hover:text-red-500 transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">Se déconnecter</span>
                        </button>
                    </nav>

                    <button
                        onClick={() => {
                            setViewMode('help');
                            setIsMenuOpen(false);
                        }}
                        className="mt-auto w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group"
                    >
                        <HelpCircle className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                        <span className="font-bold text-sm tracking-wide">Help</span>
                    </button>
                </div>
            </aside>

            {/* Main Header - Iconic Bold Edition */}
            <header className="h-56 flex items-center justify-between px-12 bg-bg-secondary border-b border-border-main relative z-[100] shadow-2xl">
                {/* Left: Menu & Logo */}
                <div className="flex items-center gap-10 flex-1">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="btn-skeuo-dark p-4 rounded-2xl hover:text-accent transition-colors"
                    >
                        <Menu size={36} />
                    </button>

                    <img
                        src="/LOGO_1_OMT.png"
                        alt="One More Tab Logo"
                        className="h-40 w-auto object-contain drop-shadow-2xl"
                    />
                </div>

                {/* Center: Compact Navigation Console */}
                <div className="flex justify-center flex-1">
                    <div className="nav-console animate-in fade-in slide-in-from-top-2 duration-500">
                        <div className="nav-group">
                            <button
                                onClick={() => currentSong && (setMode(currentSong.id, 'chords'), setViewMode('editor'))}
                                className={`nav-btn-pro btn-blue ${currentSong?.mode === 'chords' && viewMode === 'editor' ? 'nav-btn-pro-active' : ''}`}
                                title="Chords Mode"
                            >
                                <Guitar />
                            </button>
                            <button
                                onClick={() => currentSong && (setMode(currentSong.id, 'lyrics'), setViewMode('editor'))}
                                className={`nav-btn-pro btn-violet ${currentSong?.mode === 'lyrics' && viewMode === 'editor' ? 'nav-btn-pro-active' : ''}`}
                                title="Lyrics Mode"
                            >
                                <Mic />
                            </button>
                            <button
                                onClick={() => setViewMode('metronome')}
                                className={`nav-btn-pro btn-pink ${viewMode === 'metronome' ? 'nav-btn-pro-active' : ''}`}
                                title="Metronome"
                            >
                                <Music />
                            </button>
                            <button
                                onClick={() => setViewMode('tuner')}
                                className={`nav-btn-pro btn-orange ${viewMode === 'tuner' ? 'nav-btn-pro-active' : ''}`}
                                title="Tuner"
                            >
                                <Radio />
                            </button>
                        </div>

                        <div className="nav-mode-indicator">
                            <span className="nav-mode-title">
                                {viewMode === 'metronome' ? 'Metronome' :
                                    viewMode === 'tuner' ? 'Tuner' :
                                        currentSong?.mode === 'lyrics' ? 'Lyrics Mode' : 'Chords Mode'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Theme Controls */}
                <div className="flex justify-end items-center gap-4 flex-1">
                    <div className="relative group/theme">
                        <button className="btn-skeuo-dark p-2.5 rounded-xl hover:text-accent transition-colors">
                            <Palette size={22} />
                        </button>

                        <div className="absolute right-0 top-full mt-2 w-44 bg-bg-secondary border border-border-main rounded-xl shadow-2xl opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all z-[102] overflow-hidden">
                            <div className="p-2 space-y-1">
                                {(['light', 'dark', 'midnight'] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTheme(t)}
                                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all ${theme === t ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-primary'}`}
                                    >
                                        {t === 'light' ? <Sun size={16} /> : t === 'dark' ? <Moon size={16} /> : <Ghost size={16} />}
                                        <span className="font-bold text-[10px] uppercase tracking-wider">{t} Mode</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex-1 min-h-0">
                <PanelGroup orientation="horizontal">
                    {/* Editor Panel - Sidebar Style */}
                    <Panel defaultSize={70} minSize={20} className="flex flex-col border-r border-border-main bg-bg-primary">
                        <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8 w-full">
                            <div className="skeuo-inset min-h-full p-6">
                                {editor}
                            </div>
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-bg-secondary hover:bg-accent transition-colors flex items-center justify-center cursor-col-resize group z-50">
                        <div className="w-0.5 h-8 bg-border-main group-hover:bg-white rounded-full transition-colors" />
                    </PanelResizeHandle>

                    {/* Preview Panel - Main Content Style */}
                    <Panel defaultSize={30} minSize={20} className="flex flex-col relative bg-bg-secondary">
                        {/* Dedicated Options Toolbar */}
                        <header className="px-6 py-3 border-b border-border-main bg-bg-secondary flex items-center z-20 w-full flex-shrink-0 min-h-[64px] shadow-md">
                            <div className="flex-1">
                                <h2 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">Live Preview</h2>
                            </div>

                            <div className="flex-1 flex justify-center">
                                {pdfAction}
                            </div>

                            <div className="flex-1" />
                        </header>

                        {/* Center the PDF Preivew */}
                        <div className="flex-1 overflow-hidden p-6 flex items-center justify-center bg-bg-primary w-full">
                            {preview}
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
};
