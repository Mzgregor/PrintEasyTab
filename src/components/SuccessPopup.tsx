import React, { useEffect } from 'react';
import { X, CheckCircle, Copy } from 'lucide-react';
import { useSongStore } from '../store/useSongStore';


interface SuccessPopupProps {
    activationLink: string;
    onClose: () => void;
}

export const SuccessPopup: React.FC<SuccessPopupProps> = ({ activationLink, onClose }) => {
    const [copied, setCopied] = React.useState(false);
    const { t } = useSongStore();

    // Auto-dismiss after 30 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 30000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(activationLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleActivateNow = () => {
        // Navigate to activation link
        window.location.href = activationLink;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Popup */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-8 pointer-events-none">
                <div
                    className="bg-bg-secondary border-2 border-accent/30 rounded-3xl shadow-2xl max-w-2xl w-full p-8 animate-in zoom-in-95 fade-in duration-500 pointer-events-auto relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-bg-tertiary rounded-full transition-colors text-text-secondary hover:text-text-primary"
                        title={t('success.close')}
                    >
                        <X size={24} />
                    </button>

                    {/* Logo ... */}
                    <div className="w-full flex justify-center mb-6">
                        <img
                            src="/LOGO_1_OMT.png"
                            alt="One More Tab Logo"
                            className="h-24 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                        />
                    </div>

                    {/* Success Icon ... */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-green-500/10 rounded-full">
                            <CheckCircle size={64} className="text-green-400 animate-in zoom-in duration-700" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl font-black uppercase tracking-wider text-center text-accent mb-4">
                        {t('success.title')}
                    </h2>

                    {/* Message */}
                    <p className="text-text-secondary text-center text-lg leading-relaxed mb-8">
                        {t('success.message_line1')}
                        <br />
                        {t('success.message_line2')}
                    </p>

                    {/* Development Mode Notice */}
                    <div className="bg-accent/10 border border-accent/30 rounded-2xl p-6 mb-6">
                        <p className="text-accent font-bold text-sm uppercase tracking-wider mb-3 text-center">
                            🔧 {t('success.dev_notice')}
                        </p>
                        <p className="text-text-secondary text-sm text-center mb-4">
                            {t('success.dev_desc')}
                        </p>

                        {/* Activation Link Box */}
                        <div className="bg-bg-tertiary border border-border-main rounded-xl p-4 mb-4">
                            <p className="text-xs text-text-secondary uppercase tracking-wider font-bold mb-2">
                                {t('success.link_label')}
                            </p>
                            <p className="text-accent text-sm font-mono break-all">
                                {activationLink}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleActivateNow}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                            >
                                <CheckCircle size={20} />
                                <span>{t('success.activate_btn')}</span>
                            </button>
                            <button
                                onClick={handleCopyLink}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-bg-primary border border-border-main text-text-primary rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-bg-tertiary transition-all active:scale-95"
                            >
                                <Copy size={20} />
                                <span>{copied ? t('success.copied_btn') : t('success.copy_btn')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Console Reminder */}
                    <p className="text-text-secondary text-xs text-center italic">
                        💡 {t('success.console_reminder')}
                    </p>
                </div>
            </div>
        </>
    );
};
