import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Song, Section, SectionType, Measure, ChordBlock } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

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
    measures: [createMeasure(), createMeasure(), createMeasure(), createMeasure()] // Start with 4
});

const createSong = (index: number): Song => ({
    id: uuidv4(),
    title: '',
    artist: '',
    capo: 0,
    sections: []
});

export const useSongStore = create<SongState>((set) => ({
    songs: [createSong(0)], // Initial single song

    addSong: () => set((state) => {
        if (state.songs.length >= 4) return {};
        return {
            songs: [...state.songs, createSong(state.songs.length)]
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
            return {
                ...s,
                sections: arrayMove(s.sections, oldIndex, newIndex)
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
    }))
}));
