// Add event listener to book-item elements
document.querySelectorAll('.book-item').forEach(item => {
    item.addEventListener('click', function() {
        const url = item.getAttribute('data-url');  // Get the data-url attribute value
        window.location.href = url;  // Redirect the user to the URL
    });
});