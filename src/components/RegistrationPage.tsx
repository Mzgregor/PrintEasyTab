import React, { useState } from 'react';
import { useSongStore } from '../store/useSongStore';
import { UserPlus, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { SuccessPopup } from './SuccessPopup';
import { sendActivationEmail } from '../services/emailService';

export const RegistrationPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [activationLink, setActivationLink] = useState('');

    const { setViewMode, register } = useSongStore();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setIsLoading(true);

        // Mock registration delay for UX
        setTimeout(() => {
            const result = register(email, password);
            setIsLoading(false);

            if (!result.success) {
                setError(result.error || 'Erreur lors de l\'inscription');
            } else if (result.user) {
                // Send activation email (mock in local dev)
                const activationUrl = sendActivationEmail(result.user.email, result.user.activationToken || '');
                setActivationLink(activationUrl);
                setShowSuccessPopup(true);
            }
        }, 800);
    };

    const handleClosePopup = () => {
        setShowSuccessPopup(false);
        setViewMode('auth'); // Return to login page
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
            {/* Logo Section */}
            <div className="w-full max-w-4xl flex justify-center mb-12">
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab Logo"
                    className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] max-h-[30vh]"
                />
            </div>

            {/* Registration Form Card */}
            <div className="w-full max-w-md space-y-8 bg-bg-secondary p-10 rounded-[2.5rem] border border-border-main shadow-2xl relative overflow-hidden group">
                {/* Background Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />

                <div className="text-center relative z-10">
                    <h1 className="text-4xl font-black uppercase tracking-widest text-accent mb-2">Inscription</h1>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">Créez votre compte One More Tab</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="relative group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-accent transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Votre email"
                                className="w-full bg-bg-tertiary border border-border-main rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                                required
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-accent transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Mot de passe (min. 6 caractères)"
                                className="w-full bg-bg-tertiary border border-border-main rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-accent transition-colors">
                                <Lock size={20} />
                            </div>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirmez le mot de passe"
                                className="w-full bg-bg-tertiary border border-border-main rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl hover:bg-accent-light active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <UserPlus size={20} className="group-hover:scale-110 transition-transform" />
                                <span>Créer mon compte</span>
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-main"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-secondary px-4 text-text-tertiary font-bold tracking-widest">ou</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setViewMode('auth')}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-transparent border-2 border-accent text-accent rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-accent hover:text-white active:scale-95 transition-all group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour à la connexion</span>
                    </button>
                </form>
            </div>

            {/* Support Link */}
            <p className="mt-8 text-text-tertiary text-xs uppercase tracking-widest font-bold">
                Besoin d'aide ? <button onClick={() => setViewMode('help')} className="text-accent hover:underline">Consultez la documentation</button>
            </p>

            {/* Success Popup */}
            {showSuccessPopup && (
                <SuccessPopup
                    activationLink={activationLink}
                    onClose={handleClosePopup}
                />
            )}
        </div>
    );
};
