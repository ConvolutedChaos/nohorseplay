// hi mom

const mainApp = document.getElementById('mainApp');
const lowBatteryScreen = document.getElementById('lowBatteryScreen');

let mainPasscode = '0000';

let isStatusBarBlack = false;

let isOnLockScreen = true;

//#region Battery

let batteryLevel = 1;
let randomizeBattery = false;
let batterySafe = false;

if (randomizeBattery) {
    batteryLevel = Math.random();
}

if (batteryLevel < 0.1 && batterySafe) {
    batteryLevel = Math.random();
}

if (batteryLevel < 0.1) {
    document.body.innerHTML = ''
    document.body.style.backgroundColor = '#000000'
    throw new Error("Battery depleted.");
}

const batteryFill = document.getElementById('batteryFill');
batteryFill.style.transform = `scaleX(${batteryLevel})`;

const lowBatteryFill = document.getElementById('lowBatteryFill');
lowBatteryFill.style.transform = `scaleX(${batteryLevel})`;

if (batteryLevel <= 0.2) {
    batteryFill.style.backgroundColor = '#bb0000';
}

if (batteryLevel <= 0.1) {
    mainApp.innerHTML = '';
    lowBatteryScreen.style.display = 'flex';
}

//#endregion

//#region Passcode
// Passcode UI logic

const container = document.getElementById('passcode-container');
const dots = container.querySelectorAll('.dot');
const numpad = container.querySelector('.numpad');
let code = '';

function update() {
    dots.forEach((d, i) => d.classList.toggle('filled', i < code.length));
}

for (let i = 1; i <= 9; i++) {
    let b = document.createElement('button');
    b.textContent = i;
    b.onclick = () => {
        if (code.length < 4) {
            code += i;
            update();
            if (code.length === 4) {
                // Inside the setTimeout where the passcode is checked:
                setTimeout(() => {
                    if (code === mainPasscode) {
                        setDisplay(document.getElementById("lockScreen"), 'none');
                        setDisplay(document.querySelector('#statusBar #time'), 'block');
                    } else {
                        // alert("❌ Incorrect passcode. Try again.");
                        // Add shake animation
                        const dotsDiv = container.querySelector('.dots');
                        dotsDiv.classList.add('anim-shakeX');
                        // Remove the class after the animation ends (assuming 0.5s duration)
                        setTimeout(() => {
                            dotsDiv.classList.remove('anim-shakeX');
                        }, 500);
                    }
                    code = '';
                    update();
                }, 200);
            }
        }
    };
    numpad.appendChild(b);
}

let zero = document.createElement('button');
zero.textContent = '0';
zero.onclick = () => {
    if (code.length < 4) {
        code += '0';
        update();
        if (code.length === 4) {
            // Inside the setTimeout where the passcode is checked:
            setTimeout(() => {
                if (code === mainPasscode) {
                    setDisplay(document.getElementById("lockScreen"), 'none');
                    setDisplay(document.querySelector('#statusBar #time'), 'block');
                } else {
                    // alert("❌ Incorrect passcode. Try again.");
                    // Add shake animation
                    const dotsDiv = container.querySelector('.dots');
                    dotsDiv.classList.add('anim-shakeX');
                    // Remove the class after the animation ends (assuming 0.5s duration)
                    setTimeout(() => {
                        dotsDiv.classList.remove('anim-shakeX');
                    }, 300);
                }
                code = '';
                update();
            }, 200);
        }
    }
};
numpad.appendChild(zero);

container.querySelector('#passcode-delete').onclick = function () {
    code = code.slice(0, -1);
    update();
};
container.querySelector('#passcode-cancel').onclick = function () {
    code = '';
    update();
};

update();

//#endregion

//#region Status Bar

const airplaneIndicator = document.getElementById('airplaneIndicator');

const statusBarBattery = document.querySelector('#statusBar #battery');
const statusBarBatteryFill = document.querySelector('#statusBar #batteryFill');

const statusBarTime = document.querySelector('#statusBar #time');

