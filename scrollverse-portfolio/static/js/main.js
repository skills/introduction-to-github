/**
 * ScrollVerse Portfolio JavaScript
 * Main client-side functionality
 * 
 * Features:
 * - Smooth scrolling navigation
 * - Scroll-triggered animations with lazy loading
 * - On-click sound triggers for aural engagement
 * - Cosmic frequency resonance aligned with ScrollVerse community
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize smooth scrolling
    initSmoothScroll();
    
    // Initialize scroll-triggered animations with lazy loading
    initAnimations();
    
    // Initialize navigation highlighting
    initNavHighlight();
    
    // Initialize on-click sound triggers
    initSoundTriggers();
});

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Initialize scroll-triggered animations with lazy loading
 * Uses Intersection Observer API for progressive artifact reveal
 * Implements content-visibility for performance optimization
 */
function initAnimations() {
    // Lazy loading observer for animations - deferred for initial render optimization
    const animationObserverOptions = {
        threshold: 0.1,
        rootMargin: '100px 0px -50px 0px' // Pre-load slightly before viewport
    };
    
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Staggered animation for smoother progressive reveal
                const delay = parseInt(entry.target.dataset.animationDelay, 10) || 0;
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                    entry.target.classList.remove('animate-ready');
                }, delay);
                animationObserver.unobserve(entry.target);
            }
        });
    }, animationObserverOptions);
    
    // Section reveal observer for larger content blocks
    const sectionObserverOptions = {
        threshold: 0.05,
        rootMargin: '50px 0px 0px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-visible');
                sectionObserver.unobserve(entry.target);
            }
        });
    }, sectionObserverOptions);
    
    // Observe cards with staggered delays for cosmic frequency resonance
    const animatableElements = document.querySelectorAll(
        '.about-card, .project-card, .project-card-full, .blockchain-card, .stat-card, .info-card, .tier-item, .rarity-item, .feature-card'
    );
    
    // 6 represents the sacred hexagonal pattern in cosmic geometry,
    // creating a harmonious visual rhythm as elements reveal
    const SACRED_STAGGER_GROUP = 6;
    const STAGGER_DELAY_MS = 100;
    
    animatableElements.forEach((el, index) => {
        el.classList.add('animate-ready');
        // Stagger animations based on position (aligned with sacred geometry)
        el.dataset.animationDelay = (index % SACRED_STAGGER_GROUP) * STAGGER_DELAY_MS;
        animationObserver.observe(el);
    });
    
    // Observe sections for progressive reveal
    document.querySelectorAll('.section, .blockchain-section, .rarity-section, .features-section').forEach(section => {
        section.classList.add('section-ready');
        sectionObserver.observe(section);
    });
}

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
 * ScrollVerse Sound Engine
 * Creates cosmic frequency resonance sounds using Web Audio API
 * Frequencies aligned with sacred healing frequencies (432Hz, 528Hz, 777Hz, 963Hz, 369Hz)
 */

// Store AudioContext constructor reference outside for performance
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

const ScrollVerseSoundEngine = {
    audioContext: null,
    initialized: false,
    enabled: true,
    
    // Sacred frequencies for cosmic resonance
    frequencies: {
        click: 528,      // Hz - DNA repair/transformation frequency
        hover: 432,      // Hz - Natural healing frequency
        success: 777,    // Hz - Divine frequency
        navigation: 369, // Hz - Sacred geometry frequency
        transition: 963  // Hz - Pineal gland activation
    },
    
    init() {
        if (this.initialized) return;
        
        try {
            // Create audio context on first user interaction (required by browsers)
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
                this.initialized = true;
            }
        } catch (e) {
            console.log('Web Audio API not supported');
            this.enabled = false;
        }
    },
    
    /**
     * Play a cosmic resonance tone
     * @param {string} type - Sound type: 'click', 'hover', 'success', 'navigation', 'transition'
     * @param {number} duration - Duration in milliseconds
     */
    play(type = 'click', duration = 80) {
        if (!this.enabled || !this.audioContext) return;
        
        // Resume audio context if suspended (browser autoplay policy)
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Get frequency for sound type
            const frequency = this.frequencies[type] || this.frequencies.click;
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Sine wave for smooth, cosmic sound
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            // Gentle volume envelope for pleasant aural experience
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
            
            oscillator.start(now);
            oscillator.stop(now + duration / 1000);
        } catch (e) {
            // Silently fail if sound cannot be played
        }
    },
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

/**
 * Initialize on-click sound triggers for aural engagement
 * Adds cosmic frequency sounds to interactive elements
 */
function initSoundTriggers() {
    // Initialize sound engine on first interaction
    const initSound = () => {
        ScrollVerseSoundEngine.init();
        document.removeEventListener('click', initSound);
        document.removeEventListener('keydown', initSound);
    };
    
    document.addEventListener('click', initSound);
    document.addEventListener('keydown', initSound);
    
    // Add sound triggers to buttons
    document.querySelectorAll('.btn, .btn-primary, .btn-secondary, .mint-button, .qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            ScrollVerseSoundEngine.play('click', 100);
        });
    });
    
    // Add sound triggers to navigation links
    document.querySelectorAll('.nav-link, .footer-link').forEach(link => {
        link.addEventListener('click', () => {
            ScrollVerseSoundEngine.play('navigation', 120);
        });
    });
    
    // Add hover sounds to cards (subtle)
    document.querySelectorAll('.about-card, .project-card, .blockchain-card, .stat-card, .tier-item, .rarity-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            ScrollVerseSoundEngine.play('hover', 50);
        });
    });
    
    // Add click sounds to interactive cards
    document.querySelectorAll('.project-card, .project-card-full, .blockchain-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            ScrollVerseSoundEngine.play('transition', 150);
        });
    });
}

// Add animation and section styles dynamically
const style = document.createElement('style');
style.textContent = `
    /* Animation ready state - elements hidden before scroll reveal */
    .animate-ready {
        opacity: 0;
        transform: translateY(30px);
        transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), 
                    transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Animated in state - cosmic reveal */
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    /* Section ready state for lazy loading */
    .section-ready {
        opacity: 0.3;
        transition: opacity 0.8s ease-out;
    }
    
    /* Section visible state */
    .section-visible {
        opacity: 1;
    }
    
    /* Active navigation link */
    .nav-link.active {
        color: var(--gold-primary);
        background: rgba(212, 175, 55, 0.1);
    }
    
    /* Enhanced hover feedback with cosmic glow */
    .btn:active,
    .nav-link:active {
        transform: scale(0.98);
    }
    
    /* Card click feedback */
    .project-card:active,
    .blockchain-card:active,
    .about-card:active {
        transform: scale(0.99);
    }
    
    /* Lazy loading optimization using content-visibility */
    .section {
        content-visibility: auto;
        contain-intrinsic-size: 0 500px;
    }
`;
document.head.appendChild(style);
