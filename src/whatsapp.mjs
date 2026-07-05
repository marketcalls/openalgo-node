/**
 * OpenAlgo REST API - WhatsApp Notification Methods
 * https://docs.openalgo.in
 */

import BaseAPI from './base.mjs';

class WhatsAppAPI extends BaseAPI {
    /**
     * WhatsApp notification API methods for OpenAlgo.
     * Inherits from the BaseAPI class.
     *
     * Mirrors the Telegram API with the richer fields the WhatsApp endpoint
     * supports (multi-recipient broadcast capped at 5, image and document
     * attachments). One ergonomic call - `client.whatsapp({ message })` -
     * translates trader-facing parameters into the exact JSON shape the
     * OpenAlgo server expects.
     */

    /**
     * Send a WhatsApp message via the OpenAlgo paired device.
     *
     * Prerequisites:
     * 1. WhatsApp device must be paired from the OpenAlgo web UI (`/whatsapp`,
     *    scan the QR code with your phone).
     * 2. The bot auto-reconnects on every server boot from the encrypted
     *    session blob in `openalgo.db`.
     * 3. A valid, active OpenAlgo API key.
     *
     * @param {Object} params - WhatsApp notification parameters
     * @param {string} [params.message] - Plain text body. Max 4096 characters.
     * @param {string|string[]} [params.to] - Recipient(s). A single E.164
     *   digit string (e.g. "919876543210"), or an array of up to 5 such
     *   strings for a small broadcast (anything beyond 5 is dropped
     *   server-side). Defaults to the paired device's own number (self)
     *   when neither `to` nor `username` is given.
     * @param {string} [params.username] - OpenAlgo username; resolves via
     *   the linked-users table on the server.
     * @param {string} [params.image] - Server-local path to an image file.
     *   Caption falls back to `message` if no explicit caption is given.
     * @param {string} [params.document] - Server-local path to a document
     *   (PDF, CSV, etc.).
     * @param {string} [params.caption] - Caption for image / follow-up text
     *   for document.
     * @param {string} [params.filename] - Override the document's display
     *   name on the recipient's device.
     * @param {boolean} [params.waitForDelivery=true] - When true, the call
     *   resolves once WhatsApp confirms delivery and returns a per-recipient
     *   report. Set to false for fire-and-forget (returns a generic
     *   "queued" acknowledgement).
     * @param {Object} [params.otherParams] - Any additional fields are
     *   forwarded verbatim so future server-side fields work without an
     *   SDK release.
     * @returns {Promise<Object>} JSON response.
     *
     * With `waitForDelivery: true` (default):
     * ```
     * {
     *   status: 'success',
     *   message: 'Delivered to 1, failed 0',
     *   data: { sent: ['<self>'], failed: [], skipped: 0 }
     * }
     * ```
     *
     * With `waitForDelivery: false`:
     * ```
     * { status: 'success', message: 'Queued for 1 recipient(s)', queued: 1 }
     * ```
     *
     * @example
     * // Send to self - simplest case
     * await client.whatsapp({ message: 'Build #482 deployed. P&L: +1.2%' });
     *
     * // Send to a single number
     * await client.whatsapp({ message: 'Are you free for a quick call?', to: '919876543210' });
     *
     * // Small broadcast (up to 5 numbers)
     * await client.whatsapp({
     *     message: 'Server maintenance in 10 minutes',
     *     to: ['919876543210', '919812345678', '919900112233']
     * });
     *
     * // Send a chart image with a caption
     * await client.whatsapp({
     *     message: 'NIFTY end-of-day chart',
     *     to: '919876543210',
     *     image: '/srv/charts/nifty_eod.png'
     * });
     *
     * // Send a daily report PDF
     * await client.whatsapp({
     *     username: 'alice',
     *     document: '/srv/reports/2026-05-17.pdf',
     *     filename: 'summary.pdf',
     *     caption: 'Daily P&L report attached'
     * });
     *
     * // Fire-and-forget for time-critical alerts
     * await client.whatsapp({ message: 'Stop-loss hit on BANKNIFTY!', waitForDelivery: false });
     */
    async whatsapp({
        message,
        to,
        username,
        image,
        document,
        caption,
        filename,
        waitForDelivery = true,
        ...otherParams
    } = {}) {
        const url = `${this.baseUrl}whatsapp/notify`;

        // Build the payload to match the server's WhatsAppNotify schema.
        // Exactly one of self / username / phone / phones is picked based
        // on what the caller supplied, defaulting to self=true so the
        // simplest call sends to the operator.
        const payload = {
            apikey: this.apiKey
        };

        if (username) {
            payload.username = username;
        } else if (Array.isArray(to)) {
            payload.phones = to;
        } else if (typeof to === 'string' && to.trim()) {
            payload.phone = to;
        } else {
            payload.self = true;
        }

        if (message !== undefined && message !== null) {
            payload.message = message;
        }
        if (image !== undefined && image !== null) {
            payload.image_path = image;
        }
        if (document !== undefined && document !== null) {
            payload.document_path = document;
        }
        if (caption !== undefined && caption !== null) {
            payload.caption = caption;
        }
        if (filename !== undefined && filename !== null) {
            payload.filename = filename;
        }
        payload.wait_for_delivery = Boolean(waitForDelivery);

        // Forward any unrecognised params verbatim so future server-side
        // fields work without an SDK release.
        for (const [key, value] of Object.entries(otherParams)) {
            if (value !== undefined && value !== null && !(key in payload)) {
                payload[key] = value;
            }
        }

        return this._post(url, payload);
    }
}

export default WhatsAppAPI;
