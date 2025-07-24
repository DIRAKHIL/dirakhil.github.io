// Help Menu Controller
class HelpController {
    constructor() {
        this.helpPage = document.getElementById('help-page');
        this.closeHelpBtn = document.getElementById('close-help-btn');
        
        // Initialize help menu
        this.init();
    }
    
    init() {
        // Add event listener for close button
        if (this.closeHelpBtn) {
            this.closeHelpBtn.addEventListener('click', this.hideHelpMenu.bind(this));
        }
        
        // Add keyboard event listener for 'H' key to toggle help page
        document.addEventListener('keydown', (e) => {
            // Skip if the target is an input field (to avoid triggering when typing)
            if (e.target.tagName === 'INPUT') {
                return;
            }
            
            if (e.key === 'h' || e.key === 'H') {
                e.preventDefault();
                this.toggleHelpMenu();
            }
            
            // Handle Escape key to close help menu
            if (e.key === 'Escape' && this.helpPage.style.display !== 'none') {
                e.preventDefault();
                this.hideHelpMenu();
            }
        });
        
        // Add click event listener to close help menu when clicking outside the container
        this.helpPage.addEventListener('click', (e) => {
            // Close only if clicking outside the help container
            if (e.target === this.helpPage) {
                this.hideHelpMenu();
            }
        });
    }
    
    toggleHelpMenu() {
        // Check if auth page is visible
        const authPage = document.getElementById('auth-page');
        const isAuthVisible = authPage && authPage.style.display !== 'none';
        
        // Don't show help if auth page is visible
        if (isAuthVisible) {
            return;
        }
        
        // Toggle help menu visibility
        if (this.helpPage.style.display === 'none' || this.helpPage.style.display === '') {
            this.showHelpMenu();
        } else {
            this.hideHelpMenu();
        }
    }
    
    showHelpMenu() {
        // Show help menu with fade-in effect
        this.helpPage.style.display = 'flex';
        this.helpPage.style.opacity = '0';
        
        // Trigger reflow to ensure transition works
        void this.helpPage.offsetWidth;
        
        // Fade in
        this.helpPage.style.opacity = '1';
        
        // Hide presentation container
        const presentationContainer = document.querySelector('.presentation-container');
        if (presentationContainer) {
            presentationContainer.style.display = 'none';
        }
    }
    
    hideHelpMenu() {
        // Hide help menu with fade-out effect
        this.helpPage.style.opacity = '0';
        
        // After transition completes, hide the element
        setTimeout(() => {
            this.helpPage.style.display = 'none';
            
            // Show presentation container
            const presentationContainer = document.querySelector('.presentation-container');
            const authStatus = sessionStorage.getItem('presentationAuth');
            
            if (presentationContainer && (authStatus === 'admin' || authStatus === 'public')) {
                presentationContainer.style.display = 'block';
            }
        }, 300);
    }
}

// Initialize help controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.helpController = new HelpController();
});