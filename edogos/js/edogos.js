var startMenu = document.getElementById("startMenu");

var wallpaperSuccessMessage = "Wallpaper successfully changed.";

var tipMessage = "Tips:\n\nIf you enter in a web page address and it doesn't work, look at these tips:\n\n1) _'s server IP address could not be found.\nThis means that the page doesn't exist. Try checking your spelling.\n\n2) __ refused to connect.\nThis means that the page exists, however it cannot be viewed in an Iframe, in other words the page cannot be viewed in Bacon Explorer.\nExamples: YouTube, Google, DuckDuckGo, Amazon, Facebook."

function openStartMenu() {
    if (startMenu.style.display === "block") {
        startMenu.style.display = "none";
    } else {
        startMenu.style.display = "block";
    }
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

function toggleApp(appElementId, appElementPanelIconId) {
    var appElement = document.getElementById(appElementId);
    var appElementPanelIcon = document.getElementById(appElementPanelIconId);

    console.log(appElement);
    console.log(appElementPanelIcon);

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

function GoToWebPage() {
    var addressBar = document.getElementById("addressBar");
    var webIframe = document.getElementById("webIframe");
    var addressBarText = addressBar.value;
    var baconExplorerTabOpen = document.getElementById("baconExplorerTabOpen");
    // alert(addressBarText) For Debug
    webIframe.src = "https://" + addressBarText;
    baconExplorerTabOpen.innerText = addressBarText;
    if (addressBarText === "") {
        baconExplorerTabOpen.innerText = "Blank Page";
    } else if (addressBarText === null) {
        baconExplorerTabOpen.innerText = "Blank Page";
    } else if (addressBarText === " ") {
        baconExplorerTabOpen.innerText = "Blank Page";
    }
}

function SearchWeb() {
    var addressBar = document.getElementById("addressBar");
    var webIframe = document.getElementById("webIframe");
    var addressBarText = addressBar.value;
    var baconExplorerTabOpen = document.getElementById("baconExplorerTabOpen");
    // alert(addressBarText) For Debug
    var termToSearch = "https://duckduckgo.com/?q=" + addressBarText;
    window.open(termToSearch);
    baconExplorerTabOpen.innerText = addressBarText;
    if (addressBarText === "") {
        baconExplorerTabOpen.innerText = "Blank Page";
    } else if (addressBarText === null) {
        baconExplorerTabOpen.innerText = "Blank Page";
    } else if (addressBarText === " ") {
        baconExplorerTabOpen.innerText = "Blank Page";
    }
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
    console.log("Attempting to open " + fileName + "...");
    if (fileName === "raisins.mp4") {
        openApp('mediaPlayer', 'mediaPlayerIcon');
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

function crashSystem(errorMessage) {
    var crashScreenElement = document.getElementById("crashScreen");
    crashScreenElement.innerHTML = "A problem has been detected and E-Dog OS has been shut down to prevent damage to your computer.<br><br> " + errorMessage + "<br><br> If this is the first time you've seen this error screen, restart your computer. If this screen appears again, follow these steps:<br> Check to make sure any new hardware or software is properly installed. If this is a new installation, ask your hardware or<br> software manufacturer for any updates you might need. If problems continue, disable or remove any newly installed<br> hardware or software. Disable BIOS memory options such as caching or shadowing. If you need to eat bacon, restart<br> your computer, press F8 to select Advanced Startup Options, and then select Eat Bacon.<br><br> Technical Information:<br><br> *** STOP: 0x000000C1 (0x61AF2FF8, 0xEDCCAEBE, 0xB663BAE9, 0x8E2DF694)<br><br>";
    video.pause();
    toggleApp('crashScreen', 'crashScreen');
}

// document.getElementById("userAgent").innerHTML = navigator.userAgent;
console.log("TIP - any errors or messages that are not coming from E-Dog OS are coming from an embedded page in Bacon Explorer.")
console.log("wait--why are you in here?")
console.log("E-Dog OS Successfully loaded");