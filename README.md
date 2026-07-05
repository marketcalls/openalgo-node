# OpenAlgo Node.js Library

A modern Node.js library for the OpenAlgo API, providing comprehensive access to algorithmic trading functionality for Indian markets. This library follows the same structure and functionality as the official OpenAlgo Python library.

## Installation

Install the package using npm:

```bash
npm install openalgo
```

## Library Structure

The OpenAlgo Node.js library is organized into modular components:

- **BaseAPI**: Core functionality for API authentication and communication
- **DataAPI**: Methods for accessing market data (quotes, depth, historical data, expiry, search)
- **OrderAPI**: Comprehensive order management capabilities
- **AccountAPI**: Account information and portfolio management
- **AnalyzerAPI**: Analyzer mode for simulated trading
- **WhatsAppAPI**: WhatsApp notifications via the OpenAlgo paired device
- **WebSocket**: Real-time market data streaming (LTP, Quote, Market Depth) with polled snapshot getters (`getLtp`, `getQuotes`, `getDepth`)
- **Strategy**: TradingView integration for strategy execution

## Usage Examples

### Main API

The OpenAlgo class combines all API functionalities into one convenient interface:

```javascript
// Default import
import OpenAlgo from 'openalgo';

// Named imports for specific components
import { OrderAPI, DataAPI, AccountAPI, Strategy } from 'openalgo';

// Initialize with your API key
const openalgo = new OpenAlgo('YOUR_API_KEY');

// Use methods from any API group
async function main() {
  // Get real-time quotes
  const quotes = await openalgo.quotes({ symbol: 'RELIANCE', exchange: 'NSE' });
  console.log(quotes);
  
  // Place an order
  const order = await openalgo.placeOrder({
    symbol: 'RELIANCE',
    exchange: 'NSE',
    action: 'BUY',
    quantity: 50
  });
  console.log(order);
  
  // Get account information
  const funds = await openalgo.funds();
  console.log(funds);
}

main().catch(console.error);
```

### Using Individual API Components

You can also use each API component separately:

```javascript
import { OrderAPI, DataAPI, AccountAPI, Strategy } from 'openalgo';

// Initialize individual components
const dataAPI = new DataAPI('YOUR_API_KEY');
const orderAPI = new OrderAPI('YOUR_API_KEY');

// Use specific API methods
async function getData() {
  const historicalData = await dataAPI.history({
    symbol: 'RELIANCE',
    exchange: 'NSE',
    interval: '5m',  // 5-minute candles
    startDate: '2025-01-01',
    endDate: '2025-01-05'
  });
  console.log(historicalData);
}
```

### Strategy Module for TradingView

```javascript
import { Strategy } from 'openalgo';

// Initialize strategy with host URL and webhook ID
const strategy = new Strategy('http://127.0.0.1:5000', 'YOUR_WEBHOOK_ID');

// Send strategy orders from TradingView alerts
async function executeStrategy() {
  const result = await strategy.strategyOrder({
    symbol: 'RELIANCE',
    exchange: 'NSE',  // Explicitly specifying NSE exchange
    action: 'BUY',
    positionSize: 100  // Optional, for BOTH mode
  });
  console.log(result);
}
```

## API Reference and Examples

This section provides detailed examples for each component of the OpenAlgo API. All examples are provided in both CommonJS and ES Module formats.

### DataAPI

Provides methods for accessing financial market data through OpenAlgo's REST API.

#### Getting Real-Time Quotes

```javascript
import OpenAlgo from 'openalgo';
const openalgo = new OpenAlgo('YOUR_API_KEY');

// Get real-time quotes
async function getQuotes() {
  try {
    const quotes = await openalgo.quotes({ 
      symbol: 'RELIANCE', 
      exchange: 'NSE' 
    });
    console.log('Quotes:', quotes);
    // Sample response:
    // {
    //   data: {
    //     ask: 2350.1,
    //     bid: 2349.8,
    //     high: 2360.0,
    //     low: 2340.5,
    //     ltp: 2350.0,
    //     open: 2345.0,
    //     prev_close: 2344.5,
    //     volume: 3521908
    //   },
    //   status: 'success'
    // }
  } catch (error) {
    console.error('Error fetching quotes:', error.message);
  }
}
```

