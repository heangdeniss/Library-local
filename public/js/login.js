document.getElementById('login-form').addEventListener('submit', function(e) {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        e.preventDefault();  // Prevent form submission
        alert('Please fill in both fields.');
    }
});