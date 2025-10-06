(async function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("clearCookies") === "true") {
        console.log("🔥 Clearing cookies, storage, and Unity cache...");

        // 1. Clear cookies
        document.cookie.split(";").forEach(cookie => {
            const eqPos = cookie.indexOf("=");
            const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name.trim() +
                "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
        });

        // 2. Clear local/session storage
        localStorage.clear();
        sessionStorage.clear();

        // 3. Delete Unity WebGL caches
        try {
            // This is where Unity stores downloaded AssetBundles & data
            indexedDB.deleteDatabase('UnityCache');
            indexedDB.deleteDatabase('EM_PRELOAD_CACHE'); // sometimes used
            indexedDB.deleteDatabase('EM_FS'); // Emscripten FS cache
            console.log("✅ Unity IndexedDB caches deleted!");
        } catch (e) {
            console.warn("⚠️ Could not delete IndexedDB caches:", e);
        }

        // 4. Try clearing Service Worker caches (if any)
        if ('caches' in window) {
            const keys = await caches.keys();
            for (const key of keys) {
                await caches.delete(key);
                console.log("Deleted cache:", key);
            }
        }

        alert("Game cache cleared!");
        window.location.href = window.location.pathname; // reload without ?clearCookies=true
    }
})();