#### Getting Market Depth

```javascript
async function getMarketDepth() {
  try {
    const depth = await openalgo.depth({ 
      symbol: 'RELIANCE', 
      exchange: 'NSE' 
    });
    console.log('Market Depth:', depth);
    // Shows order book with multiple price levels for bids and asks
  } catch (error) {
    console.error('Error fetching market depth:', error.message);
  }
}
```

#### Getting Symbol Information

```javascript
async function getSymbolInfo() {
  try {
    const symbolInfo = await openalgo.symbol({ 
      symbol: 'RELIANCE', 
      exchange: 'NSE' 
    });
    console.log('Symbol Information:', symbolInfo);
    // Contains details like token, lot size, tick size, etc.
  } catch (error) {
    console.error('Error fetching symbol info:', error.message);
  }
}
```

#### Getting Historical Data

```javascript
async function getHistoricalData() {
  try {
    // Calculate dates for data range
    const endDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 5); // 5 days ago
    const formattedStartDate = startDate.toISOString().split('T')[0];
    
    const history = await openalgo.history({ 
      symbol: 'RELIANCE', 
      exchange: 'NSE',
      interval: 'D',  // Daily candles (use '1m', '5m', '15m', '1h', etc. for intraday)
      startDate: formattedStartDate,
      endDate: endDate
    });
    console.log('Historical Data:', history);
    // Returns array of OHLCV candles with timestamps
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
  }
}
```

#### Getting Supported Time Intervals

```javascript
async function getSupportedIntervals() {
  try {
    const intervals = await openalgo.intervals();
    console.log('Supported Intervals:', intervals);
    // Returns available timeframes categorized by minutes, hours, days, etc.
  } catch (error) {
    console.error('Error fetching intervals:', error.message);
  }
}
```

`openalgo.interval()` is a legacy alias kept for backwards compatibility — it
simply calls `intervals()` under the hood and returns the same response:

```javascript
async function getSupportedIntervalsLegacy() {
  try {
    const intervals = await openalgo.interval(); // same response as intervals()
    console.log('Supported Intervals:', intervals);
  } catch (error) {
    console.error('Error fetching intervals:', error.message);
  }
}
```

#### Calculating Option Greeks

```javascript
async function getOptionGreeks() {
  try {
    const greeks = await openalgo.optionGreeks({
      symbol: 'NIFTY02DEC2526000CE',
      exchange: 'NFO',
      interestRate: 6.5,           // optional, default 0
      forwardPrice: 26350,         // optional: custom forward/synthetic futures price
      underlyingSymbol: 'NIFTY',   // optional: auto-detected if omitted
      underlyingExchange: 'NSE_INDEX', // optional: auto-detected if omitted
      expiryTime: '19:00'          // optional: required for MCX contracts with non-standard expiry
    });
    console.log('Option Greeks:', greeks);
    // Returns delta, gamma, theta, vega, rho and implied volatility
  } catch (error) {
    console.error('Error calculating option greeks:', error.message);
  }
}
```

### OrderAPI

Comprehensive order management capabilities for trading.

#### Placing a Market Order

```javascript
async function placeMarketOrder() {
  try {
    const order = await openalgo.placeOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      action: 'BUY',  // or 'SELL'
      quantity: 50,
      pricetype: 'MARKET',
      product: 'MIS',  // or 'CNC' for delivery
      strategy: 'MyStrategy'  // Tag for identifying orders
    });
    console.log('Market Order:', order);
    // Returns order ID and status
  } catch (error) {
    console.error('Error placing market order:', error.message);
  }
}
```

#### Placing a Limit Order

```javascript
async function placeLimitOrder() {
  try {
    const order = await openalgo.placeOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      action: 'BUY',
      quantity: 50,
      pricetype: 'LIMIT',
      price: 2350.0,  // Limit price
      product: 'MIS',
      strategy: 'MyStrategy'
    });
    console.log('Limit Order:', order);
  } catch (error) {
    console.error('Error placing limit order:', error.message);
  }
}
```

#### Placing a Smart Order (Considers Current Position)

