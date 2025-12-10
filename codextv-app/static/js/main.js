/**
 * CodexTV App JavaScript
 * Dynamic streaming functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation highlight
    initNavHighlight();
    
    // Initialize video card hover effects
    initVideoCards();
});

/**
 * Highlight active navigation link
 */
function initNavHighlight() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });
}

/**
 * Initialize video card interactions
 */
function initVideoCards() {
    document.querySelectorAll('.video-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            const playIcon = this.querySelector('.play-icon');
            if (playIcon) {
                playIcon.style.transform = 'scale(1.2)';
                playIcon.style.opacity = '1';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            const playIcon = this.querySelector('.play-icon');
            if (playIcon) {
                playIcon.style.transform = 'scale(1)';
                playIcon.style.opacity = '0.5';
            }
        });
    });
}

/**
 * Fetch stream data for a video
 */
async function fetchStreamData(videoId) {
    try {
        const response = await fetch(`/stream/${videoId}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching stream:', error);
        return null;
    }
}

/**
 * Initialize streaming session
 */
async function initStreamSession(videoId) {
    try {
        const response = await fetch(`/api/stream/init/${videoId}`);
        const data = await response.json();
        console.log('Stream session initialized:', data);
        return data;
    } catch (error) {
        console.error('Error initializing stream:', error);
        return null;
    }
}

/**
 * Update stream quality
 */
async function updateQuality(videoId, quality) {
    try {
        const response = await fetch(`/api/stream/quality/${videoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ quality: quality })
        });
        const data = await response.json();
        console.log('Quality updated:', data);
        return data;
    } catch (error) {
        console.error('Error updating quality:', error);
        return null;
    }
}

// Add active nav style
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--gold-primary);
        background: rgba(212, 175, 55, 0.1);
    }
`;
document.head.appendChild(style);
