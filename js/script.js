// Browser Compatibility Checks
function checkBrowserCompatibility() {
    const warnings = [];
    
    // Check for ES6 class support
    try {
        // Safe feature detection without eval
        if (typeof class {} !== 'function') {
            warnings.push('ES6 classes not supported');
        }
    } catch (e) {
        warnings.push('ES6 classes not supported');
    }
    
    // Check for arrow functions
    try {
        // Safe feature detection without eval
        const testArrow = new Function('return () => {}');
        if (typeof testArrow() !== 'function') {
            warnings.push('Arrow functions not supported');
        }
    } catch (e) {
        warnings.push('Arrow functions not supported');
    }
    
    // Check for const/let
    try {
        // Safe feature detection without eval
        new Function('const test = 1; let test2 = 2;')();
    } catch (e) {
        warnings.push('const/let not supported');
    }
    
    // Check for sessionStorage
    if (typeof Storage === 'undefined') {
        warnings.push('Web Storage not supported');
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
    const warning = document.createElement('div');
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
    warning.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
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
    closeBtn.onclick = () => warning.remove();
    closeBtn.onmouseover = () => closeBtn.style.background = 'rgba(255,255,255,0.2)';
    closeBtn.onmouseout = () => closeBtn.style.background = 'none';
    
    warning.appendChild(closeBtn);
    document.body.insertBefore(warning, document.body.firstChild);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (warning.parentNode) {
            warning.remove();
        }
    }, 10000);
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
        }
    }
    
    init() {
        // Set initial state
        this.updateSlideDisplay();
        this.updateProgress();
        
        // Set total slides count
        if (this.totalSlidesElement) {
            this.totalSlidesElement.textContent = this.totalSlides;
        }
        
        // Add event listeners
        document.addEventListener('keydown', this.handleKeyPress.bind(this));
        
        // Add swipe detection for mobile
        this.addSwipeDetection();
        
        // Add click listeners for character cards
        this.addCharacterCardListeners();
        
        // Navigation hint removed as requested
        // this.showNavigationHint();
    }
    
    // Show temporary navigation hint at the bottom of the screen
    showNavigationHint() {
        // Create keyboard hint element if it doesn't exist
        let keyboardHint = document.querySelector('.keyboard-hint');
        if (!keyboardHint) {
            keyboardHint = document.createElement('div');
            keyboardHint.className = 'keyboard-hint';
            // Safe DOM manipulation instead of innerHTML
            keyboardHint.textContent = '';
            keyboardHint.appendChild(document.createTextNode('Use arrow keys or swipe to navigate slides. Press '));
            const strongF = document.createElement('strong');
            strongF.textContent = 'F';
            keyboardHint.appendChild(strongF);
            keyboardHint.appendChild(document.createTextNode(' for fullscreen, '));
            const strongH = document.createElement('strong');
            strongH.textContent = 'H';
            keyboardHint.appendChild(strongH);
            keyboardHint.appendChild(document.createTextNode(' for help, '));
            const strongP = document.createElement('strong');
            strongP.textContent = 'P';
            keyboardHint.appendChild(strongP);
            keyboardHint.appendChild(document.createTextNode(' for access mode.'));
            document.body.appendChild(keyboardHint);
            
            // Fade in
            setTimeout(() => {
                keyboardHint.style.opacity = '1';
            }, 100);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (keyboardHint.parentNode) {
                    keyboardHint.style.opacity = '0';
                    setTimeout(() => {
                        if (keyboardHint.parentNode) {
                            keyboardHint.parentNode.removeChild(keyboardHint);
                        }
                    }, 500);
                }
            }, 5000);
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
        // Check if touch events are supported
        if (!('ontouchstart' in window) && !navigator.maxTouchPoints) {
            console.warn('Touch events not supported, skipping swipe detection');
            return;
        }
        
        let touchStartX = 0;
        let touchEndX = 0;
        
        try {
            document.addEventListener('touchstart', e => {
                if (e.changedTouches && e.changedTouches[0]) {
                    touchStartX = e.changedTouches[0].screenX;
                }
            }, false);
            
            document.addEventListener('touchend', e => {
                if (e.changedTouches && e.changedTouches[0]) {
                    touchEndX = e.changedTouches[0].screenX;
                    this.handleSwipe();
                }
            }, false);
        } catch (error) {
            console.warn('Failed to add touch event listeners:', error);
        }
        
        this.handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left, go to next slide
                this.nextSlide();
            }
            if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right, go to previous slide
                this.previousSlide();
            }
        };
    }
    
    addCharacterCardListeners() {
        // Add click listeners to character cards
        const characterCards = document.querySelectorAll('.character-card');
        characterCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.getAttribute('data-role');
                this.showCharacterOptions(role);
            });
        });
        
        // Add close button listener
        const closeButton = document.querySelector('.close-popup');
        if (closeButton) {
            closeButton.addEventListener('click', this.closeCharacterPopup.bind(this));
        }
        
        // Add popup overlay listener
        const popupOverlay = document.getElementById('popup-overlay');
        if (popupOverlay) {
            popupOverlay.addEventListener('click', this.closeCharacterPopup.bind(this));
        }
        
        // Add character option listeners
        const characterOptions = document.querySelectorAll('.popup-option');
        characterOptions.forEach(option => {
            option.addEventListener('click', () => {
                const role = option.getAttribute('data-role');
                const name = option.getAttribute('data-name');
                const imgSrc = option.querySelector('img').src;
                
                this.updateCharacter(role, name, imgSrc);
                this.closeCharacterPopup();
            });
        });
    }
    
    showCharacterOptions(role) {
        const popup = document.getElementById('character-popup');
        const overlay = document.getElementById('popup-overlay');
        const popupTitle = document.getElementById('popup-title');
        
        // Hide all options first
        document.querySelectorAll('.popup-options').forEach(options => {
            options.style.display = 'none';
        });
        
        // Show options for selected role
        const roleOptions = document.getElementById(`${role}-options`);
        if (roleOptions) {
            roleOptions.style.display = 'flex';
        }
        
        // Update popup title
        if (popupTitle) {
            popupTitle.textContent = `Select ${role.charAt(0).toUpperCase() + role.slice(1)} Character`;
        }
        
        // Show popup and overlay
        popup.classList.add('active');
        overlay.classList.add('active');
    }
    
    closeCharacterPopup() {
        const popup = document.getElementById('character-popup');
        const overlay = document.getElementById('popup-overlay');
        
        popup.classList.remove('active');
        overlay.classList.remove('active');
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
                        notification.parentNode.removeChild(notification);
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
                    hint.parentNode.removeChild(hint);
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
            
            if (posterButton && fullscreenViewer) {
                // Open fullscreen image when poster button is clicked
                posterButton.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Poster button clicked');
                    fullscreenViewer.style.display = 'flex';
                });
                
                // Close fullscreen image when ESC key is pressed
                document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape' && fullscreenViewer.style.display === 'flex') {
                        fullscreenViewer.style.display = 'none';
                    }
                });
                
                // Also close when clicking anywhere on the fullscreen viewer
                fullscreenViewer.addEventListener('click', function() {
                    fullscreenViewer.style.display = 'none';
                });
                
                console.log('Poster button setup complete');
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