// Add CSS styles for disabled button
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .button-disabled {
            opacity: 0.3 !important;
            cursor: not-allowed !important;
            pointer-events: none !important;
            transition: all 0.3s ease !important;
            background-color: #ccc !important;
            color: #666 !important;
            box-shadow: none !important;
            transform: scale(0.95) !important;
        }
    `;
    document.head.appendChild(style);
})();

// Global timeout and event listener tracking
const AppUtils = {
    timeouts: [],
    eventListeners: [],
    
    // Safe setTimeout with tracking
    safeSetTimeout: function(callback, delay) {
        try {
            const timeoutId = setTimeout(() => {
                // Remove from tracking array when executed
                this.timeouts = this.timeouts.filter(id => id !== timeoutId);
                callback();
            }, delay);
            
            // Add to tracking array
            this.timeouts.push(timeoutId);
            return timeoutId;
        } catch (error) {
            console.error('Error setting timeout:', error);
            return null;
        }
    },
    
    // Safe event listener with tracking
    safeAddEventListener: function(element, type, handler, options) {
        if (!element) return null;
        
        try {
            element.addEventListener(type, handler, options);
            this.eventListeners.push({ element, type, handler });
            return handler;
        } catch (error) {
            console.error('Error adding event listener:', error);
            return null;
        }
    },
    
    // Cleanup all timeouts and event listeners
    cleanup: function() {
        try {
            // Clear all timeouts
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
            
            // Remove all event listeners
            this.eventListeners.forEach(({ element, type, handler }) => {
                if (element) {
                    element.removeEventListener(type, handler);
                }
            });
            this.eventListeners = [];
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
};

// Browser Compatibility Checks
function checkBrowserCompatibility() {
    const warnings = [];
    
    // Check for ES6 class support using safer detection method
    try {
        eval('class TestClass {}');
    } catch (e) {
        warnings.push('Your browser does not support modern JavaScript features. The presentation may not work correctly.');
    }
    
    // Check for fullscreen API support
    if (!document.documentElement.requestFullscreen && 
        !document.documentElement.mozRequestFullScreen && 
        !document.documentElement.webkitRequestFullscreen && 
        !document.documentElement.msRequestFullscreen) {
        warnings.push('Your browser may not support fullscreen mode. Some features might be limited.');
    }
    
    // Check for CSS Grid support
    if (window.CSS && !CSS.supports('display', 'grid')) {
        warnings.push('Your browser does not fully support CSS Grid. The layout may appear incorrect.');
    }
    
    // Display warnings if any
    if (warnings.length > 0) {
        warnings.forEach(warning => {
            showCompatibilityWarning(warning);
        });
    }
    
    return warnings.length === 0;
}

// Show browser compatibility warning
function showCompatibilityWarning(message) {
    try {
        if (!document.body) {
            console.warn('Document body not available for compatibility warning');
            return;
        }
        
        // Create warning element
        const warning = document.createElement('div');
        warning.className = 'compatibility-warning';
        warning.setAttribute('role', 'alert');
        warning.setAttribute('aria-live', 'assertive');
        
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff9800;
            color: white;
            padding: 12px;
            text-align: center;
            z-index: 10001;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        // Set message
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        warning.appendChild(messageSpan);
        
        // Create close button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.setAttribute('aria-label', 'Close warning');
        
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            margin-left: 10px;
            cursor: pointer;
            padding: 0 5px;
            border-radius: 2px;
        `;
        
        // Use safer event handling
        AppUtils.safeAddEventListener(closeBtn, 'click', () => warning.remove());
        AppUtils.safeAddEventListener(closeBtn, 'mouseover', () => closeBtn.style.background = 'rgba(255,255,255,0.2)');
        AppUtils.safeAddEventListener(closeBtn, 'mouseout', () => closeBtn.style.background = 'none');
        
        warning.appendChild(closeBtn);
        document.body.insertBefore(warning, document.body.firstChild);
        
        // Auto-remove after 10 seconds using tracked timeout
        AppUtils.safeSetTimeout(() => {
            if (warning.parentNode) {
                warning.remove();
            }
        }, 10000);
    } catch (error) {
        console.error('Error showing compatibility warning:', error);
    }
}

