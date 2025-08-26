document.getElementById("host-os").innerText = navigator.platform;

function checkPassword(event) {
    event.preventDefault(); // Prevent form submission
    const password = document.getElementById('password').value;
    const correctPassword = "password"; // Change this as needed
    if (password === correctPassword) {
        window.location.href = "index.html"; // Redirect to the desired page
    } else {
        alert("Incorrect password. Try again.");
    }
}

function togglePowerMenu() {
    const menu = document.getElementById('power-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// function toggleElement() {
//     var dropdownElement = document.getElementById('shutdownModal');
//     if (dropdownElement.style.display === 'none') {
//         dropdownElement.style.display = 'block';
//     } else {
//         dropdownElement.style.display = 'none';
//     }
// }

function updateTime() {
    const now = new Date();
    document.getElementById('time').innerText = now.toLocaleTimeString();
}
setInterval(updateTime, 1000);
window.onload = updateTime;