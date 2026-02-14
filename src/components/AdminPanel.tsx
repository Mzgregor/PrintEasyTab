import React, { useState, useEffect } from 'react';
import { useSongStore } from '../store/useSongStore';
import { Users, UserPlus, Trash2, Shield, User as UserIcon, Search, X, Edit2, ArrowLeft, Save, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import type { User, UserRole } from '../types';

export const AdminPanel: React.FC = () => {
    const { currentUser, users, loadUsers, createUserAsAdmin, deleteUserById, updateUserDetails, setViewMode, t, language } = useSongStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
    const [error, setError] = useState('');

    // Detailed Edit State
    const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<{ role: UserRole; isActive: boolean }>({ role: 'user', isActive: true });
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddUser = () => {
        setError('');
        if (!newUserEmail || !newUserPassword) {
            setError(t('common.fill_all'));
            return;
        }

        const username = newUserEmail.split('@')[0];
        const result = createUserAsAdmin(newUserEmail, username, newUserPassword, newUserRole);
        if (result.success) {
            setShowAddUser(false);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('user');
        } else {
            setError(result.error || t('auth.error_register'));
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm(t('admin.confirm_delete'))) {
            deleteUserById(userId);
        }
    };

    const handleEditUser = (user: User) => {
        setSelectedUserForEdit(user);
        setEditForm({
            role: user.role,
            isActive: user.isActive ?? true
        });
        setSaveSuccess(false);
    };

    const handleSaveUser = () => {
        if (!selectedUserForEdit) return;

        setIsSaving(true);
        // Simulate a small delay for better UX
        setTimeout(() => {
            updateUserDetails(selectedUserForEdit.id, {
                role: editForm.role,
                isActive: editForm.isActive
            });
            setIsSaving(false);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        }, 500);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return t('admin.never');
        return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (selectedUserForEdit) {
        return (
            <div className="min-h-screen bg-bg-primary p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <button
                        onClick={() => setSelectedUserForEdit(null)}
                        className="flex items-center gap-2 text-text-secondary hover:text-accent transition-colors mb-8 font-bold uppercase text-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>{t('admin.back_to_list')}</span>
                    </button>

                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-accent/20 rounded-2xl border border-accent/20">
                                <UserIcon size={32} className="text-accent" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black uppercase tracking-tight text-text-primary">
                                    {t('admin.edit_title')}
                                </h1>
                                <p className="text-text-secondary font-mono text-sm">
                                    {selectedUserForEdit.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSaveUser}
                                disabled={isSaving}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${saveSuccess ? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'bg-accent text-white hover:bg-accent-light shadow-lg'}`}
                            >
                                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
                                {isSaving ? t('admin.saving') : saveSuccess ? t('admin.saved') : t('admin.save')}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Info Card */}
                        <div className="bg-bg-secondary border border-border-main rounded-3xl p-8 shadow-sm">
                            <h3 className="text-text-secondary font-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                                <AlertCircle size={14} className="text-accent" /> {t('admin.info_section')}
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">{t('settings.email')}</label>
                                    <div className="p-4 bg-bg-tertiary/50 border border-border-main rounded-xl text-text-secondary font-medium">
                                        {selectedUserForEdit.email}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">ID Utilisateur</label>
                                    <div className="p-4 bg-bg-tertiary/50 border border-border-main rounded-xl text-text-secondary font-mono text-sm leading-none">
                                        #USER-{selectedUserForEdit.id.toString().padStart(4, '0')}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">{t('admin.table.created')}</label>
                                        <div className="p-3 bg-bg-tertiary/50 border border-border-main rounded-xl text-text-secondary text-xs">
                                            {formatDate(selectedUserForEdit.createdAt)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">{t('admin.table.last_login')}</label>
                                        <div className="p-3 bg-bg-tertiary/50 border border-border-main rounded-xl text-text-secondary text-xs">
                                            {formatDate(selectedUserForEdit.lastLogin)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings Card */}
                        <div className="bg-bg-secondary border border-border-main rounded-3xl p-8 shadow-sm">
                            <h3 className="text-text-secondary font-black uppercase text-xs tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Shield size={14} className="text-accent" /> {t('admin.settings_section')}
                            </h3>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-4">Rôle Système</label>
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => setEditForm(prev => ({ ...prev, role: 'user' }))}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${editForm.role === 'user' ? 'border-accent bg-accent/5' : 'border-border-main hover:border-text-tertiary'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${editForm.role === 'user' ? 'bg-accent/20 text-accent' : 'bg-bg-tertiary text-text-tertiary'}`}>
                                                    <UserIcon size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-black uppercase text-xs tracking-wider ${editForm.role === 'user' ? 'text-accent' : 'text-text-secondary'}`}>{t('settings.user')}</div>
                                                    <div className="text-[10px] text-text-tertiary">Accès standard à l'éditeur</div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${editForm.role === 'user' ? 'border-accent' : 'border-text-tertiary'}`}>
                                                {editForm.role === 'user' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setEditForm(prev => ({ ...prev, role: 'admin' }))}
                                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${editForm.role === 'admin' ? 'border-accent bg-accent/5' : 'border-border-main hover:border-text-tertiary'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${editForm.role === 'admin' ? 'bg-accent/20 text-accent' : 'bg-bg-tertiary text-text-tertiary'}`}>
                                                    <Shield size={20} />
                                                </div>
                                                <div className="text-left">
                                                    <div className={`font-black uppercase text-xs tracking-wider ${editForm.role === 'admin' ? 'text-accent' : 'text-text-secondary'}`}>{t('settings.admin')}</div>
                                                    <div className="text-[10px] text-text-tertiary">Contrôle total du système</div>
                                                </div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${editForm.role === 'admin' ? 'border-accent' : 'border-text-tertiary'}`}>
                                                {editForm.role === 'admin' && <div className="w-2.5 h-2.5 rounded-full bg-accent" />}
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-4">{t('admin.status')}</label>
                                    <div className="flex items-center justify-between p-6 bg-bg-tertiary/30 rounded-3xl border border-border-main">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-2xl transition-all ${editForm.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                <CheckCircle size={24} />
                                            </div>
                                            <div>
                                                <div className="font-black uppercase text-xs tracking-wider text-text-primary">
                                                    {editForm.isActive ? t('admin.status_active') : t('admin.status_suspended')}
                                                </div>
                                                <div className="text-[10px] text-text-tertiary">
                                                    {editForm.isActive ? t('admin.status_desc_active') : t('admin.status_desc_suspended')}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setEditForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all focus:outline-none ${editForm.isActive ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-bg-tertiary border-2 border-border-main'}`}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all shadow-md ${editForm.isActive ? 'translate-x-7' : 'translate-x-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary p-8">
            <div className="max-w-6xl mx-auto">
                {/* Logo Section */}
                <div className="w-full flex justify-center mb-8">
                    <img
                        src="/LOGO_1_OMT.png"
                        alt="One More Tab Logo"
                        className="h-32 w-auto object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                    />
                </div>

                {/* Header with Back Button */}
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
                            <Users size={32} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-wider text-text-primary">
                                {t('admin.title')}
                            </h1>
                            <p className="text-text-secondary font-medium">
                                {t('admin.subtitle')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Add User Bar */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl p-6 mb-6">
                    <div className="flex gap-4 flex-wrap">
                        {/* Search */}
                        <div className="flex-1 min-w-[250px] relative">
                            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={t('admin.search_placeholder')}
                                className="w-full bg-bg-tertiary border border-border-main rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>

                        {/* Add User Button */}
                        <button
                            onClick={() => setShowAddUser(!showAddUser)}
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                        >
                            {showAddUser ? <X size={20} /> : <UserPlus size={20} />}
                            <span>{showAddUser ? t('admin.cancel') : t('admin.new_user')}</span>
                        </button>
                    </div>

                    {/* Add User Form ... */}
                    {showAddUser && (
                        <div className="mt-6 pt-6 border-t border-border-main">
                            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase tracking-wider">
                                {t('admin.create_title')}
                            </h3>
                            {error && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-xl p-3 text-red-400 text-sm">
                                    {error}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <input
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                    placeholder={t('settings.email')}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                                />
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    placeholder={t('auth.password_placeholder')}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                                />
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent/50"
                                >
                                    <option value="user">{t('settings.user')}</option>
                                    <option value="admin">{t('settings.admin')}</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddUser}
                                className="w-full md:w-auto px-8 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all"
                            >
                                {t('admin.create_btn')}
                            </button>
                        </div>
                    )}
                </div>

                {/* Users Table */}
                <div className="bg-bg-secondary border border-border-main rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-bg-tertiary border-b border-border-main">
                                <tr>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        {t('admin.table.user')}
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        {t('admin.table.role')}
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        {t('admin.table.created')}
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        {t('admin.table.last_login')}
                                    </th>
                                    <th className="text-right py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        {t('admin.table.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-main">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-bg-tertiary/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-accent/10 rounded-lg">
                                                    <UserIcon size={20} className="text-accent" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary">{user.email}</div>
                                                    {user.id === currentUser?.id && (
                                                        <span className="text-xs text-accent font-bold uppercase">{t('admin.you')}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2">
                                                {user.role === 'admin' ? (
                                                    <Shield size={16} className="text-accent" />
                                                ) : (
                                                    <UserIcon size={16} className="text-text-secondary" />
                                                )}
                                                <span className={`font-bold uppercase text-xs ${user.role === 'admin' ? 'text-accent' : 'text-text-secondary'}`}>
                                                    {user.role === 'admin' ? t('settings.admin') : t('settings.user')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-text-secondary text-sm">
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td className="py-4 px-6 text-text-secondary text-sm">
                                            {formatDate(user.lastLogin)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditUser(user)}
                                                    className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
                                                    title={t('common.modifier')}
                                                >
                                                    <Edit2 size={18} className="text-accent" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={t('common.delete')}
                                                >
                                                    <Trash2 size={18} className="text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredUsers.length === 0 && (
                        <div className="py-12 text-center text-text-secondary">
                            <Users size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="font-bold uppercase tracking-wider">{t('library.empty')}</p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            {t('admin.stats.total')}
                        </div>
                        <div className="text-3xl font-black text-accent">{users.length}</div>
                    </div>
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            {t('admin.stats.admins')}
                        </div>
                        <div className="text-3xl font-black text-accent">
                            {users.filter(u => u.role === 'admin').length}
                        </div>
                    </div>
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            {t('admin.stats.standard')}
                        </div>
                        <div className="text-3xl font-black text-accent">
                            {users.filter(u => u.role === 'user').length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