if (isStatusBarBlack === true) {
    airplaneIndicator.src = 'icons/plane-black.png';

    statusBarBattery.style.backgroundImage = "url('icons/battery-bg-black.png')";
    statusBarBatteryFill.style.backgroundColor = '#000000';

    statusBarTime.style.color = '#000000';
}
else {
    airplaneIndicator.src = 'icons/plane-white.png';

    statusBarBattery.style.backgroundImage = "url('icons/battery-bg-white.png')";

    if (batteryLevel > 0.2) {
        statusBarBatteryFill.style.backgroundColor = '#ffffff';
    }

    statusBarTime.style.color = '#ffffff';
}

function blackStatusBar() {
    airplaneIndicator.src = 'icons/plane-black.png';

    statusBarBattery.style.backgroundImage = "url('icons/battery-bg-black.png')";
    statusBarBatteryFill.style.backgroundColor = '#000000';

    statusBarTime.style.color = '#000000';
}

function whiteStatusBar() {
    airplaneIndicator.src = 'icons/plane-white.png';

    statusBarBattery.style.backgroundImage = "url('icons/battery-bg-white.png')";

    if (batteryLevel > 0.2) {
        statusBarBatteryFill.style.backgroundColor = '#ffffff';
    }

    statusBarTime.style.color = '#ffffff';
}

statusBarTime.style.display = isOnLockScreen ? 'none' : 'block';

