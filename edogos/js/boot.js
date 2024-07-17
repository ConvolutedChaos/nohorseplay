function continueBoot() {
    window.location.href = "login.html"
}

// Set a timeout for 3 seconds
setTimeout(function() {
    console.log('Gonna boot now...');
    continueBoot();
}, 10000);