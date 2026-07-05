/**
 * OpenAlgo WebSocket Client for Real-time Data Streaming
 * https://docs.openalgo.in
 */

import WebSocket from 'ws';

class OpenAlgoWebSocket {
    /**
     * Initialize WebSocket client
     *
     * @param {string} apiKey - User's API key
     * @param {string} [wsUrl="ws://127.0.0.1:8765"] - WebSocket server URL
     */
    constructor(apiKey, wsUrl = "ws://127.0.0.1:8765") {
        this.apiKey = apiKey;
        this.wsUrl = wsUrl;
        this.ws = null;
        this.isConnected = false;
        this.subscriptions = new Map();
        this.messageQueue = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000;
        this.shouldReconnect = true;

        // Local cache of the most recent market-data snapshot per
        // instrument, mirroring the Python SDK's `ltp_data` / `quotes_data`
        // / `depth_data` dicts (keyed by "EXCHANGE:SYMBOL"). Populated as
        // messages arrive in `_handleMessage` and served (read-only) by
        // `getLtp` / `getQuotes` / `getDepth`.
        this.ltpData = {};
        this.quotesData = {};
        this.depthData = {};
    }

    /**
     * Connect to WebSocket server
     *
     * @returns {Promise<void>}
     */
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.shouldReconnect = true;
                this.ws = new WebSocket(this.wsUrl);

                this.ws.on('open', () => {
                    console.log('WebSocket connected');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;

                    // Send authentication (use api_key with underscore)
                    this._sendMessage({
                        action: 'authenticate',
                        api_key: this.apiKey
                    });

                    // Send any queued messages
                    while (this.messageQueue.length > 0) {
                        const message = this.messageQueue.shift();
                        this._sendMessage(message);
                    }

                    resolve();
                });

