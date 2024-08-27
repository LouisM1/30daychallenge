// You can add any JavaScript functionality here
(function() {
    // Create a script element
    var vercelScript = document.createElement('script');

    // Set the type and src attributes
    vercelScript.type = 'text/javascript';
    vercelScript.src = 'https://vercel.analytics/script.js';

    // Optionally, set the defer attribute to load it after the HTML parsing
    vercelScript.defer = true;

    // Append the script to the <head> or <body>
    document.head.appendChild(vercelScript);
})();

console.log("Portfolio website loaded!");

document.addEventListener('DOMContentLoaded', function() {
    const nameSection = document.getElementById('name');
    const scrollIndicator = document.querySelector('.scroll-indicator');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        let scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        let scrollPercentage = scrollTop / scrollHeight;
        
        if (scrollTop > lastScrollTop && scrollTop > 50) {
            nameSection.classList.add('shrink');
        } else if (scrollTop <= 50) {
            nameSection.classList.remove('shrink');
        }
        
        // Update scroll indicator
        let opacity = 1 - scrollPercentage;
        let scale = 1 - (scrollPercentage * 0.2); // Decrease size by 20%
        scrollIndicator.style.opacity = opacity;
        scrollIndicator.style.transform = `scale(${scale})`;
        
        lastScrollTop = scrollTop;
    });

    // Calculate and display progress percentage
    function updateProgressPercentage() {
        const totalDays = 30;
        const completedDays = document.querySelectorAll('li.completed').length;
        const percentage = Math.round((completedDays / totalDays) * 100);
        const percentageElement = document.getElementById('progress-percentage');
        percentageElement.textContent = `(${percentage}%)`;
    }

    updateProgressPercentage();

    const infoButton = document.getElementById('info-button');
    const drawer = document.getElementById('info-drawer');
    const body = document.body;

    function openDrawer() {
        body.classList.add('drawer-open');
        infoButton.textContent = 'Close';
    }

    function closeDrawer() {
        body.classList.remove('drawer-open');
        infoButton.textContent = 'Info';
    }

    infoButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (body.classList.contains('drawer-open')) {
            closeDrawer();
        } else {
            openDrawer();
        }
    });

    // Close drawer when clicking outside
    document.addEventListener('click', function(e) {
        if (body.classList.contains('drawer-open') && 
            !drawer.contains(e.target) && 
            e.target !== infoButton) {
            closeDrawer();
        }
    });

    // Keyboard accessibility
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && body.classList.contains('drawer-open')) {
            closeDrawer();
        }
    });

    // Add event listeners for hover links
    const hoverLinks = document.querySelectorAll('.hover-link');
    
    hoverLinks.forEach(link => {
        link.addEventListener('click', () => {
            const href = link.getAttribute('data-href');
            window.open(href, '_blank');
        });
    });
});