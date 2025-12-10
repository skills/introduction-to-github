/**
 * ScrollVerse Portfolio JavaScript
 * Main client-side functionality
 * 
 * Features:
 * - Smooth scrolling navigation
 * - Scroll-triggered animations with lazy loading
 * - On-click sound triggers for aural engagement
 * - Cosmic frequency resonance aligned with ScrollVerse community
 * - Real-time SocketIO integration for progress tracking
 * - OmniTech1 Knowledge Graph visualization support
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
    
    // Initialize SocketIO real-time connection
    initSocketIO();
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
 * 
 * Enhanced with OmniTech1 Knowledge Graph frequency mapping
 */

// Store AudioContext constructor reference outside for performance
const AudioContextClass = window.AudioContext || window.webkitAudioContext;

const ScrollVerseSoundEngine = {
    audioContext: null,
    initialized: false,
    enabled: true,
    
    // Sacred frequencies for cosmic resonance - aligned with OmniTech1 Knowledge Graph
    frequencies: {
        click: 528,        // Hz - DNA repair/transformation frequency
        hover: 432,        // Hz - Natural healing frequency
        success: 777,      // Hz - Divine frequency
        navigation: 369,   // Hz - Sacred geometry frequency
        transition: 963,   // Hz - Pineal gland activation
        connect: 528,      // Hz - Connection established
        disconnect: 369,   // Hz - Connection lost
        notification: 777, // Hz - New notification
        error: 432         // Hz - Error tone (gentle)
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
     * @param {string} type - Sound type: 'click', 'hover', 'success', 'navigation', 'transition', etc.
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
    
    /**
     * Play a custom frequency tone
     * @param {number} frequency - Frequency in Hz
     * @param {number} duration - Duration in milliseconds
     */
    playFrequency(frequency, duration = 200) {
        if (!this.enabled || !this.audioContext) return;
        
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.1, now + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration / 1000);
            
            oscillator.start(now);
            oscillator.stop(now + duration / 1000);
        } catch (e) {
            // Silently fail
        }
    },
    
    /**
     * Play a chord of sacred frequencies
     * @param {Array<number>} frequencies - Array of frequencies to play together
     * @param {number} duration - Duration in milliseconds
     */
    playChord(frequencies, duration = 300) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playFrequency(freq, duration);
            }, index * 50); // Slight delay between notes for arpeggiated effect
        });
    },
    
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
};

// Make ScrollVerseSoundEngine globally available for admin page
window.ScrollVerseSoundEngine = ScrollVerseSoundEngine;

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

/**
 * Initialize SocketIO real-time connection
 * Connects to ScrollVerse backend for real-time progress updates
 */
function initSocketIO() {
    // Check if SocketIO is available (loaded via CDN in templates)
    if (typeof io === 'undefined') {
        console.log('SocketIO not loaded, running in static mode');
        return;
    }
    
    try {
        const socket = io();
        
        socket.on('connect', function() {
            console.log('Connected to ScrollVerse real-time server');
            ScrollVerseSoundEngine.play('connect', 150);
            
            // Subscribe to progress updates
            socket.emit('subscribe_progress', {});
        });
        
        socket.on('connected', function(data) {
            console.log('Server confirmation:', data.message);
        });
        
        socket.on('progress_update', function(data) {
            // Play notification sound
            ScrollVerseSoundEngine.play('notification', 100);
            
            // Dispatch custom event for components to listen to
            const event = new CustomEvent('scrollverse-progress', { detail: data });
            document.dispatchEvent(event);
            
            console.log('Progress update:', data);
        });
        
        socket.on('graph_data', function(data) {
            // Dispatch custom event for knowledge graph visualization
            const event = new CustomEvent('scrollverse-graph', { detail: data });
            document.dispatchEvent(event);
        });
        
        socket.on('disconnect', function() {
            console.log('Disconnected from ScrollVerse real-time server');
            ScrollVerseSoundEngine.play('disconnect', 100);
        });
        
        // Store socket reference globally for other scripts
        window.scrollverseSocket = socket;
        
    } catch (e) {
        console.log('SocketIO connection error, running in static mode');
    }
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
    
    /* Real-time progress banner styles */
    .section-progress {
        padding: 0.5rem 0;
    }
    
    .progress-banner {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
        border: 1px solid rgba(212, 175, 55, 0.3);
        border-radius: 8px;
    }
    
    .progress-icon {
        font-size: 1.25rem;
        animation: pulse 2s infinite;
    }
    
    .progress-message {
        flex: 1;
    }
    
    .progress-status {
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.75rem;
        text-transform: uppercase;
        font-weight: bold;
    }
    
    .status-in_progress {
        background: #3498db;
        color: white;
    }
    
    .status-completed {
        background: #27ae60;
        color: white;
    }
    
    .status-error {
        background: #e74c3c;
        color: white;
    }
    
    @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.5; }
        100% { opacity: 1; }
    }
`;
document.head.appendChild(style);
