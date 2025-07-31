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
        // Test if class syntax is supported
        Function('class TestClass {}'); // This just tests syntax parsing, doesn't execute
    } catch (e) {
        warnings.push('ES6 classes not supported');
    }
    
    // Check for arrow functions using feature detection
    try {
        // Test if arrow function syntax is supported
        Function('() => {}'); // This just tests syntax parsing, doesn't execute
    } catch (e) {
        warnings.push('Arrow functions not supported');
    }
    
    // Check for const/let using feature detection
    try {
        // Test if const/let syntax is supported
        Function('const test = 1; let test2 = 2;'); // This just tests syntax parsing, doesn't execute
    } catch (e) {
        warnings.push('const/let not supported');
    }
    
    // Check for sessionStorage
    if (typeof Storage === 'undefined') {
        warnings.push('Web Storage not supported');
    }
    
    // Check for Fullscreen API support
    const fullscreenSupported = document.documentElement.requestFullscreen || 
                               document.documentElement.webkitRequestFullscreen || 
                               document.documentElement.mozRequestFullScreen || 
                               document.documentElement.msRequestFullscreen;
    
    if (!fullscreenSupported) {
        warnings.push('Fullscreen API not fully supported');
    }
    
    if (warnings.length > 0) {
        console.warn('Browser compatibility issues detected:', warnings);
        console.warn('Some features may not work properly in this browser');
        
        // Show user-friendly warning for critical issues
        const message = 'Your browser may not support all features of this presentation. ' +
                      'Please use a modern browser like Chrome, Firefox, Safari, or Edge for the best experience.';
        
        // Try to show a more user-friendly notification
        if (document.body) {
            showCompatibilityWarning(message);
        } else {
            // Fallback to alert if DOM not ready
            setTimeout(() => {
                if (document.body) {
                    showCompatibilityWarning(message);
                } else {
                    alert(message);
                }
            }, 100);
        }
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
            // Validate slide number
            if (slideNumber < 1 || slideNumber > this.totalSlides) {
                console.warn(`Invalid slide number: ${slideNumber}`);
                return;
            }
            
            // Remove active class from current slide
            const currentActiveSlide = document.querySelector('.slide.active');
            if (currentActiveSlide) {
                currentActiveSlide.classList.remove('active');
            }
            
            // Add active class to new slide
            const newSlide = document.getElementById(`slide-${slideNumber}`);
            if (newSlide) {
                this.currentSlide = slideNumber;
                newSlide.classList.add('active');
                
                // Update display
                this.updateSlideDisplay();
                this.updateProgress();
                
                // Navigation hint removed for slide 1 as requested
                // if (slideNumber === 1) {
                //     this.showNavigationHint();
                // }
            } else {
                console.error(`Slide element not found: slide-${slideNumber}`);
            }
        } catch (error) {
            console.error('Error navigating to slide:', error);
        }
    }
    
    updateSlideDisplay() {
        try {
            // Update slide counter
            if (this.currentSlideElement) {
                this.currentSlideElement.textContent = this.currentSlide;
            }
            
            // Update navigation buttons
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');
            
            if (prevBtn) {
                prevBtn.disabled = this.currentSlide === 1;
            }
            if (nextBtn) {
                nextBtn.disabled = this.currentSlide === this.totalSlides;
            }
        } catch (error) {
            console.error('Error updating slide display:', error);
        }
    }
    
    handleKeyPress(e) {
        // Skip if the target is an input field
        if (e.target.tagName === 'INPUT') {
            return;
        }
        
        // Check if character popup or help popup is open
        const popup = document.getElementById('character-popup');
        const isPopupActive = popup && popup.classList.contains('active');
        const helpPopup = document.querySelector('.help-popup');
        const authPage = document.getElementById('auth-page');
        const isAuthVisible = authPage && authPage.style.display !== 'none';
        
        // Handle Escape key for popups
        if (e.key === 'Escape') {
            if (isPopupActive) {
                return; // Let the popup handler handle this
            }
            if (helpPopup) {
                e.preventDefault();
                helpPopup.style.opacity = '0';
                setTimeout(() => helpPopup.remove(), 300);
                return;
            }
            // Exit fullscreen if in fullscreen mode
            if (document.fullscreenElement) {
                document.exitFullscreen();
                return;
            }
        }
        
        // Skip H key handling as it's now handled by the HelpController
        if (e.key === 'h' || e.key === 'H') {
            return;
        }
        
        // Don't handle other keys when popups are active
        if (isPopupActive || helpPopup || isAuthVisible) {
            return;
        }
        
        // Skip 'P' key handling as it's reserved for authentication
        if (e.key === 'p' || e.key === 'P') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowRight':
            case ' ':
            case 'PageDown':
                e.preventDefault();
                this.nextSlide();
                break;
            case 'ArrowLeft':
            case 'PageUp':
                e.preventDefault();
                this.previousSlide();
                break;
            case 'Home':
                e.preventDefault();
                this.goToSlide(1);
                break;
            case 'End':
                e.preventDefault();
                this.goToSlide(this.totalSlides);
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                this.toggleFullscreen();
                break;
            default:
                // Number keys for direct slide navigation
                const slideNum = parseInt(e.key);
                if (slideNum >= 1 && slideNum <= this.totalSlides) {
                    e.preventDefault();
                    this.goToSlide(slideNum);
                }
                break;
        }
    }
    
    updateProgress() {
        if (this.progressFill) {
            const progress = (this.currentSlide - 1) / (this.totalSlides - 1) * 100;
            this.progressFill.style.width = `${progress}%`;
        }
    }
    
    toggleFullscreen() {
        // Check for fullscreen element with vendor prefixes
        const isFullScreen = document.fullscreenElement || 
                            document.webkitFullscreenElement || 
                            document.mozFullScreenElement || 
                            document.msFullscreenElement;
        
        if (!isFullScreen) {
            // Request fullscreen with vendor prefixes
            const docEl = document.documentElement;
            
            if (docEl.requestFullscreen) {
                docEl.requestFullscreen().catch(err => {
                    console.error(`Error attempting to enable fullscreen: ${err.message}`);
                });
            } else if (docEl.webkitRequestFullscreen) { // Safari
                docEl.webkitRequestFullscreen();
            } else if (docEl.mozRequestFullScreen) { // Firefox
                docEl.mozRequestFullScreen();
            } else if (docEl.msRequestFullscreen) { // IE/Edge
                docEl.msRequestFullscreen();
            }
        } else {
            // Exit fullscreen with vendor prefixes
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { // Safari
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) { // Firefox
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) { // IE/Edge
                document.msExitFullscreen();
            }
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
                console.warn(`Character card not found for role: ${role}`);
                return false;
            }
            
            const nameElement = card.querySelector('.character-name');
            const imgElement = card.querySelector('img');
            
            if (nameElement) {
                nameElement.textContent = name;
            } else {
                console.warn(`Name element not found in card for role: ${role}`);
                return false;
            }
            
            if (imgElement) {
                // Save the original src to restore if the new image fails to load
                const originalSrc = imgElement.src;
                
                // Set up error handler before changing src
                imgElement.onerror = () => {
                    console.error(`Failed to load image: ${imgSrc}`);
                    imgElement.src = originalSrc; // Restore original image
                    imgElement.onerror = null; // Remove the error handler
                    
                    // Show user-friendly error notification
                    this.showErrorNotification(`Failed to load image for ${role}`);
                };
                
                // Set up success handler
                imgElement.onload = () => {
                    // Image loaded successfully - no need to log in production
                    imgElement.onload = null; // Remove the success handler
                };
                
                imgElement.src = imgSrc;
            } else {
                console.warn(`Image element not found in card for role: ${role}`);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error updating character:', error);
            this.showErrorNotification(`Error updating character: ${role}`);
            return false;
        }
    }
    
    // Show user-friendly error notifications
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
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
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
    
    // Show navigation hint when entering presentation mode
    showNavigationHint() {
        // Remove any existing hint first
        const existingHint = document.querySelector('.keyboard-hint');
        if (existingHint) {
            existingHint.remove();
        }
        
        // Create the navigation hint element
        const hint = document.createElement('div');
        hint.className = 'keyboard-hint';
        // Safe DOM manipulation instead of innerHTML
        hint.textContent = '← → Arrow keys to navigate • H for help • ESC to exit fullscreen';
        
        // Add to document
        document.body.appendChild(hint);
        
        // Show with fade in effect
        hint.style.opacity = '0';
        hint.style.transform = 'translateX(-50%) translateY(10px)';
        
        // Trigger fade in
        setTimeout(() => {
            hint.style.opacity = '1';
            hint.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
        
        // Auto-hide after 4 seconds with fade out
        setTimeout(() => {
            hint.style.opacity = '0';
            hint.style.transform = 'translateX(-50%) translateY(10px)';
            
            // Remove element after fade out completes
            setTimeout(() => {
                if (hint.parentNode) {
                    hint.remove();
                }
            }, 500);
        }, 4000);
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
            const posterButton = document.getElementById('poster-button');
            const fullscreenViewer = document.getElementById('fullscreen-image-viewer');
            
            // Track if the image viewer is open - defined at the correct scope level
            let imageViewerOpen = false;
            
            // Store event listeners for cleanup
            const eventListeners = [];
            
            // Detect Safari browser
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
            
            if (posterButton && fullscreenViewer) {
                try {
                    // Open fullscreen image when poster button is clicked
                    const posterClickHandler = function(e) {
                        try {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('Poster button clicked');
                            
                            // Hide navigation and other elements
                            const elements = document.querySelectorAll('.slide-navigation, nav');
                            elements.forEach(el => {
                                if (el) el.style.display = 'none';
                            });
                            
                            // Show fullscreen viewer
                            fullscreenViewer.style.display = 'flex';
                            imageViewerOpen = true;
                            
                            // Request fullscreen mode with Safari-specific handling
                            try {
                                if (fullscreenViewer.requestFullscreen) {
                                    fullscreenViewer.requestFullscreen().catch(err => {
                                        console.warn('Fullscreen request failed:', err);
                                        // Continue showing the viewer even if fullscreen fails
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
                                    console.warn('Fullscreen API not supported, using fallback');
                                    // Apply fullscreen-like styles
                                    document.body.classList.add('using-fullscreen-fallback');
                                    fullscreenViewer.classList.add('using-fullscreen-fallback');
                                }
                            } catch (fsError) {
                                console.error('Error requesting fullscreen:', fsError);
                                // Continue showing the viewer even if fullscreen fails
                            }
                        } catch (clickError) {
                            console.error('Error handling poster button click:', clickError);
                        }
                    };
                    
                    posterButton.addEventListener('click', posterClickHandler);
                    eventListeners.push({ element: posterButton, type: 'click', handler: posterClickHandler });
                    
                    // Close fullscreen image when ESC key is pressed
                    const keydownHandler = function(event) {
                        if (event.key === 'Escape') {
                            // If image viewer is open, close it but stay in fullscreen
                            if (fullscreenViewer && fullscreenViewer.style.display === 'flex') {
                                event.preventDefault(); // Prevent default ESC behavior
                                closeImageOnly();
                            }
                        }
                    };
                    
                    document.addEventListener('keydown', keydownHandler);
                    eventListeners.push({ element: document, type: 'keydown', handler: keydownHandler });
                    
                    // Also close when clicking anywhere on the fullscreen viewer
                    const viewerClickHandler = function(e) {
                        // Prevent any default behavior
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Close the image viewer
                        closeImageOnly();
                    };
                    
                    fullscreenViewer.addEventListener('click', viewerClickHandler);
                    eventListeners.push({ element: fullscreenViewer, type: 'click', handler: viewerClickHandler });
                    
                    // Handle fullscreen change events from browser with proper vendor prefixes
                    document.addEventListener('fullscreenchange', handleFullscreenChange);
                    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
                    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
                    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
                    
                    eventListeners.push({ element: document, type: 'fullscreenchange', handler: handleFullscreenChange });
                    eventListeners.push({ element: document, type: 'webkitfullscreenchange', handler: handleFullscreenChange });
                    eventListeners.push({ element: document, type: 'mozfullscreenchange', handler: handleFullscreenChange });
                    eventListeners.push({ element: document, type: 'MSFullscreenChange', handler: handleFullscreenChange });
                    
                    function handleFullscreenChange() {
                        try {
                            // If we're no longer in fullscreen mode but the viewer is still displayed
                            const isFullscreenActive = document.fullscreenElement || 
                                document.webkitFullscreenElement || 
                                document.mozFullScreenElement || 
                                document.msFullscreenElement;
                                
                            if (!isFullscreenActive && 
                                fullscreenViewer && 
                                fullscreenViewer.style.display === 'flex') {
                                
                                // Hide fullscreen viewer
                                fullscreenViewer.style.display = 'none';
                                
                                // Remove fallback classes if they were added
                                document.body.classList.remove('using-fullscreen-fallback');
                                fullscreenViewer.classList.remove('using-fullscreen-fallback');
                                
                                // Show navigation again
                                restoreNavigation();
                            }
                        } catch (error) {
                            console.error('Error handling fullscreen change:', error);
                            // Attempt recovery
                            if (fullscreenViewer) {
                                fullscreenViewer.style.display = 'none';
                            }
                            restoreNavigation();
                        }
                    }
                    
                    // Function to restore navigation elements
                    function restoreNavigation() {
                        try {
                            // Show navigation again using classes instead of direct style manipulation
                            const elements = document.querySelectorAll('.slide-navigation, nav');
                            elements.forEach(el => {
                                if (el) {
                                    el.style.display = '';
                                    el.style.visibility = '';
                                    el.style.opacity = '';
                                    el.style.pointerEvents = '';
                                }
                            });
                            
                            // Reset the flag
                            imageViewerOpen = false;
                        } catch (error) {
                            console.error('Error restoring navigation:', error);
                        }
                    }
                    
                    // Function to close only the image viewer but stay in fullscreen mode
                    function closeImageOnly() {
                        try {
                            // Hide fullscreen viewer
                            if (fullscreenViewer) {
                                fullscreenViewer.style.display = 'none';
                            }
                            
                            // Remove fallback classes if they were added
                            document.body.classList.remove('using-fullscreen-fallback');
                            if (fullscreenViewer) {
                                fullscreenViewer.classList.remove('using-fullscreen-fallback');
                            }
                            
                            // Show navigation again
                            restoreNavigation();
                            
                            // Exit fullscreen mode with proper vendor prefixes
                            try {
                                if (document.exitFullscreen) {
                                    document.exitFullscreen().catch(err => {
                                        console.warn('Error exiting fullscreen:', err);
                                    });
                                } else if (document.webkitExitFullscreen) {
                                    document.webkitExitFullscreen();
                                } else if (document.mozCancelFullScreen) {
                                    document.mozCancelFullScreen();
                                } else if (document.msExitFullscreen) {
                                    document.msExitFullscreen();
                                }
                            } catch (fsError) {
                                console.warn('Error exiting fullscreen:', fsError);
                            }
                        } catch (error) {
                            console.error('Error closing image viewer:', error);
                        }
                    }
                    
                    // Function to close fullscreen viewer and exit fullscreen mode
                    function closeFullscreenViewer() {
                        closeImageOnly();
                    }
                    
                    // Function to clean up event listeners
                    function cleanupPosterButtonListeners() {
                        eventListeners.forEach(({ element, type, handler }) => {
                            if (element) {
                                element.removeEventListener(type, handler);
                            }
                        });
                    }
                    
                    // Add cleanup function to window for potential use
                    window.cleanupPosterButtonListeners = cleanupPosterButtonListeners;
                    
                    console.log('Poster button setup complete');
                } catch (setupError) {
                    console.error('Error setting up poster button:', setupError);
                }
            } else {
                console.log('Poster button or fullscreen viewer not found');
                if (!posterButton) console.log('Poster button not found');
                if (!fullscreenViewer) console.log('Fullscreen viewer not found');
            }
        }
        
        // Run immediately
        setupPosterButton();
        
        // Also run on DOMContentLoaded to ensure elements are loaded
        document.addEventListener('DOMContentLoaded', setupPosterButton);
    } catch (error) {
        console.error('Failed to initialize presentation:', error);
        // Show fallback message to user
        const body = document.body;
        if (body) {
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #f44336; color: white; padding: 20px; border-radius: 5px; z-index: 9999;';
            errorDiv.textContent = 'Sorry, this presentation requires a modern browser. Please update your browser or try a different one.';
            body.appendChild(errorDiv);
        }
    }
});