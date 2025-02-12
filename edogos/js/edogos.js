var startMenu = document.getElementById("startMenu");

var wallpaperSuccessMessage = "Wallpaper successfully changed.";

var tipMessage = "Tips:\n\nIf you enter in a web page address and it doesn't work, look at these tips:\n\n1) _'s server IP adress could not be found.\nThis means that the page doesn't exist. Try checking your spelling.\n\n2) __ refused to connect.\nThis means that the page exists, however it cannot be viewed in an Iframe, in other words the page cannot be viewed in Bacon Explorer.\nExamples: YouTube, Google, DuckDuckGo, Amazon, Facebook."

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

document.getElementById("userAgent").innerHTML = navigator.userAgent;

console.log("E-Dog OS Successfully loaded");