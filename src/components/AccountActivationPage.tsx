import React, { useEffect, useState } from 'react';
import { useSongStore } from '../store/useSongStore';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';

export const AccountActivationPage: React.FC = () => {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const { setViewMode, activateAccount } = useSongStore();

    useEffect(() => {
        // Get activation token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('activate');

        if (!token) {
            setStatus('error');
            setMessage('Lien d\'activation invalide');
            return;
        }

        // Activate account
        setTimeout(() => {
            const result = activateAccount(token);

            if (result.success) {
                setStatus('success');
                setMessage('Votre compte a été activé avec succès ! Vous pouvez maintenant vous connecter.');

                // Clear URL parameter
                window.history.replaceState({}, '', window.location.pathname);

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    setViewMode('auth');
                }, 3000);
            } else {
                setStatus('error');
                setMessage(result.error || 'Erreur lors de l\'activation du compte');
            }
        }, 1000); // Simulate processing time
    }, [activateAccount, setViewMode]);

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 animate-in fade-in duration-700">
            {/* Logo */}
            <div className="w-full max-w-4xl flex justify-center mb-12">
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab Logo"
                    className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                />
            </div>

            {/* Activation Card */}
            <div className="w-full max-w-md bg-bg-secondary p-10 rounded-[2.5rem] border border-border-main shadow-2xl">
                <div className="text-center space-y-6">
                    {status === 'loading' && (
                        <>
                            <div className="flex justify-center">
                                <div className="p-4 bg-accent/10 rounded-full">
                                    <Loader2 size={64} className="text-accent animate-spin" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-wider text-text-primary">
                                Activation en cours...
                            </h2>
                            <p className="text-text-secondary">
                                Veuillez patienter pendant que nous activons votre compte.
                            </p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex justify-center">
                                <div className="p-4 bg-green-500/10 rounded-full">
                                    <CheckCircle size={64} className="text-green-400 animate-in zoom-in duration-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-wider text-accent">
                                Compte Activé !
                            </h2>
                            <p className="text-text-secondary leading-relaxed">
                                {message}
                            </p>
                            <div className="pt-4">
                                <div className="inline-flex items-center gap-2 text-sm text-text-tertiary">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Redirection automatique vers la page de connexion...</span>
                                </div>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="flex justify-center">
                                <div className="p-4 bg-red-500/10 rounded-full">
                                    <XCircle size={64} className="text-red-400 animate-in zoom-in duration-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-wider text-red-400">
                                Erreur d'Activation
                            </h2>
                            <p className="text-text-secondary leading-relaxed">
                                {message}
                            </p>
                            <button
                                onClick={() => setViewMode('auth')}
                                className="flex items-center justify-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95 mx-auto mt-6"
                            >
                                <ArrowLeft size={20} />
                                <span>Retour à la connexion</span>
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
