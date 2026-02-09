import React from 'react';
import { SongMetadata } from './SongMetadata';
import { SectionList } from './SectionList';
import type { Song } from '../types';

interface Props {
    song: Song;
    index: number;
}

export const SongBlock: React.FC<Props> = ({ song, index }) => {
    return (
        <div className="skeuo-card group transition-all duration-500 ease-out hover:shadow-2xl">
            {/* iOS Grouped Header Style */}
            <div className="px-5 py-3 border-b border-white/5 bg-white/5 backdrop-blur-md flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary opacity-60">
                    Song #{index + 1}
                </span>
                <div className="flex gap-1.5 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-text-secondary" />
                </div>
            </div>

            <div className="p-5 space-y-8">
                <SongMetadata songId={song.id} />
                <SectionList songId={song.id} />
            </div>
        </div>
    );
};
