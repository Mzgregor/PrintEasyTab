import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSongStore } from '../store/useSongStore';
import { SectionCard } from './SectionCard';
import { Plus } from 'lucide-react';
import type { SectionType } from '../types';

interface Props {
    songId: string;
}

export const SectionList: React.FC<Props> = ({ songId }) => {
    // Select the specific song we are editing
    const song = useSongStore(state => state.songs.find(s => s.id === songId));
    const { addSection, moveSection } = useSongStore();

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    if (!song) return null;

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            moveSection(songId, active.id as string, over.id as string);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Structure</h3>
            </div>

            <DndContext
                id={`dnd-context-${songId}`} // Ensure unique context per song
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={song.sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <div className="space-y-3 min-h-[50px]">
                        {song.sections.length === 0 && (
                            <div className="text-center py-8 text-slate-600 border border-slate-800 rounded-lg border-dashed">
                                Start by adding a section below
                            </div>
                        )}
                        {song.sections.map((section) => (
                            <SectionCard key={section.id} songId={songId} section={section} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Section Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro', 'Solo'] as SectionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => addSection(songId, type)}
                        className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-slate-400 hover:text-slate-100 transition-all text-xs font-semibold uppercase tracking-wide group"
                    >
                        <Plus size={14} className="group-hover:text-indigo-400 transition-colors" /> {type}
                    </button>
                ))}
            </div>
        </div>
    );
};
