var startMenu = document.getElementById("startMenu");

var wallpaperSuccessMessage = "Wallpaper successfully changed.";

var tipMessage = "Tips:\n\nIf you enter in a web page address and it doesn't work, look at these tips:\n\n1) _'s server IP address could not be found.\nThis means that the page doesn't exist. Try checking your spelling.\n\n2) __ refused to connect.\nThis means that the page exists, however it cannot be viewed in an Iframe, in other words the page cannot be viewed in Bacon Explorer.\nExamples: YouTube, Google, DuckDuckGo, Amazon, Facebook."

var systemSpecs = "Operating System: E-Dog OS v0.3.9<br>Processor: Intel© Core™ i7-6700K CPU @ 4.00GHz x 4<br>Memory: 31.3 GiB<br>Hard Drives: 250.8 GB<br>Graphics Card: NVIDIA Corporation AD104 [GeForce RTX 4070 SUPER]";

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
        console.log("Clicked outside the start menu");
    }
}

// Event listener to handle clicks on the document
document.addEventListener("click", handleClickOutside);


function showWindow(windowElement) {
    if (windowElement.style.display === "block") {
        windowElement.style.display = "none";
        console.log(windowElement + " has been hidden.");
    }
    else {
        windowElement.style.display = "block";
        console.log(windowElement + " has been made visible.");
    }
}

function updateTitleBarText(windowId, newText) {
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

    // Update the text content
    windowTitleText.textContent = newText;
}

