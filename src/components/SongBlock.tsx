import React from 'react';
import { SongMetadata } from './SongMetadata';
import { SectionList } from './SectionList';
import type { Song } from '../types';

interface Props {
    song: Song;
}

export const SongBlock: React.FC<Props> = ({ song }) => {
    return (
        <div className="skeuo-card group transition-all duration-500 ease-out hover:shadow-2xl">
            <div className="p-5 space-y-8">
                <SongMetadata songId={song.id} />
                <SectionList songId={song.id} />
            </div>
        </div>
    );
};
