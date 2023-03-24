function myFunction() {
    var headingElement = document.getElementById("name");
    console.log(headingElement.innerHTML);
    var newHeadingText = prompt("What should we call you?");
    headingElement.innerHTML = newHeadingText;
}

function insult() {
    var randomBodyParts = ["Face", "Nose", "Hair", "Butt", "Eye", "Chin"];
    var randomAdjectives = ["Smelly", "Boring", "Stupid", "Rancid", "Jelly", "Unfortunate"];
    var randomWords = ["Fly", "Marmot", "Stick", "Monkey", "Rat", "Crap", "Booger", "Thesarus"];
    var randomBodyPart = randomBodyParts[Math.floor(Math.random() * 5)];
    var randomAdjective = randomAdjectives[Math.floor(Math.random() * 6)];
    var randomWord = randomWords[Math.floor(Math.random() * 8)];
    var randomInsult = "Your " + randomBodyPart + " is like a " +
        randomAdjective + " " + randomWord + "!!!";
    alert("Your " + randomBodyPart + " is like a " + randomAdjective + " " + randomWord)
}

let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
    showSlides(slideIndex += n);
}

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
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

function fileexplorer(showhide) {
    if (showhide == "show") {
        document.getElementById('fileexplorer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('fileexplorer').style.visibility = "hidden";
    }
}

function funwithjs(showhide) {
    if (showhide == "show") {
        document.getElementById('funwithjs').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('funwithjs').style.visibility = "hidden";
    }
}

function imac(showhide) {
    if (showhide == "show") {
        document.getElementById('imac').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('imac').style.visibility = "hidden";
    }
}

function baconexplorer(showhide) {
    if (showhide == "show") {
        document.getElementById('baconexplorer').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('baconexplorer').style.visibility = "hidden";
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
    
    