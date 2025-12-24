/**
 * OpenAlgo REST API - Account Methods
 * https://docs.openalgo.in
 */

import BaseAPI from './base.mjs';

class AccountAPI extends BaseAPI {
    /**
     * Account management API methods for OpenAlgo.
     * Inherits from the BaseAPI class.
     */

    /**
     * Helper method to handle API responses
     * 
     * @param {Object} response - API response object
     * @returns {Object} Processed API response
     * @private
     */
    _handleResponse(response) {
        // This method would normally process responses, but in our case,
        // the base _post method already handles errors
        return response;
    }

    /**
     * Get funds and margin details of the connected trading account.
     * 
     * @returns {Promise<Object>} JSON response containing funds data
     */
    async funds() {
        const url = `${this.baseUrl}funds`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Get orderbook details from the broker with basic orderbook statistics.
     * 
     * @returns {Promise<Object>} JSON response containing orders data
     */
    async orderbook() {
        const url = `${this.baseUrl}orderbook`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Get tradebook details from the broker.
     * 
     * @returns {Promise<Object>} JSON response containing trades data
     */
    async tradebook() {
        const url = `${this.baseUrl}tradebook`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Get positionbook details from the broker.
     * 
     * @returns {Promise<Object>} JSON response containing positions data
     */
    async positionbook() {
        const url = `${this.baseUrl}positionbook`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Get holdings details from the broker with basic holdings statistics.
     *
     * @returns {Promise<Object>} JSON response containing holdings data
     */
    async holdings() {
        const url = `${this.baseUrl}holdings`;
        const payload = {
            apikey: this.apiKey
        };
        return this._post(url, payload);
    }

    /**
     * Calculate margin requirements for positions.
     *
     * @param {Object} params - Request parameters
     * @param {Array<Object>} params.positions - Array of position objects
     *   - symbol: Trading symbol
     *   - exchange: Exchange code
     *   - action: "BUY" or "SELL"
     *   - product: Product type
     *   - priceType: Price type
     *   - quantity: Quantity
     * @returns {Promise<Object>} JSON response containing margin data
     * @example
     * const response = await client.margin({
     *     positions: [
     *         { symbol: "NIFTY25NOV2525000CE", exchange: "NFO", action: "BUY", product: "NRML", priceType: "MARKET", quantity: "75" },
     *         { symbol: "NIFTY25NOV2525500CE", exchange: "NFO", action: "SELL", product: "NRML", priceType: "MARKET", quantity: "75" }
     *     ]
     * });
     */
    async margin({ positions }) {
        const url = `${this.baseUrl}margin`;

        // Process positions to convert camelCase to snake_case
        const processedPositions = positions.map(pos => ({
            symbol: pos.symbol,
            exchange: pos.exchange,
            action: pos.action,
            product: pos.product,
            pricetype: pos.priceType || pos.pricetype,
            quantity: String(pos.quantity)
        }));

        const payload = {
            apikey: this.apiKey,
            positions: processedPositions
        };
        return this._post(url, payload);
    }

    /**
     * Get trading holidays for a year.
     *
     * @param {Object} params - Request parameters
     * @param {number} params.year - Year to get holidays for (e.g., 2025)
     * @returns {Promise<Object>} JSON response containing holidays data
     * @example
     * const response = await client.holidays({ year: 2026 });
     */
    async holidays({ year }) {
        const url = `${this.baseUrl}holidays`;
        const payload = {
            apikey: this.apiKey,
            year
        };
        return this._post(url, payload);
    }

    /**
     * Get exchange trading timings for a specific date.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.date - Date in YYYY-MM-DD format
     * @returns {Promise<Object>} JSON response containing timings data
     * @example
     * const response = await client.timings({ date: "2025-12-19" });
     */
    async timings({ date }) {
        const url = `${this.baseUrl}timings`;
        const payload = {
            apikey: this.apiKey,
            date
        };
        return this._post(url, payload);
    }

    /**
     * Send a Telegram notification.
     *
     * @param {Object} params - Request parameters
     * @param {string} params.username - OpenAlgo login ID
     * @param {string} params.message - Message to send
     * @returns {Promise<Object>} JSON response with notification status
     * @example
     * const response = await client.telegram({
     *     username: "your_login_id",
     *     message: "NIFTY crossed 26000!"
     * });
     */
    async telegram({ username, message }) {
        const url = `${this.baseUrl}telegram`;
        const payload = {
            apikey: this.apiKey,
            username,
            message
        };
        return this._post(url, payload);
    }
}

export default AccountAPI;
