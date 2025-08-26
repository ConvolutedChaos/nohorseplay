let edogosVersion = "v0.4.1";

let systemPassword = "password";

let systemUsername = "e-dog";

//#region Variables

let doWindowLogging = false;

const startMenu = document.getElementById("startMenu");

const taskbar = document.getElementById("taskbar");

const taskbarHeight = taskbar ? taskbar.offsetHeight : 0;

var wallpaperSuccessMessage = "Wallpaper successfully changed.";

var tipMessage = "Tips:\n\nIf you enter in a web page address and it doesn't work, look at these tips:\n\n1) _'s server IP address could not be found.\nThis means that the page doesn't exist. Try checking your spelling.\n\n2) __ refused to connect.\nThis means that the page exists, however it cannot be viewed in an Iframe, in other words the page cannot be viewed in Bacon Explorer.\nExamples: YouTube, Google, DuckDuckGo, Amazon, Facebook."

var systemSpecs = "Operating System: E-Dog OS " + edogosVersion + "<br>Processor: Intel© Core™ i7-6700K CPU @ 4.00GHz x 4<br>Memory: 31.3 GiB<br>Hard Drives: 250.8 GB<br>Graphics Card: NVIDIA Corporation AD104 [GeForce RTX 4070 SUPER]";

var blankPage = "about:blank"

var globalTime;

var activeProcesses = [
    { name: "EDOGOS", cpu: 2, ram: 1343, protected: true, bypassCamelCase: true, isHidden: false, maxCpu: 100 },
    { name: "DateManager", cpu: 1, ram: 71, protected: false, bypassCamelCase: true, isHidden: false, maxCpu: 5 },
    { name: "WindowManager", cpu: 1, ram: 342, protected: true, bypassCamelCase: true, isHidden: false, maxCpu: 12.6 }
];

var isDateManagerRunning = true;

var isWindowManagerRunning = true;

const wikiLink = `<a onclick="edogBrowser.openWebPage('https://en.wikipedia.org/wiki/Error')" style="cursor:pointer;color:#007bff;text-decoration:underline;">this page</a>`;

const nohorseplayUrl = "https://nohorseplay.com/"

//#endregion


// #region Start Menu

function openStartMenu() {
    if (startMenu.style.display === "block") {
        startMenu.style.display = "none";
    } else {
        startMenu.style.display = "block";
    }
    bringWindowToFront(startMenu);
}

// Function to handle clicks outside the start menu
function handleClickOutside(event) {
    if (startMenu.style.display === "block" && !startMenu.contains(event.target) && event.target !== document.getElementById("startMenuIcon")) {
        startMenu.style.display = "none";
        // Call your function here when clicking outside the start menu
        if (doWindowLogging) {
            console.log("Clicked outside the start menu");
        }
    }
}

function showCategory(category) {
    document.querySelectorAll('.apps').forEach(appList => appList.classList.add('hidden'));
    document.getElementById(category).classList.remove('hidden');
}

function showContent(sectionId) {
    document.querySelectorAll('.main-content > div').forEach(div => div.style.display = 'none');
    document.getElementById(sectionId).style.display = 'block';
}

function toggleContent(sectionId) {
    var content = document.getElementById(sectionId);
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
}

function updateStartMenu() {
    const startMenu = document.getElementById('startMenu');
    const appsContainer = startMenu.querySelector('.apps');
    appsContainer.innerHTML = ''; // Clear existing apps

    for (const appId in availableApps) {
        if (availableApps[appId].installed) {
            const app = availableApps[appId];
            const appElement = document.createElement('div');
            appElement.innerHTML = `<img src="${app.icon}" alt="">${app.name}`;
            appElement.onclick = () => toggleApp(appId, `${appId}Icon`);
            appsContainer.appendChild(appElement);
        }
    }
}

// Event listener to handle clicks on the document
document.addEventListener("click", handleClickOutside);

//#endregion

// #region Window Management

function showWindow(windowElement) {
    if (!isWindowManagerRunning) return;

    if (windowElement.style.display === "block") {
        windowElement.style.display = "none";
        if (doWindowLogging) {
            console.log(windowElement + " has been hidden.");
        }
    }
    else {
        windowElement.style.display = "block";
        if (doWindowLogging) {
            console.log(windowElement + " has been made visible.");
        }
    }
}

function updateTitleBarText(windowId, newText, useHTML) {
    if (!isWindowManagerRunning) return;

    // Ensure windowId is an element
    var windowElement = document.getElementById(windowId);
    if (!windowElement) {
        console.error(`Element with ID "${windowId}" not found.`);
        throwError("Element with ID " + windowId + " not found.");
        return;
    }

    // Find the title bar text element
    var windowTitleText = windowElement.querySelector('.title-bar-text');
    if (!windowTitleText) {
        console.error(`Title bar text element not found in window with ID "${windowId}".`);
        throwError("Title bar text element not found in window with ID " + windowId + ".");
        return;
    }

    // Update the title bar text
    if (useHTML) {
        windowTitleText.innerHTML = newText; // Use innerHTML if useHTML is true
        // remove any existing <br> tags
        windowTitleText.innerHTML = windowTitleText.innerHTML.replace(/<br\s*\/?>/gi, ''); // Remove any existing <br> tags
    } else {
        windowTitleText.textContent = newText; // Use textContent otherwise
    }
}

function SetWindowText(newWindowText) {
    if (!isWindowManagerRunning) return;

    var addressBar = document.getElementById("addressBar");
    addressBar.value = newWindowText;
    baconExplorerTabOpen.innerText = newWindowText;
}

function toggleApp(appElementId, appElementPanelIconId, willBeHiddenInTaskManager) {
    if (!isWindowManagerRunning) return;

    var appElement = document.getElementById(appElementId);
    var appElementPanelIcon = document.getElementById(appElementPanelIconId);

    if (doWindowLogging) {
        console.log(appElement);
        console.log(appElementPanelIcon);
    }

    if (appElement.style.display === "block") {
        // Play close animation
        appElement.classList.remove('window-anim-open');
        appElement.classList.add('window-anim-close');
        appElement.addEventListener('animationend', function handler() {
            appElement.style.display = "none";
            appElementPanelIcon.style.display = "none";
            appElement.classList.remove('window-anim-close');
            appElement.removeEventListener('animationend', handler);
        });
        // Remove from activeProcesses as before...
        activeProcesses = activeProcesses.filter(proc => proc.name !== appElementId);
    } else {
        // Show and play open animation
        appElement.style.display = "block";
        appElementPanelIcon.style.display = "block";
        appElement.classList.remove('window-anim-close');
        appElement.classList.add('window-anim-open');
        appElement.addEventListener('animationend', function handler() {
            appElement.classList.remove('window-anim-open');
            appElement.removeEventListener('animationend', handler);
        });
        bringWindowToFront(appElement);
        if (appElementId === "blockbench") setIframeSrc("blockbenchFrame", "https://web.blockbench.net/")
        if (appElementId === "physicsSimulator") setIframeSrc("physicsIframe", "assets/Physics/old/physics.html");
        if (!activeProcesses.some(proc => proc.name === appElementId)) {
            var ram = Math.floor(Math.random() * 100) + 50;
            var cpu = Math.floor(Math.random() * 10) + 1;
            activeProcesses.push({ name: appElementId, cpu: cpu, ram: ram, protected: false, bypassCamelCase: false, isHidden: willBeHiddenInTaskManager || false });
        }
    }
}

