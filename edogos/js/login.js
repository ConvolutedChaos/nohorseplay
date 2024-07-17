function checkPassword() {
    var passwordInput = document.getElementById('password');
    var password = passwordInput.value;

    if (password == 'password') {
        window.location.href = "index.html"
    } else {
        alert('Incorrect password. Please try again.');
        passwordInput.value = ''; // Clear the input field
    }
}

function toggleElement() {
    var dropdownElement = document.getElementById('shutdownModal');
    if (dropdownElement.style.display === 'none') {
        dropdownElement.style.display = 'block';
    } else {
        dropdownElement.style.display = 'none';
    }
}