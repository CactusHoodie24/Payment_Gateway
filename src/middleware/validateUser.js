const Joi = require('joi');

const userSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

function validateUser(req, res, next) {
      console.log("Validation middleware hit");
  console.log(req.body);
  const { error } = userSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      status: "error",
      message: error.details[0].message
    });
  }

  next();
}

module.exports = validateUser;