function minimizeApp(appElementId, iconElementId) {
    if (!isWindowManagerRunning) return;

    var appElement = document.getElementById(appElementId);
    var iconElement = document.getElementById(iconElementId);

    if (!iconElement) {
        iconElement = document.getElementById(`${appElementId}Icon`);
    }

    // Get bounding rectangles
    const winRect = appElement.getBoundingClientRect();
    const iconRect = iconElement.getBoundingClientRect();

    // Calculate translation and scale RELATIVE TO THE VIEWPORT
    const scale = 0.1; // Shrink to 10%
    const x = (iconRect.left + iconRect.width / 2) - (winRect.left + winRect.width / 2);
    const y = (iconRect.top + iconRect.height / 2) - (winRect.top + winRect.height / 2);

    // Set CSS variables for animation
    appElement.style.setProperty('--minimize-x', `${x}px`);
    appElement.style.setProperty('--minimize-y', `${y}px`);
    appElement.style.setProperty('--minimize-transform', `scale(${scale})`);

    // Play minimize-to-icon animation
    appElement.classList.remove('window-anim-open', 'window-anim-close', 'window-anim-minimize');
    appElement.classList.add('window-anim-minimize-to-icon');
    appElement.addEventListener('animationend', function handler() {
        appElement.style.display = "none";
        appElement.classList.remove('window-anim-minimize-to-icon');
        appElement.removeEventListener('animationend', handler);
        // Optionally reset transform
        appElement.style.transform = '';
    });

    if (doWindowLogging) {
        console.log("Minimized the app to icon: " + appElementId + ".");
    }
}

function unminimizeApp(appElementId) {
    if (!isWindowManagerRunning) return;

    var appElement = document.getElementById(appElementId);

    appElement.style.display = "block";
    appElement.classList.remove('window-anim-close', 'window-anim-minimize');
    appElement.classList.add('window-anim-open');
    appElement.addEventListener('animationend', function handler() {
        appElement.classList.remove('window-anim-open');
        appElement.removeEventListener('animationend', handler);
    });

    bringWindowToFront(appElement);

    if (doWindowLogging) {
        console.log("Unminimized the app. Elements made visible: " + appElementId + ".");
    }
}

function openApp(appElementId, appElementPanelIconId) {
    if (!isWindowManagerRunning) return;

    var appElement = document.getElementById(appElementId);
    var appElementPanelIcon = document.getElementById(appElementPanelIconId);

    console.log(appElement);
    console.log(appElementPanelIcon);

    appElement.style.display = "block";
    appElementPanelIcon.style.display = "block";
    if (doWindowLogging) {
        console.log("Opened the app. Elements made visible: " + appElementId + ", " + appElementPanelIconId + ".");
    }
    bringWindowToFront(appElement);
}

function throwError(errorContent, useHTML) {
    var errorContainerElement = document.getElementById("errorContainer");
    var maxLength = 55;

    if (errorContainerElement) {
        // use innerHTML if useHTML is true, otherwise use textContent
        if (useHTML) {
            errorContainerElement.innerHTML = errorContent;
        }
        else {
            errorContainerElement.textContent = errorContent;
        }
    } else {
        console.warn("Error container not found.");
        return;
    }

    let slicedErrorTitle = errorContent.length > maxLength
        ? errorContent.slice(0, maxLength - 3) + '...'
        : errorContent;

    updateTitleBarText('error', slicedErrorTitle, useHTML);
    openApp('error', 'errorIcon', true);
}

function promptUser(message, buttons = []) {
    openApp('userPrompt', 'userPromptIcon');
    const promptTextContainer = document.getElementById('promptContent');
    const buttonGroup = document.getElementById('promptButtonGroup');
    if (promptTextContainer) promptTextContainer.innerHTML = message;
    if (buttonGroup) {
        buttonGroup.innerHTML = ''; // Clear previous buttons
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.label;
            button.className = 'promptButton' + (btn.className ? ' ' + btn.className : '');
            button.onclick = btn.onclick;
            buttonGroup.appendChild(button);
        });
    }
}

function crashSystem(errorMessage) {
    var crashScreenElement = document.getElementById("crashScreen");
    crashScreenElement.innerHTML = "A problem has been detected and E-Dog OS has been shut down to prevent damage to your computer.<br><br> " + errorMessage + "<br><br> If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:<br> Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or<br> software manufacturer for any updates you might need. If problems continue, disable or remove any newly installed<br> hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to eat bacon, restart<br> your computer, press F8 to select Advanced Startup Options, and then select Eat Bacon.<br><br> Technical Information:<br><br> *** STOP: 0x000000C1 (0x61AF2FF8, 0xEDCCAEBE, 0xB663BAE9, 0x8E2DF694)<br><br>";
    video.pause();
    toggleApp('crashScreen', 'crashScreen');
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

    // Detect double-click on the title bar
    titleBar.addEventListener('dblclick', function (e) {
        const prevState = {
            left: draggable.style.left,
            top: draggable.style.top,
            width: draggable.style.width,
            height: draggable.style.height,
            isMaximized: draggable.dataset.maximized === "true"
        };
        if (!prevState.isMaximized) {
            draggable.dataset.prevLeft = prevState.left;
            draggable.dataset.prevTop = prevState.top;
            draggable.dataset.prevWidth = prevState.width;
            draggable.dataset.prevHeight = prevState.height;
            draggable.style.left = "0px";
            draggable.style.top = "0px";
            draggable.style.width = window.innerWidth + "px";
            draggable.style.height = (window.innerHeight - taskbarHeight) + "px";
            draggable.dataset.maximized = "true";
        } else {
            draggable.style.left = draggable.dataset.prevLeft || "100px";
            draggable.style.top = draggable.dataset.prevTop || "100px";
            draggable.style.width = draggable.dataset.prevWidth || "600px";
            draggable.style.height = draggable.dataset.prevHeight || "400px";
            draggable.dataset.maximized = "false";
        }
    });

});

function drag(e) {
    if (!isWindowManagerRunning) return;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    // Get the boundaries of the screen
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight - taskbarHeight;

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
    if (!isWindowManagerRunning) return;

    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', stopDragging);
}

function bringWindowToFront(windowElement) {
    if (!isWindowManagerRunning) return;

    // Bring the clicked window to the front by setting its z-index higher than other windows
    const highestZIndex = Array.from(document.querySelectorAll('.draggable')).reduce((maxZIndex, window) => {
        const zIndex = parseInt(window.style.zIndex || 1);
        return zIndex > maxZIndex ? zIndex : maxZIndex;
    }, 0);

    windowElement.style.zIndex = highestZIndex + 1;
}

// For kicks
function openEverySingleApp() {
    if (!isWindowManagerRunning) return;

    Object.keys(availableApps).forEach(appName => {
        if (availableApps[appName].installed) {
            openApp(appName, `${appName}Icon`);
            // add it to the processes array
            if (!activeProcesses.some(proc => proc.name === appName)) {
                var ram = Math.floor(Math.random() * 100) + 50; // Random memory usage between 50 and 150 MB
                var cpu = Math.floor(Math.random() * 10) + 1; // Random CPU usage between 1% and 10%
                activeProcesses.push({ name: appName, cpu: cpu, ram: ram, protected: false, bypassCamelCase: false, isHidden: false });
            }
        }
    });
}

function closeEverySingleApp() {
    if (!isWindowManagerRunning) return;

    Object.keys(availableApps).forEach(appName => {
        // Only try to close apps that are running
        if (activeProcesses.some(proc => proc.name === appName)) {
            toggleApp(appName, `${appName}Icon`); // assuming closeApp is your existing function
            // remove it from the task manager
            activeProcesses = activeProcesses.filter(proc => proc.name !== appName);
        }
    });
}


// #endregion

// #region Date and Time
var clock = document.getElementById('date-div');

function updateDate() {
    if (isDateManagerRunning) {
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
        globalTime = now.toLocaleTimeString();

        // Calculate time until next full second
        const delay = 1000 - (now % 1000);
        setTimeout(updateDate, delay);

        // bacon explorer
        const el = document.getElementById('bacon-explorer-clock');
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `${h}:${m}`;
    }
}

updateDate();

// // Update the hidden span element with the current date and time
// document.getElementById('dateandtime').innerHTML = new Date().toLocaleString('en-US');

//#endregion

// #region Bacon Explorer

