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
    const { addSection, moveSection, t } = useSongStore();

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
                <h3 className="text-text-secondary text-xs font-bold uppercase tracking-widest">{t('section.structure')}</h3>
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
                            <div className="text-center py-8 text-text-secondary border border-border-main rounded-lg border-dashed">
                                {t('section.empty_state')}
                            </div>
                        )}
                        {song.sections.map((section) => (
                            <SectionCard key={section.id} songId={songId} section={section} />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Add Section Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(['Intro', 'Verse', 'Chorus', 'Bridge', 'Outro', 'Solo'] as SectionType[]).map((type) => (
                    <button
                        key={type}
                        onClick={() => addSection(songId, type)}
                        data-type={type}
                        className="btn-structure group"
                    >
                        <div className="flex items-center justify-center gap-2 relative z-10">
                            <div className="plus-icon transition-colors">
                                <Plus size={16} strokeWidth={3} />
                            </div>
                            <span className="text-[13px] font-bold uppercase tracking-wider text-text-secondary group-hover:text-text-primary transition-colors">
                                {t(`section.${type.toLowerCase()}`)}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
