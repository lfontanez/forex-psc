# Forex Position Size Calculator

A web-based calculator that helps traders determine optimal position sizes based on their risk management settings. This tool is designed to work with multiple APIs for currency rate data and supports various trading strategies through configurable timeframe and ATR options.

## Features

- **Multiple Data Sources**: Works with CurrencyFreaks API and FX Rates API
- **Timeframe Selection**: Supports 1m, 5m, 15m, 30m, 1h, 4h, 8h and Daily timeframes
- **ATR Calculation**: Computes Average True Range for position sizing
- **Risk Management Tools**: Calculates risk amounts based on account size and trade parameters
- **Take Profit Options**: Supports both fixed pips and ATR-based calculations

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
- The optimal lot size based on risk parameters
- Units traded per position
- Risk amount calculation
- Pip value estimation

## API Notes

The calculator uses two APIs:

1. **CurrencyFreaks**: Provides exchange rates (requires an API key)
2. **FX Rates**: Alternative source for currency data (requires an API key)

### Configuration

You'll need to update the `API_KEYS` object in the JavaScript code with your actual API keys.

## License

MIT

## Contact
For questions or issues, please reach out at:
support@example.com
