/**
 * OpenAlgo REST API - Data Methods
 * https://docs.openalgo.in
 */

import BaseAPI from './base.mjs';

class DataAPI extends BaseAPI {
    /**
     * Data API methods for OpenAlgo.
     * Inherits from the BaseAPI class.
     */

    /**
     * Handle API response with retry logic
     * 
     * @param {Object} response - API response
     * @param {number} [maxRetries=3] - Maximum number of retries
     * @param {number} [retryDelay=1000] - Delay between retries in milliseconds
     * @returns {Promise<Object>} Processed API response
     * @private
     */
    async _handleResponse(response, maxRetries = 3, retryDelay = 1000) {
        let retries = 0;
        
        // This is a placeholder for handling responses with retry logic
        // In a real implementation, this would need to be integrated with the axios request
        return response;
    }

    /**
     * Get real-time quotes for a symbol.
     * 
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange code
     * @returns {Promise<Object>} JSON response containing quote data
     */
    async quotes({ symbol, exchange }) {
        const url = `${this.baseUrl}quotes/`;
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange
        };
        return this._post(url, payload);
    }

    /**
     * Get market depth (order book) for a symbol.
     * 
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange code
     * @returns {Promise<Object>} JSON response containing depth data
     */
    async depth({ symbol, exchange }) {
        const url = `${this.baseUrl}depth/`;
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange
        };
        return this._post(url, payload);
    }

    /**
     * Get symbol details and information.
     * 
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange code
     * @returns {Promise<Object>} JSON response containing symbol information
     */
    async symbol({ symbol, exchange }) {
        const url = `${this.baseUrl}symbol`;
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange
        };
        return this._post(url, payload);
    }

    /**
     * Get historical candle data for a symbol.
     * 
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange code
     * @param {string} params.interval - Time interval (e.g., "1m", "5m", "1h", "1d")
     * @param {string} [params.startDate] - Start date (format: "YYYY-MM-DD")
     * @param {string} [params.endDate] - End date (format: "YYYY-MM-DD")
     * @param {number} [params.count] - Number of candles to return
     * @returns {Promise<Array>} Array of candle data
     */
    async history({ symbol, exchange, interval, startDate, endDate, count }) {
        const url = `${this.baseUrl}history/`;
        
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange,
            interval
        };
        
        if (startDate) {
            payload.start_date = startDate;
        }
        
        if (endDate) {
            payload.end_date = endDate;
        }
        
        if (count) {
            payload.count = String(count);
        }
        
        const response = await this._post(url, payload);
        
        if (response.status === 'success' && response.data) {
            return response.data;
        } else {
            return response; // Return the error response
        }
    }

    /**
     * Get supported time intervals for historical data.
     *
     * @returns {Promise<Object>} JSON response containing available intervals
     */
    async intervals() {
        const url = `${this.baseUrl}intervals`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Get expiry dates for a symbol.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Trading symbol (e.g., "NIFTY", "BANKNIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NFO")
     * @param {string} params.instrumenttype - Instrument type ("options" or "futures")
     * @returns {Promise<Object>} JSON response containing expiry dates
     * @example
     * const response = await client.expiry({
     *     symbol: "NIFTY",
     *     exchange: "NFO",
     *     instrumenttype: "options"
     * });
     * console.log(response);
     * // Output: { status: 'success', data: ['10-JUL-25', '17-JUL-25', ...], message: 'Found 18 expiry dates...' }
     */
    async expiry({ symbol, exchange, instrumenttype }) {
        const url = `${this.baseUrl}expiry`;
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange,
            instrumenttype
        };
        return this._post(url, payload);
    }

    /**
     * Search for symbols matching a query.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.query - Search query (e.g., "NIFTY 25000 JUL CE")
     * @param {string} params.exchange - Exchange code (e.g., "NFO", "NSE")
     * @returns {Promise<Object>} JSON response containing matching symbols
     * @example
     * const response = await client.search({
     *     query: "NIFTY 25000 JUL CE",
     *     exchange: "NFO"
     * });
     * console.log(response);
     * // Output: { status: 'success', data: [{symbol: 'NIFTY17JUL2525000CE', ...}], message: 'Found 6 matching symbols' }
     */
    async search({ query, exchange }) {
        const url = `${this.baseUrl}search`;
        const payload = {
            apikey: this.apiKey,
            query,
            exchange
        };
        return this._post(url, payload);
    }

    /**
     * Get real-time quotes for multiple symbols.
     *
     * @param {Object} params - Request parameters
     * @param {Array<Object>} params.symbols - Array of symbol objects with symbol and exchange
     * @returns {Promise<Object>} JSON response containing quotes for all symbols
     * @example
     * const response = await client.multiQuotes({
     *     symbols: [
     *         { symbol: "RELIANCE", exchange: "NSE" },
     *         { symbol: "TCS", exchange: "NSE" }
     *     ]
     * });
     */
    async multiQuotes({ symbols }) {
        const url = `${this.baseUrl}multiquotes`;
        const payload = {
            apikey: this.apiKey,
            symbols
        };
        return this._post(url, payload);
    }

    /**
     * Get option chain data for an underlying.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.underlying - Underlying symbol (e.g., "NIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NSE_INDEX")
     * @param {string} params.expiryDate - Expiry date (e.g., "30DEC25")
     * @param {number} [params.strikeCount] - Number of strikes around ATM (optional)
     * @returns {Promise<Object>} JSON response containing option chain data
     * @example
     * const response = await client.optionChain({
     *     underlying: "NIFTY",
     *     exchange: "NSE_INDEX",
     *     expiryDate: "30DEC25",
     *     strikeCount: 10
     * });
     */
    async optionChain({ underlying, exchange, expiryDate, strikeCount }) {
        const url = `${this.baseUrl}optionchain`;
        const payload = {
            apikey: this.apiKey,
            underlying,
            exchange,
            expiry_date: expiryDate
        };

        if (strikeCount !== undefined) {
            payload.strike_count = strikeCount;
        }

        return this._post(url, payload);
    }

    /**
     * Get option symbol based on offset from ATM.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.underlying - Underlying symbol (e.g., "NIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NSE_INDEX")
     * @param {string} params.expiryDate - Expiry date (e.g., "30DEC25")
     * @param {string} params.offset - Strike offset (e.g., "ATM", "ITM3", "OTM4")
     * @param {string} params.optionType - Option type ("CE" or "PE")
     * @returns {Promise<Object>} JSON response containing option symbol details
     * @example
     * const response = await client.optionSymbol({
     *     underlying: "NIFTY",
     *     exchange: "NSE_INDEX",
     *     expiryDate: "30DEC25",
     *     offset: "ATM",
     *     optionType: "CE"
     * });
     */
    async optionSymbol({ underlying, exchange, expiryDate, offset, optionType }) {
        const url = `${this.baseUrl}optionsymbol`;
        const payload = {
            apikey: this.apiKey,
            underlying,
            exchange,
            expiry_date: expiryDate,
            offset,
            option_type: optionType
        };
        return this._post(url, payload);
    }

    /**
     * Calculate synthetic future price from ATM options.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.underlying - Underlying symbol (e.g., "NIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NSE_INDEX")
     * @param {string} params.expiryDate - Expiry date (e.g., "25NOV25")
     * @returns {Promise<Object>} JSON response containing synthetic future price
     * @example
     * const response = await client.syntheticFuture({
     *     underlying: "NIFTY",
     *     exchange: "NSE_INDEX",
     *     expiryDate: "25NOV25"
     * });
     */
    async syntheticFuture({ underlying, exchange, expiryDate }) {
        const url = `${this.baseUrl}syntheticfuture`;
        const payload = {
            apikey: this.apiKey,
            underlying,
            exchange,
            expiry_date: expiryDate
        };
        return this._post(url, payload);
    }

    /**
     * Calculate option Greeks for a symbol.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.symbol - Option symbol (e.g., "NIFTY25NOV2526000CE")
     * @param {string} params.exchange - Exchange code (e.g., "NFO")
     * @param {number} [params.interestRate=0] - Risk-free interest rate
     * @param {string} params.underlyingSymbol - Underlying symbol (e.g., "NIFTY")
     * @param {string} params.underlyingExchange - Underlying exchange (e.g., "NSE_INDEX")
     * @returns {Promise<Object>} JSON response containing option Greeks
     * @example
     * const response = await client.optionGreeks({
     *     symbol: "NIFTY25NOV2526000CE",
     *     exchange: "NFO",
     *     interestRate: 0.00,
     *     underlyingSymbol: "NIFTY",
     *     underlyingExchange: "NSE_INDEX"
     * });
     */
    async optionGreeks({ symbol, exchange, interestRate = 0, underlyingSymbol, underlyingExchange }) {
        const url = `${this.baseUrl}optiongreeks`;
        const payload = {
            apikey: this.apiKey,
            symbol,
            exchange,
            interest_rate: interestRate,
            underlying_symbol: underlyingSymbol,
            underlying_exchange: underlyingExchange
        };
        return this._post(url, payload);
    }

    /**
     * Get all instruments for an exchange.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.exchange - Exchange code (e.g., "NSE", "NFO")
     * @returns {Promise<Object>} JSON response containing instruments data
     * @example
     * const response = await client.instruments({ exchange: "NSE" });
     */
    async instruments({ exchange }) {
        const url = `${this.baseUrl}instruments`;
        const payload = {
            apikey: this.apiKey,
            exchange
        };
        return this._post(url, payload);
    }
}

export default DataAPI;
