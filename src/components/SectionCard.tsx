import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import type { Section } from '../types';
import { useSongStore } from '../store/useSongStore';
import { MeasureCard } from './MeasureCard';
import { Plus } from 'lucide-react';

interface Props {
    songId: string;
    section: Section;
}

export const SectionCard: React.FC<Props> = ({ songId, section }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const { removeSection, duplicateSection, updateSection, addMeasure } = useSongStore();

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded-xl overflow-hidden bg-[#1c1c1e] border border-[#2c2c2e] shadow-sm group transition-colors hover:border-[#3a3a3c]"
        >
            <div className="flex items-center p-3 bg-[#2c2c2e]/30 border-b border-[#2c2c2e] gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="text-[#636366] hover:text-[#aeaeb2] cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/5 transition-colors"
                >
                    <GripVertical size={16} />
                </button>

                {/* Section Label */}
                <input
                    value={section.label}
                    onChange={(e) => updateSection(songId, section.id, { label: e.target.value })}
                    className="bg-transparent text-white font-medium focus:outline-none focus:ring-1 focus:ring-[#0a84ff] rounded px-2 py-0.5 w-full max-w-[200px] placeholder-[#636366]"
                />

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => duplicateSection(songId, section.id)}
                        className="p-1.5 text-[#636366] hover:text-[#0a84ff] hover:bg-[#3a3a3c] rounded-md transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => removeSection(songId, section.id)}
                        className="p-1.5 text-[#636366] hover:text-red-500 hover:bg-[#3a3a3c] rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-[#1c1c1e]">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
                    {section.measures.map((measure, index) => (
                        <MeasureCard
                            key={measure.id}
                            songId={songId}
                            sectionId={section.id}
                            measure={measure}
                            index={index}
                        />
                    ))}

                    <button
                        onClick={() => addMeasure(songId, section.id)}
                        className="aspect-[4/3] border border-dashed border-[#3a3a3c] hover:border-[#0a84ff]/50 rounded-lg flex items-center justify-center text-[#636366] hover:text-[#0a84ff] transition-colors bg-[#2c2c2e]/20 hover:bg-[#2c2c2e]/50"
                        title="Add Measure"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
