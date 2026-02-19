import React, { useRef, useState } from 'react';
import { X, Download, Upload, AlertTriangle } from 'lucide-react';

interface ExportImportModalProps {
    mode: 'export' | 'import';
    onConfirm: (file?: File) => void;
    onCancel: () => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({ mode, onConfirm, onCancel }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isExport = mode === 'export';

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setSelectedFile(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file && file.name.endsWith('.json')) setSelectedFile(file);
    };

    const handleConfirm = () => {
        if (!isExport && !selectedFile) return;
        onConfirm(selectedFile || undefined);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[300] animate-in fade-in duration-300"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[301] flex items-center justify-center p-6 pointer-events-none">
                <div
                    className="bg-bg-secondary border-2 border-red-500/30 rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto relative skeuo-card"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>

                    {/* Logo */}
                    <div className="w-full flex justify-center mb-6">
                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab Logo"
                            className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        />
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 rounded-full">
                            {isExport
                                ? <Download size={48} className="text-red-500 animate-bounce" />
                                : <Upload size={48} className="text-red-500 animate-bounce" />
                            }
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary mb-2">
                            {isExport ? 'Exporter le Matos !' : 'Importer le Matos !'}
                        </h2>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {isExport
                                ? 'Toutes les chansons de la bibliothèque seront exportées dans un fichier JSON. Garde-le précieusement !'
                                : 'Sélectionne ton fichier JSON. Les chansons déjà présentes ne seront pas dupliquées.'
                            }
                        </p>
                    </div>

                    {/* Import File Zone */}
                    {!isExport && (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            className={`mb-6 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${dragOver
                                    ? 'border-red-500 bg-red-500/10'
                                    : selectedFile
                                        ? 'border-green-500/50 bg-green-500/10'
                                        : 'border-border-main hover:border-red-500/50 hover:bg-red-500/5'
                                }`}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".json"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            {selectedFile ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                        <Upload size={20} className="text-green-400" />
                                    </div>
                                    <p className="font-bold text-green-400 text-sm">{selectedFile.name}</p>
                                    <p className="text-text-secondary text-xs">Cliquer pour changer</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center">
                                        <Upload size={20} className="text-text-secondary" />
                                    </div>
                                    <p className="font-bold text-text-primary text-sm">Glisse ton fichier ici</p>
                                    <p className="text-text-secondary text-xs">ou clique pour parcourir (.json)</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Warning for export */}
                    {isExport && (
                        <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                            <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                            <p className="text-red-300 text-xs leading-relaxed">
                                Ce fichier contient <strong>toutes les chansons de tous les utilisateurs</strong>. Garde-le en lieu sûr.
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-3 bg-bg-tertiary border border-border-main text-text-primary rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-bg-primary transition-all active:scale-95"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={!isExport && !selectedFile}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-900/20 transition-all active:scale-95 ${!isExport && !selectedFile
                                    ? 'opacity-40 cursor-not-allowed'
                                    : 'hover:bg-red-500 hover:scale-105'
                                }`}
                        >
                            {isExport ? <Download size={16} /> : <Upload size={16} />}
                            <span>{isExport ? 'Exporter' : 'Importer'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
