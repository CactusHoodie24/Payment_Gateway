const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const BASE_URL      = process.env.TNM_BASE_URL;
const API_KEY       = process.env.TNM_API_KEY;
const MERCHANT_CODE = process.env.TNM_MERCHANT_CODE;
const CALLBACK_URL  = process.env.TNM_CALLBACK_URL;

const TnmService = {
  async initiatePayment({ phone, amount, reference, campaignTitle }) {
    // Normalize phone: strip leading 0 → 265XXXXXXXXX
    const normalizedPhone = phone.startsWith('0')
      ? `265${phone.substring(1)}`
      : phone.replace('+', '');

    const transactionRef = reference || uuidv4();

    const payload = {
      msisdn:        normalizedPhone,
      amount:        String(amount),
      transaction_id: transactionRef,
      merchant_code: MERCHANT_CODE,
      narration:     campaignTitle || 'FundMe Donation',
      callback_url:  CALLBACK_URL,
    };

    const response = await axios.post(
      `${BASE_URL}/collections/request`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'api-key':      API_KEY,
        },
      }
    );

    return {
      transaction_ref: transactionRef,
      status:          'pending',
      raw:             response.data,
    };
  },

  // Called when TNM POSTs to your callback URL
  parseCallback(body) {
    // Adjust field names to match TNM's actual callback payload
    return {
      transaction_ref: body.transaction_id || body.transactionId,
      status:          body.status === 'SUCCESS' ? 'success' : 'failed',
      amount:          body.amount,
      phone:           body.msisdn,
      message:         body.message,
    };
  },

  async checkStatus(transactionRef) {
    const response = await axios.get(
      `${BASE_URL}/collections/status/${transactionRef}`,
      {
        headers: { 'api-key': API_KEY },
      }
    );
    return response.data;
  },
};

module.exports = TnmService;
