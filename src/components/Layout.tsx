import React, { useState, useEffect } from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { useSongStore } from '../store/useSongStore';
import {
    Menu, X, User, Settings, FileText, LogOut, HelpCircle,
    Type, AlignLeft, AlignCenter, AlignRight,
    Sun, Moon, Ghost, Palette, Music, Radio, Guitar, Mic, Plus
} from 'lucide-react';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
    pdfAction?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ editor, preview, pdfAction }) => {
    const {
        theme, setTheme,
        songs, setMode, addSong,
        globalLyricsFontSize, setGlobalLyricsFontSize,
        globalLyricsAlignment, setGlobalLyricsAlignment,
        setViewMode, viewMode,
        logout
    } = useSongStore();
    const currentSong = songs[0];
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
                        <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group">
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

                        <button className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-bg-tertiary transition-all group">
                            <FileText className="text-text-secondary group-hover:text-accent transition-colors" size={20} />
                            <span className="font-bold text-sm tracking-wide">Mes Tabs/Lyrics</span>
                        </button>

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

            {/* Main Header - Iconic Branding */}
            <header className="h-80 flex items-center justify-between px-8 bg-bg-secondary border-b border-border-main relative z-[100] shadow-2xl">
                <div className="grid grid-cols-3 items-center w-full">
                    {/* Left: Menu & Logo */}
                    <div className="flex justify-start items-center gap-6">
                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="p-3 bg-bg-tertiary text-text-secondary hover:bg-accent hover:text-white rounded-2xl border border-border-main transition-all shadow-lg active:scale-95"
                        >
                            <Menu size={28} />
                        </button>

                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab Logo"
                            className="h-72 w-auto object-contain drop-shadow-2xl translate-y-2"
                        />
                    </div>

                    {/* Center: Iconic Mode Selectors */}
                    <div className="flex justify-center items-center gap-6">
                        {/* Chords */}
                        <button
                            onClick={() => {
                                if (currentSong) {
                                    setMode(currentSong.id, 'chords');
                                    setViewMode('editor');
                                }
                            }}
                            className={`blob-btn w-26 h-26 transition-all shadow-xl group relative overflow-hidden
                                ${currentSong?.mode === 'chords' && viewMode === 'editor'
                                    ? 'bg-accent text-white scale-110'
                                    : 'bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-text-primary'
                                }`}
                            title="Chords Mode"
                        >
                            <Guitar size={32} className="relative z-10 transition-transform group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Lyrics */}
                        <button
                            onClick={() => {
                                if (currentSong) {
                                    setMode(currentSong.id, 'lyrics');
                                    setViewMode('editor');
                                }
                            }}
                            className={`blob-btn w-26 h-26 transition-all shadow-xl group relative overflow-hidden
                                ${currentSong?.mode === 'lyrics' && viewMode === 'editor'
                                    ? 'bg-accent text-white scale-110'
                                    : 'bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-text-primary'
                                }`}
                            title="Lyrics Mode"
                        >
                            <Mic size={32} className="relative z-10 transition-transform group-hover:-rotate-12" />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Metronome */}
                        <button
                            onClick={() => setViewMode('metronome')}
                            className={`blob-btn w-26 h-26 transition-all shadow-xl group relative overflow-hidden
                                ${viewMode === 'metronome'
                                    ? 'bg-accent text-white scale-110'
                                    : 'bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-text-primary'
                                }`}
                            title="Metronome"
                        >
                            <Music size={32} className="relative z-10 transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Tuner */}
                        <button
                            onClick={() => setViewMode('tuner')}
                            className={`blob-btn w-26 h-26 transition-all shadow-xl group relative overflow-hidden
                                ${viewMode === 'tuner'
                                    ? 'bg-accent text-white scale-110'
                                    : 'bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-secondary hover:text-text-primary'
                                }`}
                            title="Tuner"
                        >
                            <Radio size={32} className="relative z-10 transition-transform group-hover:rotate-12" />
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>

                        {/* Add Song Blob */}
                        <button
                            onClick={addSong}
                            disabled={songs.length >= 4}
                            className={`blob-btn w-26 h-26 flex flex-col items-center justify-center transition-all shadow-xl group relative overflow-hidden
                                ${songs.length >= 4
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-50'
                                    : 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-red-500/20'
                                }`}
                            title="Ajouter une chanson"
                        >
                            <Plus size={42} strokeWidth={3} className="relative z-10" />
                            <span className="text-[14px] font-black mt-0.5 relative z-10">
                                {songs.length}/4
                            </span>
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    </div>

                    {/* Right: Theme Controls & Burger Menu */}
                    <div className="flex justify-end items-center gap-6">
                        <div className="flex items-center gap-3">
                            {/* Theme Dropdown */}
                            <div className="relative group/theme">
                                <button className="p-3 bg-bg-tertiary text-text-secondary hover:bg-accent hover:text-white rounded-2xl border border-border-main transition-all shadow-lg active:scale-95">
                                    <Palette size={28} />
                                </button>

                                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-secondary border border-border-main rounded-2xl shadow-2xl opacity-0 invisible group-hover/theme:opacity-100 group-hover/theme:visible transition-all z-[102] overflow-hidden">
                                    <div className="p-2 space-y-1">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${theme === 'light' ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-primary'}`}
                                        >
                                            <Sun size={18} />
                                            <span className="font-bold text-xs uppercase tracking-wider">Light Mode</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${theme === 'dark' ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-primary'}`}
                                        >
                                            <Moon size={18} />
                                            <span className="font-bold text-xs uppercase tracking-wider">Dark Mode</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('midnight')}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${theme === 'midnight' ? 'bg-accent text-white' : 'hover:bg-bg-tertiary text-text-primary'}`}
                                        >
                                            <Ghost size={18} />
                                            <span className="font-bold text-xs uppercase tracking-wider">Midnight</span>
                                        </button>
                                    </div>
                                </div>
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
                            {editor}
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-1 bg-bg-secondary hover:bg-accent transition-colors flex items-center justify-center cursor-col-resize group z-50">
                        <div className="w-0.5 h-8 bg-border-main group-hover:bg-white rounded-full transition-colors" />
                    </PanelResizeHandle>

                    {/* Preview Panel - Main Content Style */}
                    <Panel defaultSize={30} minSize={20} className="flex flex-col relative bg-bg-secondary">
                        {/* Dedicated Options Toolbar */}
                        <header className="px-6 py-3 border-b border-border-main bg-bg-secondary flex items-center z-20 w-full flex-shrink-0 min-h-[64px]">
                            <div className="flex-1">
                                <h2 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em]">Live Preview</h2>
                            </div>

                            <div className="flex-1 flex justify-center">
                                {pdfAction && (
                                    <div className="bg-accent/10 p-0.5 rounded-full border border-accent/20">
                                        {pdfAction}
                                    </div>
                                )}
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
