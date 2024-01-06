var username = window.prompt("Please enter a username.");
var messageContainer = document.getElementById("messages");
var avatarDisplayName = document.getElementById("accountName");
if (username === null || username === "") {
    var randomNames = ["John", "Parker", "Reese", "Bob", "Peyton", "Brett", "Brayden", "Aiden", "Evan", "The Imposter", "Joe", "Joe Mama", "Chris", "Qwerty_man1212", "NaeNers", "Adam"];
    var randomName = randomNames[Math.floor(Math.random() * 16)];
    var theRandomName = randomName;
    username = theRandomName;
    avatarDisplayName.innerHTML = username;
    console.warn("You didn't put a username, so we picked a random name for you. We picked \"" + username + "\"")
}
avatarDisplayName.innerHTML = username;

function changeUsername() {
    username = window.prompt("Please enter a *NEW* username.");
    if (username === null || username === "") {
        var randomNames = ["John", "Parker", "Reese", "Bob", "Peyton", "Brett", "Brayden", "Aiden", "Evan", "The Imposter", "Joe", "Joe Mama", "Chris", "Qwerty_man1212", "NaeNers", "Adam"];
        var randomName = randomNames[Math.floor(Math.random() * 16)];
        var theRandomName = randomName;
        username = theRandomName;
        avatarDisplayName.innerHTML = username;
    }

    document.getElementById("accountName").innerHTML = username;
}

// localStorage.setItem(1, username);

function sendMessage() {
    // var displayName = username;
    var messageBox = document.getElementById("messageBox");
    var messageText = document.getElementById("messageBox").value;

    if (messageText === "" || messageText === null || messageText === " ") {
        alert("You need to put something in your message!")
        messageText = "Slap your friend! \n\nDo dah do do!";
        console.warn("You didn't put anything in your message.")
    }

    const newMessage = document.createElement("div");
    newMessage.innerHTML = "<div id='message'><button style='background-image: url(/media/images/avatar_m.png); background-size: cover; height: 75px; width: 75px; border: 2px solid #000000; border-radius: 100%;' id='avatar' title='" + username + "'>&nbsp;</button><br><p>&lt;" + username + "&gt;<br><br>" + messageText + "</p></div><br>";
    messageContainer.appendChild(newMessage);

    if (messageText == "Negro") {
        document.getElementById("alertModal").style.display = "block";
    }
}

function setAvatarPhoto001() {
    document.getElementById("avatar").style.backgroundImage = "url(../media/images/755803.jpg)";
}

function setAvatarPhoto002() {
    document.getElementById("avatar").style.backgroundImage = "url(../media/images/c7a7f75a32a55f4.png)";
}

function setAvatarPhoto003() {
    document.getElementById("avatar").style.backgroundImage = "url(../media/images/index-03-566x536.jpg)";
}

function setAvatarPhoto004() {
    document.getElementById("avatar").style.backgroundImage = "url(../media/images/ssbu__black_yoshi_by_megatoon1234_dcr7f93-pre.jpg)";
}

function setAvatarPhoto005() {
    document.getElementById("avatar").style.backgroundImage = "url(../media/images/yassir.png)";
}

function closeModal() {
    const newMessage = document.createElement("div");
    newMessage.innerHTML = "<div id='message'><button style='background-image: url(/media/images/avatar_m.png); background-size: cover; height: 75px; width: 75px; border: 2px solid #000000; border-radius: 100%;' id='avatar' title='" + username + "'>&nbsp;</button><br><p>&lt;" + username + "&gt;<br><br><video src='media/videos/killyourself.mp4' controls></video></p></div><br>";
    messageContainer.appendChild(newMessage);
    document.getElementById("alertModal").style.display = "none";
}

function quitApp() {
    localStorage.clear();
    window.close();
}

function handleFileSelect(evt) {
    var files = evt.target.files;

    // Loop through the FileList and render image files as thumbnails.
    for (var i = 0, f; f = files[i]; i++) {

        // Only process image files.
        if (!f.type.match('image.*')) {
            continue;
        } else {
            console.warn('Only image files!\n')
        }

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
            return function (e) {
                // Render thumbnail.
                var span = document.createElement('span');
                span.innerHTML =
                    [
                        '<i></i>'
                    ].join('');
                $('#avatar').attr('style', 'background-image:url(' + e.target.result + ')');
                document.getElementById('list').insertBefore(span, null);
            };
        })(f);

        // Read in the image file as a data URL.
        reader.readAsDataURL(f);
    }
}

document.getElementById('files').addEventListener('change', handleFileSelect, false);

console.log("Successfully loaded E-Dog's Chat Room version 1.0!")