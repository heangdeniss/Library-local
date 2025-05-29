// Forgot Password JavaScript functionality
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('forgot-password-form');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');

    // Password strength checker
    newPasswordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrength(strength);
    });

    // Real-time password confirmation check
    confirmPasswordInput.addEventListener('input', function() {
        const newPassword = newPasswordInput.value;
        const confirmPassword = this.value;
        
        if (confirmPassword && newPassword !== confirmPassword) {
            this.style.borderColor = '#dc3545';
            this.style.background = '#fff5f5';
        } else if (confirmPassword) {
            this.style.borderColor = '#28a745';
            this.style.background = '#f8fff8';
        } else {
            this.style.borderColor = '';
            this.style.background = '';
        }
    });

    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = {
            email: formData.get('email'),
            oldPassword: formData.get('oldPassword'),
            newPassword: formData.get('newPassword'),
            confirmPassword: formData.get('confirmPassword')
        };

        // Client-side validation
        if (!validateForm(data)) {
            return;
        }

        // Show loading state
        const submitBtn = form.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Updating...';
        submitBtn.disabled = true;

        // Submit to server
        fetch('/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage('An error occurred. Please try again.', 'error');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
});

function validateForm(data) {
    // Check if all fields are filled
    if (!data.email || !data.oldPassword || !data.newPassword || !data.confirmPassword) {
        showMessage('All fields are required', 'error');
        return false;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        showMessage('Please enter a valid email address', 'error');
        return false;
    }

    // Check password length
    if (data.newPassword.length < 6) {
        showMessage('New password must be at least 6 characters long', 'error');
        return false;
    }

    // Check password confirmation
    if (data.newPassword !== data.confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return false;
    }

    // Check if old and new passwords are different
    if (data.oldPassword === data.newPassword) {
        showMessage('New password must be different from current password', 'error');
        return false;
    }

    return true;
}

function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) {
        strength += 1;
    } else {
        feedback.push('At least 8 characters');
    }

    if (/[a-z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('Lowercase letter');
    }

    if (/[A-Z]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('Uppercase letter');
    }

    if (/[0-9]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('Number');
    }

    if (/[^A-Za-z0-9]/.test(password)) {
        strength += 1;
    } else {
        feedback.push('Special character');
    }

    return { strength, feedback };
}

function updatePasswordStrength(result) {
    const strengthDiv = document.getElementById('password-strength');
    const { strength, feedback } = result;

    let strengthText = '';
    let strengthClass = '';

    if (strength === 0) {
        strengthText = '';
        strengthClass = '';
    } else if (strength <= 2) {
        strengthText = 'Weak';
        strengthClass = 'weak';
    } else if (strength <= 3) {
        strengthText = 'Medium';
        strengthClass = 'medium';
    } else if (strength <= 4) {
        strengthText = 'Strong';
        strengthClass = 'strong';
    } else {
        strengthText = 'Very Strong';
        strengthClass = 'very-strong';
    }

    if (strengthText) {
        strengthDiv.innerHTML = `
            <div class="strength-indicator ${strengthClass}">
                <span class="strength-text">Password Strength: ${strengthText}</span>
                <div class="strength-bars">
                    ${Array.from({length: 5}, (_, i) => 
                        `<div class="strength-bar ${i < strength ? 'active' : ''}"></div>`
                    ).join('')}
                </div>
                ${feedback.length > 0 ? `<div class="strength-feedback">Need: ${feedback.join(', ')}</div>` : ''}
            </div>
        `;
    } else {
        strengthDiv.innerHTML = '';
    }
}

function togglePassword(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const passwordIcon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.classList.remove('fa-eye');
        passwordIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        passwordIcon.classList.remove('fa-eye-slash');
        passwordIcon.classList.add('fa-eye');
    }
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message');
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert message at the top of the form
    const form = document.getElementById('forgot-password-form');
    form.insertBefore(messageDiv, form.firstChild);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}
