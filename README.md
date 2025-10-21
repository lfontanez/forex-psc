# Forex Position Size Calculator

A professional web-based calculator that helps traders determine optimal position sizes based on their risk management settings. This tool integrates with MetaAPI for real-time market data and supports various trading strategies through configurable timeframe and ATR options.

## Features

- **Real-time Data**: Integrates with MetaAPI REST API for live bid/ask prices and spreads
- **Dynamic Symbol Loading**: Auto-populates currency pair dropdown from your MetaTrader account
- **Historical ATR**: Calculates Average True Range using real market data via REST API
- **Timeframe Selection**: Supports 1m, 5m, 15m, 30m, 1h, 4h, 8h and Daily timeframes
- **Smart Fallbacks**: Graceful degradation from live data → fallback rates → manual entry
- **Risk Management Tools**: Calculates risk amounts based on account size and trade parameters
- **Multiple Lot Sizes**: Supports standard (100,000), mini (10,000), and micro (1,000) lots
- **Take Profit Options**: Supports fixed pips, risk-reward ratios, and ATR-based calculations
- **Enhanced Risk-to-Reward Display**: Shows both standard ratio format (1:2.5) and detailed breakdown with actual risk and reward amounts in account currency for better understanding
- **Professional UI**: Bootstrap-based responsive design with comprehensive logging

## Technical Requirements

- Modern web browser with ES6+ support and fetch API
- MetaAPI account and credentials for real-time data
- Bootstrap 5.3.0-alpha1 CSS framework (loaded via CDN)
- jQuery for DOM manipulation (loaded via CDN)
- No build step or SDK installation required

## Quick Start

