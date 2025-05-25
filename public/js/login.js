
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('.btn-submit');

   
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        const formGroup = this.closest('.form-group');

        if (email && !validateEmail(email)) {
            formGroup.classList.add('error');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (email) {
            formGroup.classList.remove('error');
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });    // Password validation (lenient - just check it's not empty)
    passwordInput.addEventListener('blur', function() {
        const password = this.value;
        const formGroup = this.closest('.form-group');

        if (password && password.length < 1) {
            formGroup.classList.add('error');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (password) {
            formGroup.classList.remove('error');
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('invalid');
        });

        let hasErrors = false;

        if (!email || !validateEmail(email)) {
            emailInput.closest('.form-group').classList.add('error');
            emailInput.classList.add('invalid');
            hasErrors = true;
        }        // Validate password (just check it's not empty)
        if (!password || password.length < 1) {
            passwordInput.closest('.form-group').classList.add('error');
            passwordInput.classList.add('invalid');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                password: password,
                remember: document.getElementById('remember').checked
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                submitButton.textContent = 'Login Successful!';
                submitButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    window.location.href = data.redirectUrl || '/';
                }, 1500);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);

            submitButton.disabled = false;
            submitButton.textContent = 'Log In';
        
            alert(error.message || 'Login failed. Please check your credentials.');
        });
    });
});