let isEligibleForBoot = true;
let isInBootMenu = false;
let bootTimeouts = [];

function startBootTimeouts() {
    // Clear any previous timeouts
    bootTimeouts.forEach(id => clearTimeout(id));
    bootTimeouts = [];

    // Reset boot stages
    document.getElementById('bootStage1').style.display = 'block';
    document.getElementById('bootStage2').style.display = 'none';
    document.getElementById('bootMenu').style.display = 'none';

    // Set up timeouts again
    bootTimeouts.push(setTimeout(function () {
        isEligibleForBoot = false;
    }, 2000));

    bootTimeouts.push(setTimeout(function () {
        document.getElementById('bootStage1').style.display = 'none';
    }, 2000));

    bootTimeouts.push(setTimeout(function () {
        document.getElementById('bootStage2').style.display = 'block';
    }, 2800));

    bootTimeouts.push(setTimeout(function () {
        console.log('Gonna boot now...');
        window.location.href = "login.html";
    }, 13900));
}

// Listen for keypress of F8 to toggle boot options
document.addEventListener('keydown', function (event) {
    if (isEligibleForBoot && event.key === 'F8') {
        isInBootMenu = true;
        // Show boot menu (implement your own boot menu display logic)
        document.getElementById('bootStage1').style.display = 'none';
        document.getElementById('bootStage2').style.display = 'none';
        document.getElementById('bootMenu').style.display = 'block'; // You need a #bootMenu element
        // Stop boot timeouts
        bootTimeouts.forEach(id => clearTimeout(id));
    }
    // Exit boot menu with ESC
    if (isInBootMenu && event.key === 'Escape') {
        isInBootMenu = false;
        document.getElementById('bootMenu').style.display = 'none';
        startBootTimeouts();
    }
});

// Start the boot timeouts initially
startBootTimeouts();