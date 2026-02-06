import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, Copy, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
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
    const songMode = useSongStore(state => state.songs.find(s => s.id === songId)?.mode);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="rounded-xl overflow-hidden bg-bg-secondary border border-border-main shadow-sm group transition-all hover:border-accent/50"
        >
            <div className="flex items-center p-3 bg-bg-tertiary/50 border-b border-border-main gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="text-text-secondary hover:text-text-primary cursor-grab active:cursor-grabbing p-1 rounded hover:bg-white/5 transition-colors"
                >
                    <GripVertical size={16} />
                </button>

                {/* Section Label */}
                <input
                    value={section.label}
                    onChange={(e) => updateSection(songId, section.id, { label: e.target.value })}
                    className="bg-transparent text-text-primary font-medium focus:outline-none focus:ring-1 focus:ring-accent rounded px-2 py-0.5 w-full max-w-[200px] placeholder-text-secondary"
                />

                {/* Lyrics Settings Controls */}
                {songMode === 'lyrics' && (
                    <div className="flex items-center gap-2 mx-2">
                        <input
                            type="number"
                            value={section.lyricsSize || 14}
                            onChange={(e) => updateSection(songId, section.id, { lyricsSize: parseInt(e.target.value) })}
                            className="w-12 bg-bg-tertiary text-text-primary text-xs rounded px-1 text-center py-1 border border-border-main focus:border-accent outline-none"
                            title="Font Size (px)"
                        />
                        <button
                            onClick={() => {
                                const alignments: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
                                const currentIndex = alignments.indexOf(section.lyricsAlign || 'left');
                                const nextIndex = (currentIndex + 1) % alignments.length;
                                updateSection(songId, section.id, { lyricsAlign: alignments[nextIndex] });
                            }}
                            className="p-1.5 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-md transition-colors"
                            title={`Alignment: ${section.lyricsAlign || 'left'}`}
                        >
                            {section.lyricsAlign === 'center' ? <AlignCenter size={16} /> :
                                section.lyricsAlign === 'right' ? <AlignRight size={16} /> :
                                    <AlignLeft size={16} />}
                        </button>
                        <input
                            type="color"
                            value={section.lyricsColor || '#ffffff'}
                            onChange={(e) => updateSection(songId, section.id, { lyricsColor: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0 overflow-hidden"
                            title="Text Color"
                        />
                    </div>
                )}

                <div className="flex-1" />

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => duplicateSection(songId, section.id)}
                        className="p-1.5 text-text-secondary hover:text-accent hover:bg-bg-tertiary rounded-md transition-colors"
                        title="Duplicate"
                    >
                        <Copy size={16} />
                    </button>
                    <button
                        onClick={() => removeSection(songId, section.id)}
                        className="p-1.5 text-text-secondary hover:text-red-500 hover:bg-bg-tertiary rounded-md transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className={`p-4 bg-bg-secondary ${songMode === 'lyrics' ? '' : 'flex justify-center'}`}>
                {songMode === 'lyrics' ? (
                    <textarea
                        value={section.lyrics || ''}
                        onChange={(e) => updateSection(songId, section.id, { lyrics: e.target.value })}
                        className="w-full h-auto min-h-[150px] bg-bg-tertiary/30 text-text-primary rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-accent resize-y whitespace-pre-wrap transition-colors font-medium border border-border-main"
                        style={{
                            fontSize: `${(section.lyricsSize || 14) * 2}px`,
                            color: 'var(--text-primary)',
                            lineHeight: '1.5',
                            fontFamily: 'inherit'
                        }}
                        placeholder="Paste lyrics here..."
                    />
                ) : (
                    <div className="flex flex-wrap justify-center gap-2 w-full max-w-5xl">
                        {section.measures.map((measure, index) => (
                            <div key={measure.id} className="w-[23%] sm:w-[11.5%] min-w-[80px]">
                                <MeasureCard
                                    songId={songId}
                                    sectionId={section.id}
                                    measure={measure}
                                    index={index}
                                />
                            </div>
                        ))}

                        <div className="w-[23%] sm:w-[11.5%] min-w-[80px]">
                            <button
                                onClick={() => addMeasure(songId, section.id)}
                                className="w-full aspect-[4/3] border border-dashed border-border-main hover:border-accent rounded-lg flex items-center justify-center text-text-secondary hover:text-accent transition-colors bg-bg-tertiary/10 hover:bg-bg-tertiary/40"
                                title="Add Measure"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