// Presentation Controller
class PresentationController {
    constructor() {
        try {
            this.currentSlide = 1;
            this.totalSlides = 9; // Updated from 8 to 9
            this.slides = document.querySelectorAll('.slide');
            this.progressFill = document.getElementById('progress-fill');
            this.currentSlideElement = document.getElementById('current-slide');
            this.totalSlidesElement = document.getElementById('total-slides');
            
            // Track timeouts for cleanup
            this.timeouts = [];
            
            // Track event listeners for cleanup
            this.eventListeners = [];
            
            // Validate required elements
            if (!this.slides.length) {
                throw new Error('No slides found in the document');
            }
            
            this.init();
        } catch (error) {
            console.error('Failed to initialize PresentationController:', error);
            // Fallback: try to continue with basic functionality
            this.currentSlide = 1;
            this.totalSlides = 9;
            this.timeouts = [];
            this.eventListeners = [];
        }
    }
    
    // Helper method to safely set timeout with tracking
    safeSetTimeout(callback, delay) {
        try {
            const timeoutId = setTimeout(() => {
                // Remove from tracking array when executed
                this.timeouts = this.timeouts.filter(id => id !== timeoutId);
                callback();
            }, delay);
            
            // Add to tracking array
            this.timeouts.push(timeoutId);
            return timeoutId;
        } catch (error) {
            console.error('Error setting timeout:', error);
            return null;
        }
    }
    
    // Helper method to safely add event listener with tracking
    safeAddEventListener(element, type, handler, options) {
        if (!element) return null;
        
        try {
            element.addEventListener(type, handler, options);
            this.eventListeners.push({ element, type, handler });
            return handler;
        } catch (error) {
            console.error('Error adding event listener:', error);
            return null;
        }
    }
    
