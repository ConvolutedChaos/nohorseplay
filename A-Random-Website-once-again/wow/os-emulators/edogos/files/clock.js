const dateDiv = document.getElementById('date-div');

function myDateFunction() {
    const now = new Date();
    const nowStr = now.toLocaleString('en-US');
    dateDiv.innerHTML = nowStr;
}
setInterval(myDateFunction, 1000);

document.getElementById('dateandtime').innerHTML = Date()