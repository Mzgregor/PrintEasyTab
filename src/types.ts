export type ChordBlock = {
    id: string;
    text: string;     // e.g. "C", "Am7"
    duration: number; // 1, 2, 3, 4 beats
};

export type Measure = {
    id: string;
    chords: ChordBlock[];
    timeSignature: number; // default 4
};

export type SectionType = 'Intro' | 'Verse' | 'Chorus' | 'Pre-Chorus' | 'Bridge' | 'Outro' | 'Solo' | 'Custom';

export type Section = {
    id: string;
    type: SectionType;
    label: string; // e.g. "Verse 1"
    measures: Measure[];
    lyrics?: string; // Lyrics content
    lyricsSize?: number; // Font size for lyrics
    lyricsColor?: string; // Hex color for lyrics
    lyricsAlign?: 'left' | 'center' | 'right'; // Text alignment
    lyricsFont?: string; // Font family
    lyricsBold?: boolean; // Bold text
    lyricsItalic?: boolean; // Italic text
    lyricsBackground?: string; // Highlight color
};

export type Song = {
    id: string; // Unique ID for the song
    userId?: number; // ID of the user who owns this song
    mode: 'chords' | 'lyrics'; // Display mode
    title: string;
    artist: string;
    capo: number; // 0-10, 0 = no capo
    sections: Section[];
    creatorName?: string;
    likes?: number[]; // Array of user IDs who liked the song
    isFavorite: boolean;
    createdAt: string;
    updatedAt: string;
};

// User Management Types
export type UserRole = 'user' | 'admin';

export interface User {
    id: number;
    email: string;
    username: string;
    role: UserRole;
    createdAt: string;
    lastLogin: string | null;
    isActive: boolean;
    activationToken?: string;
    language?: 'fr' | 'en';
    theme?: 'light' | 'dark' | 'midnight' | 'one-more-theme-studio';
}

export interface AuthResponse {
    success: boolean;
    user?: User;
    error?: string;
}

export interface CreateUserData {
    email: string;
    username: string;
    password: string;
    role: UserRole;
}

