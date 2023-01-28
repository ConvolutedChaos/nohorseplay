var randomBodyParts = ["Face", "Nose", "Hair","Butt","Eye","Chin"];
var randomAdjectives = ["Smelly", "Boring", "Stupid","Rancid","Jelly","Unfortunate"];
var randomWords = ["Fly", "Marmot", "Stick", "Monkey", "Rat","Crap","Booger","Thesarus"];
var randomBodyPart = randomBodyParts[Math.floor(Math.random() * 3)];
var randomAdjective = randomAdjectives[Math.floor(Math.random() * 3)];
var randomWord = randomWords[Math.floor(Math.random() * 5)];
var randomInsult = "Your " + randomBodyPart + " is like a " +
randomAdjective + " " + randomWord + "!!!";
alert("Your " + randomBodyPart + " is like a " + randomAdjective + " " + randomWord)