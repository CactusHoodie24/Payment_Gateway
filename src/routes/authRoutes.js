const express        = require('express');
const router         = express.Router();
const AuthController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// POST /api/signup
router.post('/register-user', AuthController.signup);

// POST /api/login
router.post('/login', AuthController.login);

// POST /api/otp/generate        → send OTP via email or whatsapp (step 2)
router.post('/generate-otp', AuthController.generateOtp);

// POST /api/otp  (verify email OTP after signup)
router.post('/verify-otp', AuthController.verifyOtp);

// POST /api/reset-password  (send OTP to email)
router.post('/reset-password', AuthController.sendResetOtp);

// POST /api/reset-password-confirm  (verify OTP + set new password)
router.post('/reset-password-confirm', AuthController.resetPassword);

// GET /api/me  (get logged-in user profile)
router.get('/me', requireAuth, AuthController.getMe);

module.exports = router;