```javascript
async function placeSmartOrder() {
  try {
    const order = await openalgo.placeSmartOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      action: 'BUY',  // or 'SELL' or 'BOTH'
      quantity: 50,   // Used for BUY/SELL
      positionSize: 100, // Used for BOTH mode
      pricetype: 'MARKET',
      product: 'MIS',
      strategy: 'MyStrategy'
    });
    console.log('Smart Order:', order);
  } catch (error) {
    console.error('Error placing smart order:', error.message);
  }
}
```

#### Placing Multiple Orders (Basket Order)

```javascript
async function placeBasketOrder() {
  try {
    const basketResult = await openalgo.basketOrder({
      strategy: 'MyStrategy',
      orders: [
        {
          symbol: 'RELIANCE',
          exchange: 'NSE',
          action: 'BUY',
          quantity: 50,
          product: 'MIS'
        },
        {
          symbol: 'INFY',
          exchange: 'NSE',
          action: 'BUY',
          quantity: 100,
          product: 'MIS'
        }
      ]
    });
    console.log('Basket Order Result:', basketResult);
    // Returns status for each order in the basket
  } catch (error) {
    console.error('Error placing basket order:', error.message);
  }
}
```

#### Splitting Large Orders

```javascript
async function placeSplitOrder() {
  try {
    const splitResult = await openalgo.splitOrder({
      symbol: 'RELIANCE',
      exchange: 'NSE',
      action: 'BUY',
      quantity: 1000,
      splitSize: 100,  // Split into orders of 100 shares each
      pricetype: 'MARKET',
      product: 'MIS',
      strategy: 'MyStrategy'
    });
    console.log('Split Order Result:', splitResult);
    // Returns array of order results
  } catch (error) {
    console.error('Error placing split order:', error.message);
  }
}
```

#### Cancelling Orders

```javascript
async function cancelOrders() {
  // Cancel a specific order
  try {
    const cancelResult = await openalgo.cancelOrder({
      orderId: 'YOUR_ORDER_ID'
    });
    console.log('Cancel Order Result:', cancelResult);
  } catch (error) {
    console.error('Error cancelling order:', error.message);
  }
  
  // Cancel all orders from a strategy
  try {
    const cancelAllResult = await openalgo.cancelAllOrder({
      strategy: 'MyStrategy'
    });
    console.log('Cancel All Orders Result:', cancelAllResult);
  } catch (error) {
    console.error('Error cancelling all orders:', error.message);
  }
}
```

#### Closing All Positions

```javascript
async function closePositions() {
  try {
    const closeResult = await openalgo.closePosition({
      strategy: 'MyStrategy'  // Optional: close positions for specific strategy
    });
    console.log('Close Positions Result:', closeResult);
  } catch (error) {
    console.error('Error closing positions:', error.message);
  }
}
```

#### Getting Current Open Position

`product` is a **required** parameter (no default), matching the Python SDK.

```javascript
async function getOpenPosition() {
  try {
    const position = await openalgo.openPosition({
      strategy: 'MyStrategy',
      symbol: 'RELIANCE',
      exchange: 'NSE',
      product: 'MIS'  // Required: MIS, NRML, or CNC
    });
    console.log('Open Position:', position);
    // { status: 'success', quantity: '50' }
  } catch (error) {
    console.error('Error fetching open position:', error.message);
  }
}
```

#### Placing an Options Order (Auto-Resolved Strike)

```javascript
async function placeOptionsOrder() {
  try {
    // MARKET order
    const marketOrder = await openalgo.optionsOrder({
      underlying: 'NIFTY',
      exchange: 'NSE_INDEX',
      expiryDate: '28NOV24',
      offset: 'ATM',
      optionType: 'CE',
      action: 'BUY',
      quantity: 75
    });
    console.log('Options Order:', marketOrder);

    // LIMIT order - price, triggerPrice and disclosedQuantity are
    // forwarded to the server (triggerPrice/disclosedQuantity also
    // accept the snake_case form: trigger_price/disclosed_quantity)
    const limitOrder = await openalgo.optionsOrder({
      underlying: 'NIFTY',
      exchange: 'NSE_INDEX',
      expiryDate: '28NOV24',
      offset: 'OTM1',
      optionType: 'CE',
      action: 'BUY',
      quantity: 75,
      priceType: 'LIMIT',
      price: 50.0
    });
    console.log('Limit Options Order:', limitOrder);

    // SL order with a trigger price
    const slOrder = await openalgo.optionsOrder({
      underlying: 'NIFTY',
      exchange: 'NSE_INDEX',
      expiryDate: '28NOV24',
      offset: 'ATM',
      optionType: 'PE',
      action: 'SELL',
      quantity: 75,
      priceType: 'SL',
      price: 45.0,
      triggerPrice: 46.0,
      disclosedQuantity: 25
    });
    console.log('SL Options Order:', slOrder);
  } catch (error) {
    console.error('Error placing options order:', error.message);
  }
}
```