    // Cleanup all timeouts and event listeners
    cleanup() {
        try {
            // Clear all timeouts
            this.timeouts.forEach(id => clearTimeout(id));
            this.timeouts = [];
            
            // Remove all event listeners
            this.eventListeners.forEach(({ element, type, handler }) => {
                if (element) {
                    element.removeEventListener(type, handler);
                }
            });
            this.eventListeners = [];
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    
    init() {
        try {
            // Set initial state
            this.updateSlideDisplay();
            this.updateProgress();
            
            // Set total slides count
            if (this.totalSlidesElement) {
                this.totalSlidesElement.textContent = this.totalSlides;
            }
            
            // Add event listeners with tracking
            this.safeAddEventListener(document, 'keydown', this.handleKeyPress.bind(this));
            
            // Add swipe detection for mobile
            this.addSwipeDetection();
            
            // Add click listeners for character cards
            this.addCharacterCardListeners();
            
            // Add window unload event to clean up resources
            this.safeAddEventListener(window, 'beforeunload', () => this.cleanup());
            
            // Navigation hint removed as requested
            // this.showNavigationHint();
        } catch (error) {
            console.error('Error initializing presentation:', error);
        }
    }
    
    // Show temporary navigation hint at the bottom of the screen
    showNavigationHint() {
        try {
            // Create keyboard hint element if it doesn't exist
            let keyboardHint = document.querySelector('.keyboard-hint');
            if (!keyboardHint) {
                keyboardHint = document.createElement('div');
                keyboardHint.className = 'keyboard-hint';
                
                // Safe DOM manipulation instead of innerHTML
                const fragment = document.createDocumentFragment();
                
                fragment.appendChild(document.createTextNode('Use arrow keys or swipe to navigate slides. Press '));
                
                const strongF = document.createElement('strong');
                strongF.textContent = 'F';
                fragment.appendChild(strongF);
                
                fragment.appendChild(document.createTextNode(' for fullscreen, '));
                
                const strongH = document.createElement('strong');
                strongH.textContent = 'H';
                fragment.appendChild(strongH);
                
                fragment.appendChild(document.createTextNode(' for help, '));
                
                const strongP = document.createElement('strong');
                strongP.textContent = 'P';
                fragment.appendChild(strongP);
                
                fragment.appendChild(document.createTextNode(' for access mode.'));
                
                keyboardHint.appendChild(fragment);
                
                if (document.body) {
                    document.body.appendChild(keyboardHint);
                    
                    // Fade in with tracked timeout
                    this.safeSetTimeout(() => {
                        if (keyboardHint) {
                            keyboardHint.style.opacity = '1';
                        }
                    }, 100);
                    
                    // Auto-remove after 5 seconds with tracked timeout
                    this.safeSetTimeout(() => {
                        if (keyboardHint && keyboardHint.parentNode) {
                            keyboardHint.style.opacity = '0';
                            
                            this.safeSetTimeout(() => {
                                if (keyboardHint && keyboardHint.parentNode) {
                                    keyboardHint.remove();
                                }
                            }, 500);
                        }
                    }, 5000);
                }
            }
        } catch (error) {
            console.error('Error showing navigation hint:', error);
        }
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.goToSlide(this.currentSlide + 1);
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 1) {
            this.goToSlide(this.currentSlide - 1);
        }
    }
    
    goToSlide(slideNumber) {
        try {
            if (slideNumber < 1 || slideNumber > this.totalSlides) {
                console.warn(`Invalid slide number: ${slideNumber}`);
                return;
            }
            
            // Update current slide
            this.currentSlide = slideNumber;
            
            // Update slide display
            this.updateSlideDisplay();
            
            // Update progress bar
            this.updateProgress();
        } catch (error) {
            console.error('Error navigating to slide:', error);
        }
    }
    
    updateSlideDisplay() {
        try {
            // Hide all slides
            this.slides.forEach(slide => {
                slide.classList.remove('active');
            });
            
            // Show current slide
            const currentSlideElement = document.getElementById(`slide-${this.currentSlide}`);
            if (currentSlideElement) {
                currentSlideElement.classList.add('active');
            }
            
            // Update current slide number
            if (this.currentSlideElement) {
                this.currentSlideElement.textContent = this.currentSlide;
            }
        } catch (error) {
            console.error('Error updating slide display:', error);
        }
    }
    
    updateProgress() {
        try {
            if (this.progressFill) {
                const progress = (this.currentSlide - 1) / (this.totalSlides - 1) * 100;
                this.progressFill.style.width = `${progress}%`;
            }
        } catch (error) {
            console.error('Error updating progress bar:', error);
        }
    }
    
    handleKeyPress(e) {
        try {
            // Ignore key events if user is typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
                return;
            }
            
            // Check if poster was just closed to prevent immediate space key actions
            if (e.key === ' ' && window.posterJustClosed) {
                e.preventDefault();
                return;
            }
            
            switch (e.key) {
                case 'ArrowRight':
                case ' ':
                    this.nextSlide();
                    break;
                case 'ArrowLeft':
                    this.previousSlide();
                    break;
                case 'Home':
                    this.goToSlide(1);
                    break;
                case 'End':
                    this.goToSlide(this.totalSlides);
                    break;
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    const slideNumber = parseInt(e.key);
                    if (slideNumber <= this.totalSlides) {
                        this.goToSlide(slideNumber);
                    }
                    break;
                case 'f':
                case 'F':
                    this.toggleFullscreen();
                    break;
                case 'p':
                case 'P':
                    this.toggleAccessMode();
                    break;
            }
        } catch (error) {
            console.error('Error handling key press:', error);
        }
    }
    
