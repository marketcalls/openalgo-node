/**
 * OpenAlgo Node.js Library - ES Module version
 * https://docs.openalgo.in
 */

import OrderAPIClass from './orders.mjs';
import DataAPIClass from './data.mjs';
import AccountAPIClass from './account.mjs';
import StrategyClass from './strategy.mjs';
import AnalyzerAPIClass from './analyzer.mjs';
import OpenAlgoWebSocketClass from './websocket.mjs';

/**
 * OpenAlgo API client class that combines OrderAPI, DataAPI, AccountAPI, and AnalyzerAPI
 */
class OpenAlgo extends OrderAPIClass {
    constructor(apiKey, host = "http://127.0.0.1:5000", version = "v1", wsUrl = "ws://127.0.0.1:8765") {
        super(apiKey, host, version);

        // Initialize the other API interfaces
        this._dataAPI = new DataAPIClass(apiKey, host, version);
        this._accountAPI = new AccountAPIClass(apiKey, host, version);
        this._analyzerAPI = new AnalyzerAPIClass(apiKey, host, version);
        this._wsClient = null;
        this._wsUrl = wsUrl;
        this._apiKey = apiKey;
    }

    // Order API methods (from OrderAPIClass via inheritance)
    // placeOrder, placeSmartOrder, basketOrder, splitOrder, modifyOrder,
    // cancelOrder, cancelAllOrder, closePosition, orderStatus, openPosition,
    // optionsOrder, optionsMultiOrder are inherited

    // Data API methods
    quotes(params) { return this._dataAPI.quotes(params); }
    depth(params) { return this._dataAPI.depth(params); }
    symbol(params) { return this._dataAPI.symbol(params); }
    history(params) { return this._dataAPI.history(params); }
    intervals() { return this._dataAPI.intervals(); }
    expiry(params) { return this._dataAPI.expiry(params); }
    search(params) { return this._dataAPI.search(params); }
    multiQuotes(params) { return this._dataAPI.multiQuotes(params); }
    optionChain(params) { return this._dataAPI.optionChain(params); }
    optionSymbol(params) { return this._dataAPI.optionSymbol(params); }
    syntheticFuture(params) { return this._dataAPI.syntheticFuture(params); }
    optionGreeks(params) { return this._dataAPI.optionGreeks(params); }
    instruments(params) { return this._dataAPI.instruments(params); }

    // Account API methods
    funds() { return this._accountAPI.funds(); }
    orderbook() { return this._accountAPI.orderbook(); }
    tradebook() { return this._accountAPI.tradebook(); }
    positionbook() { return this._accountAPI.positionbook(); }
    holdings() { return this._accountAPI.holdings(); }
    margin(params) { return this._accountAPI.margin(params); }
    holidays(params) { return this._accountAPI.holidays(params); }
    timings(params) { return this._accountAPI.timings(params); }
    telegram(params) { return this._accountAPI.telegram(params); }

    // Analyzer API methods
    analyzerstatus() { return this._analyzerAPI.analyzerstatus(); }
    analyzertoggle(params) { return this._analyzerAPI.analyzertoggle(params); }

    // WebSocket methods
    /**
     * Connect to WebSocket server for real-time data
     * @returns {Promise<void>}
     */
    connect() {
        if (!this._wsClient) {
            this._wsClient = new OpenAlgoWebSocketClass(this._apiKey, this._wsUrl);
        }
        return this._wsClient.connect();
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this._wsClient) {
            this._wsClient.disconnect();
        }
    }

    /**
     * Subscribe to LTP (Last Traded Price) updates
     * @param {Array<Object>} instruments - Array of instruments
     * @param {Function} onDataReceived - Callback for receiving data
     */
    subscribe_ltp(instruments, onDataReceived) {
        if (!this._wsClient) {
            throw new Error('WebSocket not connected. Call connect() first.');
        }
        this._wsClient.subscribe_ltp(instruments, onDataReceived);
    }

    /**
     * Unsubscribe from LTP updates
     * @param {Array<Object>} instruments - Array of instruments
     */
    unsubscribe_ltp(instruments) {
        if (this._wsClient) {
            this._wsClient.unsubscribe_ltp(instruments);
        }
    }

    /**
     * Subscribe to Quote updates
     * @param {Array<Object>} instruments - Array of instruments
     * @param {Function} onDataReceived - Callback for receiving data
     */
    subscribe_quote(instruments, onDataReceived) {
        if (!this._wsClient) {
            throw new Error('WebSocket not connected. Call connect() first.');
        }
        this._wsClient.subscribe_quote(instruments, onDataReceived);
    }

    /**
     * Unsubscribe from Quote updates
     * @param {Array<Object>} instruments - Array of instruments
     */
    unsubscribe_quote(instruments) {
        if (this._wsClient) {
            this._wsClient.unsubscribe_quote(instruments);
        }
    }

    /**
     * Subscribe to Market Depth updates
     * @param {Array<Object>} instruments - Array of instruments
     * @param {Function} onDataReceived - Callback for receiving data
     */
    subscribe_depth(instruments, onDataReceived) {
        if (!this._wsClient) {
            throw new Error('WebSocket not connected. Call connect() first.');
        }
        this._wsClient.subscribe_depth(instruments, onDataReceived);
    }

    /**
     * Unsubscribe from Market Depth updates
     * @param {Array<Object>} instruments - Array of instruments
     */
    unsubscribe_depth(instruments) {
        if (this._wsClient) {
            this._wsClient.unsubscribe_depth(instruments);
        }
    }
}

// Named exports
export const OrderAPI = OrderAPIClass;
export const DataAPI = DataAPIClass;
export const AccountAPI = AccountAPIClass;
export const Strategy = StrategyClass;
export const AnalyzerAPI = AnalyzerAPIClass;
export const OpenAlgoWebSocket = OpenAlgoWebSocketClass;
export const version = "1.0.5";

// Default export
export default OpenAlgo;
