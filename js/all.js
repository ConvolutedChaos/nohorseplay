function myFunction() {
    var headingElement = document.getElementById("name");
    console.log(headingElement.innerHTML);
    var newHeadingText = prompt("What should we call you?");
    headingElement.innerHTML = newHeadingText;
}

function insult() {
    var randomBodyParts = ["Face", "Nose", "Hair", "Eye", "Chin"];
    var randomAdjectives = ["Smelly", "Boring", "Stupid", "Rancid", "Jelly", "Unfortunate"];
    var randomWords = ["Fly", "Marmot", "Stick", "Monkey", "Rat", "Crap", "Booger", "Thesarus"];
    var randomBodyPart = randomBodyParts[Math.floor(Math.random() * 5)];
    var randomAdjective = randomAdjectives[Math.floor(Math.random() * 6)];
    var randomWord = randomWords[Math.floor(Math.random() * 8)];
    var randomInsult = "Your " + randomBodyPart + " is like a " +
        randomAdjective + " " + randomWord + "!!!";
    alert(randomInsult)
}

function amhfitrilc() {
    var randomBodyParts = ["Man", "Fallen", "River", "Lego","City"];
    var randomAdjectives = ["Man", "Fallen", "River", "Lego","City"];
    var randomWords = ["Man", "Fallen", "River", "Lego","City"];
    var eabe = ["Man", "Fallen", "River", "Lego","City"];
    var randomBodyPart = randomBodyParts[Math.floor(Math.random() * 5)];
    var randomAdjective = randomAdjectives[Math.floor(Math.random() * 5)];
    var randomWord = randomWords[Math.floor(Math.random() * 5)];
    var rnadomeabe = randomWords[Math.floor(Math.random() * 5)];
    alert("A " + randomBodyPart + " has " + randomAdjective + "ed into a " + rnadomeabe + " in " + randomWord + " City!")
}

function kkwslink() {
    document.location="/KKWS/"
}

function sidenav(showhide) {
    if (showhide == "show") {
        document.getElementById('sidenav').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('sidenav').style.visibility = "hidden";
    }
}

function overlay(showhide) {
    if (showhide == "show") {
        document.getElementById('overlay').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('overlay').style.visibility = "hidden";
    }
}

function AngryBirds() {
    document.location="/fun/games/AngryBirds"
}