#### Placing a Multi-Leg Options Order

```javascript
async function placeIronCondor() {
  try {
    const result = await openalgo.optionsMultiOrder({
      strategy: 'Iron Condor',
      underlying: 'NIFTY',
      exchange: 'NSE_INDEX',
      expiryDate: '25NOV25',
      legs: [
        { offset: 'OTM10', optionType: 'CE', action: 'BUY', quantity: 75 },
        { offset: 'OTM10', optionType: 'PE', action: 'BUY', quantity: 75 },
        {
          offset: 'OTM5', optionType: 'CE', action: 'SELL', quantity: 75,
          // Per-leg overrides are all forwarded to the server:
          priceType: 'LIMIT', product: 'NRML', price: 120.0,
          triggerPrice: 118.0, disclosedQuantity: 25
        },
        { offset: 'OTM5', optionType: 'PE', action: 'SELL', quantity: 75 }
      ]
    });
    console.log('Iron Condor Result:', result);
  } catch (error) {
    console.error('Error placing multi-leg options order:', error.message);
  }
}
```

### AccountAPI

Access to account information and portfolio details.

#### Getting Account Funds

```javascript
async function getAccountFunds() {
  try {
    const funds = await openalgo.funds();
    console.log('Account Funds:', funds);
    // Returns available cash, margins, used margin, etc.
  } catch (error) {
    console.error('Error fetching account funds:', error.message);
  }
}
```

#### Getting Order Book

```javascript
async function getOrderBook() {
  try {
    const orderbook = await openalgo.orderbook();
    console.log('Order Book:', orderbook);
    // Returns all orders with status and details
  } catch (error) {
    console.error('Error fetching order book:', error.message);
  }
}
```

#### Getting Trade Book

```javascript
async function getTradeBook() {
  try {
    const tradebook = await openalgo.tradebook();
    console.log('Trade Book:', tradebook);
    // Returns executed trades with price, time, etc.
  } catch (error) {
    console.error('Error fetching trade book:', error.message);
  }
}
```

#### Getting Position Book

```javascript
async function getPositionBook() {
  try {
    const positions = await openalgo.positionbook();
    console.log('Position Book:', positions);
    // Returns open positions with quantity, P&L, etc.
  } catch (error) {
    console.error('Error fetching position book:', error.message);
  }
}
```

#### Getting Holdings

```javascript
async function getHoldings() {
  try {
    const holdings = await openalgo.holdings();
    console.log('Holdings:', holdings);
    // Response:
    // {
    //   status: 'success',
    //   data: [
    //     {
    //       symbol: 'RELIANCE',
    //       exchange: 'NSE',
    //       quantity: 10,
    //       product: 'CNC',
    //       pnl: 1250.50,
    //       pnlpercent: 2.5
    //     }
    //   ]
    // }
  } catch (error) {
    console.error('Error fetching holdings:', error.message);
  }
}
```

#### Getting Trading Holidays

`year` is optional and defaults to the current year (resolved client-side)
when omitted, matching the Python SDK.

```javascript
async function getHolidays() {
  try {
    const holidays = await openalgo.holidays({ year: 2025 });
    console.log('Trading Holidays:', holidays);
    // Response:
    // {
    //   status: 'success',
    //   data: [
    //     { date: '2025-01-26', description: 'Republic Day' },
    //     { date: '2025-03-14', description: 'Holi' },
    //     { date: '2025-08-15', description: 'Independence Day' }
    //   ]
    // }

    // Omit the year to default to the current year
    const currentYearHolidays = await openalgo.holidays();
    console.log('Current Year Holidays:', currentYearHolidays);
  } catch (error) {
    console.error('Error fetching holidays:', error.message);
  }
}
```

