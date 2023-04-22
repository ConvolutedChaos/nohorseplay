function shutdown() {
    document.location="/A-Random-Website-once-again/wow/virtual-desktop-selection.html"
}

function shutdownprompt(showhide) {
    if (showhide == "show") {
        document.getElementById('shutdownprompt').style.visibility = "visible";
    } else if (showhide == "hide") {
        document.getElementById('shutdownprompt').style.visibility = "hidden";
    }
}