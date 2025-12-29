function shutdown() {
    window.close();
}

function shutdownprompt(showhide) {
    if (showhide == "show") {
        document.getElementById('shutdownprompt').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('shutdownprompt').style.visibility = "hidden";
    }
}