// Update time and date
function updateStatusBarTime() {
    const now = new Date();
    statusBarTime.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

setInterval(updateStatusBarTime, 1000);
updateStatusBarTime();

// #endregion

//#region Lock Screen

if (!isOnLockScreen) {
    setDisplay(document.getElementById("lockScreen"), 'none');
}

//#region Slide to unlock

const lockScreenContent = document.getElementById('lockScreenContent');
const slideToUnlock = document.getElementById('slideToUnlock');
const passcodeContainer = document.getElementById('passcode-container');
let startX = null;
let sliding = false;
let threshold = 300; // px to trigger passcode

function onSlideStart(e) {
    if (e.target !== slideToUnlock) return;
    sliding = true;
    startX = e.touches ? e.touches[0].clientX : e.clientX;
    slideToUnlock.style.transition = 'none';
    passcodeContainer.style.transition = 'none';
}

function onSlideMove(e) {
    if (!sliding) return;
    let currentX = e.touches ? e.touches[0].clientX : e.clientX;
    let dx = Math.max(0, currentX - startX);
    slideToUnlock.style.transform = `translateX(${dx}px)`;
    passcodeContainer.style.transform = `translateX(${dx}px)`;
    if (dx > threshold) {
        showPasscode();
    }
}

function onSlideEnd() {
    if (!sliding) return;
    // Snap back if not unlocked
    slideToUnlock.style.transition = 'transform 0.3s cubic-bezier(.4,1.5,.5,1)';
    passcodeContainer.style.transition = 'transform 0.3s cubic-bezier(.4,1.5,.5,1)';
    slideToUnlock.style.transform = '';
    passcodeContainer.style.transform = '';
    sliding = false;
}

function showPasscode() {
    sliding = false;
    slideToUnlock.style.opacity = 0;
    slideToUnlock.style.pointerEvents = 'none';
    passcodeContainer.classList.add('active');
    passcodeContainer.style.transform = 'translateX(0)';
    lockScreenContent.classList.add('passcode-active'); // Hide time/date/slide
}
function hidePasscode() {
    passcodeContainer.classList.remove('active');
    lockScreenContent.classList.remove('passcode-active');
    slideToUnlock.style.opacity = 0.8;
    slideToUnlock.style.pointerEvents = '';
}

// Touch events for mobile
slideToUnlock.addEventListener('touchstart', onSlideStart);
window.addEventListener('touchmove', onSlideMove);
window.addEventListener('touchend', onSlideEnd);

// Mouse events for desktop
slideToUnlock.addEventListener('mousedown', onSlideStart);
window.addEventListener('mousemove', onSlideMove);
window.addEventListener('mouseup', onSlideEnd);

//#endregion

const lockScreenTime = document.querySelector('#lockScreen #time');
const lockScreenDate = document.querySelector('#lockScreen #date');

function updateLockScreenTime() {
    const now = new Date();
    let time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
    lockScreenTime.textContent = time.replace(/\s?[AP]M$/i, '');
    lockScreenDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

setInterval(updateLockScreenTime, 1000)
updateLockScreenTime();

//#endregion

//#region App Code

//#region Photos

const blankImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IB2cksfwAAAARnQU1BAACxjwv8YQUAAAAgY0hSTQAAeiYAAICEAAD6AAAAgOgAAHUwAADqYAAAOpgAABdwnLpRPAAAAAlwSFlzAAAuIwAALiMBeKU/dgAAAAxJREFUCNdj+P//PwAF/gL+3MxZ5wAAAABJRU5ErkJggg=='

const placeholderPictureUrl = 'placeholder.png';

const photoDirectory = "photos/";

// Example data
const albums = [
    { id: "cameraRoll", name: "Camera Roll" },
    { id: "screenshots", name: "Screenshots" },
    { id: "favorites", name: "Favorites" },
    { id: "recentlyDeleted", name: "Recently Deleted" }
];

const photos = [
    { url: "https://placecats.com/300/200", "timestamp": "2025-08-02T19:21:30Z", albums: ["cameraRoll"] },
    { url: "https://placecats.com/301/200", "timestamp": "2025-08-02T19:21:30Z", albums: ["cameraRoll"] },
    { url: "https://placecats.com/302/200", "timestamp": "2025-08-02T19:21:30Z", albums: ["cameraRoll"] },
    { url: "https://placecats.com/303/200", "timestamp": "2025-08-02T19:21:30Z", albums: ["cameraRoll"] }
];

// Find the photos app container
const photosApp = document.getElementById('photos');
const tabMenu = photosApp.querySelector('#tabMenu');

albums.forEach(album => {
    const albumPhotos = photos.filter(photo => photo.albums && photo.albums.includes(album.id));
    const firstPhoto = albumPhotos[0];


    const btn = document.createElement('button');
    btn.className = 'album-btn';
    btn.onclick = () => openAlbum(album.id, album.name);

    // Preview image
    if (firstPhoto) {
        const preview = document.createElement('img');
        preview.src = firstPhoto.url;
        preview.alt = album.name + " preview";
        preview.className = 'album-preview';
        btn.appendChild(preview);
    }
    else
    {
        const preview = document.createElement('img');
        preview.src = blankImg;
        preview.alt = album.name + " preview";
        preview.className = 'album-preview';
        btn.appendChild(preview);
    }

    // Info container
    const info = document.createElement('div');
    info.className = 'album-info';

    // Album name
    const name = document.createElement('div');
    name.className = 'album-name';
    name.textContent = album.name;
    info.appendChild(name);

    // Count
    const count = document.createElement('span');
    count.className = 'album-count';
    count.textContent = albumPhotos.length;
    info.appendChild(count);

    btn.appendChild(info);
    tabMenu.appendChild(btn);
});

// Generate album contents
albums.forEach(album => {
    const div = document.createElement('div');
    div.id = album.id;
    div.className = 'tabcontent';

    const backBtn = document.createElement('button');
    backBtn.className = 'back-btn';

    backBtn.textContent = '< Albums';
    backBtn.onclick = showTabMenu;
    div.appendChild(backBtn);

    const title = document.createElement('h3');
    title.className = 'album-title';
    title.textContent = album.name;
    div.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'photo-grid';

    // Add photos for this album
    photos.filter(photo => photo.albums && photo.albums.includes(album.id))
        .forEach(photo => {
            const img = document.createElement('img');
            img.src = photo.url;
            img.onclick = () => openPhotoPreview(photo);
            grid.appendChild(img);
        });

    div.appendChild(grid);
    photosApp.appendChild(div); // <-- Append to photosApp, not document.body
});

function openAlbum(albumId) {
    tabMenu.style.display = 'none';
    document.querySelectorAll('.tabcontent').forEach(tc => tc.classList.remove('active'));
    document.getElementById(albumId).classList.add('active');
}

function showTabMenu() {
    document.querySelectorAll('.tabcontent').forEach(tc => tc.classList.remove('active'));
    tabMenu.style.display = 'flex';
}

function openPhotoPreview(photo) {
    const modal = document.getElementById('photoPreviewModal');
    const img = document.getElementById('photoPreviewImg');
    const dateSpan = document.getElementById('photoPreviewDate');
    const favBtn = document.getElementById('photoFavoriteBtn');
    const trashBtn = document.getElementById('photoTrashBtn');

    const filledHeart = `<img src="icons/heart-black-full.png" alt="Favorite icon" class="favorite-icon">`
    const emptyHeart = `<img src="icons/heart-black.png" alt="Favorite icon" class="favorite-icon">`

    img.src = photo.url;
    // dateSpan.innerHTML = photo.timestamp
    //     ? new Date(photo.timestamp).toLocaleString()
    //     : '';
    dateSpan.innerHTML = "November 10, 2024<br><span style='font-size:1rem;'>2:23 AM</span>"

    // Example: Toggle favorite (you can expand this logic)
    favBtn.onclick = () => {
        if (!photo.albums.includes('favorites')) {
            photo.albums.push('favorites');
            favBtn.innerHTML = filledHeart;
            console.log('Photo favorited.')
        } else {
            photo.albums = photo.albums.filter(a => a !== 'favorites');
            favBtn.innerHTML = emptyHeart;
        }
    };
    favBtn.innerHTML = photo.albums.includes('favorites') ? filledHeart : emptyHeart;

    // Example: Trash button (you can expand this logic)
    trashBtn.onclick = () => {
        if (!photo.albums.includes('recentlyDeleted')) {
            photo.albums.push('recentlyDeleted');
            alert('Photo moved to Recently Deleted.');
        }
        closePhotoPreview();
    };

    modal.style.display = 'flex';
}

function closePhotoPreview() {
    document.getElementById('photoPreviewModal').style.display = 'none';
}

document.getElementById('photoPreviewClose').onclick = closePhotoPreview;
document.getElementById('photoPreviewModal').onclick = function (e) {
    if (e.target === this) closePhotoPreview();
};

//#endregion

//#region Bacon Explorer

const browserFrame = gId("browserFrame");



//#endregion

//#endregion

//#region Core Functions

const iconsDirectory = "icons/";

const apps = {
    baconExplorer: {
        appName: "Bacon Explorer",
        appId: "baconExplorer",
        author: "E-Dog",
        icon: "internet-web-browser.png",
        iconId: "baconExplorerAppIcon",
        cropIcon: true,
        version: "1.0",
        description: "A web browser.",
        open: function () {
            launchApp(this.appId)
        }
    },
    photos: {
        appName: "Photos",
        appId: "photos",
        author: "E-Dog",
        icon: "photos.png",
        iconId: "photosAppIcon",
        cropIcon: false,
        version: "1.0",
        description: "View and organize photos.",
        open: function () {
            launchApp(this.appId)
        }
    }
}

function generateHomeScreen() {
    const homeScreen = document.getElementById('homeScreen');
    homeScreen.innerHTML = ''; // Clear existing icons

    Object.values(apps).forEach(app => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'appIcon';
        iconDiv.title = app.appName;
        iconDiv.onclick = app.open.bind(app);

        const img = document.createElement('img');
        img.src = app.icon ? iconsDirectory + app.icon : 'icons/app-placeholder.png';
        img.alt = app.appName;
        if (app.cropIcon) {
            img.classList.add("iconCrop");
        }

        iconDiv.appendChild(img);

        // Add app name below the icon
        const nameDiv = document.createElement('div');
        nameDiv.className = 'appName';
        nameDiv.textContent = app.appName;
        iconDiv.appendChild(nameDiv);

        homeScreen.appendChild(iconDiv);
    });
}

/// <summary>
///     Will launch the app.
/// </summary>
function launchApp(appId) {
    setTimeout(() => {
        // Hide all app containers
        const appContainers = document.querySelectorAll('#apps > div');
        appContainers.forEach(div => div.style.display = 'none');

        setDisplay(document.getElementById("homeScreen"), 'none');
        setDisplay(document.getElementById("appDock"), 'none');

        // Show the selected app container
        const appDiv = document.getElementById(appId);

        if (appId === 'photos') {
            blackStatusBar();
        } else if (appId === 'baconExplorer') {
            blackStatusBar();
        } else {
            whiteStatusBar();
        }

        if (appDiv) {
            appDiv.style.display = 'block';
        } else {
            console.error("The app you tried to launch doesn't exist");
        }
    }, 200);
}

function homeButton() {
    const appContainers = document.querySelectorAll('#apps > div');
    appContainers.forEach(div => div.style.display = 'none');

    setDisplay(document.getElementById('homeScreen'), 'grid');
    setDisplay(document.getElementById('appDock'), 'flex');
}

function setDisplay(el, value) {
    el.style.display = value;
}

function parseIsoDate(isoString) {
    const date = new Date(isoString);

    if (isNaN(date)) {
        throw new Error("Invalid ISO 8601 timestamp: " + isoString);
    }

    return date;
}

function gId(id) {
    try {
        return document.getElementById(id);
    } catch (error) {
        console.error(`Error finding element with ID of "${id}", ${error}`)
    }
}


// //#region Status Bar Contrast

// // Example: If you know the background color
// function isColorLight(hex) {
//     // Remove # if present
//     hex = hex.replace('#', '');
//     // Parse r, g, b
//     let r = parseInt(hex.substr(0, 2), 16);
//     let g = parseInt(hex.substr(2, 2), 16);
//     let b = parseInt(hex.substr(4, 2), 16);
//     // Perceived brightness formula
//     let brightness = (r * 299 + g * 587 + b * 114) / 1000;
//     return brightness > 186; // true if light
// }

// function getTopVisibleBackgroundColor() {
//     // Priority: App > Home > Lock
//     const appContainers = document.querySelectorAll('#apps > div');
//     for (let app of appContainers) {
//         if (app.style.display !== 'none') {
//             return getComputedStyle(app).backgroundColor;
//         }
//     }
//     const homeScreen = document.getElementById('homeScreen');
//     if (homeScreen && homeScreen.style.display !== 'none') {
//         return getComputedStyle(homeScreen).backgroundColor;
//     }
//     const lockScreen = document.getElementById('lockScreen');
//     if (lockScreen && lockScreen.style.display !== 'none') {
//         return getComputedStyle(lockScreen).backgroundColor;
//     }
//     // Fallback
//     return "#000000";
// }

// function updateStatusBarColorLoop() {
//     let bg = getTopVisibleBackgroundColor();

//     // Convert rgb to hex if needed
//     function rgbToHex(rgb) {
//         const result = rgb.match(/\d+/g);
//         if (!result) return "#000000";
//         return (
//             "#" +
//             ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2]))
//                 .toString(16)
//                 .slice(1)
//         );
//     }

//     let hexColor = bg.startsWith("#") ? bg : rgbToHex(bg);

//     // Check if color is light
//     let shouldBeBlack = isColorLight(hexColor);

//     // Only update if changed
//     if (shouldBeBlack !== isStatusBarBlack) {
//         isStatusBarBlack = shouldBeBlack;
//         // Call your status bar update logic here
//         if (isStatusBarBlack) {
//             airplaneIndicator.src = 'icons/plane-black.png';
//             statusBarBattery.style.backgroundImage = "url('icons/battery-bg-black.png')";
//             statusBarBatteryFill.style.backgroundColor = '#000000';
//             statusBarTime.style.color = '#000000';
//         } else {
//             airplaneIndicator.src = 'icons/plane-white.png';
//             statusBarBattery.style.backgroundImage = "url('icons/battery-bg-white.png')";
//             if (batteryLevel > 0.2) {
//                 statusBarBatteryFill.style.backgroundColor = '#ffffff';
//             }
//             statusBarTime.style.color = '#ffffff';
//         }
//     }

//     requestAnimationFrame(updateStatusBarColorLoop);
// }

// requestAnimationFrame(updateStatusBarColorLoop);

// //#endregion

//#endregion

// Event listeners

window.addEventListener('DOMContentLoaded', generateHomeScreen);

console.log(`Battery level: ${(batteryLevel * 100).toFixed(0)}%`);
console.log("E-Dog OS Mobile loaded successfully!");