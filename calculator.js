// Forex Position Size Calculator with MetaAPI Integration
// Following TODO.md Phase 1-2: MetaAPI Integration and Real-time Data

// MetaAPI Configuration - Simplified trader-focused approach
class MetaAPIService {
    constructor() {
        this.client = null;
        this.config = {
            apiKey: null,
            accountId: null,
            region: 'new-york'
        };
    }

    // Initialize MetaAPI - just load SDK and store config
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
            
            console.log('MetaAPI SDK loaded successfully');
            
            // Create MetaAPI client instance
            this.client = new window.MetaApi(apiKey, { region });
            
            console.log('MetaAPI initialized - ready for on-demand data fetching');
            return true;
            
        } catch (error) {
            console.error('MetaAPI initialization failed:', error);
            throw error;
        }
    }

    // Load MetaAPI SDK from local installation or CDN fallback
    async loadMetaAPISDK() {
        // Check if already loaded
        if (window.MetaApi) {
            console.log('MetaAPI SDK already loaded');
            return;
        }

        // Try local paths first, then CDN as fallback
        const loadPaths = [
            './lib/metaApi.es6.js',
            './node_modules/metaapi.cloud-sdk/index.js',
            'https://cdn.jsdelivr.net/npm/metaapi.cloud-sdk@latest/index.js'
        ];

        for (const path of loadPaths) {
            console.log('Loading MetaAPI SDK from:', path);
            try {
                await this.loadScript(path);
                // Give the script time to initialize
                await new Promise(resolve => setTimeout(resolve, 500));
                
                if (window.MetaApi) {
                    console.log('MetaAPI SDK loaded successfully from:', path);
                    return;
                }
            } catch (error) {
                console.log(`Failed to load from ${path}:`, error.message);
                continue;
            }
        }

        throw new Error('Failed to load MetaAPI SDK. Please ensure you have internet connection or run: npm install && npm run build');
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

    // Get current price for a symbol (on-demand with fresh connection)
    async getPrice(symbol) {
        if (!this.client || !this.config.apiKey) {
            throw new Error('MetaAPI not initialized. Please connect first.');
        }

        try {
            console.log(`Fetching current price for ${symbol}...`);
            
            // Get account for this request
            const account = await this.client.metatraderAccountApi.getAccount(this.config.accountId);
            await account.waitDeployed();
            
            // Create connection to get real-time prices
            const connection = await account.connect();
            await connection.waitSynchronized();
            
            // Subscribe to market data for this symbol
            await connection.subscribeToMarketData(symbol);
            
            // Get symbol specification first
            const symbolSpecification = await connection.getSymbolSpecification(symbol);
            if (!symbolSpecification) {
                // Unsubscribe before throwing error
                await connection.unsubscribeFromMarketData(symbol);
                throw new Error(`Symbol ${symbol} not found`);
            }
            
            // Get current price
            const price = await connection.getSymbolPrice(symbol);
            if (!price) {
                // Unsubscribe before throwing error
                await connection.unsubscribeFromMarketData(symbol);
                throw new Error(`No price data available for ${symbol}`);
            }
            
            console.log(`Got price for ${symbol}:`, price);
            
            // Unsubscribe from market data
            await connection.unsubscribeFromMarketData(symbol);
            
            return {
                symbol: symbol,
                bid: price.bid,
                ask: price.ask,
                time: new Date(),
                spread: price.ask - price.bid
            };
        } catch (error) {
            console.error(`Failed to get price for ${symbol}:`, error);
            throw error;
        }
    }

    // Get historical data for ATR calculation (connection-based approach)
    async getHistoricalData(symbol, timeframe, startTime, limit = 100) {
        if (!this.client || !this.config.apiKey) {
            throw new Error('MetaAPI not initialized. Please connect first.');
        }

        try {
            const mtTimeframe = this.convertTimeframe(timeframe);
            console.log(`Fetching ${limit} candles for ${symbol} on ${mtTimeframe}...`);
            
            // Get account for this request
            const account = await this.client.metatraderAccountApi.getAccount(this.config.accountId);
            await account.waitDeployed();
            
            // Create connection to get historical data
            const connection = await account.connect();
            await connection.waitSynchronized();
            
            // Get historical candles using the account method
            const candles = await account.getHistoricalCandles(
                symbol,
                mtTimeframe,
                startTime,
                limit
            );
            
            if (!candles || candles.length === 0) {
                throw new Error(`No historical data available for ${symbol}`);
            }
            
            console.log(`Received ${candles.length} candles`);
            
            // Simple validation and mapping
            return candles
                .filter(c => c && c.high >= c.low)
                .map(c => ({
                    time: c.time,
                    open: c.open,
                    high: c.high,
                    low: c.low,
                    close: c.close
                }));
        } catch (error) {
            console.error(`Failed to get historical data for ${symbol}:`, error);
            throw new Error(`Historical data unavailable: ${error.message}`);
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
            throw new Error(`Need ${periods + 1} candles for ATR`);
        }
        
        const trueRanges = [];
        
        // Calculate True Range for each candle
        for (let i = 1; i < candles.length; i++) {
            const curr = candles[i];
            const prev = candles[i - 1];
            
            const tr = Math.max(
                curr.high - curr.low,
                Math.abs(curr.high - prev.close),
                Math.abs(curr.low - prev.close)
            );
            
            trueRanges.push(tr);
        }
        
        // Average the most recent 'periods' true ranges
        const recentTR = trueRanges.slice(-periods);
        const atr = recentTR.reduce((a, b) => a + b, 0) / periods;
        
        if (!isFinite(atr) || atr <= 0) {
            throw new Error('Invalid ATR calculated');
        }
        
        return atr;
    }

    // Get ATR for a symbol and timeframe (on-demand only)
    async getATR(symbol, timeframe, periods = 14) {
        try {
            console.log(`Fetching ATR for ${symbol} (${timeframe}, ${periods} periods)...`);
            
            // Calculate how many candles we need
            const candlesNeeded = periods + 10; // Small buffer
            const timeframeMs = this.getTimeframeMilliseconds(timeframe);
            const startTime = new Date(Date.now() - candlesNeeded * timeframeMs);
            
            // Get historical data
            const candles = await this.getHistoricalData(symbol, timeframe, startTime, candlesNeeded);
            
            if (candles.length < periods + 1) {
                throw new Error(`Need ${periods + 1} candles, got ${candles.length}`);
            }
            
            // Calculate ATR
            const atr = this.calculateATR(candles, periods);
            console.log(`ATR calculated: ${atr}`);
            
            return atr;
            
        } catch (error) {
            console.error(`ATR calculation failed:`, error);
            
            // Check if it's a CORS error
            const isCorsError = error.message.includes('CORS') || 
                               error.message.includes('Network') || 
                               error.message.includes('Failed to fetch') || 
                               error.name === 'TypeError' ||
                               (error.message && error.message.toLowerCase().includes('cross-origin'));
            
            if (isCorsError) {
                console.warn('CORS error detected in ATR fetching, using fallback ATR');
                // Re-throw with a more specific message so the UI can handle it appropriately
                throw new Error('CORS_ERROR: Historical data requests blocked by browser. Use manual ATR entry.');
            }
            
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

    // No disconnect needed - connections are per-request
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
