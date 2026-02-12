import React, { useState } from 'react';
import { useSongStore } from '../store/useSongStore';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Auth from store
    const { setViewMode, login, t } = useSongStore();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('UI: Login button clicked', { identifier });
        setIsLoading(true);
        setError('');

        // Mock login delay for UX
        setTimeout(() => {
            console.log('UI: Executing login from store...');
            setIsLoading(false);
            const result = login(identifier, password);
            console.log('UI: Login result received', result);
            if (!result.success) {
                setError(result.error || t('auth.error_login'));
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-700">
            {/* Logo Section */}
            <div className="w-full max-w-4xl flex justify-center mb-12">
                <img
                    src="/LOGO_1_OMT.png"
                    alt="One More Tab Logo"
                    className="w-full h-auto object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)] max-h-[40vh]"
                />
            </div>

            {/* Login Form Card */}
            <div className="w-full max-w-md space-y-8 bg-bg-secondary p-10 rounded-[2.5rem] border border-border-main shadow-2xl relative overflow-hidden group">
                {/* Background Glow Effect */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-colors duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-1000" />

                <div className="text-center relative z-10">
                    <h1 className="text-4xl font-black uppercase tracking-widest text-accent mb-2">{t('auth.login_title')}</h1>
                    <p className="text-text-secondary text-sm font-medium uppercase tracking-wider">{t('auth.subtitle')}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 text-sm font-medium text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Identifier Input */}
                        <div className="relative group/input">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within/input:text-accent transition-colors">
                                <Mail size={20} />
                            </div>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder={t('auth.identifier_placeholder')}
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
                                placeholder={t('auth.password_placeholder')}
                                className="w-full bg-bg-tertiary border border-border-main rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/10 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <button
                            type="button"
                            className="text-[11px] font-black uppercase tracking-wider text-text-secondary hover:text-accent transition-colors"
                        >
                            {t('auth.forgot_password')}
                        </button>
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
                                <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                <span>{t('auth.login_btn')}</span>
                            </>
                        )}
                    </button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-main"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-bg-secondary px-4 text-text-tertiary font-bold tracking-widest">{t('auth.or')}</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setViewMode('register')}
                        className="w-full flex items-center justify-center gap-3 py-4 bg-transparent border-2 border-accent text-accent rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-accent hover:text-white active:scale-95 transition-all group"
                    >
                        <span>{t('auth.register_btn')}</span>
                    </button>
                </form>
            </div>

            {/* Support Link */}
            <p className="mt-8 text-text-tertiary text-xs uppercase tracking-widest font-bold">
                {t('auth.help_text')} <button onClick={() => setViewMode('help')} className="text-accent hover:underline">{t('auth.documentation_link')}</button>
            </p>
        </div>
    );
};
