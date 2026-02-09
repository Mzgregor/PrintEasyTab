import React, { useState, useEffect } from 'react';
import { useSongStore } from '../store/useSongStore';
import { Users, UserPlus, Trash2, Shield, User as UserIcon, Search, X, Edit2, ArrowLeft } from 'lucide-react';

export const AdminPanel: React.FC = () => {
    const { currentUser, users, loadUsers, createUserAsAdmin, deleteUserById, updateUserRoleById, setViewMode } = useSongStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState<'user' | 'admin'>('user');
    const [error, setError] = useState('');

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddUser = () => {
        setError('');
        if (!newUserEmail || !newUserPassword) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        const result = createUserAsAdmin(newUserEmail, newUserPassword, newUserRole);
        if (result.success) {
            setShowAddUser(false);
            setNewUserEmail('');
            setNewUserPassword('');
            setNewUserRole('user');
        } else {
            setError(result.error || 'Erreur lors de la création');
        }
    };

    const handleDeleteUser = (userId: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            deleteUserById(userId);
        }
    };

    const handleToggleRole = (userId: number, currentRole: 'user' | 'admin') => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        updateUserRoleById(userId, newRole);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Jamais';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

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
                        <span>Retour à l'application</span>
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="p-4 bg-accent/10 rounded-2xl">
                            <Users size={32} className="text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-wider text-text-primary">
                                Panneau d'Administration
                            </h1>
                            <p className="text-text-secondary font-medium">
                                Gestion des utilisateurs et des permissions
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
                                placeholder="Rechercher un utilisateur..."
                                className="w-full bg-bg-tertiary border border-border-main rounded-xl py-3 pl-12 pr-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10"
                            />
                        </div>

                        {/* Add User Button */}
                        <button
                            onClick={() => setShowAddUser(!showAddUser)}
                            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all active:scale-95"
                        >
                            {showAddUser ? <X size={20} /> : <UserPlus size={20} />}
                            <span>{showAddUser ? 'Annuler' : 'Nouvel utilisateur'}</span>
                        </button>
                    </div>

                    {/* Add User Form */}
                    {showAddUser && (
                        <div className="mt-6 pt-6 border-t border-border-main">
                            <h3 className="text-lg font-bold text-text-primary mb-4 uppercase tracking-wider">
                                Créer un nouvel utilisateur
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
                                    placeholder="Email"
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                                />
                                <input
                                    type="password"
                                    value={newUserPassword}
                                    onChange={(e) => setNewUserPassword(e.target.value)}
                                    placeholder="Mot de passe"
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-accent/50"
                                />
                                <select
                                    value={newUserRole}
                                    onChange={(e) => setNewUserRole(e.target.value as 'user' | 'admin')}
                                    className="bg-bg-tertiary border border-border-main rounded-xl py-3 px-4 text-text-primary focus:outline-none focus:border-accent/50"
                                >
                                    <option value="user">Utilisateur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                            <button
                                onClick={handleAddUser}
                                className="w-full md:w-auto px-8 py-3 bg-accent text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-accent-light transition-all"
                            >
                                Créer le compte
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
                                        Utilisateur
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        Rôle
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        Créé le
                                    </th>
                                    <th className="text-left py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        Dernière connexion
                                    </th>
                                    <th className="text-right py-4 px-6 text-text-secondary font-black uppercase text-xs tracking-wider">
                                        Actions
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
                                                        <span className="text-xs text-accent font-bold uppercase">Vous</span>
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
                                                    {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
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
                                                    onClick={() => handleToggleRole(user.id, user.role)}
                                                    disabled={user.id === currentUser?.id}
                                                    className="p-2 hover:bg-accent/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title={user.role === 'admin' ? 'Rétrograder en utilisateur' : 'Promouvoir en admin'}
                                                >
                                                    <Edit2 size={18} className="text-accent" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    disabled={user.id === currentUser?.id}
                                                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Supprimer l'utilisateur"
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
                            <p className="font-bold uppercase tracking-wider">Aucun utilisateur trouvé</p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            Total utilisateurs
                        </div>
                        <div className="text-3xl font-black text-accent">{users.length}</div>
                    </div>
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            Administrateurs
                        </div>
                        <div className="text-3xl font-black text-accent">
                            {users.filter(u => u.role === 'admin').length}
                        </div>
                    </div>
                    <div className="bg-bg-secondary border border-border-main rounded-xl p-6">
                        <div className="text-text-secondary text-sm font-bold uppercase tracking-wider mb-2">
                            Utilisateurs standard
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
