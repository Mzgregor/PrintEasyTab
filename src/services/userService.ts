import * as bcrypt from 'bcryptjs';
import type { User, AuthResponse, CreateUserData, UserRole } from '../types';
import { generateActivationToken } from './emailService';

/**
 * Browser-based User Storage using localStorage
 * This replaces the SQLite implementation for browser compatibility
 */

const USERS_STORAGE_KEY = 'printeasy_users';

// Central helper for email normalization
const normalizeEmail = (email: string): string => {
    return email ? email.trim().toLowerCase() : '';
};


// Initialize with default admin user if no users exist
function initializeStorage() {
    const users = getAllUsersFromStorage();

    // Migration: Activate all existing admin accounts that don't have isActive field
    let needsSave = false;
    users.forEach(user => {
        if (user.role === 'admin' && user.isActive === undefined) {
            user.isActive = true;
            user.activationToken = null;
            needsSave = true;
            console.log(`✅ Migration: Activated admin account ${user.email}`);
        } else if (user.isActive === undefined) {
            // For regular users without isActive, set to true for backward compatibility
            user.isActive = true;
            user.activationToken = null;
            needsSave = true;
        }
    });

    if (needsSave) {
        saveUsersToStorage(users);
    }

    if (users.length === 0) {
        const defaultAdminPassword = 'admin123';
        const passwordHash = bcrypt.hashSync(defaultAdminPassword, 10);

        const adminUser = {
            id: 1,
            email: 'admin@printeasy.tab',
            role: 'admin',
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: true,  // Admin is active by default
            activationToken: null
        };

        const usersWithPasswords = [{
            ...adminUser,
            password_hash: passwordHash
        }];

        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersWithPasswords));

        console.log('✅ Default admin user created');
        console.log('   Email: admin@printeasy.tab');
        console.log('   Password: admin123');
        console.log('   ⚠️  Please change this password after first login!');
    }
}

// Initialize on module load
initializeStorage();

// Helper to get all users from storage (with passwords)
function getAllUsersFromStorage(): any[] {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Helper to save users to storage
function saveUsersToStorage(users: any[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Get user by email
export function getUserByEmail(email: string): User | null {
    try {
        const users = getAllUsersFromStorage();
        const normalizedEmail = normalizeEmail(email);
        if (!normalizedEmail) return null;

        const user = users.find(u => normalizeEmail(u.email) === normalizedEmail);
        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive ?? true,
            activationToken: user.activationToken,
            language: user.language,
            theme: user.theme
        };
    } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
    }
}

// Get user by ID
export function getUserById(id: number): User | null {
    try {
        const users = getAllUsersFromStorage();
        const user = users.find(u => u.id === id);
        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive ?? true,
            activationToken: user.activationToken,
            language: user.language,
            theme: user.theme
        };
    } catch (error) {
        console.error('Error getting user by ID:', error);
        return null;
    }
}

// Authenticate user with email and password
export function authenticateUser(email: string, password: string): AuthResponse {
    console.log('Service: authenticateUser started', { email });
    try {
        const users = getAllUsersFromStorage();
        console.log(`Service: Found ${users.length} users in storage`);
        const normalizedEmail = normalizeEmail(email);
        console.log(`Service: Normalized email: [${normalizedEmail}]`);

        if (!normalizedEmail) {
            return { success: false, error: 'Veuillez saisir un email' };
        }

        const user = users.find(u => normalizeEmail(u.email) === normalizedEmail);

        if (!user) {
            console.warn(`Auth failed: User not found [${normalizedEmail}]`);
            return {
                success: false,
                error: 'Email ou mot de passe incorrect'
            };
        }

        // Verify password
        const passwordMatch = bcrypt.compareSync(password, user.password_hash);

        if (!passwordMatch) {
            console.warn(`Auth failed: Password mismatch for [${normalizedEmail}]`);
            return {
                success: false,
                error: 'Email ou mot de passe incorrect'
            };
        }

        // Check if account is active
        // Any account with isActive explicitly set to false is blocked.
        // If isActive is undefined or true, it's allowed.
        const isUserActive = user.isActive !== false;

        if (!isUserActive) {
            console.warn(`Auth failed: Account inactive [${normalizedEmail}]`);
            return {
                success: false,
                error: 'Votre compte n\'est pas encore activé. Veuillez contacter un administrateur.'
            };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        saveUsersToStorage(users);

        const userResponse: User = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive,
            activationToken: user.activationToken,
            language: user.language,
            theme: user.theme
        };

        return {
            success: true,
            user: userResponse
        };
    } catch (error) {
        console.error('Error authenticating user:', error);
        return {
            success: false,
            error: 'Erreur lors de l\'authentification'
        };
    }
}

