/**
 * UTILITY SCRIPT - Activate All Admin Accounts
 * 
 * Run this in the browser console to manually activate all admin accounts
 * 
 * Instructions:
 * 1. Open browser console (F12)
 * 2. Copy and paste this entire script
 * 3. Press Enter
 * 4. Refresh the page
 * 5. Try logging in again
 */

(function activateAllAdminAccounts() {
    const USERS_STORAGE_KEY = 'printeasy_users';

    // Get users from localStorage
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);

    if (!usersData) {
        console.log('❌ No users found in localStorage');
        return;
    }

    const users = JSON.parse(usersData);
    console.log(`📊 Found ${users.length} users in database`);

    // Activate all admin accounts
    let activatedCount = 0;
    users.forEach(user => {
        console.log(`\n👤 User: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.isActive}`);

        if (user.role === 'admin') {
            if (!user.isActive) {
                user.isActive = true;
                user.activationToken = null;
                activatedCount++;
                console.log(`   ✅ ACTIVATED!`);
            } else {
                console.log(`   ✓ Already active`);
            }
        }
    });

    // Save back to localStorage
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    console.log(`\n🎉 Migration complete!`);
    console.log(`   Activated ${activatedCount} admin account(s)`);
    console.log(`\n🔄 Please refresh the page to apply changes`);

    return {
        totalUsers: users.length,
        activatedAdmins: activatedCount,
        users: users.map(u => ({
            email: u.email,
            role: u.role,
            isActive: u.isActive
        }))
    };
})();
