// Professional Book Categories Page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize page animations
    initializeAnimations();
    
    // Setup book category interactions
    setupBookCategories();
    
    // Setup navigation
    setupNavigation();
    
    // Setup search functionality (if needed)
    setupSearch();
});

// Initialize smooth animations for page elements
function initializeAnimations() {
    // Animate category cards on load
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.6s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate header on load
    const header = document.querySelector('.hero-header');
    if (header) {
        header.style.opacity = '0';
        header.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            header.style.transition = 'all 0.8s ease';
            header.style.opacity = '1';
            header.style.transform = 'translateY(0)';
        }, 200);
    }
}

// Setup book category click handlers with enhanced feedback
function setupBookCategories() {
    document.querySelectorAll('.category-card').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                this.style.transform = '';
                
                // Get URL and navigate
                const url = this.getAttribute('data-url');
                if (url) {
                    // Add loading state
                    showLoadingState(this);
                    
                    // Navigate after short delay for better UX
                    setTimeout(() => {
                        window.location.href = url;
                    }, 300);
                }
            }, 150);
        });
        
        // Enhanced hover effects
        item.addEventListener('mouseenter', function() {
            const cardHoverEffect = this.querySelector('.card-hover-effect');
            if (cardHoverEffect) {
                cardHoverEffect.style.transform = 'scale(1.02)';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const cardHoverEffect = this.querySelector('.card-hover-effect');
            if (cardHoverEffect) {
                cardHoverEffect.style.transform = 'scale(1)';
            }
        });
    });
}

// Setup navigation with enhanced functionality
function setupNavigation() {
    const returnButton = document.getElementById('returnButton');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            // Add button animation
            returnButton.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                returnButton.style.transform = '';
                window.location.href = '/index1'; // Navigate to the logged-in home page
            }, 150);
        });
    }
    
    // Setup breadcrumb navigation if needed
    setupBreadcrumbs();
}

// Add loading state for better user feedback
function showLoadingState(element) {
    const cardContent = element.querySelector('.card-content');
    if (cardContent) {
        const loadingSpinner = document.createElement('div');
        loadingSpinner.innerHTML = '<i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-top: 1rem; color: #fff;"></i>';
        loadingSpinner.style.textAlign = 'center';
        loadingSpinner.classList.add('loading-spinner');
        cardContent.appendChild(loadingSpinner);
    }
}

// Setup basic search functionality for future enhancement
function setupSearch() {
    // Create search functionality if search input exists
    const searchInput = document.querySelector('#bookSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
}

// Search handler for filtering book categories
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(item => {
        const title = item.querySelector('.card-title').textContent.toLowerCase();
        const description = item.querySelector('.card-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            item.style.display = 'block';
            item.style.animation = 'fadeIn 0.3s ease';
        } else {
            item.style.display = 'none';
        }
    });
}

// Setup breadcrumb navigation
function setupBreadcrumbs() {
    // Add breadcrumb if container exists
    const breadcrumbContainer = document.querySelector('.breadcrumb-container');
    if (breadcrumbContainer) {
        const breadcrumb = `
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="/index1">Home</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Book Categories</li>
                </ol>
            </nav>
        `;
        breadcrumbContainer.innerHTML = breadcrumb;
    }
}

// Utility function for debouncing search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
      .category-card {
        animation: none !important;
    }
    
    .loading-state {
        pointer-events: none;
        opacity: 0.7;
    }
`;
document.head.appendChild(style);

// Background change functionality (optional - only if header and backgrounds are defined)
const header = document.querySelector('.hero-header');
const backgrounds = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
];

if (header && backgrounds) {
    let currentIndex = 0;
    function changeBackground() {
        header.style.backgroundImage = backgrounds[currentIndex];
        currentIndex = (currentIndex + 1) % backgrounds.length; 
    }
    
    changeBackground();  
    setInterval(changeBackground, 5000);  // Change every 5 seconds (5000ms)
}