                this.ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        this._handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                });

                this.ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                });

                this.ws.on('close', () => {
                    console.log('WebSocket disconnected');
                    this.isConnected = false;
                    this._attemptReconnect();
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.ws) {
            this.shouldReconnect = false;
            this.isConnected = false;
            this.ws.close();
            this.ws = null;
            this.subscriptions.clear();
        }
    }

    /**
     * Subscribe to LTP (Last Traded Price) updates
     *
     * @param {Array<Object>} instruments - Array of instruments to subscribe
     * @param {Function} onDataReceived - Callback function for receiving data
     * @example
     * const instruments = [
     *     { exchange: "NSE", symbol: "RELIANCE" },
     *     { exchange: "NSE", symbol: "INFY" }
     * ];
     * client.subscribe_ltp(instruments, (data) => {
     *     console.log("LTP Update:", data);
     * });
     */
    subscribe_ltp(instruments, onDataReceived) {
        const subscriptionKey = 'ltp';
        this.subscriptions.set(subscriptionKey, onDataReceived);

        const message = {
            action: 'subscribe',
            mode: 'LTP',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    /**
     * Unsubscribe from LTP updates
     *
     * @param {Array<Object>} instruments - Array of instruments to unsubscribe
     */
    unsubscribe_ltp(instruments) {
        const message = {
            action: 'unsubscribe',
            mode: 'LTP',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        }

        this.subscriptions.delete('ltp');
    }

    /**
     * Subscribe to Quote updates
     *
     * @param {Array<Object>} instruments - Array of instruments to subscribe
     * @param {Function} onDataReceived - Callback function for receiving data
     * @example
     * const instruments = [
     *     { exchange: "NSE", symbol: "RELIANCE" },
     *     { exchange: "NSE", symbol: "INFY" }
     * ];
     * client.subscribe_quote(instruments, (data) => {
     *     console.log("Quote Update:", data);
     * });
     */
    subscribe_quote(instruments, onDataReceived) {
        const subscriptionKey = 'quote';
        this.subscriptions.set(subscriptionKey, onDataReceived);

        const message = {
            action: 'subscribe',
            mode: 'Quote',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    /**
     * Unsubscribe from Quote updates
     *
     * @param {Array<Object>} instruments - Array of instruments to unsubscribe
     */
    unsubscribe_quote(instruments) {
        const message = {
            action: 'unsubscribe',
            mode: 'Quote',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        }

        this.subscriptions.delete('quote');
    }

    /**
     * Subscribe to Market Depth updates
     *
     * @param {Array<Object>} instruments - Array of instruments to subscribe
     * @param {Function} onDataReceived - Callback function for receiving data
     * @example
     * const instruments = [
     *     { exchange: "NSE", symbol: "RELIANCE" },
     *     { exchange: "NSE", symbol: "INFY" }
     * ];
     * client.subscribe_depth(instruments, (data) => {
     *     console.log("Depth Update:", data);
     * });
     */
    subscribe_depth(instruments, onDataReceived) {
        const subscriptionKey = 'depth';
        this.subscriptions.set(subscriptionKey, onDataReceived);

        const message = {
            action: 'subscribe',
            mode: 'Depth',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        } else {
            this.messageQueue.push(message);
        }
    }

    /**
     * Unsubscribe from Market Depth updates
     *
     * @param {Array<Object>} instruments - Array of instruments to unsubscribe
     */
    unsubscribe_depth(instruments) {
        const message = {
            action: 'unsubscribe',
            mode: 'Depth',
            symbols: instruments
        };

        if (this.isConnected) {
            this._sendMessage(message);
        }

        this.subscriptions.delete('depth');
    }

    /**
     * Send a message to WebSocket server
     *
     * @param {Object} message - Message to send
     * @private
     */
    _sendMessage(message) {
        if (this.ws && this.isConnected) {
            this.ws.send(JSON.stringify(message));
        }
    }

    /**
     * Handle incoming WebSocket messages
     *
     * @param {Object} message - Received message
     * @private
     */
    _handleMessage(message) {
        // Handle market_data type messages
        if (message.type === 'market_data') {
            const mode = message.mode;
            const exchange = message.exchange;
            const symbol = message.symbol;
            const data = message.data || {};

            // Cache the latest snapshot per instrument so getLtp/getQuotes/
            // getDepth can serve polled reads without a live callback.
            if (exchange && symbol) {
                const symbolKey = `${exchange}:${symbol}`;
                const timestamp = data.timestamp !== undefined ? data.timestamp : Date.now();

                if (mode === 1 && 'ltp' in data) {
                    this.ltpData[symbolKey] = { price: data.ltp, timestamp };
                } else if (mode === 2) {
                    this.quotesData[symbolKey] = {
                        open: data.open || 0,
                        high: data.high || 0,
                        low: data.low || 0,
                        close: data.close || 0,
                        ltp: data.ltp || 0,
                        volume: data.volume || 0,
                        last_trade_quantity: data.last_trade_quantity || 0,
                        avg_trade_price: data.avg_trade_price || 0,
                        change: data.change || 0,
                        change_percent: data.change_percent || 0,
                        timestamp
                    };
                } else if (mode === 3 && 'depth' in data) {
                    this.depthData[symbolKey] = {
                        ltp: data.ltp || 0,
                        timestamp,
                        depth: data.depth || { buy: [], sell: [] }
                    };
                }
            }

            if (mode === 1 && this.subscriptions.has('ltp')) {
                this.subscriptions.get('ltp')(message.data);
            } else if (mode === 2 && this.subscriptions.has('quote')) {
                this.subscriptions.get('quote')(message.data);
            } else if (mode === 3 && this.subscriptions.has('depth')) {
                this.subscriptions.get('depth')(message.data);
            }
        } else if (message.status || message.type) {
            // Handle status and other messages
            console.log('WebSocket status:', message);
        }
    }

    /**
     * Get the latest cached LTP snapshot in nested format.
     *
     * @param {string} [exchange] - Filter by exchange
     * @param {string} [symbol] - Filter by symbol (requires exchange to be specified)
     * @returns {Object} `{ ltp: { EXCHANGE: { SYMBOL: { timestamp, ltp } } } }`
     */
    getLtp(exchange, symbol) {
        const result = { ltp: {} };

        for (const [symbolKey, data] of Object.entries(this.ltpData)) {
            const separatorIndex = symbolKey.indexOf(':');
            if (separatorIndex === -1) continue;

            const ex = symbolKey.slice(0, separatorIndex);
            const sym = symbolKey.slice(separatorIndex + 1);

            if (exchange && ex !== exchange) continue;
            if (symbol && sym !== symbol) continue;

            if (!result.ltp[ex]) result.ltp[ex] = {};
            result.ltp[ex][sym] = { timestamp: data.timestamp, ltp: data.price };
        }

        return result;
    }

    /**
     * Get the latest cached Quote snapshot in nested format.
     *
     * @param {string} [exchange] - Filter by exchange
     * @param {string} [symbol] - Filter by symbol (requires exchange to be specified)
     * @returns {Object} `{ quote: { EXCHANGE: { SYMBOL: { timestamp, open, high, low, close, ltp, volume, last_trade_quantity, avg_trade_price, change, change_percent } } } }`
     */
    getQuotes(exchange, symbol) {
        const result = { quote: {} };

        for (const [symbolKey, data] of Object.entries(this.quotesData)) {
            const separatorIndex = symbolKey.indexOf(':');
            if (separatorIndex === -1) continue;

            const ex = symbolKey.slice(0, separatorIndex);
            const sym = symbolKey.slice(separatorIndex + 1);

            if (exchange && ex !== exchange) continue;
            if (symbol && sym !== symbol) continue;

            if (!result.quote[ex]) result.quote[ex] = {};
            result.quote[ex][sym] = {
                timestamp: data.timestamp,
                open: data.open,
                high: data.high,
                low: data.low,
                close: data.close,
                ltp: data.ltp,
                volume: data.volume || 0,
                last_trade_quantity: data.last_trade_quantity || 0,
                avg_trade_price: data.avg_trade_price || 0,
                change: data.change || 0,
                change_percent: data.change_percent || 0
            };
        }

        return result;
    }

    /**
     * Get the latest cached Market Depth snapshot in nested format.
     *
     * @param {string} [exchange] - Filter by exchange
     * @param {string} [symbol] - Filter by symbol (requires exchange to be specified)
     * @returns {Object} `{ depth: { EXCHANGE: { SYMBOL: { timestamp, ltp, buyBook: {"1": {price, qty, orders}, ...}, sellBook: {...} } } } }`
     */
    getDepth(exchange, symbol) {
        const result = { depth: {} };

        for (const [symbolKey, data] of Object.entries(this.depthData)) {
            const separatorIndex = symbolKey.indexOf(':');
            if (separatorIndex === -1) continue;

            const ex = symbolKey.slice(0, separatorIndex);
            const sym = symbolKey.slice(separatorIndex + 1);

            if (exchange && ex !== exchange) continue;
            if (symbol && sym !== symbol) continue;

            if (!result.depth[ex]) result.depth[ex] = {};

            const entry = {
                timestamp: data.timestamp !== undefined ? data.timestamp : Date.now(),
                ltp: data.ltp || 0,
                buyBook: {},
                sellBook: {}
            };

            const buyDepth = (data.depth && data.depth.buy) || [];
            const sellDepth = (data.depth && data.depth.sell) || [];

            for (let i = 0; i < 5; i++) {
                const buyLevel = buyDepth[i];
                entry.buyBook[String(i + 1)] = buyLevel
                    ? {
                        price: Number(buyLevel.price) || 0,
                        qty: Number(buyLevel.quantity) || 0,
                        orders: Number(buyLevel.orders) || 0
                    }
                    : { price: 0.0, qty: 0, orders: 0 };

                const sellLevel = sellDepth[i];
                entry.sellBook[String(i + 1)] = sellLevel
                    ? {
                        price: Number(sellLevel.price) || 0,
                        qty: Number(sellLevel.quantity) || 0,
                        orders: Number(sellLevel.orders) || 0
                    }
                    : { price: 0.0, qty: 0, orders: 0 };
            }

            result.depth[ex][sym] = entry;
        }

        return result;
    }

    /**
     * Attempt to reconnect to WebSocket server
     *
     * @private
     */
    _attemptReconnect() {
        if (!this.shouldReconnect) {
            return;
        }

        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

            setTimeout(() => {
                this.connect().catch(error => {
                    console.error('Reconnection failed:', error);
                });
            }, this.reconnectDelay);
        } else {
            console.error('Max reconnection attempts reached');
        }
    }
}

export default OpenAlgoWebSocket;