#### Getting Exchange Timings

`date` is optional and defaults to today's date (resolved client-side) when
omitted, matching the Python SDK.

```javascript
async function getTimings() {
  try {
    const timings = await openalgo.timings({ date: '2025-12-25' });
    console.log('Exchange Timings:', timings);
    // Response:
    // {
    //   status: 'success',
    //   data: {
    //     NSE: { market_open: '09:15', market_close: '15:30' },
    //     BSE: { market_open: '09:15', market_close: '15:30' },
    //     NFO: { market_open: '09:15', market_close: '15:30' },
    //     MCX: { market_open: '09:00', market_close: '23:30' }
    //   }
    // }

    // Omit the date to default to today
    const todaysTimings = await openalgo.timings();
    console.log("Today's Timings:", todaysTimings);
  } catch (error) {
    console.error('Error fetching timings:', error.message);
  }
}
```

#### Sending Telegram Notifications

```javascript
async function sendTelegramAlert() {
  try {
    const result = await openalgo.telegram({
      username: 'your_openalgo_username',
      message: 'NIFTY crossed 26000! Time to review positions.',
      priority: 7  // Optional: 1-10, higher = more urgent (default: 5)
    });
    console.log('Telegram Result:', result);
    // Response:
    // {
    //   status: 'success',
    //   message: 'Notification sent successfully'
    // }
  } catch (error) {
    console.error('Error sending telegram:', error.message);
  }
}
```

#### Sending WhatsApp Notifications

Send a WhatsApp message via the OpenAlgo paired device. The server must
already be paired to a WhatsApp account from the `/whatsapp` admin page in
the OpenAlgo web UI (pairing itself is not exposed via the API).

Recipient resolution (pick exactly one; defaults to `self` if none given):
- `to` as a string - a single E.164 digit string, e.g. `"919876543210"`.
- `to` as an array - up to 5 E.164 digit strings for a small broadcast
  (anything beyond 5 is dropped server-side).
