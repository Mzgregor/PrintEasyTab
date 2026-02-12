import React from 'react';
import { LogOut } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';

interface StyledLogoutDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const StyledLogoutDialog: React.FC<StyledLogoutDialogProps> = ({ isOpen, onClose, onConfirm }) => {
    const { t } = useSongStore();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-md bg-bg-secondary border border-border-main rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

                <div className="p-8">
                    {/* Logo - Centered and Larger */}
                    <div className="flex justify-center mb-10">
                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab"
                            className="h-24 w-auto object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform hover:scale-105 transition-transform duration-500"
                        />
                    </div>

                    {/* Content */}
                    <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0">
                                <LogOut size={24} />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-text-primary">
                                {t('auth.logout_confirm_title')}
                            </h2>
                        </div>
                        <p className="text-text-secondary font-medium leading-relaxed">
                            {t('auth.logout_confirm_message')}
                        </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={onConfirm}
                            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-[0_10px_20px_rgba(239,68,68,0.2)] hover:shadow-[0_15px_30px_rgba(239,68,68,0.4)] hover:-translate-y-0.5 transition-all duration-300"
                        >
                            {t('nav.logout') || 'Se déconnecter'}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-bg-tertiary hover:bg-bg-tertiary/80 text-text-primary rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-200"
                        >
                            {t('common.cancel') || 'Annuler'}
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-red-500/5 blur-3xl rounded-full" />
            </div>
        </div>
    );
};