function toggleApp(appElementId, appElementPanelIconId) {
    var appElement = document.getElementById(appElementId);
    var appElementPanelIcon = document.getElementById(appElementPanelIconId);

    console.log(appElement);
    console.log(appElementPanelIcon);

    bringWindowToFront(appElement);

    if (appElement.style.display === "block") {
        appElement.style.display = "none";
        appElementPanelIcon.style.display = "none";
        console.log("Closed the app. Elements made hidden: " + appElementId + ", " + appElementPanelIconId + ".");
    } else {
        appElement.style.display = "block";
        appElementPanelIcon.style.display = "block";
        console.log("Opened the app. Elements made visible: " + appElementId + ", " + appElementPanelIconId + ".");
    }
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

function openApp(appElementId, appElementPanelIconId) {
    var appElement = document.getElementById(appElementId);
    var appElementPanelIcon = document.getElementById(appElementPanelIconId);

    console.log(appElement);
    console.log(appElementPanelIcon);

    appElement.style.display = "block";
    appElementPanelIcon.style.display = "block";
    console.log("Opened the app. Elements made visible: " + appElementId + ", " + appElementPanelIconId + ".");
}


var dateDiv = document.getElementById('date-div');

function myDateFunction() {
    var now = new Date();
    var nowStr = now.toLocaleString('en-US');
    dateDiv.innerHTML = nowStr;
}

setInterval(myDateFunction, 1);

// Update the hidden span element with the current date and time
document.getElementById('dateandtime').innerHTML = new Date().toLocaleString('en-US');

const homePage = "https://nohorseplay.com";
let bookmarks = [];
let webHistoryStack = [];
let webHistoryIndex = -1;

function loadPage() {
    let noInternetPage = "assets/baconExplorerNoConnection.html";
    let url = document.getElementById('url').value.trim();
    if (url == "") {
        return;
    }
    if (!url.startsWith('http')) {
        url = 'https://' + url;
    }
    if (navigator.onLine === false) {
        document.getElementById('browserFrame').src = noInternetPage;
        return;
    }
    
    closeStartPage();
    document.getElementById('url').value = url;
    document.getElementById('browserFrame').src = url;
    document.getElementById('baconExplorerTabOpen').innerText = url;
    addToHistory(url);
}

function goToPage(page) {
    if (navigator.onLine === false) {
        document.getElementById('browserFrame').src = noInternetPage;
        return;
    }
    closeStartPage();
    document.getElementById('browserFrame').src = page;
    document.getElementById('url').value = page;
    document.getElementById('baconExplorerTabOpen').innerText = page;
    addToHistory(page);
}

function handleKeyPress(event) {
    if (event.key === "Enter") {
        loadPage();
    }
}

function addToHistory(url) {
    if (webHistoryIndex < webHistoryStack.length - 1) {
        webHistoryStack = webHistoryStack.slice(0, webHistoryIndex + 1);
    }
    webHistoryStack.push(url);
    webHistoryIndex++;
}

function goBack() {
    if (webHistoryIndex > 0) {
        webHistoryIndex--;
        let url = webHistoryStack[webHistoryIndex];
        document.getElementById('browserFrame').src = url;
        document.getElementById('url').value = url;
    }
}

function goForward() {
    if (webHistoryIndex < webHistoryStack.length - 1) {
        webHistoryIndex++;
        let url = webHistoryStack[webHistoryIndex];
        document.getElementById('browserFrame').src = url;
        document.getElementById('url').value = url;
    }
}

function reloadPage() {
    document.getElementById('browserFrame').src = document.getElementById('browserFrame').src;
}

function goHome() {
    goToStartPage();
    document.getElementById('url').value = "";
    document.getElementById('baconExplorerTabOpen').innerText = "Start Page";
    // Go to nohorseplay.com
    // if (navigator.onLine === false) {
    //     document.getElementById('browserFrame').src = noInternetPage;
    //     return;
    // }
    // closeStartPage();
    // document.getElementById('browserFrame').src = homePage;
    // document.getElementById('url').value = homePage;
    // document.getElementById('baconExplorerTabOpen').innerText = homePage;
    // addToHistory(homePage);
}

function loadBookmarks() {
    const bookmarksContainer = document.getElementById('bookmarks');
    bookmarksContainer.innerHTML = '';
    if (bookmarks.length === 0) {
        bookmarksContainer.textContent = "For quick access, place your bookmarks here on the bookmarks bar.";
        return;
    }
    bookmarks.forEach(site => {
        const btn = document.createElement('button');
        btn.textContent = site;
        btn.onclick = () => {
            if (navigator.onLine === false) {
                document.getElementById('browserFrame').src = noInternetPage;
                return;
            }
            document.getElementById('browserFrame').src = site;
            document.getElementById('baconExplorerTabOpen').innerText = site;
            document.getElementById('url').value = site;
            addToHistory(site);
        };
        bookmarksContainer.appendChild(btn);
    });
}

function toggleBookmark() {
    let url = document.getElementById('url').value.trim();
    const index = bookmarks.indexOf(url);
    if (index === -1 && url) {
        if (!url.startsWith('http')) {
            url = 'https://' + url;
        }
        bookmarks.push(url);
    } else if (index !== -1) {
        bookmarks.splice(index, 1);
    }
    loadBookmarks();
}

function goToStartPage() {
    var startPage = document.getElementById("startPage");
    startPage.style.display = "block";
    
}

function closeStartPage() {
    var startPage = document.getElementById("startPage");
    startPage.style.display = "none";
}

function changeBackground() {
    const color = document.getElementById('bgColorPicker').value;
    var startPage = document.getElementById("startPage");
    startPage.style.backgroundColor = color;
}

loadBookmarks();

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

function DynamicVisitPage(webPage) {
    var addressBar = document.getElementById("addressBar");
    var webIframe = document.getElementById("webIframe");
    var addressBarText = addressBar.value;
    var baconExplorerTabOpen = document.getElementById("baconExplorerTabOpen");
    // alert(addressBarText) For Debug
    webIframe.src = "https://" + webPage;
}

function SetWindowText(newWindowText) {
    var addressBar = document.getElementById("addressBar");
    addressBar.value = newWindowText;
    baconExplorerTabOpen.innerText = newWindowText;
}

const video = document.getElementById('video');
const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const rewindButton = document.getElementById('rewind');
const forwardButton = document.getElementById('forward');
const timeDisplay = document.getElementById('time');
const volumeButton = document.getElementById('volume');
const volumeSlider = document.querySelector('.volume-slider');
const volumeControl = document.getElementById('volume-control');

function openMediaFile(file) {
    video.src = file;
    video.play();
    playButton.innerHTML = '&#10074;&#10074;';
}

playButton.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playButton.innerHTML = '&#10074;&#10074;';
    } else {
        video.pause();
        playButton.innerHTML = '&#9658;';
    }
});

stopButton.addEventListener('click', () => {
    video.pause();
    video.currentTime = 0;
    playButton.innerHTML = '&#9658;';
});

rewindButton.addEventListener('click', () => {
    video.currentTime -= 5;
});

forwardButton.addEventListener('click', () => {
    video.currentTime += 5;
});

video.addEventListener('timeupdate', () => {
    let minutes = Math.floor(video.currentTime / 60);
    let seconds = Math.floor(video.currentTime % 60);
    timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
});

volumeButton.addEventListener('click', () => {
    volumeSlider.style.display = volumeSlider.style.display === 'flex' ? 'none' : 'flex';
});

volumeControl.addEventListener('input', () => {
    video.volume = volumeControl.value;
});

function replayVideo() {
    video.currentTime = 0;
    video.play();
}

function resetVideo() {
    video.pause();
    video.currentTime = 0;
}

function appendToDisplay(value) {
    document.getElementById('display').value += value;
}
function clearDisplay() {
    document.getElementById('display').value = '';
}
function calculateResult() {
    try {
        document.getElementById('display').value = eval(document.getElementById('display').value);
    } catch {
        crashSystem('INVALID_CALC_EXPRESSION');
    }
}

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
        openApp('mediaPlayer', 'mediaPlayerIcon');
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