    toggleFullscreen() {
        try {
            if (!document.fullscreenElement &&
                !document.mozFullScreenElement &&
                !document.webkitFullscreenElement &&
                !document.msFullscreenElement) {
                // Enter fullscreen
                if (document.documentElement.requestFullscreen) {
                    document.documentElement.requestFullscreen();
                } else if (document.documentElement.msRequestFullscreen) {
                    document.documentElement.msRequestFullscreen();
                } else if (document.documentElement.mozRequestFullScreen) {
                    document.documentElement.mozRequestFullScreen();
                } else if (document.documentElement.webkitRequestFullscreen) {
                    document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                }
                
                // Show navigation hint
                this.showNavigationHint();
            } else {
                // Exit fullscreen
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    }
    

    
    toggleAccessMode() {
        try {
            document.body.classList.toggle('access-mode');
            
            // Show notification
            const isEnabled = document.body.classList.contains('access-mode');
            this.showNotification(`Accessibility mode ${isEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            console.error('Error toggling access mode:', error);
        }
    }
    
    showNotification(message) {
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = 'notification';
            notification.textContent = message;
            
            // Style the notification
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 10000;
                font-size: 14px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                animation: slideIn 0.3s ease-out;
            `;
            
            document.body.appendChild(notification);
            
            // Auto-remove after 5 seconds
            this.safeSetTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideOut 0.3s ease-in';
                    this.safeSetTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                        }
                    }, 300);
                }
            }, 5000);
        } catch (error) {
            console.error('Error showing notification:', error);
        }
    }
    
    addSwipeDetection() {
        try {
            // Check if touch events are supported
            if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
                console.warn('Touch events not supported, skipping swipe detection');
                return;
            }
            
            // Store touch coordinates in the instance
            this.touchStartX = 0;
            this.touchEndX = 0;
            
            // Define handlers with proper binding to maintain 'this' context
            const touchStartHandler = e => {
                if (e.changedTouches && e.changedTouches[0]) {
                    this.touchStartX = e.changedTouches[0].screenX;
                }
            };
            
            const touchEndHandler = e => {
                if (e.changedTouches && e.changedTouches[0]) {
                    this.touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe();
                }
            };
            
            // Add event listeners with tracking
            this.safeAddEventListener(document, 'touchstart', touchStartHandler, { passive: true });
            this.safeAddEventListener(document, 'touchend', touchEndHandler, { passive: true });
            
            // Define swipe handler
            this.handleSwipe = () => {
                try {
                    const swipeThreshold = 50;
                    if (this.touchEndX < this.touchStartX - swipeThreshold) {
                        // Swipe left, go to next slide
                        this.nextSlide();
                    }
                    if (this.touchEndX > this.touchStartX + swipeThreshold) {
                        // Swipe right, go to previous slide
                        this.previousSlide();
                    }
                } catch (error) {
                    console.error('Error handling swipe:', error);
                }
            };
        } catch (error) {
            console.warn('Failed to add touch event listeners:', error);
        }
    }
    
    addCharacterCardListeners() {
        try {
            // Use event delegation for character cards instead of individual listeners
            const charactersGrid = document.querySelector('.characters-grid');
            if (charactersGrid) {
                this.safeAddEventListener(charactersGrid, 'click', (event) => {
                    // Find the closest character card parent
                    const card = event.target.closest('.character-card');
                    if (card) {
                        const role = card.getAttribute('data-role');
                        if (role) {
                            this.showCharacterOptions(role);
                        }
                    }
                });
            } else {
                // Fallback to individual listeners if grid not found
                const characterCards = document.querySelectorAll('.character-card');
                characterCards.forEach(card => {
                    this.safeAddEventListener(card, 'click', () => {
                        const role = card.getAttribute('data-role');
                        if (role) {
                            this.showCharacterOptions(role);
                        }
                    });
                });
            }
            
            // Add close button listener
            const closeButton = document.querySelector('.close-popup');
            if (closeButton) {
                this.safeAddEventListener(closeButton, 'click', this.closeCharacterPopup.bind(this));
            }
            
            // Add popup overlay listener
            const popupOverlay = document.getElementById('popup-overlay');
            if (popupOverlay) {
                this.safeAddEventListener(popupOverlay, 'click', this.closeCharacterPopup.bind(this));
            }
            
            // Add keyboard accessibility for character cards
            const characterCardsArray = Array.from(document.querySelectorAll('.character-card'));
            characterCardsArray.forEach(card => {
                // Make cards focusable
                if (!card.hasAttribute('tabindex')) {
                    card.setAttribute('tabindex', '0');
                }
                
                // Add keyboard event listener
                this.safeAddEventListener(card, 'keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        const role = card.getAttribute('data-role');
                        if (role) {
                            this.showCharacterOptions(role);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error adding character card listeners:', error);
        }
        
        // Add character option listeners using event delegation
        try {
            const popupContent = document.querySelector('.popup-content');
            if (popupContent) {
                this.safeAddEventListener(popupContent, 'click', (event) => {
                    const option = event.target.closest('.popup-option');
                    if (option) {
                        const role = option.getAttribute('data-role');
                        const name = option.getAttribute('data-name');
                        const img = option.querySelector('img');
                        
                        if (role && name && img) {
                            this.updateCharacter(role, name, img.src);
                            this.closeCharacterPopup();
                        }
                    }
                });
            } else {
                // Fallback to individual listeners
                const characterOptions = document.querySelectorAll('.popup-option');
                characterOptions.forEach(option => {
                    this.safeAddEventListener(option, 'click', () => {
                        const role = option.getAttribute('data-role');
                        const name = option.getAttribute('data-name');
                        const img = option.querySelector('img');
                        
                        if (role && name && img) {
                            this.updateCharacter(role, name, img.src);
                            this.closeCharacterPopup();
                        }
                    });
                });
            }
            
            // Add keyboard accessibility for character options
            const characterOptions = document.querySelectorAll('.popup-option');
            characterOptions.forEach(option => {
                // Make options focusable
                if (!option.hasAttribute('tabindex')) {
                    option.setAttribute('tabindex', '0');
                }
                
                // Add keyboard event listener
                this.safeAddEventListener(option, 'keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        const role = option.getAttribute('data-role');
                        const name = option.getAttribute('data-name');
                        const img = option.querySelector('img');
                        
                        if (role && name && img) {
                            this.updateCharacter(role, name, img.src);
                            this.closeCharacterPopup();
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error adding character option listeners:', error);
        }
    }
    
    showCharacterOptions(role) {
        try {
            if (!role) {
                console.error('No role provided to showCharacterOptions');
                return;
            }
            
            const popup = document.getElementById('character-popup');
            const overlay = document.getElementById('popup-overlay');
            const popupTitle = document.getElementById('popup-title');
            
            if (!popup || !overlay) {
                console.error('Character popup or overlay not found');
                return;
            }
            
            // Hide all options first using CSS classes instead of direct style manipulation
            const optionsElements = document.querySelectorAll('.popup-options');
            optionsElements.forEach(options => {
                if (options) {
                    options.classList.remove('active');
                    options.style.display = 'none';
                }
            });
            
            // Show options for selected role
            const roleOptions = document.getElementById(`${role}-options`);
            if (roleOptions) {
                roleOptions.classList.add('active');
                roleOptions.style.display = 'flex';
                
                // Ensure options are accessible
                const optionElements = roleOptions.querySelectorAll('.popup-option');
                optionElements.forEach((option, index) => {
                    if (!option.hasAttribute('tabindex')) {
                        option.setAttribute('tabindex', '0');
                    }
                    
                    // Set aria attributes for accessibility
                    option.setAttribute('role', 'button');
                    option.setAttribute('aria-label', `Select ${option.getAttribute('data-name') || ''}`);
                });
                
                // Focus the first option for keyboard navigation
                const firstOption = roleOptions.querySelector('.popup-option');
                if (firstOption) {
                    this.safeSetTimeout(() => {
                        firstOption.focus();
                    }, 100);
                }
            } else {
                console.warn(`No options found for role: ${role}`);
            }
            
            // Update popup title
            if (popupTitle) {
                const capitalizedRole = role.charAt(0).toUpperCase() + role.slice(1);
                popupTitle.textContent = `Select ${capitalizedRole} Character`;
                
                // Set aria attributes for accessibility
                popup.setAttribute('aria-labelledby', 'popup-title');
            }
            
            // Show popup and overlay
            popup.classList.add('active');
            overlay.classList.add('active');
            
            // Set aria attributes for accessibility
            popup.setAttribute('aria-modal', 'true');
            popup.setAttribute('role', 'dialog');
            
            // Add ESC key handler for accessibility
            const escHandler = (event) => {
                if (event.key === 'Escape') {
                    this.closeCharacterPopup();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            
            this.safeAddEventListener(document, 'keydown', escHandler);
        } catch (error) {
            console.error('Error showing character options:', error);
        }
    }
    
    closeCharacterPopup() {
        try {
            const popup = document.getElementById('character-popup');
            const overlay = document.getElementById('popup-overlay');
            
            if (!popup || !overlay) {
                console.warn('Character popup or overlay not found');
                return;
            }
            
            // Remove active classes
            popup.classList.remove('active');
            overlay.classList.remove('active');
            
            // Reset aria attributes
            popup.removeAttribute('aria-modal');
            
            // Return focus to the element that opened the popup
            const activeSlide = document.querySelector('.slide.active');
            if (activeSlide) {
                const focusableElement = activeSlide.querySelector('[tabindex="0"]');
                if (focusableElement) {
                    this.safeSetTimeout(() => {
                        focusableElement.focus();
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error closing character popup:', error);
        }
    }
    
    updateCharacter(role, name, imgSrc) {
        if (!role || !name || !imgSrc) {
            console.error('Missing required parameters for updateCharacter:', { role, name, imgSrc });
            return false;
        }
        
        try {
            const card = document.getElementById(`${role}-card`);
            if (!card) {
                console.error(`Character card not found for role: ${role}`);
                return false;
            }
            
            // Update card image
            const cardImage = card.querySelector('img');
            if (cardImage) {
                cardImage.src = imgSrc;
                cardImage.alt = name;
            }
            
            // Update card name
            const cardName = card.querySelector('.character-name');
            if (cardName) {
                cardName.textContent = name;
            }
            
            // Update character data attribute
            card.setAttribute('data-character', name);
            
            return true;
        } catch (error) {
            console.error('Error updating character:', error);
            return false;
        }
    }
}

// Initialize presentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check browser compatibility
    checkBrowserCompatibility();
    
    try {
        window.presentationController = new PresentationController();
        
        // Add global functions for navigation buttons
        window.nextSlide = () => window.presentationController.nextSlide();
        window.previousSlide = () => window.presentationController.previousSlide();
        
        // Poster Button Functionality
        // Execute immediately and also on DOMContentLoaded
        function setupPosterButton() {
            try {
                const posterButton = document.getElementById('poster-button');
                const fullscreenViewer = document.getElementById('fullscreen-image-viewer');
                const fullscreenImage = document.getElementById('fullscreen-image');
                
                // Track if the image viewer is open
                let imageViewerOpen = false;
                
                // Detect Safari browser
                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                
                if (!posterButton || !fullscreenViewer) {
                    console.warn('Poster button or fullscreen viewer not found');
                    return;
                }
                
                // Open fullscreen image when poster button is clicked
                const posterClickHandler = function(e) {
                    try {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Check if poster was just closed to prevent immediate reopening
                        if (window.posterJustClosed) {
                            console.log('Poster was just closed, ignoring click');
                            return;
                        }
                        
                        // Check if button is disabled
                        if (e.currentTarget && (e.currentTarget.disabled || e.currentTarget.classList.contains('button-disabled'))) {
                            console.log('Button is disabled, ignoring click');
                            return;
                        }
                        
                        // Hide navigation and other elements
                        const elements = document.querySelectorAll('.slide-navigation, nav');
                        elements.forEach(el => {
                            if (el) el.style.display = 'none';
                        });
                        
                        // Show fullscreen viewer
                        fullscreenViewer.style.display = 'flex';
                        imageViewerOpen = true;
                        
                        // Focus the viewer for keyboard accessibility
                        fullscreenViewer.focus();
                        
                        // Request fullscreen mode with Safari-specific handling
                        try {
                            if (fullscreenViewer.requestFullscreen) {
                                fullscreenViewer.requestFullscreen().catch(err => {
                                    console.warn('Fullscreen request failed:', err);
                                    // Continue showing the viewer even if fullscreen fails
                                    fullscreenViewer.classList.add('using-fullscreen-fallback');
                                    document.body.style.overflow = 'hidden';
                                });
                            } else if (fullscreenViewer.webkitRequestFullscreen) {
                                // Safari and older WebKit browsers
                                fullscreenViewer.webkitRequestFullscreen();
                            } else if (fullscreenViewer.mozRequestFullScreen) {
                                fullscreenViewer.mozRequestFullScreen();
                            } else if (fullscreenViewer.msRequestFullscreen) {
                                fullscreenViewer.msRequestFullscreen();
                            } else {
                                // Fallback for browsers that don't support fullscreen API
                                fullscreenViewer.classList.add('using-fullscreen-fallback');
                                document.body.style.overflow = 'hidden';
                            }
                        } catch (err) {
                            console.warn('Error requesting fullscreen:', err);
                            // Fallback if fullscreen request fails
                            fullscreenViewer.classList.add('using-fullscreen-fallback');
                            document.body.style.overflow = 'hidden';
                        }
                        
                        // Show close hint
                        const closeHint = fullscreenViewer.querySelector('.fullscreen-close-hint');
                        if (closeHint) {
                            AppUtils.safeSetTimeout(() => {
                                closeHint.style.opacity = '1';
                                
                                // Hide hint after 3 seconds
                                AppUtils.safeSetTimeout(() => {
                                    closeHint.style.opacity = '0';
                                }, 3000);
                            }, 500);
                        }
                    } catch (error) {
                        console.error('Error in poster button click handler:', error);
                    }
                };
                
                // Close fullscreen image when clicked
                const viewerClickHandler = function() {
                    try {
                        if (imageViewerOpen) {
                            // Exit fullscreen mode
                            try {
                                if (document.exitFullscreen) {
                                    document.exitFullscreen();
                                } else if (document.webkitExitFullscreen) {
                                    document.webkitExitFullscreen();
                                } else if (document.mozCancelFullScreen) {
                                    document.mozCancelFullScreen();
                                } else if (document.msExitFullscreen) {
                                    document.msExitFullscreen();
                                }
                            } catch (err) {
                                console.warn('Error exiting fullscreen:', err);
                            }
                            
                            // Remove fallback class if it was added
                            fullscreenViewer.classList.remove('using-fullscreen-fallback');
                            document.body.style.overflow = '';
                            
                            // Hide viewer
                            fullscreenViewer.style.display = 'none';
                            imageViewerOpen = false;
                            
                            // Show navigation and other elements again
                            const elements = document.querySelectorAll('.slide-navigation, nav');
                            elements.forEach(el => {
                                if (el) el.style.display = '';
                            });
                            
                            // Set a flag to prevent immediate reopening
                            window.posterJustClosed = true;
                            
                            // Immediately disable the poster button
                            if (posterButton) {
                                posterButton.disabled = true;
                                posterButton.classList.add('button-disabled');
                                posterButton.setAttribute('aria-disabled', 'true');
                            }
                            
                            // Clear the flag after a longer delay (1 second)
                            AppUtils.safeSetTimeout(() => {
                                window.posterJustClosed = false;
                                
                                // Re-enable the button after the delay
                                if (posterButton) {
                                    posterButton.disabled = false;
                                    posterButton.classList.remove('button-disabled');
                                    posterButton.setAttribute('aria-disabled', 'false');
                                }
                            }, 1000);
                            
                            // Return focus to poster button for accessibility
                            if (posterButton) {
                                AppUtils.safeSetTimeout(() => {
                                    posterButton.focus();
                                }, 100);
                            }
                        }
                    } catch (error) {
                        console.error('Error in viewer click handler:', error);
                    }
                };
                
                // Handle fullscreen change events
                const fullscreenChangeHandler = function() {
                    try {
                        const isFullscreen = document.fullscreenElement || 
                                            document.webkitFullscreenElement || 
                                            document.mozFullScreenElement || 
                                            document.msFullscreenElement;
                        
                        if (!isFullscreen && imageViewerOpen) {
                            // User exited fullscreen, close the viewer
                            viewerClickHandler();
                        }
                    } catch (error) {
                        console.error('Error in fullscreen change handler:', error);
                    }
                };
                
                // Add event listeners with tracking
                AppUtils.safeAddEventListener(posterButton, 'click', posterClickHandler);
                AppUtils.safeAddEventListener(fullscreenViewer, 'click', viewerClickHandler);
                
                // Add fullscreen change event listeners with tracking
                AppUtils.safeAddEventListener(document, 'fullscreenchange', fullscreenChangeHandler);
                AppUtils.safeAddEventListener(document, 'webkitfullscreenchange', fullscreenChangeHandler);
                AppUtils.safeAddEventListener(document, 'mozfullscreenchange', fullscreenChangeHandler);
                AppUtils.safeAddEventListener(document, 'MSFullscreenChange', fullscreenChangeHandler);
                
                // Add ESC key handler with tracking
                const keyHandler = function(e) {
                    try {
                        if (e.key === 'Escape' && imageViewerOpen) {
                            viewerClickHandler();
                        }
                    } catch (error) {
                        console.error('Error in key handler:', error);
                    }
                };
                
                AppUtils.safeAddEventListener(document, 'keydown', keyHandler);
                
                // Add keyboard accessibility for poster button
                if (posterButton) {
                    AppUtils.safeAddEventListener(posterButton, 'keydown', (event) => {
                        if ((event.key === 'Enter' || event.key === ' ') && 
                            !posterButton.disabled && 
                            !posterButton.classList.contains('button-disabled') &&
                            !window.posterJustClosed) {
                            event.preventDefault();
                            posterClickHandler(event);
                        }
                    });
                }
                
                // Add keyboard accessibility for fullscreen viewer
                if (fullscreenViewer) {
                    AppUtils.safeAddEventListener(fullscreenViewer, 'keydown', (event) => {
                        if (event.key === 'Escape' || event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            viewerClickHandler();
                        }
                    });
                }
                
                // Safari-specific handling for fullscreen
                if (isSafari && fullscreenImage) {
                    // Add special handling for Safari's fullscreen behavior
                    fullscreenImage.style.maxHeight = '100vh';
                    fullscreenImage.style.maxWidth = '100vw';
                    fullscreenImage.style.objectFit = 'contain';
                    
                    // Add Safari fullscreen change listener for dimension fixes
                    const safariFullscreenHandler = function() {
                        try {
                            const isFullscreen = document.webkitFullscreenElement || document.fullscreenElement;
                            if (isFullscreen && isFullscreen === fullscreenViewer) {
                                // Force Safari fullscreen dimensions
                                setTimeout(() => {
                                    fullscreenViewer.style.width = '100%';
                                    fullscreenViewer.style.height = '100%';
                                    fullscreenViewer.style.left = '0';
                                    fullscreenViewer.style.top = '0';
                                    fullscreenViewer.style.position = 'fixed';
                                    fullscreenViewer.style.display = 'flex';
                                    fullscreenViewer.style.justifyContent = 'center';
                                    fullscreenViewer.style.alignItems = 'center';
                                    
                                    fullscreenImage.style.width = '100%';
                                    fullscreenImage.style.height = '100%';
                                    fullscreenImage.style.objectFit = 'cover';
                                    fullscreenImage.style.objectPosition = 'center';
                                }, 100);
                            }
                        } catch (error) {
                            console.error('Error in Safari fullscreen handler:', error);
                        }
                    };
                    
                    AppUtils.safeAddEventListener(document, 'webkitfullscreenchange', safariFullscreenHandler);
                    AppUtils.safeAddEventListener(document, 'fullscreenchange', safariFullscreenHandler);
                }
                
            } catch (error) {
                console.error('Error setting up poster button:', error);
            }
        }
        
        // Run immediately
        setupPosterButton();
        
        // Also run on DOMContentLoaded to ensure elements are loaded
        document.addEventListener('DOMContentLoaded', setupPosterButton);
    } catch (error) {
        console.error('Failed to initialize presentation:', error);
    }
});

// Add window unload event to clean up resources
window.addEventListener('beforeunload', () => {
    try {
        // Clean up global timeouts and event listeners
        AppUtils.cleanup();
        
        // Clean up presentation controller resources
        if (window.presentationController && typeof window.presentationController.cleanup === 'function') {
            window.presentationController.cleanup();
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});