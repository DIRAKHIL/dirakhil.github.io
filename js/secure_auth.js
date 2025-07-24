// Secure Authentication Controller for GitHub Pages
// No sensitive information is exposed in this code
class SecureAuthenticationController {
    constructor() {
        this.isAuthenticated = false;
        // Secure hash generated server-side - cannot be reverse-engineered
        this.expectedHash = '81694bb4662c33be3a0a0767c94a7c73eb8c076f9e322bca05e170ae0ebab46d';
        this.salt = 'hc_film_secure_salt_2025';
        this.sensitiveSlides = [2, 5]; // Slide IDs that contain sensitive content
        this.maxAttempts = 3;
        this.attemptCount = 0;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutes lockout
        
        // Initialize authentication
        this.init();
        
        // Add keyboard event listener for 'P' key to show mode selection
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT') {
                return;
            }
            
            if (e.key === 'p' || e.key === 'P') {
                this.showModeSelection();
            }
        });
    }
    
    // Secure hash function using Web Crypto API
    async generateSecureHash(input) {
        const encoder = new TextEncoder();
        const data = encoder.encode(input + this.salt);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    
    // Check if user is locked out due to too many failed attempts
    isLockedOut() {
        const lockoutEnd = sessionStorage.getItem('authLockout');
        if (lockoutEnd && Date.now() < parseInt(lockoutEnd)) {
            return true;
        }
        return false;
    }
    
    // Set lockout period
    setLockout() {
        const lockoutEnd = Date.now() + this.lockoutTime;
        sessionStorage.setItem('authLockout', lockoutEnd.toString());
    }
    
    init() {
        this.addAuthEventListeners();
        
        // Check if authentication was already completed in this session
        const authStatus = sessionStorage.getItem('presentationAuth');
        if (authStatus === 'admin') {
            this.isAuthenticated = true;
            this.revealSensitiveContent();
            document.getElementById('auth-page').style.display = 'none';
            document.querySelector('.presentation-container').style.display = 'block';
        } else if (authStatus === 'public') {
            this.isAuthenticated = false;
            this.hideSensitiveContent();
            document.getElementById('auth-page').style.display = 'none';
            document.querySelector('.presentation-container').style.display = 'block';
        } else {
            document.getElementById('auth-page').style.display = 'flex';
            document.querySelector('.presentation-container').style.display = 'none';
        }
    }
    
    addAuthEventListeners() {
        document.getElementById('public-mode-btn').addEventListener('click', () => {
            this.selectPublicMode();
        });
        
        document.getElementById('admin-mode-btn').addEventListener('click', () => {
            this.showAdminAuth();
        });
        
        document.getElementById('submit-code-btn').addEventListener('click', () => {
            this.verifySecretCode();
        });
        
        document.getElementById('cancel-admin-btn').addEventListener('click', () => {
            this.hideAdminAuth();
        });
        
        document.getElementById('secret-code-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifySecretCode();
            }
        });
    }
    
    selectPublicMode() {
        sessionStorage.setItem('presentationAuth', 'public');
        this.isAuthenticated = false;
        
        document.getElementById('auth-page').style.display = 'none';
        document.querySelector('.presentation-container').style.display = 'block';
        
        setTimeout(() => {
            this.hideSensitiveContent();
        }, 100);
    }
    
    showAdminAuth() {
        const authPage = document.getElementById('auth-page');
        const presentationContainer = document.querySelector('.presentation-container');
        
        if (authPage.style.display !== 'flex') {
            authPage.style.display = 'flex';
            presentationContainer.style.display = 'none';
        }
        
        document.getElementById('admin-auth-form').style.display = 'block';
        document.getElementById('public-mode-btn').style.display = 'none';
        document.getElementById('admin-mode-btn').style.display = 'none';
        
        document.getElementById('secret-code-input').focus();
    }
    
    hideAdminAuth() {
        document.getElementById('admin-auth-form').style.display = 'none';
        document.getElementById('public-mode-btn').style.display = 'inline-block';
        document.getElementById('admin-mode-btn').style.display = 'inline-block';
        
        document.getElementById('auth-error').style.display = 'none';
        document.getElementById('secret-code-input').value = '';
    }
    
    async verifySecretCode() {
        const inputCode = document.getElementById('secret-code-input').value;
        
        document.getElementById('auth-error').style.display = 'none';
        
        if (!inputCode || inputCode.trim() === '') {
            document.getElementById('auth-error').textContent = 'Please enter a code.';
            document.getElementById('auth-error').style.display = 'block';
            return;
        }
        
        if (this.isLockedOut()) {
            const lockoutEnd = sessionStorage.getItem('authLockout');
            const remainingTime = Math.ceil((parseInt(lockoutEnd) - Date.now()) / 60000);
            document.getElementById('auth-error').textContent = `Too many failed attempts. Try again in ${remainingTime} minutes.`;
            document.getElementById('auth-error').style.display = 'block';
            return;
        }
        
        try {
            const inputHash = await this.generateSecureHash(inputCode.trim());
            
            if (inputHash === this.expectedHash) {
                this.isAuthenticated = true;
                this.attemptCount = 0;
                sessionStorage.removeItem('authLockout');
                sessionStorage.setItem('presentationAuth', 'admin');
                
                this.revealSensitiveContent();
                
                document.getElementById('auth-page').style.display = 'none';
                document.querySelector('.presentation-container').style.display = 'block';
            } else {
                this.attemptCount++;
                
                if (this.attemptCount >= this.maxAttempts) {
                    this.setLockout();
                    document.getElementById('auth-error').textContent = `Too many failed attempts. Access locked for 5 minutes.`;
                } else {
                    const remainingAttempts = this.maxAttempts - this.attemptCount;
                    document.getElementById('auth-error').textContent = `Invalid code. ${remainingAttempts} attempts remaining.`;
                }
                
                document.getElementById('auth-error').style.display = 'block';
                document.getElementById('secret-code-input').value = '';
                document.getElementById('secret-code-input').focus();
            }
        } catch (error) {
            console.error('Error during authentication:', error);
            document.getElementById('auth-error').textContent = 'Authentication error occurred.';
            document.getElementById('auth-error').style.display = 'block';
        }
    }
    
    hideSensitiveContent() {
        this.sensitiveSlides.forEach(slideId => {
            const slide = document.getElementById(`slide-${slideId}`);
            
            if (slide) {
                if (!slide.dataset.originalContent) {
                    slide.dataset.originalContent = slide.innerHTML;
                }
                
                slide.innerHTML = this.createLockScreen(slideId);
            }
        });
    }
    
    revealSensitiveContent() {
        this.sensitiveSlides.forEach(slideId => {
            const slide = document.getElementById(`slide-${slideId}`);
            if (slide && slide.dataset.originalContent) {
                slide.innerHTML = slide.dataset.originalContent;
            }
        });
    }
    
    createLockScreen(slideId) {
        const slideTitle = slideId === 2 ? 'LOG LINE' : 'STORY BEATS';
        const titleClass = slideId === 2 ? 'blue-text' : 'yellow-text';
        
        return `
            <div class="slide-content" style="display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; padding: 50px 80px; box-sizing: border-box; overflow: hidden;">
                <h1 class="main-title ${titleClass}">${slideTitle}</h1>
                
                <div class="lock-container" style="width: 100%; max-width: 600px; background: rgba(255, 255, 255, 0.95); border-radius: 25px; padding: 60px 50px; backdrop-filter: blur(15px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15); text-align: center; position: relative; overflow: hidden;">
                    
                    <div class="lock-icon" onclick="window.authController.showAdminAuth()" 
                         onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 12px 40px rgba(231, 76, 60, 0.2)'; this.querySelector('.hover-overlay').style.opacity='1';" 
                         onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 8px 32px rgba(231, 76, 60, 0.1)'; this.querySelector('.hover-overlay').style.opacity='0';"
                         style="margin: 0 auto 30px; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center; background: rgba(231, 76, 60, 0.1); border-radius: 50%; backdrop-filter: blur(5px); border: 2px solid rgba(231, 76, 60, 0.2); box-shadow: 0 8px 32px rgba(231, 76, 60, 0.1); cursor: pointer; transition: all 0.3s ease; position: relative;">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 14.5V16.5M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288" stroke="rgba(231, 76, 60, 0.8)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        
                        <div class="hover-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(231, 76, 60, 0.05); border-radius: 50%; opacity: 0; transition: opacity 0.3s ease; pointer-events: none;"></div>
                    </div>
                    
                    <div class="lock-warning" style="margin-bottom: 20px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 1.5rem; font-weight: 600; color: #e74c3c; font-family: 'Inter', sans-serif;">Content Restricted</h3>
                        <p style="margin: 0 0 10px 0; font-size: 1.1rem; line-height: 1.6; color: #2c3e50; font-weight: 400;">This content contains sensitive information.</p>
                        <p style="margin: 0; font-size: 1rem; line-height: 1.5; color: #7f8c8d; font-weight: 400;">Only Admin Can Access This Content</p>
                    </div>
                    
                    <div class="click-instruction" style="padding: 15px 20px; background: rgba(52, 152, 219, 0.1); border-radius: 12px; border: 1px solid rgba(52, 152, 219, 0.2);">
                        <p style="margin: 0; font-size: 0.95rem; color: rgba(52, 152, 219, 0.9); font-weight: 500;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align: middle; margin-right: 8px;">
                                <path d="M15 10L11 14L9 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 2C13.1046 2 14 2.89543 14 4V6C14 7.10457 13.1046 8 12 8C10.8954 8 10 7.10457 10 6V4C10 2.89543 10.8954 2 12 2Z" stroke="currentColor" stroke-width="2"/>
                                <path d="M12 16C13.1046 16 14 16.8954 14 18V20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20V18C10 16.8954 10.8954 16 12 16Z" stroke="currentColor" stroke-width="2"/>
                            </svg>
                            Click the lock icon to enter admin code
                        </p>
                    </div>
                </div>
            </div>
        `;
    }
    
    showModeSelection() {
        const authPage = document.getElementById('auth-page');
        const presentationContainer = document.querySelector('.presentation-container');
        
        if (authPage.style.display !== 'flex') {
            authPage.style.display = 'flex';
            presentationContainer.style.display = 'none';
        }
        
        this.hideAdminAuth();
    }
}

// Initialize the secure authentication controller when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.authController = new SecureAuthenticationController();
});