1. **Clone or download** the project files
2. **Open index.html** in your browser (no build step needed!)
3. **Get MetaAPI credentials**:
   - Sign up at [MetaAPI.cloud](https://metaapi.cloud)
   - Create a MetaTrader account connection
   - Get your API key and account ID
4. **Configure the application**:
   - Open the calculator in your browser
   - Enter your MetaAPI credentials in the configuration section
   - Click "Connect to MetaAPI"
5. **Start trading calculations** with real-time data!

## MetaAPI Configuration

### Required Credentials

You can configure MetaAPI credentials in several ways:

#### Method 1: Browser Storage (localStorage)
Credentials are automatically saved to browser localStorage after your first successful connection. This is the most convenient method as credentials persist across browser sessions without needing to re-enter them.

#### Method 2: Config File
Create a `config.json` file with your credentials:

```json
{
  "METAAPI_API_KEY": "your_api_key_here",
  "METAAPI_ACCOUNT_ID": "your_account_id_here",
  "METAAPI_REGION": "new-york"
}
```

#### Method 3: Manual Entry
Enter credentials directly in the web interface when connecting.

**Note**: The application will automatically try to load credentials from browser storage first, then config files, then fall back to manual entry.

### Browser Storage

The calculator automatically saves your MetaAPI credentials to browser localStorage after a successful connection:

- **Automatic Saving**: Credentials are saved immediately after successful MetaAPI initialization
- **Auto-Initialization**: When credentials are found (from localStorage or config.json), MetaAPI automatically initializes on page load - no need to click the "Initialize MetaAPI" button
- **Persistent Sessions**: Credentials persist across browser sessions - no need to re-enter them
- **Easy Management**: Use the "Clear Saved" button in the MetaAPI configuration section to remove stored credentials
- **Browser-Specific**: localStorage is specific to each browser and device - credentials won't sync across different browsers or devices
- **Privacy**: Clear stored credentials when using a shared or public computer

### Supported Regions
- `new-york` (default)
- `london`
- `singapore`

### Getting MetaAPI Credentials

1. **Sign up** at [MetaAPI.cloud](https://metaapi.cloud)
2. **Create an account** and verify your email
3. **Add a MetaTrader account** (demo or live)
4. **Copy your API key** from the dashboard
5. **Copy your account ID** from your MT account settings

## How to Use

### 1. Connect to MetaAPI

**First-time users:**
- Enter your API key and account ID
- Select your preferred region
- Click "Initialize MetaAPI"
- Wait for successful connection confirmation
- Credentials are automatically saved for future visits

**Return visits:**
- Page loads and automatically detects saved credentials
- MetaAPI auto-initializes in the background
- Available symbols automatically load from your account
- Connection status appears when ready
- No manual initialization needed - just start calculating!

**Note**: If auto-initialization fails, you can manually retry by clicking "Initialize MetaAPI" or entering credentials again.

### 2. Select Trading Parameters
- Choose your currency pair
- Set your account size and currency
- Configure risk percentage
- Select global timeframe for your strategy

### 3. Configure Stop Loss
Choose from three methods:
- **Fixed Pips**: Enter exact pip distance
- **Price Level**: Enter specific price for stop loss
- **ATR-Based**: Use Average True Range with multiplier

### 4. Set Take Profit (Optional)
Choose from three methods:
- **Fixed Price/Pips**: Enter target price or pip distance
- **Risk-Reward Ratio**: Set desired risk-to-reward ratio
- **ATR-Based**: Use ATR multiplier for take profit

### 5. Calculate Position Size
Click "Calculate Position Size" to get:
- Optimal lot size for your risk parameters
- Position size in units
- Risk amount in your account currency
- Pip value for the position
- Potential profit (if take profit is set)

## Data Sources & Fallbacks

The calculator uses a robust fallback system:

1. **MetaAPI (Primary)**: Real-time bid/ask prices and historical data
2. **Fallback Rates**: Hardcoded rates for major pairs when API fails
3. **Manual Entry**: User can input current price and ATR manually

## ATR Calculation

- **Real-time ATR**: Calculated from live historical candles via MetaAPI
- **Timeframe Scaling**: ATR automatically adjusts based on selected timeframe
- **Fallback ATR**: Simulated values when live data unavailable
- **Manual Override**: Users can enter ATR values manually

## Pip Size Calculation

The calculator uses precise pip size definitions for accurate position sizing:

### Pip Size vs Decimal Places

**Important distinction:**
- **Decimal Places**: Used for price display formatting
- **Pip Size**: Used for calculations (stop loss, take profit, ATR conversion)

### Pip Size by Currency Type

- **Standard Forex Pairs** (EUR/USD, GBP/USD, etc.):
  - Display: 5 decimal places (1.12345)
  - Pip Size: 0.0001 (4th decimal place)
  - The 5th decimal is a "pipette" or fractional pip

- **JPY Pairs** (USD/JPY, EUR/JPY, etc.):
  - Display: 3 decimal places (143.972)
  - Pip Size: 0.01 (2nd decimal place)
  - The 3rd decimal is a fractional pip

- **Gold (XAU/USD)**:
  - Display: 2 decimal places (2450.00)
  - Pip Size: 0.01 (2nd decimal place)

### ATR to Pips Conversion

When converting ATR values to pips, the calculator uses the correct pip size:
- ATR value (e.g., 0.00286 for EUR/USD) ÷ Pip Size (0.0001) = 28.6 pips
- With ATR multiplier of 2: 28.6 × 2 = 57.2 pips for stop loss

This ensures accurate risk management calculations across all currency pairs.

## Technical Implementation

### REST API Integration
The calculator uses MetaAPI's REST API for all data operations:

**Price Data**: `GET /users/current/accounts/{accountId}/symbols/{symbol}/current-price`
- Real-time bid/ask prices with spread information
- Automatic mid-price calculation for position sizing
- Error handling with fallback to hardcoded rates

**Historical Data**: `GET /users/current/accounts/{accountId}/historical-market-data/symbols/{symbol}/timeframes/{timeframe}/candles`
- Fetches 100 recent candles for ATR calculations
- Supports all major timeframes (1m to 1d)
- Chronological sorting and data validation

**Symbol Discovery**: `GET /users/current/accounts/{accountId}/symbols`
- Dynamically loads all available trading symbols
- Handles both string arrays and object responses
- Automatic symbol formatting for display

### Error Handling & Resilience
- **CORS Detection**: Identifies browser security blocks and provides user guidance
- **Graceful Degradation**: Falls back to hardcoded data when APIs fail
- **Loading States**: Visual feedback during data fetching operations
- **Comprehensive Logging**: Detailed activity logs for debugging

## Dynamic Symbol Loading

### Auto-Populate Currency Pairs
The calculator automatically fetches and displays all available trading symbols from your connected MetaTrader account via MetaAPI, providing a personalized trading experience with access to your broker's complete symbol list.

**How it works:**
- **Automatic Loading**: When you connect to MetaAPI, the calculator fetches all available symbols from your MetaTrader account
- **Real-time Updates**: Symbol list reflects your broker's current offerings
- **Smart Formatting**: Automatically formats symbols for display (EUR/USD, XAU/USD (Gold), etc.)
- **Fallback Protection**: Uses default symbol list if API connection fails

**Technical Implementation:**
- **REST API Endpoint**: `GET /users/current/accounts/{accountId}/symbols`
- **Error Handling**: CORS detection and graceful fallback to default symbols
- **Loading States**: Visual feedback during symbol fetching
- **Selection Preservation**: Maintains your current selection when symbols update

### Default Symbol List (Fallback)
When MetaAPI is unavailable, the calculator uses these major pairs, crosses, and commodities:
- EUR/USD, GBP/USD, USD/JPY, AUD/USD
- USD/CAD, USD/CHF, NZD/USD
- EUR/JPY, GBP/JPY, EUR/GBP, AUD/JPY
- EUR/AUD, GBP/AUD
- XAU/USD (Gold)

## Development

### Local Development
```bash
npm run install-deps  # Install dependencies and build SDK
npm run dev           # Start development server
```

### Production Deployment
```bash
npm run install-deps  # Install dependencies and build SDK
npm run start         # Start production server
```

### Manual Build (if needed)
```bash
npm install           # Install dependencies
npm run build         # Copy SDK files to lib directory
```

### Project Structure
```
├── index.html          # Main application file with Bootstrap UI
├── calculator.js       # MetaAPI REST API integration and core logic
├── config.js           # Configuration loader for environment variables
├── package.json        # Dependencies and scripts
├── CONVENTIONS.md      # Development standards and guidelines
├── TODO.md            # Implementation status and completed tasks
└── README.md          # This documentation file
```

## Security Notes

- **API Keys**: Never commit real API keys to version control
- **Browser Storage**: Credentials are stored in browser localStorage for convenience. They are browser-specific and not encrypted. Always use the "Clear Saved" button when using a shared computer
- **HTTPS**: Use HTTPS in production for secure API communication
- **Rate Limiting**: MetaAPI has rate limits - the app handles this gracefully

## Troubleshooting

### Connection Issues
- Verify your MetaAPI credentials are correct
- Check that your MetaTrader account is deployed and running
- Ensure your internet connection is stable
- Try different regions if connection fails

### Data Issues
- If prices seem incorrect, try refreshing the connection
- Use manual data entry as a backup when APIs fail
- Check the activity logs for detailed error information

### Symbol Loading Issues
- **"Using default symbol list"**: MetaAPI not connected - symbols will auto-load after connection
- **"CORS blocked - using default symbols"**: Browser security blocking requests - use manual data entry or deploy to web server
- **"API error - using default symbols"**: MetaAPI connection issue - check credentials and account status
- **Empty dropdown**: Refresh page or reconnect to MetaAPI

### Performance
- The app automatically throttles API requests
- Historical data is cached to reduce API calls
- Fallback mechanisms ensure the calculator always works

## License

This project is licensed under the lfontanez/forex-psc Community License v1.0 - see the [LICENSE](LICENSE) file for details.

**TL;DR**: Free to use, modify, and share. Just don't sell it as-a-service without permission.

## Support

For technical support or questions:
- Check the activity logs in the calculator for detailed error information
- Verify your MetaAPI account status and credentials
- Ensure your MetaTrader account is properly configured and running

## Contributing

This is a production-ready forex calculator. Contributions welcome for:
- Additional currency pairs
- Enhanced ATR calculation methods
- UI/UX improvements
- Performance optimizations
