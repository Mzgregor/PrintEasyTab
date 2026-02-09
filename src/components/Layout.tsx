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

            {/* Main Header - Iconic Branding */}
            <header className="h-80 flex items-center justify-between px-8 bg-bg-secondary border-b border-border-main relative z-[100] shadow-2xl">
                <div className="grid grid-cols-3 items-center w-full">
                    {/* Left: Menu & Logo */}
                    <div className="flex justify-start items-center gap-6">
                        {/* Burger Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="btn-skeuo-dark p-3 rounded-2xl"
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
                    <div className="flex justify-center">
                        <div className="flex flex-col items-center">
                            {/* Unified Pro Navigation Console */}
                            <div className="nav-console animate-in fade-in slide-in-from-top-4 duration-700">

                                <div className="nav-group py-4">
                                    {/* Chords */}
                                    <button
                                        onClick={() => {
                                            if (currentSong) {
                                                setMode(currentSong.id, 'chords');
                                                setViewMode('editor');
                                            }
                                        }}
                                        className={`nav-btn-pro btn-blue ${currentSong?.mode === 'chords' && viewMode === 'editor' ? 'nav-btn-pro-active' : ''}`}
                                        title="Chords Mode"
                                    >
                                        <Guitar size={44} />
                                    </button>

                                    {/* Lyrics */}
                                    <button
                                        onClick={() => {
                                            if (currentSong) {
                                                setMode(currentSong.id, 'lyrics');
                                                setViewMode('editor');
                                            }
                                        }}
                                        className={`nav-btn-pro btn-violet ${currentSong?.mode === 'lyrics' && viewMode === 'editor' ? 'nav-btn-pro-active' : ''}`}
                                        title="Lyrics Mode"
                                    >
                                        <Mic size={44} />
                                    </button>

                                    {/* Metronome */}
                                    <button
                                        onClick={() => setViewMode('metronome')}
                                        className={`nav-btn-pro btn-pink ${viewMode === 'metronome' ? 'nav-btn-pro-active' : ''}`}
                                        title="Metronome"
                                    >
                                        <Music size={44} />
                                    </button>

                                    {/* Tuner */}
                                    <button
                                        onClick={() => setViewMode('tuner')}
                                        className={`nav-btn-pro btn-orange ${viewMode === 'tuner' ? 'nav-btn-pro-active' : ''}`}
                                        title="Tuner"
                                    >
                                        <Radio size={44} />
                                    </button>
                                </div>

                                {/* Refined Mode Title Strip */}
                                <div className="nav-mode-indicator">
                                    <div className="nav-mode-indicator-panel">
                                        <div className="nav-mode-title">
                                            {viewMode === 'metronome' ? 'Metronome Mode' :
                                                viewMode === 'tuner' ? 'Tuner Mode' :
                                                    currentSong?.mode === 'lyrics' ? 'Lyrics Mode' :
                                                        'Chords Mode'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Theme Controls & Burger Menu */}
                    <div className="flex justify-end items-center gap-6">
                        <div className="flex items-center gap-3">
                            {/* Theme Dropdown */}
                            <div className="relative group/theme">
                                <button className="btn-skeuo-dark p-3 rounded-2xl">
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
