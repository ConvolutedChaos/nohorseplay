try {
    let focusedApp = "finder"; // Default focused app

    var user = prompt("Please enter a user name:");
    var untrimmedUser = user;

    if (user === null || user === "") {
        user = "Timmy Toenails";
    } else {
        user = user.trim();
        if (user.length > 20) {
            user = user.substring(0, 20);
        }
    }

    function getUser() {
        document.getElementById("user1").innerText = user;
    }

    const draggables = document.querySelectorAll('.draggable');
    let offsetX, offsetY, currentDraggable;

    draggables.forEach(draggable => {
        const titleBar = draggable.querySelector('.title-bar');
        titleBar.addEventListener('mousedown', function (e) {
            e.preventDefault();
            currentDraggable = draggable;
            offsetX = e.clientX - currentDraggable.getBoundingClientRect().left;
            offsetY = e.clientY - currentDraggable.getBoundingClientRect().top;

            bringWindowToFront(currentDraggable); // Bring the clicked window to the front

            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDragging);
        });
    });


    function drag(e) {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Get the boundaries of the screen
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;

        // Get the width and height of the draggable element
        const draggableWidth = currentDraggable.offsetWidth;
        const draggableHeight = currentDraggable.offsetHeight;

        // Ensure the window stays within the screen boundaries
        newX = Math.max(0, Math.min(newX, screenWidth - draggableWidth));
        newY = Math.max(0, Math.min(newY, screenHeight - draggableHeight));

        currentDraggable.style.left = newX + 'px';
        currentDraggable.style.top = newY + 'px';
    }


    function stopDragging() {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
    }

    function bringWindowToFront(windowElement) {
        // Bring the clicked window to the front by setting its z-index higher than other windows
        const highestZIndex = Array.from(document.querySelectorAll('.draggable')).reduce((maxZIndex, window) => {
            const zIndex = parseInt(window.style.zIndex || 1);
            return zIndex > maxZIndex ? zIndex : maxZIndex;
        }, 0);

        windowElement.style.zIndex = highestZIndex + 1;
    }

    function openApp(appElementId, hasMenus) {
        var appElement = document.getElementById(appElementId);
        // var appElementPanelIcon = document.getElementById(appElementPanelIconId);

        console.log(appElement);
        // console.log(appElementPanelIcon);

        appElement.style.display = "block";
        // appElementPanelIcon.style.display = "block";
        console.log("Opened the app. Elements made visible: " + appElementId + ".");
        if (hasMenus) {
            updateMenuBar(appElementId);
        }
        bringWindowToFront(appElement);
    }
    function updateMenuBar(appName) {
        const menuItemsContainer = document.getElementById("menu-items");
        menuItemsContainer.innerHTML = ""; // Clear existing menu items

        if (apps[appName]) {
            apps[appName].forEach((menuItem) => {
                const li = document.createElement("li");
                li.innerHTML = menuItem.name;
                li.classList.add("menu-item");

                // Attach the action to the menu item
                if (menuItem.action) {
                    li.onclick = menuItem.action;
                }

                // Check if the menu item has a submenu
                if (menuItem.submenu) {
                    const submenu = document.createElement("ul");
                    submenu.classList.add("submenu");

                    menuItem.submenu.forEach((subItem) => {
                        const subLi = document.createElement("li");
                        subLi.innerHTML = subItem.name;
                        subLi.classList.add("submenu-item");

                        // Attach the action to the submenu item
                        if (subItem.action) {
                            subLi.onclick = subItem.action;
                        }

                        submenu.appendChild(subLi);
                    });

                    li.appendChild(submenu);
                }

                menuItemsContainer.appendChild(li);
                console.log('Updated menu for app: ' + appName)
            });

        } else {
            console.error(`No menu configuration found for app: ${appName}`);
        }
    }

    function focusApp(appName) {
        console.log(`Focusing app: ${appName}`);

        updateMenuBar(appName); // Update the menu bar for the focused app

        console.log("Focused app:", focusedApp);
    }
    function closeApp(appElementId) {
        var appElement = document.getElementById(appElementId);
        // var appElementPanelIcon = document.getElementById(appElementPanelIconId);
        
        console.log(appElement);
        // console.log(appElementPanelIcon);

        appElement.style.display = "none";
        // appElementPanelIcon.style.display = "none";
        updateMenuBar('finder');
        console.log("Closed the app. Elements made visible: " + appElementId + ".");
    }

    function minimizeApp(appElementId) {
        var appElement = document.getElementById(appElementId);

        console.log(appElement);

        appElement.style.display = "none";
        console.log("Minimized the app. Elements made hidden: " + appElementId + ".");

    }

    function unminimizeApp(appElementId) {
        var appElement = document.getElementById(appElementId);

        console.log(appElement);

        appElement.style.display = "block";
        console.log("Unminimized the app. Elements made visible: " + appElementId + ".");

    }

    const apps = {
        finder: [
            {
                name: "<b id='currentAppOpen'>Finder</b>", action: () => console.log("Finder > Finder menu clicked"), submenu: [
                    { name: "About Finder...", action: () => console.log("Finder > About Finder clicked") },
                    { name: "<hr>", action: () => console.log("Finder > Divider clicked") },
                    { name: "Preferences...", action: () => console.log("Finder > Preferences clicked") },
                    { name: "<hr>", action: () => console.log("Finder > Divider clicked") },
                    { name: "Empty Trash...", action: () => console.log("Finder > Empty Trash clicked") },
                    { name: "Secure Empty Trash...", action: () => console.log("Finder > Secure Empty Trash clicked") },

                    { name: "Services", action: () => console.log("Finder > File > Services clicked") },

                    { name: "Hide Finder", action: () => console.log("Finder > Hide Finder clicked") },
                    { name: "Hide Others", action: () => console.log("Finder > Hide Others clicked") },
                    { name: "Show All", action: () => console.log("Finder > Show All clicked") },
                ]
            },
            {
                name: "File", action: () => console.log("Safavri > File menu clicked"), submenu: [
                    { name: "About Finder", action: () => console.log("Finder > About Finder clicked") },
                ]
            },
            {
                name: "Edit", action: () => console.log("Finder > Edit menu clicked"), submenu: [
                    { name: "Undo", action: () => console.log("Finder > Edit > Undo clicked") },
                    { name: "Redo", action: () => console.log("Finder > Edit > Redo clicked") },
                ]
            },
            { name: "View", action: () => console.log("Finder > View menu clicked") },
            { name: "Go", action: () => console.log("Finder > Go menu clicked") },
            { name: "Window", action: () => console.log("Finder > Window menu clicked") },
            { name: "Help", action: () => console.log("Finder > Help menu clicked") },
        ],
        safari: [
            {
                name: "<b id='currentAppOpen'>Safari</b>", action: () => console.log("Safari > Safari menu clicked"), submenu: [
                    { name: "About Safari", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Report Bugs To Apple...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Preferences...", action: () => console.log("Safari > Preferences clicked") },
                    { name: "Block Pop-Up Windows", action: () => console.log("Safari > Preferences clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Private Browsing", action: () => console.log("Safari > Empty Trash clicked") },
                    { name: "Reset Safari...", action: () => console.log("Safari > Secure Empty Trash clicked") },
                    { name: "Empty Cache...", action: () => console.log("Safari > Secure Empty Trash clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Services", action: () => console.log("Finder > File > Services clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Hide Safari", action: () => console.log("Safari > Hide Finder clicked") },
                    { name: "Hide Others", action: () => console.log("Safari > Hide Others clicked") },
                    { name: "Show All", action: () => console.log("Safari > Show All clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Quit Safari", action: () => closeApp("safari") },
                ]
            },
            {
                name: "File", action: () => console.log("Text Editor > File menu clicked"), submenu: [
                    { name: "New Window", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Open File...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Open Location...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Close Window", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Save As...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Mail Contents of This Page", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Mail Link to This Page", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Import Bookmarks...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Export Bookmarks...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Page Setup...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Print...", action: () => console.log("Safari > About Safari clicked") },
                ]
            },
            {
                name: "Edit", action: () => console.log("Text Editor > Edit menu clicked"), submenu: [
                    { name: "Undo", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Redo", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Cut", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Copy", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Paste", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Delete", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Select All", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "AutoFill Form", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Find", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Spelling", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Special Characters...", action: () => console.log("Safari > About Safari clicked") },

                ]
            },
            {
                name: "View", action: () => console.log("Text Editor > View menu clicked"), submenu: [
                    { name: "Hide Address Bar", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Customize Address Bar...", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Hide Bookmarks Bar", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Show Status Bar", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Stop", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Reload Page", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Make Text Bigger", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Make Text Smaller", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "View Source", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Text Encoding", action: () => console.log("Safari > About Safari clicked") },
                ]
            },
            {
                name: "History", action: () => console.log("Text Editor > View menu clicked"), submenu: [
                    { name: "Back", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Forward", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Home", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Mark Page for SnapBack", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Page SnapBack", action: () => console.log("Safari > About Safari clicked") },
                    { name: "Search Results SnapBack", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Dates", action: () => console.log("Safari > About Safari clicked") },
                    { name: "<hr>", action: () => console.log("Safari > Divider clicked") },
                    { name: "Clear History", action: () => console.log("Safari > About Safari clicked") },
                ]
            },
            { name: "Bookmarks", action: () => console.log("Text Editor > View menu clicked") },
            { name: "Window", action: () => console.log("Text Editor > View menu clicked") },
            { name: "Help", action: () => console.log("Text Editor > Help menu clicked") },
        ],
    };



    const dockApps = [
        { name: "Finder", icon: "media/img/FinderIcon_128x128x32.png", appId: "finder", isOpen: true },
        { name: "Dashboard", icon: "media/img/AppIcons/Dashboard.png", appId: "dashboard", isOpen: false },
        { name: "Safari", icon: "media/img/compass_128x128x32.png", appId: "safari", customClick: () => openApp("safari", true), isOpen: false },
        { name: "iChat", icon: "media/img/AppIcons/iChat.png", appId: "ichat", isOpen: false },
        { name: "Address Book", icon: "media/img/AppIcons/AddressBook.png", appId: "addressBook", isOpen: false },
        { name: "iTunes", icon: "media/img/AppIcons/iTunes.png", appId: "itunes", isOpen: false },
        { name: "iCal", icon: "media/img/AppIcons/iCal.png", appId: "ical", isOpen: false },
        { name: "QuickTime Player", icon: "media/img/AppIcons/QuickTime Player.png", appId: "quickTimePlayer", isOpen: false },
        { name: "System Preferences", icon: "media/img/AppIcons/System Preferences.png", appId: "systemPreferences", isOpen: false },
        { name: "Divider", icon: "", appId: "divider" },
        {
            name: "Trash",
            icon: "media/img/TrashIcon_128x128x32.png",
            appId: "trash",
            isOpen: false,
            customClick: () => console.log("Trash clicked! Emptying trash...")
        }
    ];

    function generateDock() {
        const dock = document.getElementById("dock");
        dock.innerHTML = ""; // Clear existing dock items

        dockApps.forEach((app) => {
            if (app.appId === "divider") {
                // Create a divider element
                const divider = document.createElement("div");
                divider.classList.add("dock-divider");
                dock.appendChild(divider);
            } else {
                // Create an app icon container
                const iconContainer = document.createElement("div");
                iconContainer.classList.add("dock-icon-container");

                // Create the app iconupdateMenuBar('finder');
                const img = document.createElement("img");
                img.src = app.icon;
                img.alt = app.name;
                img.classList.add("dock-icon");
                img.dataset.appId = app.appId.trim().toLowerCase(); // Normalize appId


                // Use customClick if defined, otherwise default to toggleAppState
                img.onclick = app.customClick
                    ? () => {
                        console.log(`Custom click for ${app.appId}`);
                        app.customClick();
                    }
                    : () => {
                        console.log(`Default click for ${app.appId}`);
                        toggleAppState(app.appId);
                    };

                iconContainer.appendChild(img);
                dock.appendChild(iconContainer);
            }
        });

        console.log("Generated dock:", dock.innerHTML);
    }


    document.addEventListener("DOMContentLoaded", generateDock);
    document.addEventListener("DOMContentLoaded", () => {
        updateMenuBar("finder");
    });

    getUser();
    
    console.log("hi mom")
} catch (error) {
    console.error(error);
}