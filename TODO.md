# Transition Plan to MetaAPI Implementation

## High-Level Tasks
1. Remove dependencies on CurrencyFreaks and FXRates APIs
2. Implement MetaAPI integration using metaapi-javascript-sdk
3. Add API status monitoring and manual data fallback
4. Update configuration management for MetaAPI credentials

## Required Changes

### 1. Dependency Management
- Add metaapi-javascript-sdk to package.json
```bash
npm install metaapi.cloud-sdk
```

### 2. Configuration Files
- Create new .env file for MetaAPI credentials:
```.env
METAAPI_API_KEY=your_api_key_here
METAAPI_ACCESS_TOKEN=your_access_token_here
METAAPI_ACCOUNT_ID=your_account_id_here
```
- Remove old API keys from .env-example

### 3. Code Changes

#### a) index.html
- Add MetaAPI status indicator
- Modify form sections to handle manual input when API is offline

#### b) calculator.js
1. Replace existing API calls with MetaAPI implementation
2. Add API connectivity check
3. Implement fallback to manual data entry
4. Remove unused API key handling

### 4. New Features
- Add API status monitoring
- Create a separate form section for manual data input
- Add error handling for API failures
- Update UI to indicate when using manual vs live data

### 5. Risk Management
- Keep existing ATR calculation logic but modify it to use MetaAPI candles
- Maintain backward compatibility with older versions

## Detailed Implementation Steps

1. Create new .env file:
```
METAAPI_API_KEY=your_api_key_here
METAAPI_ACCESS_TOKEN=your_access_token_here
METAAPI_ACCOUNT_ID=your_account_id_here
```

2. Update package.json to include metaapi dependency:
```json
{
  "dependencies": {
    "metaapi.cloud-sdk": "^29.3.1"
  }
}
```

3. Modify index.html:
- Add status indicator section
- Create manual data input form

4. Rewrite calculator.js:
- Initialize MetaAPI client
- Implement candle fetching for ATR calculation
- Add API connectivity checks
- Handle manual data entry mode
- Update logging to track API usage

## Testing Requirements
1. Verify successful connection to MetaAPI
2. Test ATR calculations using live data
3. Test manual data input functionality
4. Validate API status indicator updates correctly
5. Ensure proper error handling and recovery paths

## Documentation Updates
1. Remove references to old APIs in README.md
2. Add documentation for MetaAPI configuration
3. Update user instructions for providing MetaAPI credentials

## Risk Mitigation
- Implement retry logic for failed API calls
- Add rate limiting for API requests
- Maintain data persistence when switching between live and manual modes
- Keep existing calculations working while transitioning

## Timeline Estimate
- Initial setup: 2 days
- Core implementation: 5 days
- Testing & QA: 3 days
- Documentation updates: 1 day
Total: ~11 days of developer time
