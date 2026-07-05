/**
 * OpenAlgo REST API - Order Methods
 * https://docs.openalgo.in
 */

import BaseAPI from './base.mjs';

class OrderAPI extends BaseAPI {
    /**
     * Order management API methods for OpenAlgo.
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
     * Place an order with the given parameters.
     * 
     * @param {Object} params - Order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.action - BUY or SELL
     * @param {string} params.exchange - Exchange code
     * @param {string} [params.priceType="MARKET"] - Type of price
     * @param {string} [params.product="MIS"] - Product type
     * @param {number|string} [params.quantity=1] - Quantity to trade
     * @param {Object} [params.otherParams] - Other optional parameters like:
     *   - price: Required for LIMIT orders
     *   - triggerPrice: Required for SL and SL-M orders
     *   - disclosedQuantity: Disclosed quantity
     *   - target: Target price
     *   - stopLoss: Stoploss price
     *   - trailingSl: Trailing stoploss points
     * @returns {Promise<Object>} JSON response from the API
     */
    async placeOrder({ 
        strategy = "NodeJS", 
        symbol, 
        action, 
        exchange, 
        priceType = "MARKET", 
        product = "MIS",
        quantity = 1, 
        price,
        triggerPrice,
        ...otherParams
    }) {
        const url = `${this.baseUrl}placeorder`;
        
        // Build the base payload
        const payload = {
            apikey: this.apiKey,
            strategy,
            symbol,
            action,
            exchange,
            pricetype: priceType,
            product,
            quantity: String(quantity)
        };
        
        // Add price for LIMIT orders
        if (price !== undefined) {
            payload.price = String(price);
        }
        
        // Add trigger price for SL and SL-M orders
        if (triggerPrice !== undefined) {
            payload.trigger_price = String(triggerPrice);
        }
        
        // Add other parameters, converting any numeric values to strings
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                payload[apiKey] = typeof value === 'number' ? String(value) : value;
            }
        }
        
        return this._post(url, payload);
    }

    /**
     * Place a "smart" order that considers existing positions.
     * 
     * @param {Object} params - Smart order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.action - BUY or SELL
     * @param {string} params.exchange - Exchange code
     * @param {string} [params.priceType="MARKET"] - Type of price
     * @param {string} [params.product="MIS"] - Product type
     * @param {number|string} params.quantity - Quantity to trade
     * @param {number|string} params.positionSize - Target position size
     * @param {Object} [params.otherParams] - Other optional parameters
     * @returns {Promise<Object>} JSON response from the API
     */
    async placeSmartOrder({ 
        strategy = "NodeJS", 
        symbol, 
        action, 
        exchange, 
        priceType = "MARKET", 
        product = "MIS", 
        quantity, 
        positionSize,
        ...otherParams
    }) {
        const url = `${this.baseUrl}placesmartorder`;
        
        // Build the payload
        const payload = {
            apikey: this.apiKey,
            strategy,
            symbol,
            action,
            exchange,
            pricetype: priceType,
            product,
            quantity: String(quantity),
            position_size: String(positionSize)
        };
        
        // Add other parameters, converting any numeric values to strings
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                payload[apiKey] = typeof value === 'number' ? String(value) : value;
            }
        }
        
        return this._post(url, payload);
    }

    /**
     * Place multiple orders simultaneously.
     * 
     * @param {Object} params - Basket order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {Array<Object>} params.orders - List of order dictionaries
     * @returns {Promise<Object>} JSON response containing results for each order
     */
    async basketOrder({ strategy = "NodeJS", orders }) {
        const url = `${this.baseUrl}basketorder`;
        
        // Process orders to ensure all numeric values are strings
        const processedOrders = orders.map(order => {
            const processedOrder = {};
            for (const [key, value] of Object.entries(order)) {
                processedOrder[key] = typeof value === 'number' ? String(value) : value;
            }
            return processedOrder;
        });
        
        const payload = {
            apikey: this.apiKey,
            strategy,
            orders: processedOrders
        };
        
        return this._post(url, payload);
    }

    /**
     * Split a large order into multiple smaller orders.
     * 
     * @param {Object} params - Split order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.action - BUY or SELL
     * @param {string} params.exchange - Exchange code
     * @param {number|string} params.quantity - Total quantity to trade
     * @param {number|string} params.splitSize - Size of each split order
     * @param {string} [params.priceType="MARKET"] - Type of price
     * @param {string} [params.product="MIS"] - Product type
     * @param {Object} [params.otherParams] - Other optional parameters
     * @returns {Promise<Object>} JSON response containing results for each split order
     */
    async splitOrder({ 
        strategy = "NodeJS", 
        symbol, 
        action, 
        exchange, 
        quantity, 
        splitSize, 
        priceType = "MARKET", 
        product = "MIS",
        ...otherParams
    }) {
        const url = `${this.baseUrl}splitorder`;
        
        // Build the payload
        const payload = {
            apikey: this.apiKey,
            strategy,
            symbol,
            action,
            exchange,
            quantity: String(quantity),
            splitsize: String(splitSize),
            pricetype: priceType,
            product
        };
        
        // Add other parameters, converting any numeric values to strings
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                payload[apiKey] = typeof value === 'number' ? String(value) : value;
            }
        }
        
        return this._post(url, payload);
    }
    
    /**
     * Modify an existing order.
     * 
     * @param {Object} params - Order modification parameters
     * @param {string} params.orderId - Order ID to modify
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.action - BUY or SELL
     * @param {string} params.exchange - Exchange code
     * @param {string} [params.priceType="LIMIT"] - Type of price
     * @param {string} params.product - Product type
     * @param {number|string} params.quantity - Quantity to trade
     * @param {number|string} params.price - New price
     * @param {number|string} [params.disclosedQuantity=0] - Disclosed quantity
     * @param {number|string} [params.triggerPrice=0] - Trigger price
     * @param {Object} [params.otherParams] - Other optional parameters
     * @returns {Promise<Object>} JSON response from the API
     */
    async modifyOrder({ 
        orderId, 
        strategy = "NodeJS", 
        symbol, 
        action, 
        exchange, 
        priceType = "LIMIT", 
        product, 
        quantity, 
        price,
        disclosedQuantity = 0,
        triggerPrice = 0,
        ...otherParams
    }) {
        const url = `${this.baseUrl}modifyorder`;
        
        // Build the base payload
        const payload = {
            apikey: this.apiKey,
            orderid: orderId,
            strategy,
            symbol,
            action,
            exchange,
            pricetype: priceType,
            product,
            quantity: String(quantity),
            price: String(price),
            disclosed_quantity: String(disclosedQuantity),
            trigger_price: String(triggerPrice)
        };
        
        // Add other parameters, converting any numeric values to strings
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                payload[apiKey] = typeof value === 'number' ? String(value) : value;
            }
        }
        
        return this._post(url, payload);
    }
    
    /**
     * Cancel an existing order.
     * 
     * @param {Object} params - Order cancellation parameters
     * @param {string} params.orderId - Order ID to cancel
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @returns {Promise<Object>} JSON response from the API
     */
    async cancelOrder({ orderId, strategy = "NodeJS" }) {
        const url = `${this.baseUrl}cancelorder`;
        
        const payload = {
            apikey: this.apiKey,
            orderid: orderId,
            strategy
        };
        
        return this._post(url, payload);
    }
    
    /**
     * Cancel all open orders.
     * 
     * @param {Object} [params] - Optional parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @returns {Promise<Object>} JSON response from the API
     */
    async cancelAllOrder({ strategy = "NodeJS" } = {}) {
        const url = `${this.baseUrl}cancelallorder`;
        
        const payload = {
            apikey: this.apiKey,
            strategy
        };
        
        return this._post(url, payload);
    }
    
    /**
     * Close all positions.
     * 
     * @param {Object} [params] - Optional parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} [params.product] - Product type to filter
     * @param {string} [params.symbolGroup] - Symbol group to filter
     * @returns {Promise<Object>} JSON response from the API
     */
    async closePosition({ strategy = "NodeJS", product, symbolGroup } = {}) {
        const url = `${this.baseUrl}closeposition`;
        
        const payload = {
            apikey: this.apiKey,
            strategy
        };
        
        if (product) {
            payload.product = product;
        }
        
        if (symbolGroup) {
            payload.symbolgroup = symbolGroup;
        }
        
        return this._post(url, payload);
    }
    
    /**
     * Get the status of a specific order.
     * 
     * @param {Object} params - Order status parameters
     * @param {string} params.orderId - The order ID to check
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @returns {Promise<Object>} JSON response with order status details
     */
    async orderStatus({ orderId, strategy = "NodeJS" }) {
        const url = `${this.baseUrl}orderstatus`;
        
        const payload = {
            apikey: this.apiKey,
            orderid: orderId,  // Changed from order_id to orderid to match Python implementation
            strategy
        };
        
        return this._post(url, payload);
    }
    
    /**
     * Get current open position information.
     *
     * @param {Object} params - Open position parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.symbol - Trading symbol
     * @param {string} params.exchange - Exchange code
     * @param {string} params.product - Product type. Required (no default,
     *   matching the Python SDK).
     * @returns {Promise<Object>} JSON response with position details
     */
    async openPosition({ strategy = "NodeJS", symbol, exchange, product }) {
        const url = `${this.baseUrl}openposition`;

        const payload = {
            apikey: this.apiKey,
            strategy,
            symbol,
            exchange,
            product
        };

        return this._post(url, payload);
    }

    /**
     * Place an options order with automatic strike selection.
     *
     * @param {Object} params - Options order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.underlying - Underlying symbol (e.g., "NIFTY", "BANKNIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NSE_INDEX")
     * @param {string} params.expiryDate - Expiry date (e.g., "28OCT25")
     * @param {string} params.offset - Strike offset (e.g., "ATM", "ITM4", "OTM5")
     * @param {string} params.optionType - Option type ("CE" or "PE")
     * @param {string} params.action - BUY or SELL
     * @param {number|string} params.quantity - Quantity to trade
     * @param {string} [params.priceType="MARKET"] - Type of price
     * @param {string} [params.product="NRML"] - Product type
     * @param {number|string} [params.splitSize=0] - Split size for large orders
     * @param {number|string} [params.price] - Limit price. Required for LIMIT orders.
     * @param {number|string} [params.triggerPrice] - Trigger price (also accepted
     *   as `trigger_price`). Required for SL and SL-M orders.
     * @param {number|string} [params.disclosedQuantity] - Disclosed quantity
     *   (also accepted as `disclosed_quantity`).
     * @param {Object} [params.otherParams] - Any other fields are forwarded
     *   verbatim (numbers are stringified), matching the Python SDK's
     *   `**kwargs` passthrough.
     * @returns {Promise<Object>} JSON response from the API
     * @example
     * // LIMIT option order
     * await client.optionsOrder({
     *     underlying: 'NIFTY',
     *     exchange: 'NSE_INDEX',
     *     expiryDate: '28NOV24',
     *     offset: 'OTM1',
     *     optionType: 'CE',
     *     action: 'BUY',
     *     quantity: 75,
     *     priceType: 'LIMIT',
     *     price: 50.0
     * });
     */
    async optionsOrder({
        strategy = "NodeJS",
        underlying,
        exchange,
        expiryDate,
        offset,
        optionType,
        action,
        quantity,
        priceType = "MARKET",
        product = "NRML",
        splitSize = 0,
        price,
        triggerPrice,
        trigger_price,
        disclosedQuantity,
        disclosed_quantity,
        ...otherParams
    }) {
        const url = `${this.baseUrl}optionsorder`;

        const payload = {
            apikey: this.apiKey,
            strategy,
            underlying,
            exchange,
            expiry_date: expiryDate,
            offset,
            option_type: optionType,
            action,
            quantity: String(quantity),
            pricetype: priceType,
            product,
            splitsize: String(splitSize)
        };

        if (price !== undefined && price !== null) {
            payload.price = String(price);
        }

        const resolvedTriggerPrice = triggerPrice !== undefined ? triggerPrice : trigger_price;
        if (resolvedTriggerPrice !== undefined && resolvedTriggerPrice !== null) {
            payload.trigger_price = String(resolvedTriggerPrice);
        }

        const resolvedDisclosedQuantity = disclosedQuantity !== undefined ? disclosedQuantity : disclosed_quantity;
        if (resolvedDisclosedQuantity !== undefined && resolvedDisclosedQuantity !== null) {
            payload.disclosed_quantity = String(resolvedDisclosedQuantity);
        }

        // Forward any other parameters verbatim (numbers stringified),
        // mirroring Python's **kwargs passthrough for future fields.
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null) {
                const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
                payload[apiKey] = typeof value === 'number' ? String(value) : value;
            }
        }

        return this._post(url, payload);
    }

    /**
     * Place multiple options orders simultaneously (e.g., Iron Condor, Diagonal Spread).
     *
     * @param {Object} params - Options multi-order parameters
     * @param {string} [params.strategy="NodeJS"] - The trading strategy name
     * @param {string} params.underlying - Underlying symbol (e.g., "NIFTY")
     * @param {string} params.exchange - Exchange code (e.g., "NSE_INDEX")
     * @param {string} [params.expiryDate] - Default expiry date for all legs
     * @param {Array<Object>} params.legs - Array of leg configurations
     *   - offset: Strike offset (e.g., "OTM6", "ITM2")
     *   - optionType: "CE" or "PE"
     *   - action: "BUY" or "SELL"
     *   - quantity: Quantity to trade
     *   - expiryDate: (optional) Override expiry for this leg
     *   - priceType (or pricetype): (optional) MARKET/LIMIT/SL/SL-M. Default: MARKET.
     *   - product: (optional) Product type (MIS/NRML). Default: MIS.
     *   - price: (optional) Limit price for LIMIT orders.
     *   - triggerPrice (or trigger_price): (optional) Trigger price for SL orders.
     *   - disclosedQuantity (or disclosed_quantity): (optional) Disclosed quantity.
     * @returns {Promise<Object>} JSON response containing results for each leg
     * @example
     * // Long Straddle with LIMIT orders
     * await client.optionsMultiOrder({
     *     strategy: 'Long Straddle',
     *     underlying: 'BANKNIFTY',
     *     exchange: 'NSE_INDEX',
     *     expiryDate: '25NOV25',
     *     legs: [
     *         { offset: 'ATM', optionType: 'CE', action: 'BUY', quantity: 30, priceType: 'LIMIT', price: 250.0 },
     *         { offset: 'ATM', optionType: 'PE', action: 'BUY', quantity: 30, priceType: 'LIMIT', price: 250.0 }
     *     ]
     * });
     */
    async optionsMultiOrder({
        strategy = "NodeJS",
        underlying,
        exchange,
        expiryDate,
        legs
    }) {
        const url = `${this.baseUrl}optionsmultiorder`;

        // Process legs to convert camelCase to snake_case and ensure string values
        const processedLegs = legs.map(leg => {
            const processedLeg = {
                offset: leg.offset,
                option_type: leg.optionType,
                action: leg.action,
                quantity: String(leg.quantity)
            };
            if (leg.expiryDate) {
                processedLeg.expiry_date = leg.expiryDate;
            }

            const priceType = leg.priceType !== undefined ? leg.priceType : leg.pricetype;
            if (priceType !== undefined && priceType !== null) {
                processedLeg.pricetype = priceType;
            }

            if (leg.product !== undefined && leg.product !== null) {
                processedLeg.product = leg.product;
            }

            if (leg.price !== undefined && leg.price !== null) {
                processedLeg.price = String(leg.price);
            }

            const triggerPrice = leg.triggerPrice !== undefined ? leg.triggerPrice : leg.trigger_price;
            if (triggerPrice !== undefined && triggerPrice !== null) {
                processedLeg.trigger_price = String(triggerPrice);
            }

            const disclosedQuantity = leg.disclosedQuantity !== undefined ? leg.disclosedQuantity : leg.disclosed_quantity;
            if (disclosedQuantity !== undefined && disclosedQuantity !== null) {
                processedLeg.disclosed_quantity = String(disclosedQuantity);
            }

            return processedLeg;
        });

        const payload = {
            apikey: this.apiKey,
            strategy,
            underlying,
            exchange,
            legs: processedLegs
        };

        // Add default expiry_date if provided
        if (expiryDate) {
            payload.expiry_date = expiryDate;
        }

        return this._post(url, payload);
    }
}

export default OrderAPI;
