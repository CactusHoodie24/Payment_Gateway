// src/middleware/validateOrganization.js
const Joi = require('joi');

const organizationSchema = Joi.object({
  name:                 Joi.string().required(),
  contactEmail:         Joi.string().email().required(),
  contactPhone:         Joi.string().pattern(/^0[0-9]{9}$/).required(),
  organizationTypeId:   Joi.number().integer().positive().required(),
  description:          Joi.string().optional().allow(null, ''),
  password:             Joi.string().min(6).required(),
  // optional fields
  organization_website: Joi.string().uri().optional().allow(null, ''),
  short_code:           Joi.string().alphanum().optional().allow(null, ''),
  address_line1:        Joi.string().optional().allow(null, ''),
  city:                 Joi.string().optional().allow(null, ''),
  country:              Joi.string().optional().allow(null, ''),
  region:               Joi.string().optional().allow(null, ''),
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