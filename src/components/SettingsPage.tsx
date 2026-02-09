import React, { useState } from 'react';
import { useSongStore } from '../store/useSongStore';
import { Settings, User, Lock, LogOut, Shield, Save, ArrowLeft } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { currentUser, logout, setViewMode, changeUserPassword } = useSongStore();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const isAdmin = currentUser?.role === 'admin';

    const handleChangePassword = () => {
        setMessage('');
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return;
        }

        if (newPassword.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        const success = changeUserPassword(currentPassword, newPassword);
        if (success) {
            setMessage('Mot de passe modifié avec succès');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError('Mot de passe actuel incorrect');
        }
    };

    const handleLogout = () => {
        if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            logout();
        }
    };

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-4xl mx-auto">
                {/* Logo Section */}
                <div className="w-full flex justify-center mb-8">
                    <img
                        src="/LOGO_1_OMT.png"
                        alt="One More Tab Logo"
                        className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    />
                </div>

                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => setViewMode('editor')}
                        className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-6 font-bold uppercase text-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Retour à l'application</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-accent/10 rounded-2xl">
                            <Settings size={32} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-wider text-text-primary">
                                Paramètres
                            </h1>
                            <p className="text-text-secondary font-medium">
                                Gérez votre compte et vos préférences
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-3">
                        <User size={24} className="text-accent" />
                        Informations du compte
                    </h2>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-3 border-b border-border-main">
                            <span className="text-text-secondary font-bold uppercase text-sm">Email</span>
                            <span className="text-text-primary font-medium">{currentUser?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border-main">
                            <span className="text-text-secondary font-bold uppercase text-sm">Rôle</span>
                            <div className="flex items-center gap-2">
                                {isAdmin ? (
                                    <>
                                        <Shield size={16} className="text-accent" />
                                        <span className="text-accent font-bold uppercase text-sm">Administrateur</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={16} className="text-text-secondary" />
                                        <span className="text-text-secondary font-bold uppercase text-sm">Utilisateur</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-text-secondary font-bold uppercase text-sm">Membre depuis</span>
                            <span className="text-text-primary font-medium">
                                {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-3">
                        <Lock size={24} className="text-accent" />
                        Changer le mot de passe
                    </h2>

                    {message && (
                        <div className="mb-4 bg-green-500/10 border border-green-500/50 rounded-xl p-3 text-green-400 text-sm font-medium">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-text-secondary font-bold uppercase text-xs mb-2">
                                Mot de passe actuel
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>
                        <div>
                            <label className="block text-text-secondary font-bold uppercase text-xs mb-2">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>
                        <div>
                            <label className="block text-text-secondary font-bold uppercase text-xs mb-2">
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>
                        <button
                            onClick={handleChangePassword}
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                        >
                            <Save size={20} />
                            <span>Enregistrer le nouveau mot de passe</span>
                        </button>
                    </div>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                    <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-3">
                            <Shield size={24} className="text-accent" />
                            Administration
                        </h2>
                        <p className="text-text-secondary mb-4">
                            Accédez au panneau d'administration pour gérer les utilisateurs et les permissions.
                        </p>
                        <button
                            onClick={() => setViewMode('admin')}
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                        >
                            <Shield size={20} />
                            <span>Ouvrir le panneau d'administration</span>
                        </button>
                    </div>
                )}

                {/* Logout Section */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4">
                        Déconnexion
                    </h2>
                    <p className="text-text-secondary mb-4">
                        Déconnectez-vous de votre compte One More Tab.
                    </p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-red-500/20 transition-all active:scale-95"
                    >
                        <LogOut size={20} />
                        <span>Se déconnecter</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
