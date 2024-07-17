var startMenu = document.getElementById("startMenu");

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
    webIframe.src = addressBarText;
    baconExplorerTabOpen.innerText = addressBarText;
}

const draggables = document.querySelectorAll('.draggable');
let offsetX, offsetY, currentDraggable;

draggables.forEach(draggable => {
    const titleBar = draggable.querySelector('.title-bar');
    titleBar.addEventListener('mousedown', function(e) {
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




console.log("E-Dog OS Successfully loaded");