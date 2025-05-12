document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();  // Prevent default form submission

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return; // Stop the submission if passwords do not match
    }

    // Send data using fetch (AJAX)
    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            username: username,
            email: email,
            password: password,
            confirmPassword: confirmPassword
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Registration successful!');
            window.location.href = '/login';
        } else {
            alert(data.message);  // Show any error message
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration succesfully.');
        window.location.href = '/login';
    });
});