function throwError(errorContent) {
    var errorContainerElement = document.getElementById("errorContainer");
    errorContainerElement.innerHTML = errorContent;
    toggleApp('error', 'errorIcon');
}

function crashSystem(errorMessage) {
    var crashScreenElement = document.getElementById("crashScreen");
    crashScreenElement.innerHTML = "A problem has been detected and E-Dog OS has been shut down to prevent damage to your computer.<br><br> " + errorMessage + "<br><br> If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:<br> Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or<br> software manufacturer for any updates you might need. If problems continue, disable or remove any newly installed<br> hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to eat bacon, restart<br> your computer, press F8 to select Advanced Startup Options, and then select Eat Bacon.<br><br> Technical Information:<br><br> *** STOP: 0x000000C1 (0x61AF2FF8, 0xEDCCAEBE, 0xB663BAE9, 0x8E2DF694)<br><br>";
    video.pause();
    toggleApp('crashScreen', 'crashScreen');
}

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

function populateAppStore() {
    const availableAppsContainer = document.getElementById('availableAppsContainer');
    availableAppsContainer.innerHTML = ''; // Clear existing apps

    for (const appId in availableApps) {
        const app = availableApps[appId];
        const appElement = document.createElement('div');
        appElement.classList.add('app');
        appElement.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>${app.name}</span>
            <button onclick="installApp('${appId}')">Install</button>
        `;
        availableAppsContainer.appendChild(appElement);
    }
}

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
        appElement.innerHTML = `
            <img src="${app.icon}" alt="${app.name}">
            <span>${app.name}</span>
            <p>${app.description}</p>
            <button onclick="${buttonAction}">${buttonLabel}</button>
        `;
        availableAppsContainer.appendChild(appElement);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    updateStartMenu();
    populateAppStore();
    const inputField = document.getElementById('terminalShell');
    inputField.value = prefixText;
    inputField.focus(); // Set focus to the input field when the page loads
});

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
        description: "Install and manage applications. Like the Google Play Store, but worse.",
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
        description: "Explore the internet. Bacon not included.",
        installed: true
    },
    "calculator": {
        name: "Calculator",
        icon: "media/img/accessories-calculator.png",
        description: "Do maths. Useful for cheating on tests.",
        installed: true
    },
    "debugTools": {
        name: "Debug Tools",
        icon: "media/img/passwords.png",
        description: "Please don't drag the computer icon into the recycle bin.",
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
        description: "Connect to the internet using a dial-up modem. Good luck.",
        installed: true
    },
    "drawingProgram": {
        name: "Drawing",
        icon: "media/img/drawing.png",
        description: "Draw stuff, like a 5-year-old. Or a 25-year-old. Do 25-year-olds draw with crayons?",
        installed: true
    },
    "fileExplorer": {
        name: "File Explorer",
        icon: "media/img/folder.png",
        description: "Manage files and folders. Like Windows Explorer, but worse. Bacon still not included.",
        installed: true
    },
    "mediaPlayer": {
        name: "Media Player",
        icon: "media/img/media-player.png",
        description: "Watch videos and listen to music. Or just play raisins.mp4 on repeat.",
        installed: true
    },
    "systemSettings": {
        name: "System Settings",
        icon: "media/img/settings.png",
        description: "Configure system settings and preferences. How exciting. But you can change your wallpaper.",
        installed: true
    },
    "terminal": {
        name: "Terminal",
        icon: "media/img/utilities-terminal.png",
        description: "Use the command line interface. For advanced users only. Or if you want to feel like a hacker.",
        installed: true // Terminal is installed by default
    },
    "textEditor": {
        name: "Text Editor",
        icon: "media/img/accessories-text-editor.png",
        description: "Edit text files. Like Notepad, but worse. And with less features. Enjoy your three buttons.",
        installed: true // Terminal is installed by default
    },
    "camera": {
        name: "Camera",
        icon: "media/img/accessories-camera.png",
        description: "Take pictures, i think",
        installed: true
    }
};

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

function dialUp() {
    var dialUpStatus = document.getElementById("dialUpStatus");
    dialUpStatus.play();
}

function stopDialUp() {
    var dialUpStatus = document.getElementById("dialUpStatus");
    dialUpStatus.pause();
    dialUpStatus.currentTime = 0;
}

// Camera

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
// try {
//     screwUp();
// } catch(err) {
//     throwError(err);
//     updateTitleBarText('error', err);
// }
// document.getElementById("userAgent").innerHTML = navigator.userAgent;
console.log("TIP - any errors or messages that are not coming from E-Dog OS are coming from an embedded page in Bacon Explorer.");
console.log("wait--why are you in here?");
console.log("hi mom");
console.log("E-Dog OS Successfully loaded");