const edogBrowser = (() => {
    const tabBar = document.getElementById("edog-tab-bar");
    const urlInput = document.getElementById("edog-browser-url");
    const iframeContainer = document.getElementById("iframe-container");
    const devtools = document.getElementById("edog-devtools");
    const devOutput = document.getElementById("dev-output");
    const newTabStartPageElement = document.getElementById("newTabElement");

    let tabs = [];
    let activeTab = null;
    let tabCounter = 0;

    function sanitizeUrl(input) {
        try {
            const url = new URL(input);
            return url.href;
        } catch {
            return "https://" + input;
        }
    }

    function getFavicon(url) {
        try {
            const u = new URL(url);
            return `${u.origin}/favicon.ico`;
        } catch {
            return "";
        }
    }

    function createTab(initialUrl = "about:blank") {
        const tabId = `tab-${++tabCounter}`;
        const iframe = document.createElement("iframe");
        iframe.id = tabId;
        iframe.src = sanitizeUrl(initialUrl);
        iframe.classList.add("edog-browser-tab");
        iframeContainer.appendChild(iframe);

        const tabButton = document.createElement("button");
        const favicon = document.createElement("img");
        favicon.src = getFavicon(initialUrl);
        favicon.onerror = () => favicon.style.display = "none";

        const titleSpan = document.createElement("span");
        titleSpan.textContent = "Loading...";

        const closeBtn = document.createElement("span");
        closeBtn.innerHTML = "&times;";
        closeBtn.className = "close-btn";
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closeTab(tabId);
        };

        tabButton.appendChild(favicon);
        tabButton.appendChild(titleSpan);
        tabButton.appendChild(closeBtn);
        tabButton.id = `btn-${tabId}`;
        tabButton.onclick = () => setActiveTab(tabId);

        tabBar.insertBefore(tabButton, document.getElementById("edog-new-tab"));

        tabs.push({ id: tabId, iframe, button: tabButton, favicon, titleSpan });
        setActiveTab(tabId);

        if (
            iframe.src === "about:blank" ||
            iframe.src === window.location.origin + "/about:blank" ||
            iframe.src === ""
        ) {
            newTabStartPageElement.style.display = "block";
            iframeContainer.style.display = "none";
        } else {
            newTabStartPageElement.style.display = "none";
            iframeContainer.style.display = "block";
        }

        iframe.onload = () => {
            try {
                if (activeTab === tabId) {
                    urlInput.value = iframe.contentWindow.location.href;
                    console.log(`Iframe with id of ${iframe.id} was navigated.`)
                }

                if (
                    iframe.src !== "about:blank" &&
                    iframe.src !== window.location.origin + "/about:blank" &&
                    iframe.src !== ""
                ) {
                    newTabStartPageElement.style.display = "none";
                    iframeContainer.style.display = "block";
                }

                const title = iframe.contentDocument.querySelector("title").innerText || iframe.src;
                titleSpan.textContent = title;
                favicon.src = getFavicon(iframe.src);
                updatePageInfo();
            } catch (error) {
                // throwError(error);
                titleSpan.textContent = iframe.src;
                updatePageInfo("🔒 Cross-origin — cannot access page details.");
            }
        };
    }

    function setActiveTab(id) {
        activeTab = id;
        tabs.forEach(t => {
            t.iframe.classList.toggle("active", t.id === id);
            t.button.classList.toggle("active", t.id === id);
        });

        const tab = tabs.find(t => t.id === id);
        if (tab) {
            urlInput.value = tab.iframe.src;
            updatePageInfo();

            // Show or hide the new tab start page
            if (
                tab.iframe.src === "about:blank" ||
                tab.iframe.src === window.location.origin + "/about:blank" ||
                tab.iframe.src === "" // fallback
            ) {
                newTabStartPageElement.style.display = "block";
                iframeContainer.style.display = "none";
            } else {
                newTabStartPageElement.style.display = "none";
                iframeContainer.style.display = "block";
            }
        }
    }

    function closeTab(id) {
        const tab = tabs.find(t => t.id === id);
        if (!tab) return;
        tab.iframe.remove();
        tab.button.remove();
        tabs = tabs.filter(t => t.id !== id);

        if (activeTab === id) {
            const nextTab = tabs[tabs.length - 1];
            if (nextTab) {
                setActiveTab(nextTab.id);
            } else {
                activeTab = null;
                urlInput.value = "";
                updatePageInfo("No tab selected.");
            }
        }
    }

    function go() {
        const tab = tabs.find(t => t.id === activeTab);
        if (tab) {
            const url = sanitizeUrl(urlInput.value);

            // Check for image file extensions
            if (url.match(/\.(gif|png)$/i)) {
                // Show the image view, hide iframe and new tab start page
                document.getElementById("browserImageView").style.display = "block";
                iframeContainer.style.display = "none";
                newTabStartPageElement.style.display = "none";
                // Set the image src
                document.querySelector("#browserImageView img").src = url;
                tab.titleSpan.textContent = url.split('/').pop();
                tab.favicon.src = getFavicon(url);
                return;
            }

            // Default behavior for non-image URLs
            document.getElementById("browserImageView").style.display = "none";
            tab.iframe.src = url;
            tab.favicon.src = getFavicon(url);
            tab.titleSpan.textContent = "Loading...";

            // Hide the new tab start page when navigating
            newTabStartPageElement.style.display = "none";
            iframeContainer.style.display = "block";
        }
    }

    function reload() {
        const tab = tabs.find(t => t.id === activeTab);
        if (tab) tab.iframe.src = tab.iframe.src;
    }

    function goBack() {
        const tab = tabs.find(t => t.id === activeTab);
        try {
            tab?.iframe?.contentWindow?.history?.back();
        } catch { }
    }

    function goForward() {
        const tab = tabs.find(t => t.id === activeTab);
        try {
            tab?.iframe?.contentWindow?.history?.forward();
        } catch { }
    }

    function togglePageInfo() {
        devtools.classList.toggle("active");
        updatePageInfo();
    }

    function updatePageInfo(msg) {
        const tab = tabs.find(t => t.id === activeTab);
        if (!tab || msg) {
            devOutput.textContent = msg || "No tab selected.";
            return;
        }

        try {
            const doc = tab.iframe.contentDocument;
            devOutput.textContent = `URL: ${tab.iframe.src}\nTitle: ${doc.title}\nLinks: ${doc.links.length}\nImages: ${doc.images.length}\nLast Modified: ${doc.lastModified}\n`.trim();
        } catch {
            devOutput.textContent = "🔒 Cross-origin — cannot access page details.";
        }
    }

    function openWebPage(url) {
        openApp('baconExplorer', 'baconExplorerIcon');
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        // make a new tab with the given URL
        createTab(url);
    }

    function saveBookmarks(bookmarks) {
        localStorage.setItem("edogBookmarks", JSON.stringify(bookmarks));
    }

    function loadBookmarks() {
        return JSON.parse(localStorage.getItem("edogBookmarks") || "[]");
    }

    function renderBookmarkBar() {
        const bar = document.getElementById("bookmark-bar");
        bar.innerHTML = "";

        const bookmarks = loadBookmarks();

        bookmarks.forEach(({ title, url }, index) => {
            const btn = document.createElement("button");
            btn.textContent = title || url;
            btn.title = `${url} - Right-click to delete`;
            btn.onclick = () => createTab(url);

            // Optional: Right-click to delete
            btn.oncontextmenu = (e) => {
                e.preventDefault();
                if (confirm(`Remove bookmark "${title}"?`)) {
                    bookmarks.splice(index, 1);
                    saveBookmarks(bookmarks);
                    renderBookmarkBar();
                }
            };

            bar.appendChild(btn);
        });

        if (bookmarks.length === 0) {
            const emptyMsg = document.createElement("span");
            emptyMsg.textContent = "No bookmarks yet. Add some!";
            emptyMsg.style.color = "#888";
            emptyMsg.style.marginLeft = "10px";
            emptyMsg.style.fontSize = "1rem"
            bar.appendChild(emptyMsg);
        }
    }

    function addBookmark() {
        const tab = tabs.find(t => t.id === activeTab);
        if (!tab) return;

        const url = tab.iframe.src;
        const title = tab.titleSpan.textContent;

        const bookmarks = loadBookmarks();
        if (bookmarks.some(b => b.url === url)) {
            alert("Already bookmarked!");
            return;
        }

        bookmarks.push({ title, url });
        saveBookmarks(bookmarks);
        renderBookmarkBar();
    }


    document.getElementById("edog-new-tab").onclick = () => createTab();
    urlInput.addEventListener("keydown", e => {
        if (e.key === "Enter") go();
    });

    createTab();

    renderBookmarkBar();

    return { go, reload, goBack, goForward, togglePageInfo, openWebPage, addBookmark };
})();

