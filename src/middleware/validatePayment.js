// src/middleware/validatePayment.js
const Joi = require('joi');

const paymentSchema = Joi.object({
  amount: Joi.number().integer().positive().required().messages({
    'number.base':     'amount must be a number.',
    'number.integer':  'amount must be a whole number.',
    'number.positive': 'amount must be greater than 0.',
    'any.required':    'amount is required.'
  }),

  phone_number: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      'string.empty':        'phone_number is required.',
      'string.pattern.base': 'phone_number must be a valid phone number (e.g. +265881234567).',
      'any.required':        'phone_number is required.'
    }),

  payment_channel: Joi.string()
    .valid('AIRTEL', 'TNM')
    .required()
    .messages({
      'string.empty': 'payment_channel is required.',
      'any.only':     'payment_channel must be either AIRTEL or TNM.',
      'any.required': 'payment_channel is required.'
    }),

  merchant_reference: Joi.string().max(255).required().messages({
    'string.empty': 'merchant_reference is required.',
    'string.max':   'merchant_reference must not exceed 255 characters.',
    'any.required': 'merchant_reference is required.'
  }),

  transaction_type_id: Joi.number().integer().positive().required().messages({
    'number.base':     'transaction_type_id must be a number.',
    'number.integer':  'transaction_type_id must be an integer.',
    'number.positive': 'transaction_type_id must be a positive number.',
    'any.required':    'transaction_type_id is required.'
  })
});

function validatePayment(req, res, next) {
  console.log('🔍 validatePayment middleware hit');
  console.log('📦 Request body:', req.body);

  const { error } = paymentSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const messages = error.details.map(d => d.message);
    console.log('❌ Validation failed:', messages);
    return res.status(400).json({
      status:  'error',
      message: 'Validation failed.',
      errors:  messages
    });
  }

  console.log('✅ Validation passed — forwarding to controller');
  next();
}

module.exports = validatePayment;