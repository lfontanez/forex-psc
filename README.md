# Forex Position Size Calculator

A professional web-based calculator that helps traders determine optimal position sizes based on their risk management settings. This tool integrates with MetaAPI for real-time market data and supports various trading strategies through configurable timeframe and ATR options.

## Features

- **Real-time Data**: Integrates with MetaAPI for live bid/ask prices and spreads
- **Historical ATR**: Calculates Average True Range using real market data from MetaAPI
- **Timeframe Selection**: Supports 1m, 5m, 15m, 30m, 1h, 4h, 8h and Daily timeframes
- **Smart Fallbacks**: Graceful degradation from live data → fallback rates → manual entry
- **Risk Management Tools**: Calculates risk amounts based on account size and trade parameters
- **Multiple Lot Sizes**: Supports standard (100,000), mini (10,000), and micro (1,000) lots
- **Take Profit Options**: Supports fixed pips, risk-reward ratios, and ATR-based calculations
- **Professional UI**: Bootstrap-based responsive design with comprehensive logging

## Technical Requirements

- Modern web browser with ES6+ support
- MetaAPI account and credentials for real-time data
- Bootstrap 5.3.0-alpha1 CSS framework
- jQuery for DOM manipulation

## Quick Start

1. **Clone or download** the project files
2. **Install dependencies**: `npm install`
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

Create a `.env` file based on `.env-example`:

```env
METAAPI_API_KEY=your_api_key_here
METAAPI_ACCOUNT_ID=your_account_id_here
METAAPI_REGION=new-york
```

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
- Enter your API key and account ID
- Select your preferred region
- Click "Connect to MetaAPI"
- Wait for successful connection confirmation

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

## Supported Currency Pairs

Major pairs, crosses, and commodities:
- EUR/USD, GBP/USD, USD/JPY, AUD/USD
- USD/CAD, USD/CHF, NZD/USD
- EUR/JPY, GBP/JPY, EUR/GBP, AUD/JPY
- EUR/AUD, GBP/AUD
- XAU/USD (Gold)

## Development

### Local Development
```bash
npm install
npm run dev
```

### Production Deployment
```bash
npm run start
```

### Project Structure
```
├── index.html          # Main application file
├── calculator.js       # MetaAPI integration and core logic
├── package.json        # Dependencies and scripts
├── .env-example        # Environment configuration template
└── README.md          # This file
```

## Security Notes

- **API Keys**: Never commit real API keys to version control
- **Browser Storage**: API keys are stored in memory only, not persisted
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

### Performance
- The app automatically throttles API requests
- Historical data is cached to reduce API calls
- Fallback mechanisms ensure the calculator always works

## License

MIT License - see LICENSE file for details

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
