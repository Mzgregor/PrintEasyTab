import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Song, Section, SectionType, Measure, ChordBlock } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

interface SongState {
    song: Song;
    setTitle: (title: string) => void;
    setArtist: (artist: string) => void;
    setCapo: (capo: number) => void;

    addSection: (type?: SectionType) => void;
    removeSection: (sectionId: string) => void;
    moveSection: (activeId: string, overId: string) => void;
    updateSection: (sectionId: string, updates: Partial<Section>) => void;
    duplicateSection: (sectionId: string) => void;

    addMeasure: (sectionId: string) => void;
    removeMeasure: (sectionId: string, measureId: string) => void;
    updateMeasure: (sectionId: string, measureId: string, chords: ChordBlock[]) => void;
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

export const useSongStore = create<SongState>((set) => ({
    song: {
        title: '',
        artist: '',
        capo: 0,
        sections: []
    },

    setTitle: (title) => set((state) => ({ song: { ...state.song, title } })),
    setArtist: (artist) => set((state) => ({ song: { ...state.song, artist } })),
    setCapo: (capo) => set((state) => ({ song: { ...state.song, capo } })),

    addSection: (type = 'Verse') => set((state) => {
        // Count existing sections of this type to auto-number
        const existingCount = state.song.sections.filter(s => s.type === type).length;
        return {
            song: {
                ...state.song,
                sections: [...state.song.sections, createSection(type, existingCount)]
            }
        };
    }),

    removeSection: (id) => set((state) => ({
        song: {
            ...state.song,
            sections: state.song.sections.filter((s) => s.id !== id)
        }
    })),

    moveSection: (activeId, overId) => set((state) => {
        const oldIndex = state.song.sections.findIndex((s) => s.id === activeId);
        const newIndex = state.song.sections.findIndex((s) => s.id === overId);
        return {
            song: {
                ...state.song,
                sections: arrayMove(state.song.sections, oldIndex, newIndex)
            }
        };
    }),

    updateSection: (id, updates) => set((state) => ({
        song: {
            ...state.song,
            sections: state.song.sections.map((s) =>
                s.id === id ? { ...s, ...updates } : s
            )
        }
    })),

    duplicateSection: (id) => set((state) => {
        const sectionIndex = state.song.sections.findIndex(s => s.id === id);
        if (sectionIndex === -1) return {};

        const sectionToDup = state.song.sections[sectionIndex];
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

        const newSections = [...state.song.sections];
        newSections.splice(sectionIndex + 1, 0, newSection);

        return {
            song: { ...state.song, sections: newSections }
        };
    }),

    addMeasure: (sectionId) => set((state) => ({
        song: {
            ...state.song,
            sections: state.song.sections.map((s) =>
                s.id === sectionId
                    ? { ...s, measures: [...s.measures, createMeasure()] }
                    : s
            )
        }
    })),

    removeMeasure: (sectionId, measureId) => set((state) => ({
        song: {
            ...state.song,
            sections: state.song.sections.map((s) =>
                s.id === sectionId
                    ? { ...s, measures: s.measures.filter(m => m.id !== measureId) }
                    : s
            )
        }
    })),

    updateMeasure: (sectionId, measureId, chords) => set((state) => ({
        song: {
            ...state.song,
            sections: state.song.sections.map((s) =>
                s.id === sectionId
                    ? {
                        ...s,
                        measures: s.measures.map(m =>
                            m.id === measureId ? { ...m, chords } : m
                        )
                    }
                    : s
            )
        }
    }))

}));
