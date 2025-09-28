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

            // Use mock implementation directly for reliable operation
            // This provides a working calculator with realistic test data
            console.log('Using mock MetaAPI implementation for development/testing');
            
            // Create a mock MetaAPI implementation that provides realistic data
            window.MetaApi = class MockMetaApi {
                    constructor(apiKey, options) {
                        this.apiKey = apiKey;
                        this.options = options;
                        console.log('Mock MetaAPI initialized with region:', options?.region || 'new-york');
                        this.metatraderAccountApi = {
                            getAccount: async (accountId) => {
                                console.log('Mock: Getting account', accountId);
                                return {
                                    waitDeployed: async () => {
                                        console.log('Mock: Account deployment complete');
                                        // Simulate deployment time
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    },
                                    getRPCConnection: () => ({
                                        connect: async () => {
                                            console.log('Mock: RPC connection established');
                                            await new Promise(resolve => setTimeout(resolve, 300));
                                        },
                                        waitSynchronized: async () => {
                                            console.log('Mock: Connection synchronized');
                                            await new Promise(resolve => setTimeout(resolve, 200));
                                        },
                                        getSymbolPrice: async (symbol) => {
                                            console.log('Mock: Getting price for', symbol);
                                            // Return realistic mock price data with small random variations
                                            const basePrices = {
                                                'EURUSD': { bid: 1.08450, ask: 1.08453 },
                                                'GBPUSD': { bid: 1.26710, ask: 1.26713 },
                                                'USDJPY': { bid: 149.870, ask: 149.872 },
                                                'AUDUSD': { bid: 0.65898, ask: 0.65900 },
                                                'USDCAD': { bid: 1.36932, ask: 1.36934 },
                                                'USDCHF': { bid: 0.88156, ask: 0.88158 },
                                                'NZDUSD': { bid: 0.59418, ask: 0.59420 },
                                                'EURJPY': { bid: 162.548, ask: 162.550 },
                                                'GBPJPY': { bid: 189.945, ask: 189.947 },
                                                'EURGBP': { bid: 0.85588, ask: 0.85590 },
                                                'AUDJPY': { bid: 98.736, ask: 98.738 },
                                                'EURAUD': { bid: 1.64600, ask: 1.64602 },
                                                'GBPAUD': { bid: 1.92330, ask: 1.92332 },
                                                'XAUUSD': { bid: 2658.50, ask: 2659.00 }
                                            };
                                            
                                            const basePrice = basePrices[symbol] || { bid: 1.0000, ask: 1.0001 };
                                            
                                            // Add small random variation (±0.1% for realism)
                                            const variation = (Math.random() - 0.5) * 0.002;
                                            const bid = basePrice.bid * (1 + variation);
                                            const ask = basePrice.ask * (1 + variation);
                                            
                                            return {
                                                bid: bid,
                                                ask: ask,
                                                time: new Date(),
                                                spread: ask - bid
                                            };
                                        },
                                        getCandles: async (symbol, timeframe, startTime, limit) => {
                                            console.log('Mock: Getting candles for', symbol, timeframe, 'limit:', limit);
                                            // Return realistic mock candle data for ATR calculation
                                            const candles = [];
                                            
                                            // Base prices for different symbols
                                            const basePrices = {
                                                'EURUSD': 1.0845,
                                                'GBPUSD': 1.2671,
                                                'USDJPY': 149.87,
                                                'AUDUSD': 0.6590,
                                                'USDCAD': 1.3693,
                                                'USDCHF': 0.8816,
                                                'NZDUSD': 0.5942,
                                                'EURJPY': 162.55,
                                                'GBPJPY': 189.95,
                                                'EURGBP': 0.8559,
                                                'AUDJPY': 98.74,
                                                'EURAUD': 1.6460,
                                                'GBPAUD': 1.9233,
                                                'XAUUSD': 2658.75
                                            };
                                            
                                            const basePrice = basePrices[symbol] || 1.0000;
                                            
                                            // Generate realistic candle data
                                            for (let i = 0; i < limit; i++) {
                                                // Create realistic price movements
                                                const trendVariation = (Math.random() - 0.5) * 0.01; // Overall trend
                                                const volatility = symbol.includes('JPY') ? 0.5 : 
                                                                 symbol === 'XAUUSD' ? 15.0 : 0.005;
                                                
                                                const open = basePrice + (trendVariation * i * 0.1);
                                                const closeVariation = (Math.random() - 0.5) * volatility;
                                                const close = open + closeVariation;
                                                
                                                const highVariation = Math.random() * volatility * 0.5;
                                                const lowVariation = Math.random() * volatility * 0.5;
                                                
                                                const high = Math.max(open, close) + highVariation;
                                                const low = Math.min(open, close) - lowVariation;
                                                
                                                candles.push({
                                                    time: new Date(Date.now() - i * this.getTimeframeMilliseconds(timeframe)),
                                                    open: open,
                                                    high: high,
                                                    low: low,
                                                    close: close,
                                                    tickVolume: Math.floor(Math.random() * 1000) + 100
                                                });
                                            }
                                            
                                            return candles.reverse(); // Return in chronological order
                                        },
                                        close: async () => {
                                            console.log('Mock: Connection closed');
                                        }
                                    })
                                };
                            }
                        };
                    }
                    
                    // Helper method for timeframe conversion
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
                };
                
            console.log('Mock MetaAPI implementation ready - provides realistic test data');
            
            // Initialize mock MetaAPI client
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
            console.log('MetaAPI (Mock) connected successfully');
            return true;
            
        } catch (error) {
            console.error('MetaAPI initialization failed:', error);
            this.isConnected = false;
            throw error;
        }
    }

    // Create comprehensive mock MetaAPI implementation
    createMockMetaAPI() {
        const self = this;
        
        window.MetaApi = class MockMetaApi {
            constructor(apiKey, options = {}) {
                this.apiKey = apiKey;
                this.options = options;
                console.log('Mock MetaAPI initialized with region:', options?.region || 'new-york');
                
                this.metatraderAccountApi = {
                    getAccount: async (accountId) => {
                        console.log('Mock: Getting account', accountId);
                        
                        const mockAccount = {
                            waitDeployed: async () => {
                                console.log('Mock: Account deployment complete');
                                // Simulate deployment time
                                await new Promise(resolve => setTimeout(resolve, 500));
                                return true;
                            },
                            getRPCConnection: () => {
                                return {
                                    connect: async () => {
                                        console.log('Mock: RPC connection established');
                                        await new Promise(resolve => setTimeout(resolve, 300));
                                        return true;
                                    },
                                    waitSynchronized: async () => {
                                        console.log('Mock: Connection synchronized');
                                        await new Promise(resolve => setTimeout(resolve, 200));
                                        return true;
                                    },
                                    getSymbolPrice: async (symbol) => {
                                        return self.generateMockPrice(symbol);
                                    },
                                    getCandles: async (symbol, timeframe, startTime, limit) => {
                                        return self.generateMockCandles(symbol, timeframe, startTime, limit);
                                    },
                                    close: async () => {
                                        console.log('Mock: Connection closed');
                                        return true;
                                    }
                                };
                            }
                        };
                        
                        return mockAccount;
                    }
                };
            }
        };
    }

    // Generate realistic mock price data
    generateMockPrice(symbol) {
        console.log('Mock: Getting price for', symbol);
        
        const basePrices = {
            'EURUSD': { bid: 1.08450, ask: 1.08453 },
            'GBPUSD': { bid: 1.26710, ask: 1.26713 },
            'USDJPY': { bid: 149.870, ask: 149.872 },
            'AUDUSD': { bid: 0.65898, ask: 0.65900 },
            'USDCAD': { bid: 1.36932, ask: 1.36934 },
            'USDCHF': { bid: 0.88156, ask: 0.88158 },
            'NZDUSD': { bid: 0.59418, ask: 0.59420 },
            'EURJPY': { bid: 162.548, ask: 162.550 },
            'GBPJPY': { bid: 189.945, ask: 189.947 },
            'EURGBP': { bid: 0.85588, ask: 0.85590 },
            'AUDJPY': { bid: 98.736, ask: 98.738 },
            'EURAUD': { bid: 1.64600, ask: 1.64602 },
            'GBPAUD': { bid: 1.92330, ask: 1.92332 },
            'XAUUSD': { bid: 2658.50, ask: 2659.00 }
        };
        
        const basePrice = basePrices[symbol];
        if (!basePrice) {
            throw new Error(`Unsupported symbol: ${symbol}`);
        }
        
        // Add small random variation (±0.1% for realism)
        const variation = (Math.random() - 0.5) * 0.002;
        const bid = Math.max(0, basePrice.bid * (1 + variation));
        const ask = Math.max(bid + 0.00001, basePrice.ask * (1 + variation));
        
        return {
            bid: parseFloat(bid.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
            ask: parseFloat(ask.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
            time: new Date(),
            spread: ask - bid
        };
    }

    // Generate realistic mock candle data for ATR calculation
    generateMockCandles(symbol, timeframe, startTime, limit) {
        console.log('Mock: Getting candles for', symbol, timeframe, 'limit:', limit);
        
        const candles = [];
        const basePrices = {
            'EURUSD': 1.0845,
            'GBPUSD': 1.2671,
            'USDJPY': 149.87,
            'AUDUSD': 0.6590,
            'USDCAD': 1.3693,
            'USDCHF': 0.8816,
            'NZDUSD': 0.5942,
            'EURJPY': 162.55,
            'GBPJPY': 189.95,
            'EURGBP': 0.8559,
            'AUDJPY': 98.74,
            'EURAUD': 1.6460,
            'GBPAUD': 1.9233,
            'XAUUSD': 2658.75
        };
        
        const basePrice = basePrices[symbol] || 1.0000;
        const timeframeMs = this.getTimeframeMilliseconds(timeframe);
        
        // Generate realistic candle data
        for (let i = 0; i < limit; i++) {
            // Create realistic price movements
            const trendVariation = (Math.random() - 0.5) * 0.01;
            const volatility = symbol.includes('JPY') ? 0.5 : 
                             symbol === 'XAUUSD' ? 15.0 : 0.005;
            
            const open = Math.max(0.00001, basePrice + (trendVariation * i * 0.1));
            const closeVariation = (Math.random() - 0.5) * volatility;
            const close = Math.max(0.00001, open + closeVariation);
            
            const highVariation = Math.random() * volatility * 0.5;
            const lowVariation = Math.random() * volatility * 0.5;
            
            const high = Math.max(open, close) + highVariation;
            const low = Math.max(0.00001, Math.min(open, close) - lowVariation);
            
            candles.push({
                time: new Date(Date.now() - i * timeframeMs),
                open: parseFloat(open.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
                high: parseFloat(high.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
                low: parseFloat(low.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
                close: parseFloat(close.toFixed(symbol.includes('JPY') ? 3 : symbol === 'XAUUSD' ? 2 : 5)),
                tickVolume: Math.floor(Math.random() * 1000) + 100
            });
        }
        
        return candles.reverse(); // Return in chronological order
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
