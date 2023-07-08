function noConnectFunction() {
    // const element = document.getElementById("aaaa");
    // element.remove();
    // //WAWA
    // // Create element:

    // const webBrowse = document.createElement('iframe');
    // webBrowse.setAttribute('src', '/A-Random-Website-once-again/wow/os-emulators/edogos/files/noConnect.htm');
    // webBrowse.setAttribute('style', 'width: 640px; height: 400px; border: 1px solid #000;');
    // webBrowse.setAttribute('frameborder', '0');

    // document.getElementById("bbbb").appendChild(webBrowse);


    var addressbarinput = document.getElementById('addressbar')
    document.getElementById("iframeone").src = ('/A-Random-Website-once-again/wow/os-emulators/edogos/files/noConnect.htm');
    document.getElementById("currWindowBacon").innerHTML = "Can't Connect to Page"
}

function conntoApple() {
    document.getElementById("currWindowBacon").innerHTML = "Apple"
    document.getElementById("iframeone").src = ('//ten-years-ago.neal.fun/apple.com/');
}

function theBlissWallpaper() {
    document.body.style.backgroundImage = "url('/img/bliss.jpg')";
    document.cookie = "currentwallpaper=Bliss; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function changeWallpaperToTheBowlOfFruit() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/f494bfba58260f60bf53f91a7d7c1bdd.jpg')";
    document.cookie = "currentwallpaper=BowlOfFruit; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function changeWallpaperToTheFlowers() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/84132-nature-flowers-closeup-white_flowers-Windows_8.jpg')";
    document.cookie = "currentwallpaper=Flowers; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function changeWallpaperToTychusFindlayFromSC2() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/d5b76f7c228e8b1030e2df64a09f60d5.jpg')";
    document.cookie = "currentwallpaper=TychusFindlay; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function changeWallpaperToThePuppy() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/435688-free-cute-dogs-and-puppies-wallpaper-2560x1600-for-pc.jpg')";
    document.cookie = "currentwallpaper=Puppy; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function changeWallpaperToTheGorgeousMountains() {
    document.body.style.backgroundImage = "url('/img/roccky.jpg')"
    document.cookie = "currentwallpaper=Mountain; expires=Thu, 18 Dec 2123 12:00:00 UTC";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    let username = getCookie("username");
    if (username != "") {
        alert("Welcome again " + username);
    } else {
        username = prompt("Please enter your name:", "");
        if (username != "" && username != null) {
            setCookie("username", username, 365);
        }
    }
}

function mydiv(showhide) {
    if (showhide == "show") {
        document.getElementById('mydiv').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('mydiv').style.visibility = "hidden";
    }
}

function panel(showhide) {
    if (showhide == "show") {
        document.getElementById('panel').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('panel').style.visibility = "hidden";
    }
}

