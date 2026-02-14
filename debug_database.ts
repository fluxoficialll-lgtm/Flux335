import { db } from './src/database';

/**
 * This script is for debugging purposes.
 * It directly inspects the data being returned from the database layer,
 * which is suspected to be the cause of the "e.forEach is not a function" error.
 */
const runDatabaseCheck = () => {
    console.log("=========================================");
    console.log("= Running Database Integrity Check      =");
    console.log("=========================================");

    // --- Check 1: Notifications ---
    console.log("\n[1] Checking 'notifications' table data...");
    try {
        const notificationsData = db.notifications.getAll();
        console.log("  - Data received:", notificationsData);

        if (Array.isArray(notificationsData)) {
            console.log("  - ✅ Check PASSED: Data is a valid array.");
        } else {
            console.log(`  - ❌ Check FAILED: Data is NOT an array. Type: ${typeof notificationsData}`);
        }
    } catch (e: any) {
        console.error("  - 🚨 CRITICAL ERROR while accessing notifications:", e.message);
    }

    // --- Check 2: Chats ---
    console.log("\n[2] Checking 'chats' table data...");
    try {
        const chatsData = db.chats.getAll();
        console.log("  - Data received:", chatsData);

        if (Array.isArray(chatsData)) {
            console.log("  - ✅ Check PASSED: Data is a valid array.");
        } else {
            console.log(`  - ❌ Check FAILED: Data is NOT an array. Type: ${typeof chatsData}`);
        }
    } catch (e: any) {
        console.error("  - 🚨 CRITICAL ERROR while accessing chats:", e.message);
    }

    console.log("\n=========================================");
    console.log("= Check Complete                      =");
    console.log("=========================================");
    console.log("\nTo run this check, use a tool like ts-node:");
    console.log("npx ts-node debug_database.ts\n");
};

runDatabaseCheck();