// #endregion

// #region Background Settings

const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');

imageInput.addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        imagePreview.src = e.target.result;
        document.body.style.backgroundImage = `url(${e.target.result})`;
    }

    reader.readAsDataURL(file);
});

function setWallpaper1() {
    document.body.style.background = "url('/edogos/media/img/wallpaper1.jpg') no-repeat";
    document.body.style.backgroundSize = "cover";
    console.log(wallpaperSuccessMessage);
}

function setWallpaper2() {
    document.body.style.background = "url('/edogos/media/img/wallpaper2.png') no-repeat";
    document.body.style.backgroundSize = "cover";
    console.log(wallpaperSuccessMessage);
}

function setWallpaper3() {
    document.body.style.background = "url('/edogos/media/img/beta-fish-hd.jpg') no-repeat";
    document.body.style.backgroundSize = "cover";
    console.log(wallpaperSuccessMessage);
}

function setWallpaper4() {
    document.body.style.background = "url('/edogos/media/img/post-room.png') no-repeat";
    document.body.style.backgroundSize = "cover";
    console.log(wallpaperSuccessMessage);
}

function setWallpaper5() {
    document.body.style.background = "url('/edogos/media/img/checker.png')";
    console.log(wallpaperSuccessMessage);
}

function setWallpaper6() {

}

// #endregion

//#region Video Player

const video = document.getElementById('edogVideo');
const playPauseBtn = document.getElementById('playPauseBtn');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.getElementById('progressBar');
const fullscreenBtn = document.getElementById('fullscreenBtn');

playPauseBtn.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPauseBtn.textContent = '⏸️';
    } else {
        video.pause();
        playPauseBtn.textContent = '▶️';
    }
});

muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
});

volumeSlider.addEventListener('input', () => {
    video.volume = volumeSlider.value;
    video.muted = video.volume === 0;
    muteBtn.textContent = video.muted ? '🔇' : '🔊';
});

video.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    progressBar.value = percent;
});

progressBar.addEventListener('input', () => {
    const time = (progressBar.value / 100) * video.duration;
    video.currentTime = time;
});

fullscreenBtn.addEventListener('click', () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
        video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
        video.msRequestFullscreen();
    }
});

//#endregion

//#region Calculator
function appendToDisplay(value) {
    document.getElementById('display').value += value;
}

function clearDisplay() {
    document.getElementById('display').value = '';
}

function calculateResult() {
    try {
        let expression = document.getElementById('display').value;
        document.getElementById('display').value = math.evaluate(expression); // Safe evaluation
    } catch {
        crashSystem('INVALID_CALC_EXPRESSION');
    }
}

//#endregion

//#region File Explorer
const folders = {
    "Home": [{ name: "Desktop", icon: "media/img/user-desktop.png", type: "folder" }, { name: "Documents", icon: "media/img/folder-documents.png", type: "folder" }, { name: "Downloads", icon: "media/img/folder-download.png", type: "folder" }, { name: "Music", icon: "media/img/folder-music.png", type: "folder" }, { name: "Pictures", icon: "media/img/folder-pictures.png", type: "folder" }, { name: "Videos", icon: "media/img/folder-videos.png", type: "folder" }],
    "Documents": [{ name: "Reports", icon: "media/img/filetypes/text-x-generic.png", type: "file" }, { name: "Notes", icon: "media/img/filetypes/text-x-generic.png", type: "file" }, { name: "Projects", icon: "media/img/filetypes/text-x-generic.png", type: "file" }],
    "Downloads": [{ name: "File1.zip", icon: "media/img/filetypes/package-x-generic.png", type: "file" }, { name: "Setup.exe", icon: "media/img/filetypes/application-x-executable.png", type: "file" }],
    "Pictures": [{ name: "Image1.png", icon: "media/img/filetypes/image-x-generic.png", type: "file" }, { name: "Photo.jpg", icon: "media/img/filetypes/image-x-generic.png", type: "file" }],
    "Music": [{ name: "Song1.mp3", icon: "media/img/filetypes/audio-x-generic.png", type: "file" }, { name: "Song2.mp3", icon: "media/img/filetypes/audio-x-generic.png", type: "file" }],
    "Videos": [{ name: "raisins.mp4", icon: "media/img/raisins-mp4-thumb.png", type: "file" }, { name: "Clip.avi", icon: "media/img/filetypes/video-x-generic.png", type: "file" }]
};

let history = [];
let historyIndex = -1;

function openFolder(folderName) {
    var fileExplorerTitleText = document.getElementById("fileExplorerTitleBarText");
    fileExplorerTitleText.innerText = folderName;
    if (historyIndex === -1 || history[historyIndex] !== folderName) {
        history = history.slice(0, historyIndex + 1);
        history.push(folderName);
        historyIndex++;
    }

    const panel = document.getElementById("mainPanel");
    panel.innerHTML = "";

    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.toggle("active", li.textContent === folderName);
    });

    if (folders[folderName]) {
        folders[folderName].forEach(item => {
            const div = document.createElement("div");
            div.classList.add("item");
            div.innerHTML = `<img src='${item.icon}' alt='folder'><br>${item.name}`;
            div.ondblclick = () => {
                if (item.type === "folder") {
                    openFolder(item.name);
                } else {
                    openFile(item.name);
                }
            };
            panel.appendChild(div);
        });
        document.getElementById("fileCount").textContent = folders[folderName].length + " items";
    }
}

function openFile(fileName) {
    console.log("Attempting to open file:" + fileName + "...");
    if (fileName === "raisins.mp4") {
        openMediaFile('../img/vids/funy/raisins.mp4');
    }
}

function goBack() {
    if (historyIndex > 0) {
        historyIndex--;
        openFolder(history[historyIndex]);
    }
}

function goForward() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        openFolder(history[historyIndex]);
    }
}

function updateZoom(value) {
    document.querySelectorAll(".item img").forEach(img => {
        img.style.width = value + "px";
        img.style.height = value + "px";
    });
}

openFolder("Home"); // Load Home by default

//#endregion

//#region Terminal
function sendCommand(command) {
    if (command !== "") {
        console.log(command);
    }
    parseCommand(command);
    // No need to reset the input field with the prefix here
}

function scrollToBottom() {
    const output = document.getElementById('output');
    output.scrollTop = output.scrollHeight;
}

