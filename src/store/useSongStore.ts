import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Song, Section, SectionType, Measure, ChordBlock, User, AuthResponse, UserRole } from '../types';
import * as userService from '../services/userService';
import { translations } from '../translations';

interface SongState {
    songs: Song[];
    activeSongId: string | null;
    addSong: () => void;
    removeSong: (songId: string) => void;
    setActiveSongId: (songId: string) => void;

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

    viewMode: 'editor' | 'metronome' | 'tuner' | 'help' | 'auth' | 'register' | 'settings' | 'admin' | 'library' | 'configuration';
    setViewMode: (mode: 'editor' | 'metronome' | 'tuner' | 'help' | 'auth' | 'register' | 'settings' | 'admin' | 'library' | 'configuration') => void;

    theme: 'light' | 'dark' | 'midnight' | 'one-more-theme-studio';
    setTheme: (theme: 'light' | 'dark' | 'midnight' | 'one-more-theme-studio') => void;

    language: 'fr' | 'en';
    setLanguage: (lang: 'fr' | 'en') => void;

    // Global Lyrics Settings
    globalLyricsFontSize: number;
    setGlobalLyricsFontSize: (size: number) => void;
    globalLyricsAlignment: 'left' | 'center' | 'right';
    setGlobalLyricsAlignment: (align: 'left' | 'center' | 'right') => void;

    // Library State
    librarySongs: Song[];
    saveSong: (song: Song) => void;
    toggleFavorite: (songId: string) => void;
    deleteFromLibrary: (songIds: string[]) => void;
    updateLibrarySong: (songId: string, updates: Partial<Song>) => void;

    // Auth state
    isAuthenticated: boolean;
    currentUser: User | null;
    users: User[];

    // Auth methods
    login: (email: string, password: string) => AuthResponse;
    register: (email: string, password: string) => AuthResponse;
    logout: () => void;

