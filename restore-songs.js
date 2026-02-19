/**
 * SCRIPT DE RESTAURATION DES CHANSONS (V2 - Amélioré)
 * 
 * Instructions :
 * 1. Ouvrez la console (F12)
 * 2. Copiez-collez ce script
 * 3. Appuyez sur Entrée
 */

(function restoreSongsV2() {
    const LIBRARY_KEY = 'print_easy_tab_library';
    const USERS_KEY = 'printeasy_users';

    // 1. Charger les données
    const libraryJson = localStorage.getItem(LIBRARY_KEY);
    const usersJson = localStorage.getItem(USERS_KEY);

    if (!libraryJson) {
        console.error("❌ Aucune bibliothèque de chansons trouvée (Storage vide).");
        return;
    }

    let songs = [];
    try {
        songs = JSON.parse(libraryJson);
    } catch (e) {
        console.error("❌ Erreur de lecture de la bibliothèque (JSON invalide).", e);
        return;
    }

    if (!Array.isArray(songs)) {
        console.error("❌ La bibliothèque n'est pas un tableau valide.");
        return;
    }

    const users = usersJson ? JSON.parse(usersJson) : [];

    console.log(`📊 ANALYSE APPROFONDIE`);
    console.log(`------------------------------`);
    console.log(`Total chansons trouvées en mémoire : ${songs.length}`);

    // Lister les chansons avec leur ID user
    console.log("Détail des chansons :");
    const details = songs.map(s => ({
        Title: s.title || '(Sans titre)',
        Artist: s.artist || '(Inconnu)',
        UserID: s.userId,
        TypeUserID: typeof s.userId
    }));
    console.table(details);

    console.log("\n👤 Utilisateurs disponibles :");
    console.table(users.map(u => ({ id: u.id, email: u.email })));

    // Fonction de récupération forcée
    window.claimSongs = function (targetUserId) {
        const targetIdNum = Number(targetUserId);

        if (isNaN(targetIdNum)) {
            console.error("❌ L'ID doit être un nombre. Exemple : claimSongs(1)");
            return;
        }

        console.log(`🔄 Tentative de déplacement de ${songs.length} chansons vers l'utilisateur ID ${targetIdNum}...`);

        const newSongs = songs.map(s => {
            return {
                ...s,
                userId: targetIdNum, // Force number
                updatedAt: new Date().toISOString()
            };
        });

        localStorage.setItem(LIBRARY_KEY, JSON.stringify(newSongs));
        console.log(`✅ SUCCÈS ! ${newSongs.length} chansons sauvegardées sur l'utilisateur ${targetIdNum}.`);
        console.log("⚠️ IMPORTANT : Rafraichissez la page (F5) maintenant !");
    };

    console.log("\n❓ DIAGNOSTIC :");
    if (songs.length === 0) {
        console.log("❌ Il semble qu'il n'y ait aucune chanson dans la base locale.");
        console.log("   Si vous aviez des onglets ouverts mais non sauvegardés (pas d'icône disquette cliquée), ils ont été perdus au rafraichissement.");
    } else {
        console.log(`✅ ${songs.length} chansons sont récupérables.`);
        console.log("👉 Tapez : claimSongs(1)");
    }

})();
