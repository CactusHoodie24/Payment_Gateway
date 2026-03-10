// src/middleware/validateActivation.js
const Joi = require('joi');

const activationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.empty': 'email is required.',
    'string.email': 'email must be a valid email address.',
    'any.required': 'email is required.'
  }),

  temp_password: Joi.string().required().messages({
    'string.empty': 'temp_password is required.',
    'any.required': 'temp_password is required.'
  }),

  password: Joi.string().min(6).max(255).required().messages({
    'string.empty': 'password is required.',
    'string.min':   'password must be at least 6 characters.',
    'string.max':   'password must not exceed 255 characters.',
    'any.required': 'password is required.'
  }),

  password_confirmation: Joi.string().valid(Joi.ref('password')).required().messages({
    'string.empty': 'password_confirmation is required.',
    'any.only':     'Passwords do not match.',
    'any.required': 'password_confirmation is required.'
  })
});

function validateActivation(req, res, next) {
  console.log('🔍 validateActivation middleware hit');
 // console.log('📦 Request body:', { ...req.body, temp_password: '***', password: '***', password_confirmation: '***' });
console.log('📦 Request body:', req.body);

  const { error } = activationSchema.validate(req.body, { abortEarly: false });

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

module.exports = validateActivation;