try {
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

    function appstore(showhide) {
        if (showhide == "show") {
            document.getElementById('appstore').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('appstore').style.visibility = "hidden";
        }
    }

    function EASREADYdesc(showhide) {
        if (showhide == "show") {
            document.getElementById('EASREADYdesc').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('EASREADYdesc').style.visibility = "hidden";
        }
    }

    function EASREADY(showhide) {
        if (showhide == "show") {
            document.getElementById('EASREADY').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('EASREADY').style.visibility = "hidden";
        }
    }

    function eas_ready(showhide) {
        if (showhide == "show") {
            document.getElementById('eas_ready').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('eas_ready').style.visibility = "hidden";
        }
    }

    function scroll_left(showhide) {
        if (showhide == "show") {
            document.getElementById('scroll_left').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('scroll_left').style.visibility = "hidden";
        }
    }

    function snake_appp(showhide) {
        if (showhide == "show") {
            document.getElementById('snake_appp').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('snake_appp').style.visibility = "hidden";
        }
    }

    function snake_apppdesc(showhide) {
        if (showhide == "show") {
            document.getElementById('snake_apppdesc').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('snake_apppdesc').style.visibility = "hidden";
        }
    }

    function SNAEKEEDPUJNwedrfjhilwse(showhide) {
        if (showhide == "show") {
            document.getElementById('SNAEKEEDPUJNwedrfjhilwse').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('SNAEKEEDPUJNwedrfjhilwse').style.visibility = "hidden";
        }
    }

    function surprise(showhide) {
        if (showhide == "show") {
            document.getElementById('surprise').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('surprise').style.visibility = "hidden";
        }
    }

    function phone(showhide) {
        if (showhide == "show") {
            document.getElementById('phone').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('phone').style.visibility = "hidden";
        }
    }

    function eTunes(showhide) {
        if (showhide == "show") {
            document.getElementById('eTunes').style.visibility = "visible";
        } else if (showhide == "hide") {
            document.getElementById('eTunes').style.visibility = "hidden";
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

    function makeBig() {
        myVideo.width = 560;
    }

    function makeSmall() {
        myVideo.width = 320;
    }

    function makeNormal() {
        myVideo.width = 420;
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

    //  

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

    var easAudio = new Audio('/img/assets/audio/aaaaa.mp3')

    function checkAlert() {
        document.getElementById("currAlert").innerHTML = "Emergency Alert Detected Please follow Instructions onscreen <br> Current Alert: crazyfrog <br> Provided to you by: EDOG <br><br>"
        document.getElementById("audio001").play();
        scroll_left('show');
    }



    function installEasApp() {
        EASREADY('show');
    }

    function uninstallEasApp() {
        EASREADY('hide');
    }

    function installSnakApp() {
        SNAEKEEDPUJNwedrfjhilwse('show');
    }

    function uninstallSnakApp() {
        SNAEKEEDPUJNwedrfjhilwse('hide');
    }

    function showeasDesc() {
        EASREADYdesc('show');
    }

    function closeeasDesc() {
        EASREADYdesc('hide');
    }

    function opensnake_apppdesc() {
        snake_apppdesc('show');
    }

    function closesnake_apppdesc() {
        snake_apppdesc('hide');
    }

    function closeAppStore() {
        EASREADYdesc('hide');
        appstore('hide')
        snake_apppdesc('hide')
    }
    (() => {
        // The width and height of the captured photo. We will set the
        // width to the value defined here, but the height will be
        // calculated based on the aspect ratio of the input stream.

        const width = 640; // We will scale the photo width to this
        let height = 0; // This will be computed based on the input stream

        // |streaming| indicates whether or not we're currently streaming
        // video from the camera. Obviously, we start at false.

        let streaming = false;

        // The various HTML elements we need to configure or control. These
        // will be set by the startup() function.

        let video = null;
        let canvas = null;
        let photo = null;
        let startbutton = null;

        // function showViewLiveResultButton() {
        //     if (window.self !== window.top) {
        //         // Ensure that if our document is in a frame, we get the user
        //         // to first open it in its own tab or window. Otherwise, it
        //         // won't be able to request permission for camera access.
        //         document.querySelector(".contentarea").remove();
        //         const button = document.createElement("button");
        //         button.textContent = "View live result of the example code above";
        //         document.body.append(button);
        //         button.addEventListener("click", () => window.open(location.href));
        //         return true;
        //     }
        //     return false;
        // }

        function startup() {
            // if (showViewLiveResultButton()) {
            //     return;
            // }
            video = document.getElementById("videoStream");
            canvas = document.getElementById("photoCanvas");
            photo = document.getElementById("imgPhoto");
            startbutton = document.getElementById("startbutton");

            navigator.mediaDevices
                .getUserMedia({ video: true, audio: false })
                .then((stream) => {
                    video.srcObject = stream;
                    video.play();
                })
                .catch((err) => {
                    console.error(`{[CAMERA APP]} An error occurred: ${err} \n\nYou probably do not have a webcam. To fix this, try plugging in a camera/webcam or maybe installing the correct drivers.`);
                });

            video.addEventListener(
                "canplay",
                (ev) => {
                    if (!streaming) {
                        height = video.videoHeight / (video.videoWidth / width);

                        // Firefox currently has a bug where the height can't be read from
                        // the video, so we will make assumptions if this happens.

                        if (isNaN(height)) {
                            height = width / (4 / 3);
                        }

                        video.setAttribute("width", width);
                        video.setAttribute("height", height);
                        canvas.setAttribute("width", width);
                        canvas.setAttribute("height", height);
                        streaming = true;
                    }
                },
                false,
            );

            startbutton.addEventListener(
                "click",
                (ev) => {
                    takepicture();
                    ev.preventDefault();
                },
                false,
            );

            clearphoto();
        }

        // Fill the photo with an indication that none has been
        // captured.

        function clearphoto() {
            const context = canvas.getContext("2d");
            context.fillStyle = "#000";
            context.fillRect(0, 0, canvas.width, canvas.height);

            const data = canvas.toDataURL("image/png");
            photo.setAttribute("src", data);
        }

        // Capture a photo by fetching the current contents of the video
        // and drawing it into a canvas, then converting that to a PNG
        // format data URL. By drawing it on an offscreen canvas and then
        // drawing that to the screen, we can change its size and/or apply
        // other changes before drawing it.

        function takepicture() {
            const context = canvas.getContext("2d");
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);

                const data = canvas.toDataURL("image/png");
                photo.setAttribute("src", data);
            } else {
                clearphoto();
            }
        }

        // Set up our event listener to run the startup process
        // once loading is complete.
        window.addEventListener("load", startup, false);
    })();
    function crash() {
        // For E-Dog OS debugging purposes.
        bluescreen('show');

        // Stop/pause all the <audio> and <video> elements inside of the page.
        document.getElementById("MusicBox").pause();
        document.getElementById('busyAuido').pause();
        document.getElementById('dialAudio').pause();
        document.getElementById('audio1').pause();
        document.getElementById('audio001').pause();
        document.getElementById('video1').pause();

        document.getElementById("errorText01").innerHTML = "Sussus Amongus";
        document.getElementById("forcedCrash").innerHTML = "<br>(Forced Crash)<br>";


        //thisfunctionshouldneverexistsopleasedonotmakethisanactualfunctionsothatwhenyourunthisfunctionthereisaonehundredpercentchancethatitwillcrashedogosandalsopleasereadthistwicesothatyouwilldefinitelyrememberthatthisfunctionshouldneverexistsopleasedonotmakethisanactualfunction();
    }
}
catch (err) {
    bluescreen('show');

    // Stop/pause all the <audio> and <video> elements inside of the page.
    document.getElementById("MusicBox").pause();
    document.getElementById('busyAuido').pause();
    document.getElementById('dialAudio').pause();
    document.getElementById('audio1').pause();
    document.getElementById('audio001').pause();
    document.getElementById('video1').pause();

    document.getElementById("errorText01").innerHTML = err.message;
}

console.log("Successfully loaded E-Dog OS");