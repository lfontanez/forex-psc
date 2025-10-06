// Configuration loader for environment variables
// This file attempts to load environment variables for browser use

// Global configuration object
window.ENV_CONFIG = {};

// Function to load environment variables
async function loadEnvironmentConfig() {
    try {
        // In a real deployment, you might load this from a server endpoint
        // that serves environment variables (excluding sensitive ones)
        
        // For development, configuration can be loaded from config.json
        // or embedded in HTML meta tags
        
        // Method 1: Try to fetch from a config endpoint (recommended for production)
        // Uncomment if you have a backend API that serves configuration
        // try {
        //     const response = await fetch('/api/config');
        //     if (response.ok) {
        //         const config = await response.json();
        //         Object.assign(window.ENV_CONFIG, config);
        //         console.log('Configuration loaded from API endpoint');
        //         return;
        //     }
        // } catch (error) {
        //     // API endpoint not available, continue to other methods
        // }
        
        // Method 2: Try to load from a static config.json file
        try {
            const response = await fetch('./config.json');
            if (response.ok) {
                const config = await response.json();
                Object.assign(window.ENV_CONFIG, config);
                console.log('Configuration loaded from config.json');
                return;
            }
        } catch (error) {
            // config.json not available, continue
        }
        
        // Method 3: Check if configuration is embedded in HTML meta tags
        // (This would be done by a build process or server-side rendering)
        const metaElements = document.querySelectorAll('meta[name^="config-"]');
        metaElements.forEach(meta => {
            const key = meta.getAttribute('name').replace('config-', '').toUpperCase();
            const value = meta.getAttribute('content');
            if (value) {
                window.ENV_CONFIG[key] = value;
            }
        });
        
        if (Object.keys(window.ENV_CONFIG).length > 0) {
            console.log('Configuration loaded from HTML meta tags');
        }
        
        // No additional methods - config.json and meta tags are sufficient
        // .env files are not recommended for browser-based applications
        
    } catch (error) {
        console.warn('Could not load configuration:', error);
    }
}

// Load configuration when the script loads
loadEnvironmentConfig();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadEnvironmentConfig };
}