function baconexplorer(showhide) {
    if (showhide == "show") {
        document.getElementById('baconexplorer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('baconexplorer').style.visibility = "hidden";
    }
}

function funwithjs(showhide) {
    if (showhide == "show") {
        document.getElementById('funwithjs').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('funwithjs').style.visibility = "hidden";
    }
}

function nohorseplaysite(showhide) {
    if (showhide == "show") {
        document.getElementById('nohorseplaysite').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('nohorseplaysite').style.visibility = "hidden";
    }
}

function aboutedogos(showhide) {
    if (showhide == "show") {
        document.getElementById('aboutedogos').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('aboutedogos').style.visibility = "hidden";
    }
}

function systemsettings(showhide) {
    if (showhide == "show") {
        document.getElementById('systemsettings').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('systemsettings').style.visibility = "hidden";
    }
}

function changeWallpaper(showhide) {
    if (showhide == "show") {
        document.getElementById('changeWallpaper').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('changeWallpaper').style.visibility = "hidden";
    }
}

function fileexplorer(showhide) {
    if (showhide == "show") {
        document.getElementById('fileexplorer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('fileexplorer').style.visibility = "hidden";
    }
}

function imac(showhide) {
    if (showhide == "show") {
        document.getElementById('imac').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('imac').style.visibility = "hidden";
    }
}

function startmenu(showhide) {
    if (showhide == "show") {
        document.getElementById('startmenu').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('startmenu').style.visibility = "hidden";
    }
}

function error(showhide) {
    if (showhide == "show") {
        document.getElementById('error').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('error').style.visibility = "hidden";
    }
}

function bluescreen(showhide) {
    if (showhide == "show") {
        document.getElementById('bluescreen').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('bluescreen').style.visibility = "hidden";
    }
}

function vscode(showhide) {
    if (showhide == "show") {
        document.getElementById('vscode').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('vscode').style.visibility = "hidden";
    }
}

function edogpaint(showhide) {
    if (showhide == "show") {
        document.getElementById('edogpaint').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('edogpaint').style.visibility = "hidden";
    }
}

function setupbox(showhide) {
    if (showhide == "show") {
        document.getElementById('setupbox').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('setupbox').style.visibility = "hidden";
    }
}

function setupboxotwo(showhide) {
    if (showhide == "show") {
        document.getElementById('setupboxotwo').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('setupboxotwo').style.visibility = "hidden";
    }
}

function setupboxotwo(showhide) {
    if (showhide == "show") {
        document.getElementById('setupboxotwo').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('setupboxotwo').style.visibility = "hidden";
    }
}

function texteditor(showhide) {
    if (showhide == "show") {
        document.getElementById('texteditor').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('texteditor').style.visibility = "hidden";
    }
}

function mediaplayer(showhide) {
    if (showhide == "show") {
        document.getElementById('mediaplayer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('mediaplayer').style.visibility = "hidden";
    }
}

function edogcalculator(showhide) {
    if (showhide == "show") {
        document.getElementById('edogcalculator').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('edogcalculator').style.visibility = "hidden";
    }
}

function musicpalyer(showhide) {
    if (showhide == "show") {
        document.getElementById('musicpalyer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('musicpalyer').style.visibility = "hidden";
    }
}

function softwareupdate(showhide) {
    if (showhide == "show") {
        document.getElementById('softwareupdate').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('softwareupdate').style.visibility = "hidden";
    }
}

function camera(showhide) {
    if (showhide == "show") {
        document.getElementById('camera').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('camera').style.visibility = "hidden";
    }
}

function terminall(showhide) {
    if (showhide == "show") {
        document.getElementById('terminall').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('terminall').style.visibility = "hidden";
    }
}

//document.location=""

function hhg() {

}

document.addEventListener('mouseup', function (e) {
    var container = document.getElementById('startmenu');
    if (!container.contains(e.target)) {
        container.style.visibility = 'hidden';
    }
});

function bluescreenOfDeath() {
    baconexplorer('hide')
    mydiv('hide')
    funwithjs('hide')
    vscode('hide')
    fileexplorer('hide')
    systemsettings('hide')
    startmenu('hide')
    funwithjs('hide')
    imac('hide')
    changeWallpaper('hide')
    aboutedogos('hide')
    edogpaint('hide')
    setupbox1('hide')
    bluescreen('show')
}

var myVideo = document.getElementById("video1");
function playPause() {
    if (myVideo.paused) {
        myVideo.play();
    } else {
        myVideo.pause();
    }
}

function makeBig() {
    myVideo.width = 560;
}

function makeSmall() {
    myVideo.width = 320;
}

function makeNormal() {
    myVideo.width = 420;
}

/* Get the element you want displayed in fullscreen mode (a video in this example): */
var elem = document.getElementById("video1");

/* When the openFullscreen() function is executed, open the video in fullscreen.
Note that we must include prefixes for different browsers, as they don't support the requestFullscreen method yet */
function openFullscreen() {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}

// Function that display value
function dis(val) {
    document.getElementById("result").value += val
}

function myFunction(event) {
    if (event.key == '0' || event.key == '1'
        || event.key == '2' || event.key == '3'
        || event.key == '4' || event.key == '5'
        || event.key == '6' || event.key == '7'
        || event.key == '8' || event.key == '9'
        || event.key == '+' || event.key == '-'
        || event.key == '*' || event.key == '/')
        document.getElementById("result").value += event.key;
}

var cal = document.getElementById("calcu");
cal.onkeyup = function (event) {
    if (event.keyCode === 13) {
        console.log("Enter");
        let x = document.getElementById("result").value
        console.log(x);
        solve();
    }
}

// Function that evaluates the digit and return result
function solve() {
    let x = document.getElementById("result").value
    let y = math.evaluate(x)
    document.getElementById("result").value = y
}

// Function that clear the display
function clr() {
    document.getElementById("result").value = ""
}

var errorSound = new Audio('/img/assets/audio/error.mp3');

function closeSoftwareUpdate() {
    document.location = "/A-Random-Website-once-again/wow/os-emulators/edogos/index.html"
}
var closeSoftwareUpdateId = setTimeout(closeSoftwareUpdate, 480000);
