function parseCommand(commandToParse) {
    var command = commandToParse;
    var output = document.getElementById('output');
    var appToOpen = command.replace("open ", ""); // Extract the app name from the command
    var phraseToEcho = command.replace("echo ", ""); // Extract the the phrase to echo from the command
    output.innerHTML += prefixHTML + commandToParse + "<br>";
    switch (command) {
        case "help":
            // hi mom
            output.innerHTML += "Available commands: help, clear, date, time, echo, exit, close, crash, throwError('error'), wallpaper, tips, about, open, install, console.log('message')";
            break;
        case "clear":
            console.clear();
            output.innerHTML = ''; // Clear the output element
            break;
        case "date":
            output.innerHTML += new Date().toLocaleDateString() + "<br>";
            break;
        case "time":
            output.innerHTML += new Date().toLocaleTimeString() + "<br>";
            break;
        case "echo":
            output.innerHTML += commandToParse.replace("echo ", "") + "<br>";
            break;
        case "exit":
            output.innerHTML += "Exiting terminal shell...<br>";
            toggleApp('terminal', 'terminalIcon');
            break;
        case "close":
            output.innerHTML += "Close what?<br>";
            break;
        case "crash":
            crashSystem("FORCED_CRASH");
            break;
        case "wallpaper":
            setWallpaper1();
            break;
        case "tips":
            output.innerHTML += tipMessage.replace(/\n/g, "<br>") + "<br>";
            break;
        case "":
            break;
        case "about":
            output.innerHTML += systemSpecs + "<br>";
            break;
        default:
            if (command.startsWith("open ")) {
                if (availableApps[appToOpen] && availableApps[appToOpen].installed) {
                    toggleApp(appToOpen, `${appToOpen}Icon`);
                    output.innerHTML += `Opened ${availableApps[appToOpen].name}<br>`;
                } else {
                    output.innerHTML += `App not found or not installed: ${appToOpen}<br>`;
                }
            } else if (command.startsWith("install ")) {
                var appToInstall = command.replace("install ", "");
                if (availableApps[appToInstall]) {
                    installApp(appToInstall);
                    output.innerHTML += `Installed ${availableApps[appToInstall].name}<br>`;
                } else {
                    output.innerHTML += `App not found: ${appToInstall}<br>`;
                }
            } else if (command.startsWith("echo ")) {
                output.innerHTML += phraseToEcho + "<br>";
            } else if (command.startsWith("console.log(\'") && command.endsWith("\')")) {
                command.startsWith("console.log(\'") && command.endsWith("\')");
                var message = command.replace("console.log(\'", "").replace("\')", "");
                if (message !== "") {
                    console.log(message);
                }
                output.innerHTML += `Logged message: ${message}<br>`;
            } else if (command.startsWith("throwError(\'") && command.endsWith("\')")) {
                command.startsWith("throwError(\'") && command.endsWith("\')");
                var threwError = command.replace("throwError(\'", "").replace("\')", "");
                if (threwError !== "") {
                    throwError(threwError);
                    updateTitleBarText('error', threwError);
                }
                output.innerHTML += `Threw error: ${threwError}<br>`;
            } else {
                output.innerHTML += "Invalid command.<br>";
            }
    }
    scrollToBottom();
}

//#endregion

// #region Terminal Shell

const prefixHTML = '<span id="prefix"><span class="user">edog</span>@<span class="host">edog-OS</span>:~$&nbsp;</span>';
// e-dog@edog-OS:~$ '
const prefixText = '';

function handleInput(event) {
    const inputField = document.getElementById('terminalShell');
    const prefix = prefixText;

    // Prevent the user from deleting the prefix
    if (inputField.selectionStart < prefix.length && (event.key === 'Backspace' || event.key === 'Delete')) {
        event.preventDefault();
    }

    // Handle the Enter key to process the command
    if (event.key === 'Enter') {
        const command = inputField.value.slice(prefix.length); // Extract the command after the prefix
        sendCommand(command);
        inputField.value = prefix; // Reset the input field with the prefix
    }
}


//#endregion

// #region App Store

// Wait, what? You thought you could just install apps from the App Store? No, you have to do it manually. Just kidding, this is the app store. You can install apps from here.
// Why are there two of the exact same function? Maybe I was trying to make it look like the app store is a real app? Or maybe I just forgot to remove one of them. Who knows? Anyway, here's the function that populates the app store with available apps.
// This function populates the app store with available apps, allowing users to install or uninstall them
// K, Ill just comment out the first one, since it was a mistake and I forgot to remove it
// There we go
// i need to make the app store better
// function populateAppStore() {
//     const availableAppsContainer = document.getElementById('availableAppsContainer');
//     availableAppsContainer.innerHTML = ''; // Clear existing apps

//     for (const appId in availableApps) {
//         const app = availableApps[appId];
//         const appElement = document.createElement('div');
//         appElement.classList.add('app');
//         appElement.innerHTML = `
//             <img src="${app.icon}" alt="${app.name}">
//             <span>${app.name}</span>
//             <button onclick="installApp('${appId}')">Install</button>
//         `;
//         availableAppsContainer.appendChild(appElement);
//     }
// }

