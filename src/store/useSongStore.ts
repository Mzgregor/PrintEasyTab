import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Song, Section, SectionType, Measure, ChordBlock } from '../types';

interface SongState {
    songs: Song[];
    addSong: () => void;
    removeSong: (songId: string) => void;

    setTitle: (songId: string, title: string) => void;
    setArtist: (songId: string, artist: string) => void;
    setCapo: (songId: string, capo: number) => void;

    addSection: (songId: string, type?: SectionType) => void;
    removeSection: (songId: string, sectionId: string) => void;
    moveSection: (songId: string, activeId: string, overId: string) => void;
    updateSection: (songId: string, sectionId: string, updates: Partial<Section>) => void;
    duplicateSection: (songId: string, sectionId: string) => void;

    addMeasure: (songId: string, sectionId: string) => void;
    removeMeasure: (songId: string, sectionId: string, measureId: string) => void;
    updateMeasure: (songId: string, sectionId: string, measureId: string, chords: ChordBlock[]) => void;

    toggleMode: (songId: string) => void;
    setMode: (songId: string, mode: 'chords' | 'lyrics') => void;

    viewMode: 'editor' | 'metronome' | 'tuner' | 'help' | 'auth';
    setViewMode: (mode: 'editor' | 'metronome' | 'tuner' | 'help' | 'auth') => void;

    theme: 'light' | 'dark' | 'midnight';
    setTheme: (theme: 'light' | 'dark' | 'midnight') => void;

    // Global Lyrics Settings
    globalLyricsFontSize: number;
    setGlobalLyricsFontSize: (size: number) => void;
    globalLyricsAlignment: 'left' | 'center' | 'right';
    setGlobalLyricsAlignment: (align: 'left' | 'center' | 'right') => void;

    // Auth state
    isAuthenticated: boolean;
    login: (email: string) => void;
    logout: () => void;
}

const createMeasure = (): Measure => ({
    id: uuidv4(),
    timeSignature: 4,
    chords: []
});

const createSection = (type: SectionType = 'Verse', index: number): Section => ({
    id: uuidv4(),
    type,
    label: `${type} ${index + 1}`,
    measures: [createMeasure(), createMeasure(), createMeasure(), createMeasure()], // Start with 4
    lyrics: '',
    lyricsSize: 14,
    lyricsColor: '', // Empty means follow theme/default
    lyricsAlign: 'left',
    lyricsFont: 'Inter',
    lyricsBold: false,
    lyricsItalic: false,
    lyricsBackground: '' // Empty means no highlight
});

const createSong = (): Song => ({
    id: uuidv4(),
    mode: 'chords',
    title: '',
    artist: '',
    capo: 0,
    sections: []
});

export const useSongStore = create<SongState>((set) => ({
    songs: [createSong()], // Initial single song

    addSong: () => set((state) => {
        if (state.songs.length >= 4) return {};
        return {
            songs: [...state.songs, createSong()]
        };
    }),

    removeSong: (songId) => set((state) => {
        if (state.songs.length <= 1) return {}; // Prevent removing the last song
        return {
            songs: state.songs.filter(s => s.id !== songId)
        };
    }),

    setTitle: (songId, title) => set((state) => ({
        songs: state.songs.map(s => s.id === songId ? { ...s, title } : s)
    })),

    setArtist: (songId, artist) => set((state) => ({
        songs: state.songs.map(s => s.id === songId ? { ...s, artist } : s)
    })),

    setCapo: (songId, capo) => set((state) => ({
        songs: state.songs.map(s => s.id === songId ? { ...s, capo } : s)
    })),

    addSection: (songId, type = 'Verse') => set((state) => {
        return {
            songs: state.songs.map(s => {
                if (s.id !== songId) return s;
                const existingCount = s.sections.filter(sec => sec.type === type).length;
                return {
                    ...s,
                    sections: [...s.sections, createSection(type, existingCount)]
                };
            })
        };
    }),

    removeSection: (songId, sectionId) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            return {
                ...s,
                sections: s.sections.filter((sec) => sec.id !== sectionId)
            };
        })
    })),

    moveSection: (songId, activeId, overId) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            const oldIndex = s.sections.findIndex((sec) => sec.id === activeId);
            const newIndex = s.sections.findIndex((sec) => sec.id === overId);

            if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return s;

            const newSections = [...s.sections];
            const [movedSection] = newSections.splice(oldIndex, 1);
            newSections.splice(newIndex, 0, movedSection);

            return {
                ...s,
                sections: newSections
            };
        })
    })),

    updateSection: (songId, sectionId, updates) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            return {
                ...s,
                sections: s.sections.map((sec) =>
                    sec.id === sectionId ? { ...sec, ...updates } : sec
                )
            };
        })
    })),

    duplicateSection: (songId, sectionId) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            const sectionIndex = s.sections.findIndex(sec => sec.id === sectionId);
            if (sectionIndex === -1) return s;

            const sectionToDup = s.sections[sectionIndex];
            const newSection = {
                ...sectionToDup,
                id: uuidv4(),
                label: `${sectionToDup.label} (Copy)`,
                measures: sectionToDup.measures.map(m => ({
                    ...m,
                    id: uuidv4(),
                    chords: m.chords.map(c => ({ ...c, id: uuidv4() }))
                }))
            };

            const newSections = [...s.sections];
            newSections.splice(sectionIndex + 1, 0, newSection);
            return { ...s, sections: newSections };
        })
    })),

    addMeasure: (songId, sectionId) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            return {
                ...s,
                sections: s.sections.map((sec) =>
                    sec.id === sectionId
                        ? { ...sec, measures: [...sec.measures, createMeasure()] }
                        : sec
                )
            };
        })
    })),

    removeMeasure: (songId, sectionId, measureId) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            return {
                ...s,
                sections: s.sections.map((sec) =>
                    sec.id === sectionId
                        ? { ...sec, measures: sec.measures.filter(m => m.id !== measureId) }
                        : sec
                )
            };
        })
    })),

    updateMeasure: (songId, sectionId, measureId, chords) => set((state) => ({
        songs: state.songs.map(s => {
            if (s.id !== songId) return s;
            return {
                ...s,
                sections: s.sections.map((sec) =>
                    sec.id === sectionId
                        ? {
                            ...sec,
                            measures: sec.measures.map(m =>
                                m.id === measureId ? { ...m, chords } : m
                            )
                        }
                        : sec
                )
            };
        })
    })),

    toggleMode: (songId) => set((state) => ({
        songs: state.songs.map(s =>
            s.id === songId
                ? { ...s, mode: s.mode === 'chords' ? 'lyrics' : 'chords' }
                : s
        )
    })),

    setMode: (songId, mode) => set((state) => ({
        songs: state.songs.map(s =>
            s.id === songId ? { ...s, mode } : s
        )
    })),

    viewMode: 'editor',
    setViewMode: (viewMode) => set({ viewMode }),

    theme: 'dark',
    setTheme: (theme) => set({ theme }),

    globalLyricsFontSize: 16,
    setGlobalLyricsFontSize: (globalLyricsFontSize) => set({ globalLyricsFontSize }),
    globalLyricsAlignment: 'left',
    setGlobalLyricsAlignment: (globalLyricsAlignment) => set({ globalLyricsAlignment }),

    // Auth implementation
    isAuthenticated: false,
    login: (email) => set({ isAuthenticated: true, viewMode: 'editor' }),
    logout: () => set({ isAuthenticated: false, viewMode: 'auth' })
}));
