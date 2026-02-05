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
                        className="group relative overflow-hidden bg-[#2c2c2e] hover:bg-[#3a3a3c] border border-[#38383a] rounded-lg p-3 transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            <Plus size={14} className="text-[#0a84ff]" />
                            <span className="text-[12px] font-semibold uppercase tracking-wider text-gray-300 group-hover:text-white transition-colors">
                                {type}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
