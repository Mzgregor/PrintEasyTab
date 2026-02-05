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
        <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50 shadow-sm relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-700"></div>

            {/* Song Label (Visual distinction as requested: Different background/header) */}
            <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                    Song {index + 1}
                </span>
            </div>

            <div className="p-4 space-y-6">
                <SongMetadata songId={song.id} />
                <SectionList songId={song.id} />
            </div>
        </div>
    );
};
