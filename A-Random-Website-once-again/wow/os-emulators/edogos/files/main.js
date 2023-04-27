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

var url_string = window.location.href; //window.location.href
var url = new URL(url_string);

var c = url.searchParams.get("name");

if (c === "nohorseplay.com") {
    nohorseplaysite('show')
    console.log("The URL '" + c + "' has been loaded! :)")
} else if (c === "https://nohorseplay.com") {
    nohorseplaysite('show')
    console.log("The URL '" + c + "' has been loaded! :)")
} else if (c === "http://nohorseplay.com") {
    nohorseplaysite('show')
    console.log("The URL '" + c + "' has been loaded! :)")
} else {
    console.error("The URL '" + c + "' is not valid.")
}

const dateDiv = document.getElementById('date-div');

function myDateFunction() {
    const now = new Date();
    const nowStr = now.toLocaleString('en-US');
    dateDiv.innerHTML = nowStr;
}
setInterval(myDateFunction, 1000);

document.getElementById('dateandtime').innerHTML = Date()

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

document.addEventListener('mouseup', function (e) {
    var container = document.getElementById('startmenu');
    if (!container.contains(e.target)) {
        container.style.visibility = 'hidden';
    }
});

function handleFileSelect(evt) {
    var files = evt.target.files;

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML =
                    [
                        '<p>Current picture:</p><img style="height: 75px; border: 1px solid #000; margin: 5px" src="',
                        e.target.result,
                        '" title="', escape(theFile.name),
                        '"/>'
                    ].join('');
                $('body').attr('style', 'background-image:url(' + e.target.result + ')');
                document.getElementById('list').insertBefore(span, null);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

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

//document.location=""

function hhg() {

}

function changeWallpaperToTheBowlOfFruit() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/f494bfba58260f60bf53f91a7d7c1bdd.jpg')";
}

function changeWallpaperToTheFlowers() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/84132-nature-flowers-closeup-white_flowers-Windows_8.jpg')";
}

function changeWallpaperToTychusFindlayFromSC2() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/d5b76f7c228e8b1030e2df64a09f60d5.jpg')";
}

function changeWallpaperToThePuppy() {
    document.body.style.backgroundImage = "url('/A-Random-Website-once-again/wow/img/435688-free-cute-dogs-and-puppies-wallpaper-2560x1600-for-pc.jpg')";
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

//Make the DIV element draggagle:
dragElement(document.getElementById("nohorseplaysite"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        /* if present, the header is where you move the DIV from:*/
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        /* otherwise, move the DIV from anywhere inside the DIV:*/
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        /* stop moving when mouse button is released:*/
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

var errorSound = new Audio('/img/assets/audio/error.mp3');

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