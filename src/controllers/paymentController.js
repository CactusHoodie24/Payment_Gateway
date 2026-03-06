// src/controllers/paymentController.js
const axios = require('axios');

const paymentController = {

async paymentInitiate(req, res) {
  try {
    console.log('💳 Payment initiation request received');
    console.log('📦 Request body:', req.body);

    const response = await axios.post(
      'http://localhost:4000/users',
      req.body,
      { headers: { 'Content-Type': 'application/json' } }
    );

    console.log('✅ Payment forwarded successfully:', response.data);

    return res.status(200).json({
      status:  'success',
      message: 'Payment initiated successfully.',
      data:    response.data
    });

  } catch (err) {
    console.error('❌ Payment initiation error:', err.message);

    if (err.response) {
      return res.status(err.response.status).json({
        status:  'error',
        message: err.response.data?.message || 'Upstream service error.'
      });
    }

    return res.status(500).json({
      status:  'error',
      message: 'Internal server error.'
    });
  }
}

}

module.exports = paymentController