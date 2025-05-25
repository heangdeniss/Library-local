document.addEventListener('DOMContentLoaded', () => {
    // Add click event to book category items
    document.querySelectorAll('.book-item').forEach(item => {
        item.addEventListener('click', () => {
            const url = item.getAttribute('data-url');
            if (url) {
                // Add visual feedback before redirect
                item.style.opacity = '0.7';
                window.location.href = url;
            }
        });
        
        // Add hover effect for better UX
        item.addEventListener('mouseenter', () => {
            item.style.cursor = 'pointer';
        });
    });

    // Handle the Return Button
    const returnButton = document.getElementById('returnButton');
    if (returnButton) {
        returnButton.addEventListener('click', () => {
            window.location.href = '/'; // Navigate to the index page
        });
    }
});

const header = document.querySelector('.header');


const backgrounds = [
    'url(../images/fundamentals-of-statistics-cover.png)',
    'url(../images/324bs_ArtificialIntelligenceMachineLearning-cover.webp)',
    'url(../images/Big-data-jawfakhwbfawhfvaawdawfawfaw442834-cover.png)',
    'url(../images/845-visualization-cover.webp)',
    'url(../images/Five.Co-The-MySQL-cover.png)',
    'url(../images/Deep-Learning-and-Neural-Networks-a-detailed-analysis-Banner-cover.png)'
];


let currentIndex = 0;
function changeBackground() {
    header.style.backgroundImage = backgrounds[currentIndex];
    currentIndex = (currentIndex + 1) % backgrounds.length; 
}


changeBackground();  
setInterval(changeBackground, 5000);  // Change every 5 seconds (5000ms)