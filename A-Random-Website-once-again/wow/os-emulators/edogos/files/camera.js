var width = 320;
var height = 0;
var streaming = false;

navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function (err) {
            console.log("An error occured! " + err);
        });

video.addEventListener('canplay', function (ev) {
    if (!streaming) {
        height = video.videoHeight / (video.videoWidth / width);
        video.setAttribute('width', width);
        video.setAttribute('height', height);
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);

        streaming = true;
    }
}, false);

startbutton.addEventListener('click', function (ev) {
    takepicture();
    ev.preventDefault();
}, false);

clearphoto();

function clearphoto() {
    var context = canvas.getContext('2d');
    context.fillStyle = "#AAA";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function takepicture() {
    var context = canvas.getContext('2d');
    if (width && height) {
        canvas.width = width;
        canvas.height = height;
        context.drawImage(video, 0, 0, width, height);

        var dataURL = canvas.toDataURL("image/jpeg", 0.95);
        if (dataURL && dataURL != "data:,") {
            var fileName = generateImageName();
            uploadimage(dataURL, fileName);
        } else {
            alert("Image not available");
        }
    } else {
        clearphoto();
    }
}

function generateImageName() {
    // ... generate image name logic here ...
    return imageName;
}

function uploadimage(dataurl, filename) {
    // ... upload logic here ...
}