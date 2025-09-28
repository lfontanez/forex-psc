// Configuration loader for environment variables
// This file attempts to load environment variables for browser use

// Global configuration object
window.ENV_CONFIG = {};

// Function to load environment variables
async function loadEnvironmentConfig() {
    try {
        // In a real deployment, you might load this from a server endpoint
        // that serves environment variables (excluding sensitive ones)
        
        // For development, try to load from a local .env file via a simple fetch
        // Note: This requires a server that can serve the .env file or convert it to JSON
        
        // Method 1: Try to fetch from a config endpoint (recommended for production)
        try {
            const response = await fetch('/api/config');
            if (response.ok) {
                const config = await response.json();
                Object.assign(window.ENV_CONFIG, config);
                console.log('Environment config loaded from API');
                return;
            }
        } catch (error) {
            // API endpoint not available, continue to other methods
        }
        
        // Method 2: Try to load from a static config.json file
        try {
            const response = await fetch('/config.json');
            if (response.ok) {
                const config = await response.json();
                Object.assign(window.ENV_CONFIG, config);
                console.log('Environment config loaded from config.json');
                return;
            }
        } catch (error) {
            // config.json not available, continue
        }
        
        // Method 3: Check if environment variables are embedded in the HTML
        // (This would be done by a build process or server-side rendering)
        const metaElements = document.querySelectorAll('meta[name^="env-"]');
        metaElements.forEach(meta => {
            const key = meta.getAttribute('name').replace('env-', '').toUpperCase();
            const value = meta.getAttribute('content');
            if (value) {
                window.ENV_CONFIG[key] = value;
            }
        });
        
        if (Object.keys(window.ENV_CONFIG).length > 0) {
            console.log('Environment config loaded from meta tags');
        }
        
    } catch (error) {
        console.warn('Could not load environment configuration:', error);
    }
}

// Load configuration when the script loads
loadEnvironmentConfig();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadEnvironmentConfig };
}
