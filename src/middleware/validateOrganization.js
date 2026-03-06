// src/middleware/validateOrganization.js
const Joi = require('joi');

const organizationSchema = Joi.object({
  name: Joi.string().min(2).max(255).required().messages({
    'string.empty': 'name is required.',
    'string.min':   'name must be at least 2 characters.',
    'any.required': 'name is required.'
  }),

  short_code: Joi.string().alphanum().min(2).max(20).required().messages({
    'string.empty':    'short_code is required.',
    'string.alphanum': 'short_code must contain only letters and numbers.',
    'string.min':      'short_code must be at least 2 characters.',
    'string.max':      'short_code must not exceed 20 characters.',
    'any.required':    'short_code is required.'
  }),

  description: Joi.string().min(5).max(255).required().messages({
    'string.empty': 'description is required.',
    'string.min':   'description must be at least 5 characters.',
    'any.required': 'description is required.'
  }),

  contact_email: Joi.string().email().required().messages({
    'string.empty': 'contact_email is required.',
    'string.email': 'contact_email must be a valid email address.',
    'any.required': 'contact_email is required.'
  }),

  contact_phone: Joi.string()
    .pattern(/^\+?[0-9]{7,15}$/)
    .required()
    .messages({
      'string.empty':        'contact_phone is required.',
      'string.pattern.base': 'contact_phone must be a valid phone number (e.g. +265881234567).',
      'any.required':        'contact_phone is required.'
    }),

  organization_website: Joi.string().uri().optional().allow('', null).messages({
    'string.uri': 'organization_website must be a valid URL (e.g. https://example.com).'
  }),

  business_registration_number: Joi.string().max(100).optional().allow('', null),
  tax_identification_number:    Joi.string().max(100).optional().allow('', null),
  address_line1: Joi.string().max(255).optional().allow('', null),
  address_line2: Joi.string().max(255).optional().allow('', null),
  city:          Joi.string().max(100).optional().allow('', null),
  region:        Joi.string().max(100).optional().allow('', null),
  country:       Joi.string().max(100).optional().allow('', null),

  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'SUSPENDED', 'DORMANT', 'DELETED', 'PENDING_ACTIVE')
    .optional()
    .messages({
      'any.only': 'status must be one of: ACTIVE, INACTIVE, SUSPENDED, DORMANT, DELETED, PENDING_ACTIVE.'
    }),

  organization_type_id: Joi.number().integer().positive().required().messages({
    'number.base':     'organization_type_id must be a number.',
    'number.integer':  'organization_type_id must be an integer.',
    'number.positive': 'organization_type_id must be a positive number.',
    'any.required':    'organization_type_id is required.'
  })
});

function validateOrganization(req, res, next) {
  console.log('🔍 validateOrganization middleware hit');
  console.log('📦 Request body:', req.body);

  const { error } = organizationSchema.validate(req.body, { abortEarly: false });

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

module.exports = validateOrganization;