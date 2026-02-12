import React from 'react';
import { X, AlertTriangle, Trash2, LogOut } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Supprimer",
    cancelText = "Annuler",
    variant = 'danger'
}) => {
    if (!isOpen) return null;

    const isDanger = variant === 'danger';

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
                    className={`bg-bg-secondary border-2 ${isDanger ? 'border-red-500/30' : 'border-orange-500/30'} rounded-[2rem] shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300 pointer-events-auto relative skeuo-card`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Icon (Top-Right) */}
                    <button
                        onClick={onCancel}
                        className="absolute top-6 right-6 p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary hover:text-text-primary"
                    >
                        <X size={20} />
                    </button>

                    {/* Logo Header */}
                    <div className="w-full flex justify-center mb-6">
                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab Logo"
                            className="h-16 w-auto object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        />
                    </div>

                    {/* Warning Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 ${isDanger ? 'bg-red-500/10' : 'bg-orange-500/10'} rounded-full`}>
                            <AlertTriangle size={48} className={isDanger ? 'text-red-500 animate-pulse' : 'text-orange-500'} />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary mb-3">
                            {title}
                        </h2>
                        <p className="text-text-secondary text-sm leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-6 py-4 bg-bg-tertiary border border-border-main text-text-primary rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-bg-primary transition-all active:scale-95"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={onConfirm}
                            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 ${isDanger ? 'bg-red-600 shadow-red-900/20 hover:bg-red-500' : 'bg-orange-600 shadow-orange-900/20 hover:bg-orange-500'} text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg transition-all active:scale-95 hover:scale-105`}
                        >
                            {isDanger ? <Trash2 size={16} /> : <LogOut size={16} />}
                            <span>{confirmText}</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};
