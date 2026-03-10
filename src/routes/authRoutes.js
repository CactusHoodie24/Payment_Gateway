const express        = require('express');
const Joi = require('joi');
const router         = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware  = require('../middleware/auth');
const validateBody = require('../middleware/userValidation');

// Define your schema
const userSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10,15}$/) // Only digits, length 10-15
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be 10 to 15 digits'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

// POST /api/signup
router.post('/register-user', validateBody(userSchema), AuthController.signup);

// POST /api/login
router.post('/login-admin', validateBody(loginSchema), AuthController.login);

// POST /api/otp/generate        → send OTP via email or whatsapp (step 2)
router.post('/generate-otp', AuthController.generateOtp);

// POST /api/otp  (verify email OTP after signup)
router.post('/verify-otp', AuthController.verifyOtp);

// POST /api/reset-password  (send OTP to email)
router.post('/reset-password', AuthController.sendResetOtp);

// POST /api/reset-password-confirm  (verify OTP + set new password)
router.post('/reset-password-confirm', AuthController.resetPassword);

// GET /api/me  (get logged-in user profile)
router.get('/me', authMiddleware(['admin']), AuthController.getMe);


// GET /api/login-organization
router.post('/login-organizations', AuthController.loginUser);

router.post('/verifyUser-otp', AuthController.verifyLoginOtp)

module.exports = router;
