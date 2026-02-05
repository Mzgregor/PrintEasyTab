import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy } from 'lucide-react';
import type { Section } from '../types';
import { useSongStore } from '../store/useSongStore';
import { MeasureCard } from './MeasureCard';
import { Plus } from 'lucide-react';

interface Props {
    section: Section;
}

export const SectionCard: React.FC<Props> = ({ section }) => {
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

    const { removeSection, duplicateSection, updateSection } = useSongStore();

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden group shadow-sm hover:shadow-md hover:border-slate-600 transition-all"
        >
            <div className="flex items-center p-3 bg-slate-800/50 border-b border-slate-700/50 gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="text-slate-600 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-700/50 transition-colors"
                >
                    <GripVertical size={18} />
                </button>

                {/* Section Label */}
                <input
                    value={section.label}
                    onChange={(e) => updateSection(section.id, { label: e.target.value })}
                    className="bg-transparent text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded px-2 py-0.5 w-full max-w-[200px]"
                />

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => duplicateSection(section.id)}
                        className="p-1.5 text-slate-500 hover:text-indigo-400 hover:bg-slate-700 rounded transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => removeSection(section.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="p-4 bg-slate-900/30">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-2">
                    {section.measures.map((measure, index) => (
                        <MeasureCard
                            key={measure.id}
                            sectionId={section.id}
                            measure={measure}
                            index={index}
                        />
                    ))}

                    <button
                        onClick={() => useSongStore.getState().addMeasure(section.id)}
                        className="aspect-[4/3] border-2 border-dashed border-slate-800 hover:border-slate-600 rounded-md flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors"
                        title="Add Measure"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
