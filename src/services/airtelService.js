const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const BASE_URL      = process.env.AIRTEL_BASE_URL;
const CLIENT_ID     = process.env.AIRTEL_CLIENT_ID;
const CLIENT_SECRET = process.env.AIRTEL_CLIENT_SECRET;
const COUNTRY       = process.env.AIRTEL_COUNTRY   || 'MW';
const CURRENCY      = process.env.AIRTEL_CURRENCY  || 'MWK';
const CALLBACK_URL  = process.env.AIRTEL_CALLBACK_URL;

let cachedToken = null;
let tokenExpiry  = null;

async function getAccessToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const response = await axios.post(`${BASE_URL}/auth/oauth2/token`, {
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type:    'client_credentials',
  });

  cachedToken = response.data.access_token;
  tokenExpiry  = Date.now() + (response.data.expires_in - 60) * 1000;
  return cachedToken;
}

const AirtelService = {
  async initiatePayment({ phone, amount, reference, campaignTitle }) {
    const token = await getAccessToken();

    // Normalize phone: strip leading 0 or +265, ensure 9 digits
    const normalizedPhone = phone.replace(/^(\+265|0)/, '');

    const transactionRef = reference || uuidv4();

    const payload = {
      reference: campaignTitle || 'FundMe Donation',
      subscriber: {
        country:  COUNTRY,
        currency: CURRENCY,
        msisdn:   normalizedPhone,
      },
      transaction: {
        amount:    amount,
        country:   COUNTRY,
        currency:  CURRENCY,
        id:        transactionRef,
      },
    };

    const response = await axios.post(
      `${BASE_URL}/merchant/v2/payments/`,
      payload,
      {
        headers: {
          Authorization:  `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Country':    COUNTRY,
          'X-Currency':   CURRENCY,
        },
      }
    );

    return {
      transaction_ref: transactionRef,
      status:          response.data.data?.transaction?.status || 'pending',
      raw:             response.data,
    };
  },

  // Called when Airtel POSTs to your callback URL
  parseCallback(body) {
    const transaction = body?.transaction || {};
    return {
      transaction_ref: transaction.id,
      status:          transaction.status_code === 'TS' ? 'success' : 'failed',
      amount:          transaction.amount,
      phone:           transaction.msisdn,
      message:         transaction.message,
    };
  },

  async checkStatus(transactionRef) {
    const token = await getAccessToken();
    const response = await axios.get(
      `${BASE_URL}/standard/v1/payments/${transactionRef}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Country':   COUNTRY,
          'X-Currency':  CURRENCY,
        },
      }
    );
    return response.data;
  },
};

module.exports = AirtelService;
