// controllers/validation.controller.js
const validationService = require("../services/validationservice.js");

class ValidationController {

  async index(req, res) {
  try {
    // Destructure page first
    const { page } = req.body;

    // Validate page only
    const { error: pageError } = validationService.validatePage({ page });

    if (pageError) {
      console.log("❌ Page validation failed");
      console.log("Request body:", req.body);
      console.log("Validation error details:", pageError.details);

      return res.status(422).json({
        error: pageError.details[0].message
      });
    }

    switch (page) {
      case "signup":
        return this.validateSignup(req, res);

      default:
        return res.status(400).json({
          error: "Invalid page specified"
        });
    }

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Server error",
      details: err.message
    });
  }
}

  async validateSignup(req, res) {
    const { page, name, email, phone, password, password_confirmation } = req.body;

// Remove spaces
const sanitizedData = {
  page,
  name,
  email,
  phone: phone.trim(),
  password,
  password_confirmation
};
    const { error, value } = validationService.validateSignup(sanitizedData);

    if (error) {
        console.log("❌ Signup validation failed");
    console.log("Request body:", req.body);
    console.log("Validation error details:", error.details);
      return res.status(422).json({
        error: error.details[0].message
      });
    }

    // Here you would normally check database uniqueness
    // Example: check if email exists

    return res.status(200).json({
      message: "Signup data is valid",
      data: value
    });
  }
}

module.exports = new ValidationController();