- `username` - an OpenAlgo login ID, resolved via the linked-users table.
- neither - defaults to `self: true` (the paired device's own number).

```javascript
async function sendWhatsAppAlert() {
  try {
    // Send to self - simplest case
    const selfResult = await openalgo.whatsapp({
      message: 'Build #482 deployed. P&L: +1.2%'
    });
    console.log('WhatsApp Result:', selfResult);
    // Response (waitForDelivery defaults to true):
    // {
    //   status: 'success',
    //   message: 'Delivered to 1, failed 0',
    //   data: { sent: ['<self>'], failed: [], skipped: 0 }
    // }

    // Send to a single number
    await openalgo.whatsapp({
      message: 'Are you free for a quick call?',
      to: '919876543210'
    });

    // Small broadcast (up to 5 numbers)
    await openalgo.whatsapp({
      message: 'Server maintenance in 10 minutes',
      to: ['919876543210', '919812345678', '919900112233']
    });

    // Send a chart image with a caption
    await openalgo.whatsapp({
      message: 'NIFTY end-of-day chart',
      to: '919876543210',
      image: '/srv/charts/nifty_eod.png'
    });

    // Send a daily report PDF to an OpenAlgo username
    await openalgo.whatsapp({
      username: 'alice',
      document: '/srv/reports/2026-05-17.pdf',
      filename: 'summary.pdf',
      caption: 'Daily P&L report attached'
    });

    // Fire-and-forget for time-critical alerts (skip the delivery report)
    await openalgo.whatsapp({
      message: 'Stop-loss hit on BANKNIFTY!',
      waitForDelivery: false
    });
    // Response: { status: 'success', message: 'Queued for 1 recipient(s)', queued: 1 }
  } catch (error) {
    console.error('Error sending WhatsApp message:', error.message);
  }
}
```

#### Calculating Margin Requirements

```javascript
async function calculateMargin() {
  try {
    const margin = await openalgo.margin({
      positions: [
        {
          symbol: 'NIFTY25DEC24000CE',
          exchange: 'NFO',
          action: 'BUY',
          product: 'NRML',
          priceType: 'MARKET',
          quantity: 75
        },
        {
          symbol: 'NIFTY25DEC24500CE',
          exchange: 'NFO',
          action: 'SELL',
          product: 'NRML',
          priceType: 'MARKET',
          quantity: 75
        }
      ]
    });
    console.log('Margin Requirements:', margin);
    // Response:
    // {
    //   status: 'success',
    //   data: {
    //     total_margin: 125000.50,
    //     available_margin: 500000.00,
    //     utilized_margin: 125000.50
    //   }
    // }
  } catch (error) {
    console.error('Error calculating margin:', error.message);
  }
}
```

### AnalyzerAPI

Toggle between live and simulated trading modes.

#### Getting Analyzer Status

```javascript
async function getAnalyzerStatus() {
  try {
    const status = await openalgo.analyzerstatus();
    console.log('Analyzer Status:', status);
    // Response:
    // {
    //   status: 'success',
    //   data: {
    //     analyze_mode: true,
    //     mode: 'analyze',
    //     total_logs: 121
    //   }
    // }
  } catch (error) {
    console.error('Error fetching analyzer status:', error.message);
  }
}
```

#### Toggling Analyzer Mode

```javascript
async function toggleAnalyzerMode() {
  try {
    // Enable analyze mode (simulated trading)
    const enableResult = await openalgo.analyzertoggle({ mode: true });
    console.log('Analyzer Mode Enabled:', enableResult);
    // Response:
    // {
    //   status: 'success',
    //   data: {
    //     analyze_mode: true,
    //     mode: 'analyze',
    //     total_logs: 121,
    //     message: 'Analyzer mode switched to analyze'
    //   }
    // }

    // Disable analyze mode (live trading)
    const disableResult = await openalgo.analyzertoggle({ mode: false });
    console.log('Analyzer Mode Disabled:', disableResult);
    // Response:
    // {
    //   status: 'success',
    //   data: {
    //     analyze_mode: false,
    //     mode: 'live',
    //     total_logs: 121,
    //     message: 'Analyzer mode switched to live'
    //   }
    // }
  } catch (error) {
    console.error('Error toggling analyzer mode:', error.message);
  }
}
```

### WebSocket API

Real-time market data streaming for LTP, Quote, and Market Depth.

#### Subscribing to LTP (Last Traded Price)

```javascript
import OpenAlgo from 'openalgo';

const client = new OpenAlgo(
    'YOUR_API_KEY',
    'http://127.0.0.1:5000',
    'v1',
    'ws://127.0.0.1:8765'
);

const instruments = [
    { exchange: "NSE", symbol: "RELIANCE" },
    { exchange: "NSE", symbol: "INFY" }
];

function onLTP(data) {
    console.log("LTP Update:", data);
}

async function streamLTP() {
    try {
        await client.connect();
        client.subscribe_ltp(instruments, onLTP);

        // Listen for updates...
        await new Promise(resolve => setTimeout(resolve, 60000));

        client.unsubscribe_ltp(instruments);
        client.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

#### Subscribing to Quote Data

```javascript
const instruments = [
    { exchange: "NSE", symbol: "SBIN" },
    { exchange: "NSE", symbol: "TCS" }
];

function onQuote(data) {
    console.log("Quote Update:", data);
    // Receives: ltp, volume, open, high, low, close, etc.
}

async function streamQuote() {
    try {
        await client.connect();
        client.subscribe_quote(instruments, onQuote);

        await new Promise(resolve => setTimeout(resolve, 60000));

        client.unsubscribe_quote(instruments);
        client.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

#### Subscribing to Market Depth

```javascript
const instruments = [
    { exchange: "NSE", symbol: "HDFCBANK" }
];

function onDepth(data) {
    console.log("Market Depth Update:", data);
    // Receives: 5-level order book with buy/sell orders
}

async function streamDepth() {
    try {
        await client.connect();
        client.subscribe_depth(instruments, onDepth);

        await new Promise(resolve => setTimeout(resolve, 60000));

        client.unsubscribe_depth(instruments);
        client.disconnect();
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

#### Polling Cached Snapshots (getLtp / getQuotes / getDepth)

In addition to push-based callbacks, the client keeps a local cache of the
latest message received per instrument (mirroring the Python SDK's
`get_ltp` / `get_quotes` / `get_depth`). Use these getters to poll the most
recent snapshot at any time, without needing a callback:

```javascript
async function pollSnapshots() {
    await client.connect();
    client.subscribe_ltp([{ exchange: "NSE", symbol: "RELIANCE" }]);
    client.subscribe_quote([{ exchange: "NSE", symbol: "TCS" }]);
    client.subscribe_depth([{ exchange: "NSE", symbol: "HDFCBANK" }]);

    // Give the feed a moment to deliver the first tick
    await new Promise(resolve => setTimeout(resolve, 2000));

    // All three getters accept optional (exchange, symbol) filters
    console.log(client.getLtp());
    // { ltp: { NSE: { RELIANCE: { timestamp: 1735900000000, ltp: 2900.5 } } } }

    console.log(client.getLtp("NSE"));           // filter by exchange
    console.log(client.getLtp("NSE", "RELIANCE")); // filter by exchange + symbol

    console.log(client.getQuotes());
    // { quote: { NSE: { TCS: { timestamp, open, high, low, close, ltp, volume, ... } } } }

    console.log(client.getDepth());
    // { depth: { NSE: { HDFCBANK: { timestamp, ltp, buyBook: {"1": {...}, ...}, sellBook: {"1": {...}, ...} } } } }

    client.disconnect();
}
```

### Data API Enhancements

#### Getting Expiry Dates

```javascript
async function getExpiryDates() {
  try {
    const expiry = await openalgo.expiry({
      symbol: 'NIFTY',
      exchange: 'NFO',
      instrumenttype: 'options'  // or 'futures'
    });
    console.log('Expiry Dates:', expiry);
    // Returns array of available expiry dates
  } catch (error) {
    console.error('Error fetching expiry dates:', error.message);
  }
}
```

#### Searching Symbols

```javascript
async function searchSymbols() {
  try {
    const searchResult = await openalgo.search({
      query: 'NIFTY 25000 JUL CE',
      exchange: 'NFO'
    });
    console.log('Search Results:', searchResult);
    // Returns matching symbols with details
  } catch (error) {
    console.error('Error searching symbols:', error.message);
  }
}
```

### Strategy Module for TradingView

Integrates with TradingView for strategy execution via webhooks.

```javascript
import { Strategy } from 'openalgo';

// Initialize strategy with host URL and webhook ID
const strategy = new Strategy('http://127.0.0.1:5000', 'YOUR_WEBHOOK_ID');

// Send strategy order from TradingView alerts
async function executeStrategyOrder() {
  try {
    const result = await strategy.strategyOrder({
      symbol: 'RELIANCE',
      action: 'BUY',  // or 'SELL' or 'BOTH' or 'EXIT'
      positionSize: 100,  // Optional, for BOTH mode
      quantity: 50,       // Optional, for specific size
      exchange: 'NSE',    // Using NSE exchange for Indian equities
      product: 'MIS'      // Optional trading product type
    });
    console.log('Strategy Order Result:', result);
  } catch (error) {
    console.error('Error executing strategy order:', error.message);
  }
}
```

## Running the Examples

The library includes comprehensive example files that demonstrate all functionality:

- `data-examples.mjs`: Demonstrates all data API functionality (quotes, depth, history, expiry, search)
- `order-examples.mjs`: Shows various order placement and management options
- `account-examples.mjs`: Illustrates account information retrieval
- `analyzer-examples.mjs`: Examples of analyzer mode toggling
- `websocket-examples.mjs`: Real-time market data streaming examples
- `strategy-examples.mjs`: Examples of TradingView strategy integration

### Running All Examples

```bash
npm run examples
```

### Running Specific Examples

```bash
npm run example:data
npm run example:order
npm run example:account
npm run example:analyzer
npm run example:websocket
npm run example:strategy
```

Or run the examples directly:

```bash
node examples/run-examples.mjs data
node examples/run-examples.mjs order
node examples/run-examples.mjs account
node examples/run-examples.mjs analyzer
node examples/run-examples.mjs websocket
node examples/run-examples.mjs strategy
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