    // User management methods
    loadUsers: () => void;
    createUserAsAdmin: (email: string, password: string, role: UserRole) => AuthResponse;
    deleteUserById: (userId: number) => void;
    updateUserRoleById: (userId: number, newRole: UserRole) => void;
    updateUserDetails: (userId: number, updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>) => void;
    changeUserPassword: (currentPassword: string, newPassword: string) => boolean;
    activateAccount: (token: string) => AuthResponse;
    // Helper to get translated string
    t: (key: string) => string;
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

const createSong = (userId?: number): Song => ({
    id: uuidv4(),
    userId,
    mode: 'chords',
    title: '',
    artist: '',
    capo: 0,
    sections: [],
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
});

const initialSong = createSong();

// Helper to load songs from localStorage (filtered by userId)
const loadLibraryFromStorage = (userId?: number): Song[] => {
    try {
        const stored = localStorage.getItem('print_easy_tab_library');
        if (!stored) return [];
        const allSongs: Song[] = JSON.parse(stored);
        if (userId === undefined) return []; // Return empty if no user (or we could return all, but for security empty is better)
        return allSongs.filter(s => s.userId === userId);
    } catch (e) {
        console.error('Failed to load library from storage', e);
        return [];
    }
};

// Helper to save library to localStorage (merging with existing songs of other users)
const saveLibraryToStorage = (userSongs: Song[], userId: number) => {
    try {
        const stored = localStorage.getItem('print_easy_tab_library');
        const allSongs: Song[] = stored ? JSON.parse(stored) : [];

        // Remove old versions of this user's songs and add the new ones
        const otherUsersSongs = allSongs.filter(s => s.userId !== userId);
        const newAllSongs = [...otherUsersSongs, ...userSongs];

        localStorage.setItem('print_easy_tab_library', JSON.stringify(newAllSongs));
    } catch (e) {
        console.error('Failed to save library to storage', e);
    }
};

export const useSongStore = create<SongState>((set, get) => ({
    songs: [initialSong],
    activeSongId: initialSong.id,

    addSong: () => set((state) => {
        if (state.songs.length >= 4) return {};
        const newSong = createSong(state.currentUser?.id);
        return {
            songs: [...state.songs, newSong],
            activeSongId: newSong.id
        };
    }),

    removeSong: (songId) => set((state) => {
        if (state.songs.length <= 1) return {};
        const newSongs = state.songs.filter(s => s.id !== songId);
        let newActiveId = state.activeSongId;

        // If we're removing the active song, switch to the first available one
        if (state.activeSongId === songId) {
            newActiveId = newSongs[0].id;
        }

        return {
            songs: newSongs,
            activeSongId: newActiveId
        };
    }),

    setActiveSongId: (activeSongId) => set({ activeSongId }),

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
    setTheme: (theme) => {
        const state = get();
        if (state.currentUser) {
            userService.updateUser(state.currentUser.id, { theme });
            set({
                theme,
                currentUser: { ...state.currentUser, theme }
            });
        } else {
            set({ theme });
        }
    },

    globalLyricsFontSize: 16,
    setGlobalLyricsFontSize: (globalLyricsFontSize) => set({ globalLyricsFontSize }),
    globalLyricsAlignment: 'left',
    setGlobalLyricsAlignment: (globalLyricsAlignment) => set({ globalLyricsAlignment }),

    // Language implementation
    language: (localStorage.getItem('printeasy_lang') as 'fr' | 'en') || 'fr',
    setLanguage: (language) => {
        const state = get();
        localStorage.setItem('printeasy_lang', language);

        if (state.currentUser) {
            userService.updateUser(state.currentUser.id, { language });
            set({
                language,
                currentUser: { ...state.currentUser, language }
            });
        } else {
            set({ language });
        }
    },

    t: (key: string) => {
        const state = get();
        const lang = state.language;
        return translations[lang]?.[key] || key;
    },

    // Library implementation
    librarySongs: [], // Initialize empty, will be loaded on login

    saveSong: (song) => set((state) => {
        if (!state.currentUser) return {};

        const existingIndex = state.librarySongs.findIndex(s => s.id === song.id);
        let newLibrary;
        const now = new Date().toISOString();
        const songToSave = { ...song, userId: state.currentUser.id, updatedAt: now };

        if (existingIndex >= 0) {
            newLibrary = [...state.librarySongs];
            newLibrary[existingIndex] = songToSave;
        } else {
            newLibrary = [...state.librarySongs, { ...songToSave, createdAt: now }];
        }

        saveLibraryToStorage(newLibrary, state.currentUser.id);
        return { librarySongs: newLibrary };
    }),

    toggleFavorite: (songId) => set((state) => {
        if (!state.currentUser) return {};

        // Toggle in library
        const newLibrary = state.librarySongs.map(s =>
            s.id === songId ? { ...s, isFavorite: !s.isFavorite, updatedAt: new Date().toISOString() } : s
        );

        // Toggle in active session if present
        const newSessionSongs = state.songs.map(s =>
            s.id === songId ? { ...s, isFavorite: !s.isFavorite, updatedAt: new Date().toISOString() } : s
        );

        saveLibraryToStorage(newLibrary, state.currentUser.id);
        return { librarySongs: newLibrary, songs: newSessionSongs };
    }),

    deleteFromLibrary: (songIds) => set((state) => {
        if (!state.currentUser) return {};
        const newLibrary = state.librarySongs.filter(s => !songIds.includes(s.id));
        saveLibraryToStorage(newLibrary, state.currentUser.id);
        return { librarySongs: newLibrary };
    }),

    updateLibrarySong: (songId, updates) => set((state) => {
        if (!state.currentUser) return {};
        const now = new Date().toISOString();
        const newLibrary = state.librarySongs.map(s =>
            s.id === songId ? { ...s, ...updates, updatedAt: now } : s
        );
        saveLibraryToStorage(newLibrary, state.currentUser.id);
        return { librarySongs: newLibrary };
    }),

    // Auth implementation
    isAuthenticated: false,
    currentUser: null,
    users: [],

    login: (email, password) => {
        console.log('Store: Calling authenticateUser...', { email });
        const result = userService.authenticateUser(email, password);
        console.log('Store: Authentication result', result);
        if (result.success && result.user) {
            set({
                isAuthenticated: true,
                currentUser: result.user,
                viewMode: 'editor',
                librarySongs: loadLibraryFromStorage(result.user.id),
                language: result.user.language || get().language,
                theme: result.user.theme || get().theme
            });

            // Ensure localStorage is updated for non-logged in state fallback
            if (result.user.language) {
                localStorage.setItem('printeasy_lang', result.user.language);
            }
        }
        return result;
    },

    register: (email, password) => {
        const result = userService.createUser({ email, password, role: 'user' });
        // Don't auto-login - user must activate account first
        return result;
    },

    logout: () => {
        const initialSong = createSong();
        set({
            isAuthenticated: false,
            currentUser: null,
            viewMode: 'auth',
            librarySongs: [],
            songs: [initialSong],
            activeSongId: initialSong.id
        });
    },

    // User management
    loadUsers: () => {
        const allUsers = userService.getAllUsers();
        set({ users: allUsers });
    },

    createUserAsAdmin: (email, password, role) => {
        const result = userService.createUser({ email, password, role });
        if (result.success) {
            const allUsers = userService.getAllUsers();
            set({ users: allUsers });
        }
        return result;
    },

    deleteUserById: (userId) => {
        const success = userService.deleteUser(userId);
        if (success) {
            const allUsers = userService.getAllUsers();
            set({ users: allUsers });
        }
    },

    updateUserRoleById: (userId, newRole) => {
        const success = userService.updateUserRole(userId, newRole);
        if (success) {
            const allUsers = userService.getAllUsers();
            set({ users: allUsers });
        }
    },

    updateUserDetails: (userId, updates) => {
        const success = userService.updateUser(userId, updates);
        if (success) {
            const allUsers = userService.getAllUsers();
            set({ users: allUsers });
        }
    },

    changeUserPassword: (currentPassword, newPassword) => {
        const state = get();
        if (!state.currentUser) return false;

        // Verify current password first
        const authResult = userService.authenticateUser(state.currentUser.email, currentPassword);
        if (!authResult.success) return false;

        // Change password
        return userService.changePassword(state.currentUser.id, newPassword);
    },

    activateAccount: (token) => {
        const result = userService.activateUser(token);
        return result;
    },
}));
