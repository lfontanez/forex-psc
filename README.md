# Forex Position Size Calculator

A web-based calculator that helps traders determine optimal position sizes based on their risk management settings. This tool is designed to work with multiple APIs for currency rate data and supports various trading strategies through configurable timeframe and ATR options.

# Forex Position Size Calculator

A web-based calculator that helps traders determine optimal position sizes based on their risk management settings. This tool is designed to work with multiple APIs for currency rate data and supports various trading strategies through configurable timeframe and ATR options.

## Features

- **Multiple Data Sources**: Works with CurrencyFreaks API and FX Rates API
- **Timeframe Selection**: Supports 1m, 5m, 15m, 30m, 1h, 4h, 8h and Daily timeframes
- **ATR Calculation**: Computes Average True Range for position sizing (automatically scales with timeframe)
- **Risk Management Tools**: Calculates risk amounts based on account size and trade parameters (e.g., standard lot sizes: 100,000 units per lot)
- **Take Profit Options**: Supports both fixed pips and ATR-based calculations
- **Debugging Features**: Includes activity logging for troubleshooting

## Technical Requirements

- Node.js (for future CLI version)
- Bootstrap 5.3.0-alpha1 CSS framework
- jQuery for DOM manipulation

## How to Use

The calculator provides two main features:

### Global Timeframe Selection
Allows you to select the timeframe for your trading strategy, which automatically scales ATR values accordingly.

### Position Size Calculation
Helps determine:
- The optimal lot size based on risk parameters (supports standard/mini/micro lots)
- Units traded per position
- Risk amount calculation
- Pip value estimation

## Configuration Notes

This calculator uses two API keys from CurrencyFreaks and FX Rates APIs. These are **hardcoded fallback values** in the JavaScript code for demonstration purposes.

### Important Note:
When deploying to production, you must replace these hardcoded placeholders with your actual API keys:

```javascript
const API_KEYS = {
    currencyfreaks: 'YOUR_CURRENCYFREAKS_API_KEY', // Replace with your CurrencyFreaks key
    fxrates: 'YOUR_FXRATES_API_KEY'                // Replace with your FX Rates key
};
```

The calculator also includes hardcoded fallback rates for certain pairs (Gold, JPY) when API access fails. These should be replaced with actual market data in production environments.

### Default ATR Values:
These default values are used as fallbacks if no real-time rate is available:

- Gold: $2450.00
- EUR/USD: 1.15403

## API Notes

The calculator uses two APIs for exchange rates (simulated in this demo):

1. **CurrencyFreaks**: Provides exchange rates (requires an API key)
   - In production, you should use your own CurrencyFreaks API key
2. **FX Rates**: Alternative source for currency data (requires an API key)

## License

Apache-2.0

## Contact
For questions or issues regarding this demo code:
support@example.com
