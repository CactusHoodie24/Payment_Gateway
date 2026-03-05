// services/validation.service.js
const Joi = require("joi");

class ValidationService {

  validatePage(data) {
    const schema = Joi.object({
      page: Joi.string().required()
    });

    return schema.validate(data);
  }

  validateSignup(data) {
  const schema = Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().length(9).pattern(/^[0-9]+$/).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    password_confirmation: Joi.any()
      .valid(Joi.ref("password"))
      .required()
      .messages({ "any.only": "Passwords do not match" })
  });

  // Strip unknown fields like "page" from data
  return schema.validate(data, { stripUnknown: true });
}
}

module.exports = new ValidationService();