function populateAppStore() {
    const availableAppsContainer = document.getElementById('availableAppsContainer');
    availableAppsContainer.innerHTML = ''; // Clear existing apps

    for (const appId in availableApps) {
        const app = availableApps[appId];
        const appElement = document.createElement('div');
        appElement.classList.add('app');
        appElement.classList.add('dropShadow');
        const buttonLabel = app.installed ? 'Uninstall' : 'Install';
        const buttonAction = app.installed ? `uninstallApp('${appId}')` : `installApp('${appId}')`;

        // Add Open button if installed
        let openButton = '';
        if (app.installed) {
            openButton = `<button onclick="openApp('${appId}', '${appId}Icon')">Open</button>`;
        }

        appElement.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>${app.name}</span>
            <p>${app.description}</p>
            <div class="app-buttons">
                <button onclick="${buttonAction}">${buttonLabel}</button>
                ${openButton}
            </div>
        `;
        availableAppsContainer.appendChild(appElement);
    }
}

const availableApps = {
    "aboutEdogos": {
        name: "About E-Dog OS",
        icon: "media/img/software-properties.png",
        description: "Look at system information.",
        installed: true
    },
    "appStore": {
        name: "App Store",
        icon: "media/img/system-software-install.png",
        description: "Install and manage applications.<br> You probly have it open right now.",
        installed: true // App Store is installed by default
    },
    "backgroundSettings": {
        name: "Background Settings",
        icon: "media/img/system-settings-backgrounds.png",
        description: "Personalize your desktop background.",
        installed: true
    },
    "baconExplorer": {
        name: "Bacon Explorer",
        icon: "media/img/internet-web-browser.png",
        description: "Explore the internet.",
        installed: true
    },
    "blockbench": {
        name: "Blockbench",
        icon: "media/img/blockbench.png",
        description: "Create 3D models.",
        installed: false
    },
    "calculator": {
        name: "Calculator",
        icon: "media/img/accessories-calculator.png",
        description: "Do maths. Useful for cheating on tests.",
        installed: true
    },
    "camera": {
        name: "Camera",
        icon: "media/img/accessories-camera.png",
        description: "Take pictures, i think",
        installed: true
    },
    "debugTools": {
        name: "Debug Tools",
        icon: "media/img/passwords.png",
        description: "Please don't drag the computer<br>icon into the recycle bin.",
        installed: true
    },
    "detailedSystemInfo": {
        name: "Detailed System Info",
        icon: "media/img/software-properties.png",
        description: "Like About E-Dog OS, but more detailed.",
        installed: true
    },
    "dialUp": {
        name: "Dial Up",
        icon: "media/img/telephone.png",
        description: "Connect to the internet using<br>a dial-up modem. Wait, what?",
        installed: true
    },
    "drawingProgram": {
        name: "Drawing",
        icon: "media/img/drawing.png",
        description: "Draw stuff",
        installed: true
    },
    "fileExplorer": {
        name: "File Explorer",
        icon: "media/img/folder.png",
        description: "Manage files and folders.",
        installed: true
    },
    "fontSettings": {
        name: "Font Settings",
        icon: "media/img/preferences-desktop-font.png",
        description: "Manage the fonts that E-Dog OS uses.",
        installed: true
    },
    "mediaPlayer": {
        name: "Media Player",
        icon: "media/img/media-player.png",
        description: "Watch videos and listen to music.",
        installed: true
    },
    "physicsSimulator": {
        name: "Physics Simulator",
        icon: "media/img/media-player.png",
        description: "Throw stuff around and watch it fall.<br>Like in real life, but worse.",
        installed: true
    },
    "systemSettings": {
        name: "System Settings",
        icon: "media/img/settings.png",
        description: "Configure system settings and preferences.",
        installed: true
    },
    "taskManager": {
        name: "Task Manager",
        icon: "media/img/utilities-system-monitor.png",
        description: "Manage running applications and processes.",
        installed: true
    },
    "terminal": {
        name: "Terminal",
        icon: "media/img/utilities-terminal.png",
        description: "Use the command line interface.",
        installed: true // Terminal is installed by default
    },
    "textEditor": {
        name: "Text Editor",
        icon: "media/img/accessories-text-editor.png",
        description: "Edit text files.<br>Like Notepad, but worse.",
        installed: true // Terminal is installed by default
    },
    "virtualMachines": {
        name: "Virtual Machines",
        icon: "media/img/computer.png",
        description: "Run other OSes inside E-Dog OS!<br> Or just run E-Dog OS inside E-Dog OS inside ...",
        installed: true // Terminal is installed by default
    },
    "weather": {
        name: "Weather",
        icon: "media/img/gnome-weather.png",
        description: "Is it going to rain?<br>Is it going to be sunny?<br>Find out here.",
        installed: true
    }
};

function installApp(appId) {
    if (availableApps[appId]) {
        availableApps[appId].installed = true;
        updateStartMenu();
        populateAppStore(); // Update the app store to reflect the new installation status
        console.log(`${availableApps[appId].name} installed.`);
    } else {
        console.log(`App ${appId} not found.`);
    }
}

function uninstallApp(appId) {
    if (availableApps[appId]) {
        availableApps[appId].installed = false;
        updateStartMenu();
        populateAppStore(); // Update the app store to reflect the new installation status
        console.log(`${availableApps[appId].name} uninstalled.`);
    } else {
        console.log(`App ${appId} not found.`);
    }
}

// #endregion

document.addEventListener("DOMContentLoaded", function () {
    updateStartMenu();
    populateAppStore();
    const inputField = document.getElementById('terminalShell');
    inputField.value = prefixText;
    inputField.focus(); // Set focus to the input field when the page loads
});

// #region Text Editor

function saveText() {
    const text = document.getElementById('textEditorArea').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const anchor = document.createElement('a');
    var fileName = prompt("Enter a name: (Extension will be added)", "document");
    if (fileName == null || fileName == "") {
        fileName = "document.txt";
    }
    anchor.download = fileName + '.txt';
    anchor.href = window.URL.createObjectURL(blob);
    anchor.target = '_blank';
    anchor.style.display = 'none'; // Ensure the anchor is not visible
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
}

function loadText() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'text/plain';
    input.onchange = function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('textEditorArea').value = e.target.result;
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

function clearText() {
    document.getElementById('textEditorArea').value = '';
}

// #endregion

// #region Dial Up
function dialUp() {
    var dialUpStatus = document.getElementById("dialUpStatus");
    dialUpStatus.play();
}

function stopDialUp() {
    var dialUpStatus = document.getElementById("dialUpStatus");
    dialUpStatus.pause();
    dialUpStatus.currentTime = 0;
}
// #endregion

// #region Camera

let webcamStream;

function startWebcam() {
    const video = document.getElementById('webcam');

    // Request access to the webcam
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            webcamStream = stream;
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error('Error accessing webcam:', error);
            throwError('Error accessing webcam: ' + error);
            updateTitleBarText('error', error);
        });
}

function stopWebcam() {
    if (webcamStream) {
        // Stop all video tracks
        webcamStream.getTracks().forEach((track) => track.stop());
        webcamStream = null;
    }
}

function takePicture() {
    const video = document.getElementById('webcam');
    const canvas = document.getElementById('snapshotCanvas');
    const capturedImage = document.getElementById('capturedImage');

    // Set canvas dimensions to match the video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the current video frame onto the canvas
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert the canvas to a data URL and display it in the img element
    const imageData = canvas.toDataURL('image/png');
    capturedImage.src = imageData;
    capturedImage.style.display = 'block';
}

function updateTime() {
    const timeElement = document.getElementById("weatherTime");
    if (timeElement) {
        const now = new Date();
        const options = { hour: '2-digit', minute: '2-digit' };
        timeElement.textContent = now.toLocaleTimeString('en-US', options);
    }
}

//#endregion

// #region Virtual Machines
function startVm(vmIframe, vmUrl) {
    try {
        var vm = document.getElementById(vmIframe);
        vm.src = vmUrl;
    } catch (err) {
        throwError(err);
    }
}

function stopVm(vmIframe) {
    try {
        var vm = document.getElementById(vmIframe);
        vm.src = blankPage;
    } catch (err) {
        throwError(err);
    }
}

function makeDraggable(element) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    const titleBar = element.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - element.getBoundingClientRect().left;
        offsetY = e.clientY - element.getBoundingClientRect().top;

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    });

    function drag(e) {
        if (!isDragging) return;
        element.style.left = `${e.clientX - offsetX}px`;
        element.style.top = `${e.clientY - offsetY}px`;
    }

    function stopDragging() {
        isDragging = false;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
    }
}

function spawnWindow(windowTitle, windowContent, windowWidth, windowHeight, isResizable) {
    if (windowWidth == null || windowHeight == null) {
        throwError("Window loading failed! Please specify the window width or height.")
        return;
    }

    try {
        // Create the window container
        const windowElement = document.createElement('div');

        if (isResizable) {
            windowElement.classList.add('draggable', 'dropShadow', 'resizeable');
        }
        else {
            windowElement.classList.add('draggable', 'dropShadow');
        }

        windowElement.style.position = 'absolute';
        windowElement.style.top = '100px';
        windowElement.style.left = '100px';
        windowElement.style.width = windowWidth + 'px';
        windowElement.style.height = windowHeight + 'px';
        windowElement.style.margin = '0px';
        windowElement.style.padding = '0px';
        windowElement.style.backgroundColor = '#ffffff';
        windowElement.style.border = '1px solid #000000';
        windowElement.style.borderRadius = '5px';
        windowElement.style.textAlign = 'center';
        windowElement.style.overflow = 'hidden';

        // Create the title bar
        const titleBar = document.createElement('div');
        titleBar.classList.add('title-bar');
        titleBar.style.backgroundColor = '#404040';
        titleBar.style.color = '#ffffff';
        titleBar.style.width = '100%';
        titleBar.style.height = '56px'
        titleBar.style.cursor = 'move';
        titleBar.onclick = () => {
            bringWindowToFront(windowElement)
        };

        // Add the title text
        const titleText = document.createElement('span');
        titleText.classList.add('title-bar-text');
        titleText.innerHTML = '<br>' + windowTitle;


        // Add the close button
        const closeButton = document.createElement('button');
        closeButton.classList.add('window-close-button');
        closeButton.textContent = '×';
        closeButton.style.backgroundColor = '#833939';
        closeButton.style.border = '1px solid #000000';
        closeButton.style.color = '#fff';
        closeButton.style.fontSize = '25px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '0px';
        closeButton.style.right = '0px';
        closeButton.addEventListener('mouseover', () => {
            closeButton.style.backgroundColor = '#ff0000'; // Change background color on hover
        });
        closeButton.addEventListener('mouseout', () => {
            closeButton.style.backgroundColor = '#833939'; // Reset background color
        });

        closeButton.onclick = () => {
            document.body.removeChild(windowElement); // Remove the window when closed
        };

        // Append title text and close button to the title bar
        titleBar.appendChild(titleText);
        titleBar.appendChild(closeButton);


        // Create the content area
        const contentArea = document.createElement('div');
        contentArea.classList.add('window-content');
        contentArea.style.padding = '10px';
        contentArea.style.overflow = 'auto';
        contentArea.innerHTML = windowContent;

        // Append the title bar and content area to the window
        windowElement.appendChild(titleBar);
        windowElement.appendChild(contentArea);

        // Append the window to the body
        document.body.appendChild(windowElement);

        // Make the window draggable
        makeDraggable(windowElement);


        bringWindowToFront(windowElement)

    } catch (err) {
        throwError("Error creating a window: " + err)
    }
}

//#endregion

// #region Weather
try {
    // This is a really big number
    // Oh wait it says infinity
    var reallyBigNumber = Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER * Number.MAX_SAFE_INTEGER;

    // Scratch that, this is a really big number
    var reallyBigNumber = Number.MAX_SAFE_INTEGER - 1;

    var reallyBigNumberString = reallyBigNumber.toString();
    document.getElementById("lowestTemp").innerText = reallyBigNumber;
} catch (err) {
    throwError('Error! I think it\'s hot outside. error:' + err);
    updateTitleBarText('error', err);
}

// #endregion

//#region Task Manager

// const fakeProcesses = [
//     { name: "BarkSynth.exe", cpu: 5, ram: 120, protected: false },
//     { name: "PawPaint", cpu: 12, ram: 80, protected: false },
//     { name: "SnackLocator", cpu: 2, ram: 30, protected: false },
//     { name: "E-DogOS Kernel", cpu: 17, ram: 300, protected: false },
//     { name: "EDOGOS", cpu: 10, ram: 200, protected: true },
// ];

function renderTaskList() {
    const list = document.getElementById("task-list");
    list.innerHTML = "";
    if (activeProcesses.length === 0) {
        list.innerHTML = "<tr><td colspan='5'>No running processes.</td></tr>";
        return;
    }
    activeProcesses.forEach((proc, index) => {
        if (proc.isHidden) return; // Skip hidden processes

        const row = document.createElement("tr");

        row.innerHTML = `
        <td>${(proc.bypassCamelCase) ? proc.name : camelToTitle(proc.name)}</td>
        <td>${proc.cpu}%</td>
        <td>${proc.ram} MB</td>
        <td><button class="end-task-btn" onclick="endTask(${index})">End Task</button></td>
        `;
        list.appendChild(row);
    });
}

function endTask(index) {
    const proc = activeProcesses[index];
    if (proc.protected) {
        throwError(`Cannot terminate ${(proc.bypassCamelCase) ? proc.name : camelToTitle(proc.name)}. It is a protected process.`);
        return;
    }
    if (availableApps[proc.name]) {
        toggleApp(proc.name, `${proc.name}Icon`);
    } else {
        console.log(`"${(proc.bypassCamelCase) ? proc.name : camelToTitle(proc.name)}" terminated. It was not an installed app, so nothing probably happened.`);
    }
    if (proc.name === "DateManager") {
        isDateManagerRunning = false;
    }
    if (proc.name === "WindowManager") {
        isWindowManagerRunning = false;
    }
    activeProcesses.splice(index, 1);
    console.log(`"${(proc.bypassCamelCase) ? proc.name : camelToTitle(proc.name)}" terminated.`);
    renderTaskList();
}

renderTaskList();

const cpuCanvas = document.getElementById("cpuGraph");
const ramCanvas = document.getElementById("ramGraph");

const width = cpuCanvas.width;
const height = cpuCanvas.height;

const cpuCtx = cpuCanvas.getContext("2d");
const ramCtx = ramCanvas.getContext("2d");

const graphWidth = cpuCanvas.width;
const graphHeight = cpuCanvas.height;
const stretchFactor = 2;
const maxPoints = Math.floor(graphWidth / stretchFactor);

let cpuData = [];
let ramData = [];

let smoothedCpuLoad = 0;


// Max RAM value for scaling (fake)
const MAX_RAM = 1024;

function drawGraph(ctx, data, maxVal, color) {
    ctx.clearRect(0, 0, graphWidth, graphHeight);

    // Grid lines
    ctx.strokeStyle = "#222";
    ctx.beginPath();
    for (let y = 0; y <= height; y += 20) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = color;

    data.forEach((val, i) => {
        const x = (i / (maxPoints - 1)) * graphWidth;
        const y = graphHeight - (val / maxVal) * graphHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });

    ctx.stroke();
}

function updateGraphData() {
    const totalCpu = activeProcesses.reduce((a, b) => a + b.cpu, 0);
    const totalRam = activeProcesses.reduce((a, b) => a + b.ram, 0);

    cpuData.push(totalCpu);
    ramData.push(totalRam);

    if (cpuData.length > maxPoints) cpuData.shift();
    if (ramData.length > maxPoints) ramData.shift();
}

function randomizeCpuUsage() {
    const targetLoad = Math.pow(Math.random(), 2) * 100; // biased toward lower values

    // Smoothly interpolate between previous and new value
    const smoothingFactor = 0.2; // smaller = smoother
    smoothedCpuLoad = smoothedCpuLoad + (targetLoad - smoothedCpuLoad) * smoothingFactor;

    const efforts = activeProcesses.map(() => Math.random());
    const totalEffort = efforts.reduce((a, b) => a + b, 0);

    activeProcesses.forEach((proc, i) => {
        const share = efforts[i] / totalEffort;
        let cpuValue = +(share * smoothedCpuLoad).toFixed(1);
        // Cap CPU usage to maxCpu if defined
        if (typeof proc.maxCpu === "number") {
            cpuValue = Math.min(cpuValue, proc.maxCpu);
        }
        proc.cpu = cpuValue;
    });
}

// Optional: Randomly wiggle CPU usage every few seconds
setInterval(() => {
    randomizeCpuUsage();
}, 100);

setInterval(() => {
    renderTaskList();
}, 1000);

// update the graph every second
setInterval(() => {
    updateGraphData();
    drawGraph(cpuCtx, cpuData, 100, "lime");
    drawGraph(ramCtx, ramData, MAX_RAM, "aqua");
}, 100);

//#endregion

// #region Drawing Program
const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");

let painting = false;
let paintHistory = [];
let redoStack = [];

function saveState() {
    if (paintHistory.length > 50) paintHistory.shift();
    paintHistory.push(canvas.toDataURL());
    redoStack = [];
}

function restoreState(state) {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = state;
}

function startPos(e) {
    painting = true;
    draw(e);
    saveState();
}

function endPos() {
    painting = false;
    ctx.beginPath();
}

function draw(e) {
    if (!painting) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.strokeStyle = colorPicker.value;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

// File actions
window.save = () => {
    const link = document.createElement("a");
    link.download = "e-dog-masterpiece.png";
    link.href = canvas.toDataURL();
    link.click();
};

window.clear = () => {
    saveState();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Edit actions
window.undo = () => {
    if (paintHistory.length > 0) {
        redoStack.push(canvas.toDataURL());
        restoreState(paintHistory.pop());
    }
};

window.redo = () => {
    if (redoStack.length > 0) {
        paintHistory.push(canvas.toDataURL());
        restoreState(redoStack.pop());
    }
};

// Event listeners
canvas.addEventListener("mousedown", startPos);
canvas.addEventListener("mouseup", endPos);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseleave", endPos);

// Menu toggling
document.querySelectorAll(".edog-paint-menu").forEach(menu => {
    const trigger = menu.querySelector("span");
    const dropdown = menu.querySelector(".edog-paint-dropdown");

    trigger.addEventListener("click", () => {
        const isVisible = dropdown.style.display === "block";
        document.querySelectorAll(".edog-paint-dropdown").forEach(d => d.style.display = "none");
        dropdown.style.display = isVisible ? "none" : "block";
    });
});

document.addEventListener("click", e => {
    if (!e.target.closest(".edog-paint-menu")) {
        document.querySelectorAll(".edog-paint-dropdown").forEach(d => d.style.display = "none");
    }
});

saveState(); // Initialize with blank canvas

// #endregion

//#region Boot Script

// change this to halt boot

let willBoot = true;

if (willBoot) {
    const progressFill = document.getElementById('progress-fill');
    let progress = 0;

    document.getElementById('edogos-desktop').style.display = 'none';
    document.getElementById('edogosSetupScreen').style.display = 'none';
    document.getElementById('edogosLoginScreen').style.display = 'none';
    document.getElementById('edogosBootScreen').style.display = 'block';

    // Simulate progress updates
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        progress = Math.min(progress, 90); // Cap it at 90% until load
        progressFill.style.width = progress + '%';
    }, 200);

    // When content is ready (can use 'DOMContentLoaded' or 'load')
    window.addEventListener('load', () => {
        clearInterval(interval);
        progressFill.style.width = '100%';

        // Delay a bit for dramatic effect, then switch
        setTimeout(() => {
            document.getElementById('edogosBootScreen').style.display = 'none';
            // Example usage:
            if (isFirstVisit()) {
                if (confirm('It appears that this is your first time logging into E-Dog OS. Would you like to set up your computer now? If you click \'Cancel\', you can still set up later.')) {
                    document.getElementById('loadingSetupText').style.display = 'block';
                    setTimeout(() => {
                        document.getElementById('loadingSetupText').style.display = 'none';
                        document.getElementById('edogosSetupScreen').style.display = 'block';
                    }, 1250);
                }
                else {
                    document.getElementById('edogos-desktop').style.display = 'block';
                }
                // You could trigger a modal, animation, or tutorial here
                return;
            }
            document.getElementById('edogosLoginScreen').style.display = 'flex';
        }, 500); // Half a second just to show full bar
    });
}

//#endregion

//#region Login Script
document.getElementById("host-os").innerText = getOS();

function checkPassword(event) {
    event.preventDefault();
    const passwordBox = document.getElementById('loginScreenPassword');
    const spinner = document.getElementById('password-loading-spinner');
    // const correctPassword = "password";

    // Show spinner right away
    spinner.classList.remove('hidden');

    if (passwordBox.value === systemPassword) {
        setTimeout(() => {
            spinner.classList.add('hidden');
            document.getElementById('edogosLoginScreen').style.display = 'none';
            document.getElementById('edogos-desktop').style.display = 'block';
            passwordBox.value = ''; // Clear it for the future
        }, 500);
    } else {
        setTimeout(() => {
            spinner.classList.add('hidden');

            // Reset shake animation if needed
            passwordBox.classList.remove('anim-shakeX');
            void passwordBox.offsetWidth;
            passwordBox.classList.add('anim-shakeX');
        }, 500);
    }
}

function togglePowerMenu() {
    const menu = document.getElementById('power-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// function toggleElement() {
//     var dropdownElement = document.getElementById('shutdownModal');
//     if (dropdownElement.style.display === 'none') {
//         dropdownElement.style.display = 'block';
//     } else {
//         dropdownElement.style.display = 'none';
//     }
// }

function updateTime() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString();
}

setInterval(updateTime, 1000);
window.onload = updateTime;
//#endregion

//#region E-Dog OS Setup
document.getElementById('setup-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const username = document.getElementById('setup-username').value.trim();
    const password = document.getElementById('setup-password').value.trim();
    const confirm = document.getElementById('setup-password-confirm').value.trim();
    const errorBox = document.getElementById('setup-error');
    const usePasswordToLogIn = document.getElementById('usePasswordToLogInCheckbox').checked;

    if (password.match(/[<>]/g) || username.match(/[<>]/g)) {
        errorBox.textContent = "Less than and greater than signs are not allowed.";
        errorBox.style.display = "block";
        return;
    }

    if (password.length < 6) {
        errorBox.textContent = "Please pick a password longer than 6 characters.";
        errorBox.style.display = "block";
        return;
    }

    if (password !== confirm) {
        errorBox.textContent = "Passwords do not match";
        errorBox.style.display = "block";
        return;
    }


    errorBox.style.display = "none";

    handleSetup(username, password, usePasswordToLogIn);
    // document.getElementById('setup-dialog').style.display = 'none';
});

function handleSetup(username, password, usePasswordToLogIn) {
    console.log("✅ Setup complete!");
    console.log("Username:", username);
    // NOTE: Don't log passwords in real applications!
    localStorage.setItem('edogos_username', username);
    localStorage.setItem('edogos_password', password); // 🤫 Shhh!
    document.getElementById('user-text').innerText = username;
    systemPassword = password;

    setTimeout(() => {
        // document.getElementById('edogosSetupScreen').style.display = 'none';
        // if (usePasswordToLogIn) {
        //     document.getElementById('edogosLoginScreen').style.display = 'flex';
        // }
        // else {
        //     document.getElementById('edogos-desktop').style.display = 'block';
        // }
        location = location
    }, 500);
}
//#endregion

// #region End Of Script extras

document.getElementById("ver").textContent = edogosVersion;
document.getElementById("ver2").textContent = edogosVersion;

function setIframeSrc(iframeId, newSrc) {
    var iframe = document.getElementById(iframeId)
    iframe.src = newSrc;
    console.log("Iframe with id of \"" + iframeId + "\" has it's source set to \"" + newSrc + "\".")
}

function camelToTitle(str) {
    return str
        .replace(/([A-Z])/g, ' $1')    // insert space before capital letters
        .replace(/^./, char => char.toUpperCase()); // capitalize the first letter
}

function showHideElement(element, newVal) {
    element.style.display = newVal;
}

function getOS() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/windows phone/i.test(userAgent)) return "Windows Phone";
    if (/win/i.test(userAgent)) return "Windows";
    if (/android/i.test(userAgent)) return "Android";
    if (/linux/i.test(userAgent)) return "Linux";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "iOS";
    if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) return "macOS";

    return "Unknown OS";
}

// Detect first-time users
function isFirstVisit() {
    const visited = localStorage.getItem('hasVisited');

    if (visited === null) {
        // First time!
        localStorage.setItem('hasVisited', 'true');
        return true;
    }

    return false;
}

document.querySelector('[title="E-Dog OS ver"]').setAttribute('title', 'E-Dog OS ' + edogosVersion);

document.addEventListener("DOMContentLoaded", () => {
    updateTime(); // Set the initial time
    setInterval(updateTime, 1000); // Update the time every second
});

if (localStorage.getItem('edogos_password')) {
    systemPassword = localStorage.getItem('edogos_password');
}

if (localStorage.getItem('edogos_username')) {
    systemUsername = localStorage.getItem('edogos_username');
    document.getElementById('user-text').innerText = systemUsername;
}

// document.addEventListener('DOMContentLoaded', () => {
//     document.querySelectorAll('.resizeable').forEach(win => {
//         // Prevent duplicate handles
//         if (win.querySelector('.resize-handle')) return;

//         const handle = document.createElement('div');
//         handle.className = 'resize-handle';
//         handle.style.position = 'absolute';
//         handle.style.right = '0';
//         handle.style.bottom = '0';
//         handle.style.width = '16px';
//         handle.style.height = '16px';
//         handle.style.cursor = 'nwse-resize';
//         handle.style.background = 'rgba(0,0,0,0.2)';
//         handle.style.zIndex = '10';
//         handle.style.borderBottomRightRadius = '5px';

//         let isResizing = false, lastX, lastY;

//         handle.addEventListener('mousedown', function(e) {
//             e.preventDefault();
//             isResizing = true;
//             lastX = e.clientX;
//             lastY = e.clientY;
//             document.addEventListener('mousemove', resizeWindow);
//             document.addEventListener('mouseup', stopResize);
//         });

//         function resizeWindow(e) {
//             if (!isResizing) return;
//             const dx = e.clientX - lastX;
//             const dy = e.clientY - lastY;
//             lastX = e.clientX;
//             lastY = e.clientY;
//             win.style.width = Math.max(200, win.offsetWidth + dx) + 'px';
//             win.style.height = Math.max(100, win.offsetHeight + dy) + 'px';
//         }

//         function stopResize() {
//             isResizing = false;
//             document.removeEventListener('mousemove', resizeWindow);
//             document.removeEventListener('mouseup', stopResize);
//         }

//         win.appendChild(handle);
//     });
// });
// try {
//     screwUp();
// } catch(err) {
//     throwError(err);
//     updateTitleBarText('error', err);
// }
// document.getElementById("userAgent").innerHTML = navigator.userAgent;
// console.log("TIP - any errors or messages that are not coming from E-Dog OS are coming from an embedded page in Bacon Explorer.");
// console.log("wait--why are you in here?");
// console.log("hi mom");
// console.debug("hi mom");

console.log("E-Dog OS Successfully loaded");
// #endregion