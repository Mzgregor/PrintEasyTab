import React, { useState } from 'react';
import { useSongStore } from '../store/useSongStore';
import { Settings, User, Lock, LogOut, Shield, Save, ArrowLeft } from 'lucide-react';

export const SettingsPage: React.FC = () => {
    const { currentUser, logout, setViewMode, changeUserPassword, updateUserDetails, t, language } = useSongStore();
    const [username, setUsername] = useState(currentUser?.username || '');
    const [email, setEmail] = useState(currentUser?.email || '');
    const [isEditingInfo, setIsEditingInfo] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const isAdmin = currentUser?.role === 'admin';

    const handleSaveAllInfo = () => {
        setMessage('');
        setError('');

        if (!username || !email) {
            setError(t('common.fill_all'));
            return;
        }

        if (currentUser) {
            let success = true;

            // Only update if values actually changed
            if (username !== currentUser.username) {
                const userSuccess = updateUserDetails(currentUser.id, { username });
                if (!userSuccess) success = false;
            }

            if (email !== currentUser.email && success) {
                const emailSuccess = updateUserDetails(currentUser.id, { email });
                if (!emailSuccess) success = false;
            }

            if (success) {
                setMessage(t('admin.saved'));
                setIsEditingInfo(false);
            } else {
                setError(t('auth.error_update_failed') || 'Erreur lors de la mise à jour des informations. Le pseudo ou l\'email est peut-être déjà utilisé.');
            }
        }
    };

    const handleCancelEdit = () => {
        setUsername(currentUser?.username || '');
        setEmail(currentUser?.email || '');
        setIsEditingInfo(false);
        setError('');
        setMessage('');
    };

    const handleChangePassword = () => {
        setMessage('');
        setError('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setError(t('common.fill_all'));
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(t('settings.password_error_match'));
            return;
        }

        if (newPassword.length < 6) {
            setError(t('settings.password_error_length'));
            return;
        }

        const success = changeUserPassword(currentPassword, newPassword);
        if (success) {
            setMessage(t('settings.password_success'));
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setError(t('settings.password_error_current'));
        }
    };

    const handleLogout = () => {
        if (confirm(t('settings.logout_confirm'))) {
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
                        <span>{t('settings.back_to_app')}</span>
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-accent/10 rounded-2xl">
                            <Settings size={32} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-wider text-text-primary">
                                {t('settings.title')}
                            </h1>
                            <p className="text-text-secondary font-medium">
                                {t('settings.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* User Info Card */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6 mb-6 overflow-hidden relative">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-6 flex items-center gap-3">
                        <User size={24} className="text-accent" />
                        {t('settings.account_info')}
                    </h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-4 border-b border-border-main/50">
                            <span className="text-text-secondary font-bold uppercase text-xs tracking-widest">{t('settings.username')}</span>
                            {isEditingInfo ? (
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-2 px-4 text-text-primary focus:outline-none focus:border-accent/50 text-sm w-64 shadow-inner"
                                />
                            ) : (
                                <span className="text-text-primary font-black">{currentUser?.username}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-border-main/50">
                            <span className="text-text-secondary font-bold uppercase text-xs tracking-widest">{t('settings.email')}</span>
                            {isEditingInfo ? (
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-2 px-4 text-text-primary focus:outline-none focus:border-accent/50 text-sm w-64 shadow-inner"
                                />
                            ) : (
                                <span className="text-text-primary font-black">{currentUser?.email}</span>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-4 border-b border-border-main/50">
                            <span className="text-text-secondary font-bold uppercase text-xs tracking-widest">{t('settings.role')}</span>
                            <div className="flex items-center gap-2">
                                {isAdmin ? (
                                    <>
                                        <Shield size={14} className="text-accent" />
                                        <span className="text-accent font-black uppercase text-xs tracking-tighter">{t('settings.admin')}</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={14} className="text-text-secondary" />
                                        <span className="text-text-secondary font-black uppercase text-xs tracking-tighter">{t('settings.user')}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-4 mb-4">
                            <span className="text-text-secondary font-bold uppercase text-xs tracking-widest">{t('settings.member_since')}</span>
                            <span className="text-text-primary font-bold">
                                {currentUser?.createdAt && new Date(currentUser.createdAt).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}
                            </span>
                        </div>

                        {/* Control Buttons */}
                        <div className="flex justify-start gap-4 mt-6 pt-6 border-t border-border-main/50">
                            {isEditingInfo ? (
                                <>
                                    <button
                                        onClick={handleSaveAllInfo}
                                        className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-900/20 hover:bg-emerald-500 hover:scale-105 transition-all active:scale-95 animate-in slide-in-from-left-4"
                                    >
                                        <Save size={18} />
                                        <span>Enregistrer</span>
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="px-8 py-3 bg-bg-tertiary border border-border-main text-text-secondary rounded-xl font-black uppercase text-xs tracking-[0.2em] hover:bg-bg-primary hover:text-text-primary transition-all active:scale-95 animate-in slide-in-from-left-2"
                                    >
                                        <span>Annuler</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditingInfo(true)}
                                    className="flex items-center gap-2 px-8 py-3 bg-accent text-white rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-accent/20 hover:bg-accent-light hover:scale-105 transition-all active:scale-95"
                                >
                                    <User size={18} />
                                    <span>Modifier mes informations</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6 mb-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-3">
                        <Lock size={24} className="text-accent" />
                        {t('settings.change_password')}
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
                                {t('settings.current_password')}
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
                                {t('settings.new_password')}
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
                                {t('settings.confirm_password')}
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
                            <span>{t('settings.save_password')}</span>
                        </button>
                    </div>
                </div>

                {/* Admin Section */}
                {isAdmin && (
                    <div className="bg-bg-secondary border border-accent/30 rounded-2xl p-6 mb-6">
                        <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4 flex items-center gap-3">
                            <Shield size={24} className="text-accent" />
                            {t('settings.admin_section')}
                        </h2>
                        <p className="text-text-secondary mb-4">
                            {t('settings.admin_desc')}
                        </p>
                        <button
                            onClick={() => setViewMode('admin')}
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                        >
                            <Shield size={20} />
                            <span>{t('settings.admin_btn')}</span>
                        </button>
                    </div>
                )}

                {/* Logout Section */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6">
                    <h2 className="text-xl font-black uppercase tracking-wider text-text-primary mb-4">
                        {t('settings.logout_title')}
                    </h2>
                    <p className="text-text-secondary mb-4">
                        {t('settings.logout_desc')}
                    </p>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/50 text-red-400 rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-red-500/20 transition-all active:scale-95"
                    >
                        <LogOut size={20} />
                        <span>{t('nav.logout')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
