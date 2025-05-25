// Modern Analysis & Statistics Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    setupPDFControls();
    setupAnimations();
});

// Initialize page functionality
function initializePage() {
    // Add loading state for PDF
    const pdfObject = document.querySelector('.pdf-object');
    if (pdfObject) {
        showPDFLoading();
        
        pdfObject.addEventListener('load', () => {
            hidePDFLoading();
        });
        
        pdfObject.addEventListener('error', () => {
            hidePDFLoading();
            showPDFError();
        });
    }
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
}

// Setup PDF control functionality
function setupPDFControls() {
    // Fullscreen functionality
    window.openFullscreen = function() {
        const pdfCard = document.querySelector('.pdf-card');
        const pdfObject = document.querySelector('.pdf-object');
        
        if (pdfCard && pdfObject) {
            if (pdfCard.requestFullscreen) {
                pdfCard.requestFullscreen();
            } else if (pdfCard.webkitRequestFullscreen) {
                pdfCard.webkitRequestFullscreen();
            } else if (pdfCard.msRequestFullscreen) {
                pdfCard.msRequestFullscreen();
            }
            
            // Add fullscreen class for styling
            pdfCard.classList.add('fullscreen');
        }
    };
    
    // Handle fullscreen exit
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
}

// Handle fullscreen state changes
function handleFullscreenChange() {
    const pdfCard = document.querySelector('.pdf-card');
    
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (pdfCard) {
            pdfCard.classList.remove('fullscreen');
        }
    }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to go back
        if (e.key === 'Escape') {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                history.back();
            }
        }
        
        // F11 for fullscreen
        if (e.key === 'F11') {
            e.preventDefault();
            openFullscreen();
        }
        
        // Ctrl+D for download
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            const downloadLink = document.querySelector('a[download]');
            if (downloadLink) {
                downloadLink.click();
            }
        }
    });
}

// Setup page animations
function setupAnimations() {
    // Animate hero section elements
    const heroElements = document.querySelectorAll('.hero-section .display-5, .hero-section .lead, .hero-section .category-stats');
    heroElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.8s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 + (index * 200));
    });
    
    // Animate PDF card
    const pdfCard = document.querySelector('.pdf-card');
    if (pdfCard) {
        pdfCard.style.opacity = '0';
        pdfCard.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            pdfCard.style.transition = 'all 0.8s ease';
            pdfCard.style.opacity = '1';
            pdfCard.style.transform = 'translateY(0)';
        }, 400);
    }
    
    // Animate no content card
    const noContentCard = document.querySelector('.no-content-card');
    if (noContentCard) {
        noContentCard.style.opacity = '0';
        noContentCard.style.transform = 'translateY(40px)';
        
        setTimeout(() => {
            noContentCard.style.transition = 'all 0.8s ease';
            noContentCard.style.opacity = '1';
            noContentCard.style.transform = 'translateY(0)';
        }, 400);
    }
    
    // Animate header action buttons
    const headerActions = document.querySelectorAll('.header-actions .btn');
    headerActions.forEach((btn, index) => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            btn.style.transition = 'all 0.6s ease';
            btn.style.opacity = '1';
            btn.style.transform = 'translateX(0)';
        }, 600 + (index * 100));
    });
}

// Show PDF loading state
function showPDFLoading() {
    const pdfViewerContainer = document.querySelector('.pdf-viewer-container');
    if (pdfViewerContainer) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'pdf-loading';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <i class="fas fa-spinner fa-spin fa-3x mb-3 text-primary"></i>
                <h5>Loading PDF Document...</h5>
                <p class="text-muted">Please wait while we prepare your document</p>
            </div>
        `;
        loadingDiv.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;
            border-radius: 15px;
            backdrop-filter: blur(5px);
        `;
        
        const loadingContent = loadingDiv.querySelector('.loading-content');
        loadingContent.style.cssText = `
            text-align: center;
            color: #495057;
            padding: 2rem;
        `;
        
        pdfViewerContainer.style.position = 'relative';
        pdfViewerContainer.appendChild(loadingDiv);
    }
}

// Hide PDF loading state
function hidePDFLoading() {
    const loadingDiv = document.querySelector('.pdf-loading');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => {
            loadingDiv.remove();
        }, 300);
    }
}

// Show PDF error state
function showPDFError() {
    const pdfViewerContainer = document.querySelector('.pdf-viewer-container');
    const pdfObject = document.querySelector('.pdf-object');
    
    if (pdfViewerContainer && pdfObject) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'pdf-error';
        errorDiv.innerHTML = `
            <div class="error-content">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                <h4>Unable to Load PDF</h4>
                <p class="text-muted mb-4">The PDF document could not be displayed in your browser. Please try downloading it instead.</p>
                <div class="error-actions">
                    <button class="btn btn-primary me-2" onclick="window.location.reload()">
                        <i class="fas fa-refresh me-2"></i>Retry
                    </button>
                    <a href="${pdfObject.data}" class="btn btn-outline-primary" download>
                        <i class="fas fa-download me-2"></i>Download PDF
                    </a>
                </div>
            </div>
        `;
        
        errorDiv.style.cssText = `
            height: 500px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: white;
            border-radius: 15px;
            text-align: center;
            color: #6c757d;
            border: 2px dashed #dee2e6;
        `;
        
        const errorContent = errorDiv.querySelector('.error-content');
        errorContent.style.cssText = `
            padding: 2rem;
            max-width: 400px;
        `;
        
        pdfObject.style.display = 'none';
        pdfViewerContainer.appendChild(errorDiv);
    }
}

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Add professional button enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all existing functionality
    initializePage();
    setupPDFControls();
    setupAnimations();
    
    // Add button enhancements
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            if (!this.style.transform.includes('translateY')) {
                this.style.transform = 'translateY(-2px)';
            }
        });
        
        btn.addEventListener('mouseleave', function() {
            if (this.style.transform.includes('translateY(-2px)')) {
                this.style.transform = 'translateY(0)';
            }
        });
        
        btn.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(0)';
        });
        
        btn.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-2px)';
        });
    });
    
    // Add navbar scroll effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        });
    }
});

// Borrow book function
async function borrowBook(bookId) {
    const button = event.target;
    const originalText = button.innerHTML;
    
    try {
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Borrowing...';
        button.disabled = true;
        
        const response = await fetch(`/borrowing/borrow/${bookId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Success
            button.innerHTML = '<i class="fas fa-check me-2"></i>Borrowed!';
            button.className = 'btn btn-success ms-2';
            
            // Show success message
            showNotification('Book borrowed successfully! Due date: ' + result.dueDate, 'success');
            
            // Update the button permanently after a short delay
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-check me-2"></i>Borrowed';
                button.disabled = true;
                button.className = 'btn btn-secondary ms-2';
            }, 2000);
            
        } else {
            // Error
            throw new Error(result.error || 'Failed to borrow book');
        }
        
    } catch (error) {
        console.error('Error borrowing book:', error);
        
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
        
        // Show error message
        showNotification(error.message || 'Failed to borrow book. Please try again.', 'error');
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        ${message}