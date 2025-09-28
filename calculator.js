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

            // Import MetaAPI using CDN for browser compatibility
            if (!window.MetaApi) {
                console.log('Loading MetaAPI SDK...');
                
                // Try multiple CDN sources
                const cdnUrls = [
                    'https://unpkg.com/metaapi.cloud-sdk@29.3.1/dist/metaApi.min.js',
                    'https://cdn.jsdelivr.net/npm/metaapi.cloud-sdk@29.3.1/dist/metaApi.min.js',
                    'https://unpkg.com/metaapi.cloud-sdk@latest/dist/metaApi.min.js'
                ];
                
                let lastError;
                for (const url of cdnUrls) {
                    try {
                        console.log(`Trying to load MetaAPI from: ${url}`);
                        const script = document.createElement('script');
                        script.src = url;
                        document.head.appendChild(script);
                        
                        // Wait for script to load with timeout
                        await new Promise((resolve, reject) => {
                            const timeout = setTimeout(() => {
                                reject(new Error(`MetaAPI SDK loading timeout from ${url}`));
                            }, 10000); // 10 second timeout
                            
                            script.onload = () => {
                                clearTimeout(timeout);
                                resolve();
                            };
                            script.onerror = (error) => {
                                clearTimeout(timeout);
                                reject(new Error(`Failed to load MetaAPI SDK from ${url}`));
                            };
                        });
                        
                        // Check if MetaApi is now available
                        if (window.MetaApi) {
                            console.log(`MetaAPI SDK loaded successfully from: ${url}`);
                            break;
                        } else {
                            throw new Error(`MetaAPI SDK loaded but MetaApi not available from ${url}`);
                        }
                        
                    } catch (error) {
                        console.warn(`Failed to load from ${url}:`, error.message);
                        lastError = error;
                        // Remove failed script
                        const failedScript = document.querySelector(`script[src="${url}"]`);
                        if (failedScript) {
                            failedScript.remove();
                        }
                        continue;
                    }
                }
                
                // If all CDN attempts failed, throw the last error
                if (!window.MetaApi) {
                    throw new Error(`Failed to load MetaAPI SDK from all CDN sources. Last error: ${lastError?.message}`);
                }
            }
            
            // Check if MetaAPI is available
            if (!window.MetaApi) {
                throw new Error('MetaAPI SDK not loaded properly');
            }
            
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
            // Wait for connection to be established
            await this.connection.waitSynchronized();
            
            this.isConnected = true;
            console.log('MetaAPI connected successfully');
            return true;
            
        } catch (error) {
            console.error('MetaAPI initialization failed:', error);
            this.isConnected = false;
            throw error;
        }
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
                time: price.time,
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
            const candles = await this.connection.getCandles(symbol, timeframe, startTime, limit);
            return candles.map(candle => ({
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

    // Calculate ATR from historical data
    calculateATR(candles, periods = 14) {
        if (candles.length < periods + 1) {
            throw new Error(`Insufficient data for ATR calculation. Need at least ${periods + 1} candles.`);
        }

        const trueRanges = [];
        
        for (let i = 1; i < candles.length; i++) {
            const current = candles[i];
            const previous = candles[i - 1];
            
            const tr1 = current.high - current.low;
            const tr2 = Math.abs(current.high - previous.close);
            const tr3 = Math.abs(current.low - previous.close);
            
            const trueRange = Math.max(tr1, tr2, tr3);
            trueRanges.push(trueRange);
        }

        // Calculate Simple Moving Average of True Range for the specified periods
        const atrValues = [];
        for (let i = periods - 1; i < trueRanges.length; i++) {
            const sum = trueRanges.slice(i - periods + 1, i + 1).reduce((a, b) => a + b, 0);
            atrValues.push(sum / periods);
        }

        // Return the most recent ATR value
        return atrValues[atrValues.length - 1];
    }

    // Get ATR for a symbol and timeframe
    async getATR(symbol, timeframe, periods = 14) {
        try {
            // Calculate start time (need extra candles for ATR calculation)
            const now = new Date();
            const startTime = new Date(now.getTime() - (periods + 10) * this.getTimeframeMilliseconds(timeframe));
            
            // Get historical data
            const candles = await this.getHistoricalData(symbol, timeframe, startTime, periods + 10);
            
            // Calculate and return ATR
            const atr = this.calculateATR(candles, periods);
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
