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
        <div className="glass-card rounded-[20px] overflow-hidden relative group transition-transform duration-500 ease-out hover:scale-[1.01]">
            {/* iOS Grouped Header Style */}
            <div className="px-5 py-3 border-b border-[#38383a] bg-[#2c2c2e]/50 backdrop-blur-md flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8e8e93]">
                    Song {index + 1}
                </span>
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#3a3a3c]" />
                    <div className="w-2 h-2 rounded-full bg-[#3a3a3c]" />
                </div>
            </div>

            <div className="p-5 space-y-8">
                <SongMetadata songId={song.id} />
                <SectionList songId={song.id} />
            </div>
        </div>
    );
};
