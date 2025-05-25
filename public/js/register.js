// Professional Register Form Validation and Submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('register-form');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchError = document.getElementById('password-match-error');
    const submitButton = document.querySelector('.btn-submit');    // Password strength checker (informational only)
    function checkPasswordStrength(password) {
        if (!password) return { strength: 0, feedback: '' };
        
        let strength = 0;
        let feedback = '';
        let tips = [];

        // Check criteria
        const hasLength = password.length >= 8;
        const hasLower = /[a-z]/.test(password);
        const hasUpper = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecial = /[^A-Za-z0-9]/.test(password);

        if (hasLength) strength++;
        if (hasLower) strength++;
        if (hasUpper) strength++;
        if (hasNumber) strength++;
        if (hasSpecial) strength++;

        // Build feedback with tips
        if (!hasLength) tips.push('8+ characters');
        if (!hasLower) tips.push('lowercase letter');
        if (!hasUpper) tips.push('uppercase letter');
        if (!hasNumber) tips.push('number');
        if (!hasSpecial) tips.push('special character');

        switch (strength) {
            case 0:
            case 1:
            case 2:
                feedback = '<span class="strength-weak">Weak password</span>';
                if (tips.length > 0) {
                    feedback += `<br><small>Consider adding: ${tips.join(', ')}</small>`;
                }
                break;
            case 3:
                feedback = '<span class="strength-medium">Medium strength</span>';
                if (tips.length > 0) {
                    feedback += `<br><small>Consider adding: ${tips.join(', ')}</small>`;
                }
                break;
            case 4:
                feedback = '<span class="strength-strong">Strong password</span>';
                if (tips.length > 0) {
                    feedback += `<br><small>Consider adding: ${tips.join(', ')}</small>`;
                }
                break;
            case 5:
                feedback = '<span class="strength-strong">Very strong password! ✓</span>';
                break;
        }

        return { strength, feedback };
    }

    // Real-time password strength checking
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const result = checkPasswordStrength(password);
        passwordStrengthDiv.innerHTML = result.feedback;
    });

    // Real-time password match checking
    function checkPasswordMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const formGroup = confirmPasswordInput.closest('.form-group');

        if (confirmPassword && password !== confirmPassword) {
            formGroup.classList.add('error');
            confirmPasswordInput.classList.add('invalid');
            confirmPasswordInput.classList.remove('valid');
            return false;
        } else if (confirmPassword && password === confirmPassword) {
            formGroup.classList.remove('error');
            confirmPasswordInput.classList.remove('invalid');
            confirmPasswordInput.classList.add('valid');
            return true;
        }
        return true;
    }

    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
    passwordInput.addEventListener('input', checkPasswordMatch);

    // Email validation
    function validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Real-time email validation
    emailInput.addEventListener('blur', function() {
        const email = this.value;
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
    });

    // Username validation
    usernameInput.addEventListener('blur', function() {
        const username = this.value;
        const formGroup = this.closest('.form-group');

        if (username && username.length < 3) {
            formGroup.classList.add('error');
            this.classList.add('invalid');
            this.classList.remove('valid');
        } else if (username) {
            formGroup.classList.remove('error');
            this.classList.remove('invalid');
            this.classList.add('valid');
        }
    });

    // Form submission with enhanced validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset all error states
        document.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
        });
        document.querySelectorAll('input').forEach(input => {
            input.classList.remove('invalid');
        });

        let hasErrors = false;

        // Validate username
        if (!username || username.length < 3) {
            usernameInput.closest('.form-group').classList.add('error');
            usernameInput.classList.add('invalid');
            hasErrors = true;
        }

        // Validate email
        if (!email || !validateEmail(email)) {
            emailInput.closest('.form-group').classList.add('error');
            emailInput.classList.add('invalid');
            hasErrors = true;
        }        // Validate password (minimum 3 characters, but allow any password)
        if (!password || password.length < 3) {
            passwordInput.closest('.form-group').classList.add('error');
            passwordInput.classList.add('invalid');
            hasErrors = true;
        }

        // Validate password match
        if (password !== confirmPassword) {
            confirmPasswordInput.closest('.form-group').classList.add('error');
            confirmPasswordInput.classList.add('invalid');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Disable submit button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Creating Account...';

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
                'confirm-password': confirmPassword
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Success feedback
                submitButton.textContent = 'Account Created!';
                submitButton.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
                
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
            } else {
                throw new Error(data.message || 'Registration failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = 'Register Now';
            
            // Show error feedback
            alert(error.message || 'Registration failed. Please try again.');
        });
    });
});
