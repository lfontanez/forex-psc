// Forex Position Size Calculator with MetaAPI Integration
// Following TODO.md Phase 1-2: MetaAPI Integration and Real-time Data

// MetaAPI Configuration - REST API approach
class MetaAPIService {
    constructor() {
        this.config = {
            apiKey: null,
            accountId: null,
            region: 'new-york'
        };
    }

    // Initialize MetaAPI - just store config (no SDK needed for REST API)
    async initialize(apiKey, accountId, region = 'new-york') {
        try {
            console.log('Initializing MetaAPI with:', { accountId, region, hasApiKey: !!apiKey });
            
            // Store configuration
            this.config.apiKey = apiKey;
            this.config.accountId = accountId;
            this.config.region = region;
            
            console.log('MetaAPI initialized - ready for REST API requests');
            return true;
            
        } catch (error) {
            console.error('MetaAPI initialization failed:', error);
            throw error;
        }
    }

    // Helper method to make REST API requests
    async makeRestRequest(url, method = 'GET') {
        if (!this.config.apiKey) {
            throw new Error('MetaAPI not initialized. Please connect first.');
        }

        try {
            console.log(`Making ${method} request to:`, url);
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'auth-token': this.config.apiKey,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('REST API response received:', data);
            return data;

        } catch (error) {
            console.error('REST API request failed:', error);
            
            // Check if it's a CORS error
            const isCorsError = error.message.includes('CORS') || 
                               error.message.includes('Network') || 
                               error.message.includes('Failed to fetch') || 
                               error.name === 'TypeError' ||
                               (error.message && error.message.toLowerCase().includes('cross-origin'));
            
            if (isCorsError) {
                throw new Error('CORS_ERROR: Browser blocking MetaAPI REST requests. Use manual data entry.');
            }
            
            throw error;
        }
    }

    // Get current price for a symbol using REST API
    async getPrice(symbol) {
        if (!this.config.apiKey || !this.config.accountId) {
            throw new Error('MetaAPI not initialized. Please connect first.');
        }

        try {
            console.log(`Fetching current price for ${symbol} via REST API...`);
            
            const url = `https://mt-client-api-v1.${this.config.region}.agiliumtrade.ai/users/current/accounts/${this.config.accountId}/symbols/${symbol}/current-price`;
            
            const priceData = await this.makeRestRequest(url);
            
            if (!priceData || !priceData.bid || !priceData.ask) {
                throw new Error(`Invalid price data received for ${symbol}`);
            }
            
            console.log(`Got price for ${symbol}:`, priceData);
            
            return {
                symbol: symbol,
                bid: priceData.bid,
                ask: priceData.ask,
                time: priceData.time ? new Date(priceData.time) : new Date(),
                spread: priceData.ask - priceData.bid
            };
        } catch (error) {
            console.error(`Failed to get price for ${symbol}:`, error);
            throw error;
        }
    }

    // Get historical data for ATR calculation using REST API
    async getHistoricalData(symbol, timeframe, startTime, limit = 100) {
        if (!this.config.apiKey || !this.config.accountId) {
            throw new Error('MetaAPI not initialized. Please connect first.');
        }

        try {
            const mtTimeframe = this.convertTimeframe(timeframe);
            console.log(`Fetching ${limit} candles for ${symbol} on ${mtTimeframe} via REST API...`);
            
            // Format startTime as ISO string
            const startTimeISO = startTime instanceof Date ? startTime.toISOString() : new Date(startTime).toISOString();
            
            const url = `https://mt-market-data-client-api-v1.${this.config.region}.agiliumtrade.ai/users/current/accounts/${this.config.accountId}/historical-market-data/symbols/${symbol}/timeframes/${mtTimeframe}/candles?startTime=${encodeURIComponent(startTimeISO)}&limit=${limit}`;
            
            const candles = await this.makeRestRequest(url);
            
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
            
            // Calculate how many candles we need - increased buffer for gaps/incomplete candles
            const candlesNeeded = periods + 15; // Larger buffer to account for gaps
            const timeframeMs = this.getTimeframeMilliseconds(timeframe);
            const startTime = new Date(Date.now() - candlesNeeded * timeframeMs);
            
            console.log(`Requesting ${candlesNeeded} candles for ATR calculation (need minimum ${periods + 1})...`);
            
            // Get historical data
            const candles = await this.getHistoricalData(symbol, timeframe, startTime, candlesNeeded);
            
            console.log(`Received ${candles.length} candles (requested ${candlesNeeded}, minimum needed ${periods + 1})`);
            
            // More lenient check - we just need enough for ATR calculation
            if (candles.length < periods + 1) {
                console.warn(`Insufficient candles: got ${candles.length}, need ${periods + 1}`);
                throw new Error(`Insufficient historical data: received ${candles.length} candles, need at least ${periods + 1} for ATR calculation`);
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