// Create new user
export function createUser(data: CreateUserData): AuthResponse {
    try {
        const users = getAllUsersFromStorage();
        const normalizedEmail = normalizeEmail(data.email);

        if (!normalizedEmail) {
            return { success: false, error: 'Email invalide' };
        }

        // Check if user already exists
        const existingUser = users.find(u => normalizeEmail(u.email) === normalizedEmail);
        if (existingUser) {
            return {
                success: false,
                error: 'Un compte avec cet email existe déjà'
            };
        }

        // Hash password
        const passwordHash = bcrypt.hashSync(data.password, 10);

        // Generate new ID and activation token
        const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
        const activationToken = generateActivationToken();

        const newUser = {
            id: newId,
            email: normalizedEmail,
            password_hash: passwordHash,
            role: data.role,
            createdAt: new Date().toISOString(),
            lastLogin: null,
            isActive: false,  // New users start inactive
            activationToken: activationToken,
            language: undefined as 'fr' | 'en' | undefined,
            theme: undefined as 'light' | 'dark' | 'midnight' | 'one-more-theme-studio' | undefined
        };

        users.push(newUser);
        saveUsersToStorage(users);

        const userResponse: User = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role as UserRole,
            createdAt: newUser.createdAt,
            lastLogin: newUser.lastLogin,
            isActive: newUser.isActive,
            activationToken: newUser.activationToken,
            language: newUser.language,
            theme: newUser.theme
        };

        return {
            success: true,
            user: userResponse
        };
    } catch (error) {
        console.error('Error creating user:', error);
        return {
            success: false,
            error: 'Erreur lors de la création du compte'
        };
    }
}

// Get all users (admin only)
export function getAllUsers(): User[] {
    try {
        const users = getAllUsersFromStorage();

        return users.map(user => ({
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive ?? true,
            activationToken: user.activationToken,
            language: user.language,
            theme: user.theme
        }));
    } catch (error) {
        console.error('Error getting all users:', error);
        return [];
    }
}

// Update user role
export function updateUserRole(userId: number, newRole: UserRole): boolean {
    return updateUser(userId, { role: newRole });
}

// Update user details (admin only)
export function updateUser(userId: number, updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>): boolean {
    try {
        const users = getAllUsersFromStorage();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return false;

        // If manually activating/deactivating, sync activationToken
        if (updates.isActive === true) {
            updates.activationToken = undefined;
        }

        users[userIndex] = { ...users[userIndex], ...updates };
        saveUsersToStorage(users);
        return true;
    } catch (error) {
        console.error('Error updating user details:', error);
        return false;
    }
}

// Change user password
export function changePassword(userId: number, newPassword: string): boolean {
    try {
        const users = getAllUsersFromStorage();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) return false;

        const passwordHash = bcrypt.hashSync(newPassword, 10);
        users[userIndex].password_hash = passwordHash;
        saveUsersToStorage(users);
        return true;
    } catch (error) {
        console.error('Error changing password:', error);
        return false;
    }
}

// Delete user
export function deleteUser(userId: number): boolean {
    try {
        const users = getAllUsersFromStorage();

        // Prevent deleting the last admin
        const adminCount = users.filter(u => u.role === 'admin').length;
        const user = users.find(u => u.id === userId);

        if (user?.role === 'admin' && adminCount <= 1) {
            console.error('Cannot delete the last admin user');
            return false;
        }

        const filteredUsers = users.filter(u => u.id !== userId);
        saveUsersToStorage(filteredUsers);
        return true;
    } catch (error) {
        console.error('Error deleting user:', error);
        return false;
    }
}

// Check if user is admin
export function isAdmin(userId: number): boolean {
    const user = getUserById(userId);
    return user?.role === 'admin';
}

// Get user by activation token
export function getUserByActivationToken(token: string): User | null {
    try {
        const users = getAllUsersFromStorage();
        const user = users.find(u => u.activationToken === token);
        if (!user) return null;

        return {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: user.isActive,
            activationToken: user.activationToken,
            language: user.language,
            theme: user.theme
        };
    } catch (error) {
        console.error('Error getting user by activation token:', error);
        return null;
    }
}

// Activate user account
export function activateUser(token: string): AuthResponse {
    try {
        const users = getAllUsersFromStorage();
        const userIndex = users.findIndex(u => u.activationToken === token);

        if (userIndex === -1) {
            return {
                success: false,
                error: 'Lien d\'activation invalide ou expiré'
            };
        }

        const user = users[userIndex];

        // Check if already active
        if (user.isActive === true) {
            return {
                success: false,
                error: 'Ce compte est déjà activé'
            };
        }

        // Activate the account
        users[userIndex].isActive = true;
        users[userIndex].activationToken = null;
        saveUsersToStorage(users);

        const userResponse: User = {
            id: user.id,
            email: user.email,
            role: user.role as UserRole,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            isActive: true,
            activationToken: undefined,
            language: user.language,
            theme: user.theme
        };

        console.log(`✅ Compte activé avec succès: ${user.email}`);

        return {
            success: true,
            user: userResponse
        };
    } catch (error) {
        console.error('Error activating user:', error);
        return {
            success: false,
            error: 'Erreur lors de l\'activation du compte'
        };
    }
}
