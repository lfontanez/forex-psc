// Forex Position Size Calculator with MetaAPI Integration
// Following TODO.md Phase 1-2: MetaAPI Integration and Real-time Data

// MetaAPI Configuration - Browser-compatible approach
class MetaAPIService {
    constructor() {
        this.client = null;
        this.account = null;
        this.connection = null;
        this.isConnected = false;
        this.config = {
            // These will be set from environment or user input
            apiKey: null,
            accountId: null,
            region: 'new-york' // Default region
        };
    }

    // Initialize MetaAPI client (browser-compatible)
    async initialize(apiKey, accountId, region = 'new-york') {
        try {
            console.log('Initializing MetaAPI with:', { accountId, region, hasApiKey: !!apiKey });
            
            // Store configuration
            this.config.apiKey = apiKey;
            this.config.accountId = accountId;
            this.config.region = region;

            // Load MetaAPI SDK
            console.log('Loading MetaAPI SDK...');
            await this.loadMetaAPISDK();
            
            if (!window.MetaApi) {
                throw new Error('MetaAPI SDK failed to load properly');
            }
            
            console.log('Real MetaAPI SDK loaded successfully');
            
            // Initialize MetaAPI client
            console.log('Creating MetaAPI instance...');
            const api = new window.MetaApi(apiKey, { region });
            this.client = api;
            
            console.log('Getting account...');
            // Get account
            this.account = await api.metatraderAccountApi.getAccount(accountId);
            
            console.log('Waiting for account deployment...');
            // Wait for account to be deployed
            await this.account.waitDeployed();
            
            console.log('Creating RPC connection...');
            // Create connection
            this.connection = this.account.getRPCConnection();
            await this.connection.connect();
            
            console.log('Waiting for synchronization...');
            // Wait for connection to be established with timeout
            try {
                // Set a reasonable timeout for synchronization (30 seconds)
                await Promise.race([
                    this.connection.waitSynchronized(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Synchronization timeout after 30 seconds')), 30000)
                    )
                ]);
                
                this.isConnected = true;
                console.log('MetaAPI connected and synchronized successfully');
                return true;
            } catch (syncError) {
                // If synchronization fails, we can still use the connection for some operations
                console.warn('Synchronization warning:', syncError.message);
                console.log('Connection established but not fully synchronized. Some features may be limited.');
                this.isConnected = true; // Mark as connected anyway
                return true;
            }
            
        } catch (error) {
            console.error('MetaAPI initialization failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    // Load MetaAPI SDK from CDN sources (browser-compatible)
    async loadMetaAPISDK() {
        // Check if already loaded
        if (window.MetaApi) {
            console.log('MetaAPI SDK already loaded');
            return;
        }

        // Use browser-compatible CDN URLs for MetaAPI SDK
        const cdnUrls = [
            // Primary: jsdelivr works reliably
            'https://cdn.jsdelivr.net/npm/metaapi.cloud-sdk@latest/index.js',
            'https://cdn.jsdelivr.net/npm/metaapi.cloud-sdk@29.3.1/index.js',
            
            // Try local copy if available
            './lib/metaApi.es6.js',
            './node_modules/metaapi.cloud-sdk/index.js',
            
            // Fallback: unpkg (has CORS issues but keep as last resort)
            'https://unpkg.com/metaapi.cloud-sdk@latest/index.js',
            'https://unpkg.com/metaapi.cloud-sdk@29.3.1/index.js'
        ];

        for (const url of cdnUrls) {
            console.log('Trying to load MetaAPI from:', url);
            try {
                await this.loadScript(url);
                // Give the script time to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (window.MetaApi) {
                    console.log('MetaAPI SDK loaded successfully from:', url);
                    return;
                }
            } catch (error) {
                console.log(`Failed to load from ${url}:`, error.message);
                continue;
            }
        }

        throw new Error('Failed to load MetaAPI SDK from all CDN sources. Please check your internet connection and try again.');
    }

    // Load script dynamically with better error handling
    loadScript(src) {
        return new Promise((resolve, reject) => {
            // Check if script already exists
            const existingScript = document.querySelector(`script[src="${src}"]`);
            if (existingScript) {
                if (window.MetaApi) {
                    resolve();
                    return;
                }
                // Remove existing script if it didn't load properly
                existingScript.remove();
            }

            const script = document.createElement('script');
            script.src = src;
            script.type = 'module'; // Use ES6 modules for better compatibility
            script.crossOrigin = 'anonymous';
            
            // Set timeout for loading (increased for slower connections)
            const timeout = setTimeout(() => {
                script.remove();
                reject(new Error(`Timeout loading script from ${src}`));
            }, 15000);
            
            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            script.onerror = () => {
                clearTimeout(timeout);
                script.remove();
                reject(new Error(`Failed to load script from ${src}`));
            };
            
            document.head.appendChild(script);
        });
    }

    // Get real-time price for a symbol
    async getPrice(symbol) {
        if (!this.isConnected || !this.connection) {
            throw new Error('MetaAPI not connected');
        }

        try {
            const price = await this.connection.getSymbolPrice(symbol);
            return {
                symbol: symbol,
                bid: price.bid,
                ask: price.ask,
                time: price.time || new Date(),
                spread: price.ask - price.bid
            };
        } catch (error) {
            console.error(`Failed to get price for ${symbol}:`, error);
            throw error;
        }
    }

    // Get historical data for ATR calculation
    async getHistoricalData(symbol, timeframe, startTime, limit = 100) {
        if (!this.isConnected || !this.connection) {
            throw new Error('MetaAPI not connected');
        }

        try {
            // Convert timeframe to MetaAPI format
            const mtTimeframe = this.convertTimeframe(timeframe);
            
            console.log(`Fetching ${limit} candles for ${symbol} on ${mtTimeframe} timeframe`);
            
            // Get candles from MetaAPI
            const candles = await this.connection.getCandles(symbol, mtTimeframe, startTime, limit);
            
            console.log(`Received ${candles.length} candles from MetaAPI`);
            
            if (!candles || candles.length === 0) {
                throw new Error(`No historical data available for ${symbol} on ${mtTimeframe}`);
            }
            
            // Validate candle data
            const validCandles = candles.filter(candle => 
                candle && 
                typeof candle.open === 'number' && 
                typeof candle.high === 'number' && 
                typeof candle.low === 'number' && 
                typeof candle.close === 'number' &&
                candle.high >= candle.low &&
                candle.high >= Math.max(candle.open, candle.close) &&
                candle.low <= Math.min(candle.open, candle.close)
            );
            
            console.log(`${validCandles.length} valid candles after filtering`);
            
            if (validCandles.length === 0) {
                throw new Error(`No valid candle data for ${symbol}`);
            }
            
            return validCandles.map(candle => ({
                time: candle.time,
                open: candle.open,
                high: candle.high,
                low: candle.low,
                close: candle.close,
                volume: candle.tickVolume || candle.realVolume || 0
            }));
        } catch (error) {
            console.error(`Failed to get historical data for ${symbol}:`, error);
            throw error;
        }
    }

    // Convert timeframe to MetaAPI format
    convertTimeframe(timeframe) {
        const timeframeMap = {
            '1m': '1m',
            '5m': '5m',
            '15m': '15m',
            '30m': '30m',
            '1h': '1h',
            '4h': '4h',
            '8h': '8h',
            '1d': '1d'
        };
        return timeframeMap[timeframe] || '1h';
    }

    // Calculate ATR from historical data
    calculateATR(candles, periods = 14) {
        if (candles.length < periods + 1) {
            throw new Error(`Insufficient data for ATR calculation. Need at least ${periods + 1} candles, got ${candles.length}.`);
        }

        console.log(`Calculating ATR with ${candles.length} candles, ${periods} periods`);
        
        const trueRanges = [];
        
        // Calculate True Range for each candle (starting from index 1)
        for (let i = 1; i < candles.length; i++) {
            const current = candles[i];
            const previous = candles[i - 1];
            
            // Validate candle data
            if (!current || !previous || 
                typeof current.high !== 'number' || typeof current.low !== 'number' || 
                typeof current.close !== 'number' || typeof previous.close !== 'number') {
                console.warn(`Invalid candle data at index ${i}:`, current, previous);
                continue;
            }
            
            // True Range calculation
            const tr1 = current.high - current.low; // Current high - current low
            const tr2 = Math.abs(current.high - previous.close); // Current high - previous close
            const tr3 = Math.abs(current.low - previous.close); // Current low - previous close
            
            const trueRange = Math.max(tr1, tr2, tr3);
            
            if (trueRange > 0 && isFinite(trueRange)) {
                trueRanges.push(trueRange);
            }
        }

        console.log(`Calculated ${trueRanges.length} true range values`);
        
        if (trueRanges.length < periods) {
            throw new Error(`Insufficient valid true range data. Need ${periods}, got ${trueRanges.length}.`);
        }

        // Calculate Simple Moving Average of True Range for the specified periods
        // Use the most recent 'periods' number of true ranges
        const recentTrueRanges = trueRanges.slice(-periods);
        const sum = recentTrueRanges.reduce((a, b) => a + b, 0);
        const atr = sum / periods;

        console.log(`ATR calculation: sum=${sum}, periods=${periods}, ATR=${atr}`);
        
        if (!isFinite(atr) || atr <= 0) {
            throw new Error(`Invalid ATR calculated: ${atr}`);
        }

        return atr;
    }

    // Get ATR for a symbol and timeframe
    async getATR(symbol, timeframe, periods = 14) {
        try {
            console.log(`Calculating ATR for ${symbol}, timeframe: ${timeframe}, periods: ${periods}`);
            
            // Calculate start time (need extra candles for ATR calculation)
            const now = new Date();
            const candlesNeeded = Math.max(periods + 20, 50); // Ensure we have enough data
            const timeframeMs = this.getTimeframeMilliseconds(timeframe);
            const startTime = new Date(now.getTime() - candlesNeeded * timeframeMs);
            
            console.log(`Requesting ${candlesNeeded} candles from ${startTime.toISOString()}`);
            
            // Get historical data
            const candles = await this.getHistoricalData(symbol, timeframe, startTime, candlesNeeded);
            
            if (candles.length < periods + 1) {
                throw new Error(`Insufficient historical data. Got ${candles.length} candles, need at least ${periods + 1}`);
            }
            
            console.log(`Using ${candles.length} candles for ATR calculation`);
            
            // Sort candles by time to ensure proper order
            candles.sort((a, b) => new Date(a.time) - new Date(b.time));
            
            // Calculate and return ATR
            const atr = this.calculateATR(candles, periods);
            
            console.log(`Calculated ATR: ${atr} for ${symbol} (${timeframe}, ${periods} periods)`);
            
            return atr;
            
        } catch (error) {
            console.error(`Failed to calculate ATR for ${symbol}:`, error);
            throw error;
        }
    }

    // Convert timeframe string to milliseconds
    getTimeframeMilliseconds(timeframe) {
        const timeframes = {
            '1m': 60 * 1000,
            '5m': 5 * 60 * 1000,
            '15m': 15 * 60 * 1000,
            '30m': 30 * 60 * 1000,
            '1h': 60 * 60 * 1000,
            '4h': 4 * 60 * 60 * 1000,
            '8h': 8 * 60 * 60 * 1000,
            '1d': 24 * 60 * 60 * 1000
        };
        return timeframes[timeframe] || timeframes['1h'];
    }

    // Disconnect from MetaAPI
    async disconnect() {
        try {
            if (this.connection) {
                await this.connection.close();
            }
            this.isConnected = false;
            console.log('MetaAPI disconnected');
        } catch (error) {
            console.error('Error disconnecting from MetaAPI:', error);
        }
    }
}

// Timeframe conversion factors for ATR scaling
const timeframeFactors = {
    '1m': 0.05,   // 1 minute is roughly 5% of daily ATR
    '5m': 0.12,   // 5 minutes is roughly 12% of daily ATR
    '15m': 0.22,  // 15 minutes is roughly 22% of daily ATR
    '30m': 0.32,  // 30 minutes is roughly 32% of daily ATR
    '1h': 0.45,   // 1 hour is roughly 45% of daily ATR
    '4h': 0.67,   // 4 hours is roughly 67% of daily ATR
    '8h': 0.82,   // 8 hours is roughly 82% of daily ATR
    '1d': 1.0     // Daily is the reference (100%)
};

// Global MetaAPI service instance
const metaAPIService = new MetaAPIService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MetaAPIService, metaAPIService, timeframeFactors };
} else {
    // Browser environment - attach to window
    window.MetaAPIService = MetaAPIService;
    window.metaAPIService = metaAPIService;
    window.timeframeFactors = timeframeFactors;
}
