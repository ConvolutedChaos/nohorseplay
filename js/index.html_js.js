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

