const AuthService = require('../services/authService');
const UserModel   = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const OtpModel = require('../models/OtpModel');

const AuthController = {
  async signup(req, res, next) {
    try {
      const result = await AuthService.signup(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

    async generateOtp(req, res, next) {
    try {
      const { email, phone, channel } = req.body;
      console.log('Sending OTP')
      const result = await AuthService.sendOtp({ email, phone, channel });
      res.status(200).json(result);
    } catch (err) {
      console.log(err)
      next(err);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const result = await AuthService.verifyOtp(req.body);
      console.log('Verifying otp')
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async login(req, res, next) {
    try {
      const result = await AuthService.login(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async sendResetOtp(req, res, next) {
    try {
      const result = await AuthService.sendResetOtp(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const result = await AuthService.resetPassword(req.body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res) {
    res.status(200).json({ data: req.user });
  },

  async loginUser(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          status:  'error',
          message: 'email and password are required.'
        });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status:  'error',
          message: 'Invalid email or password.'
        });
      }

      if (!user.is_activated) {
        return res.status(403).json({
          status:  'error',
          message: 'Account not activated. Please set your password first.',
          data: { id: user.id, email: user.email }
        });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({
          status:  'error',
          message: 'Invalid email or password.'
        });
      }

      // Generate unique 6-digit OTP
      let code;
      let exists;
      do {
        code   = Math.floor(100000 + Math.random() * 900000).toString();
        exists = await OtpModel.findOne({ code });
      } while (exists);

      // Save OTP to otps table
      await OtpModel.create({
        channel:  'EMAIL',
        code,
        handle:   email,
        metadata: { purpose: 'user_login', user_id: user.id }
      });

      // Send OTP to user's email
      await AuthService.sendUserOtp({ email, channel: 'EMAIL', code });

      return res.status(200).json({
        status:  'success',
        message: 'OTP sent to your email. Please verify to complete login.',
        data: { email: user.email }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        status:  'error',
        message: 'Internal server error.'
      });
    }
  },
// Step 2 — verify OTP and assign httpOnly cookie
  async verifyLoginOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          status:  'error',
          message: 'email and code are required.'
        });
      }

      const code = otp

      // Find OTP by code and handle (email)
      const otpRecord = await OtpModel.findOne({ code, handle: email });
 

      if (!otpRecord) {
        return res.status(400).json({
          status:  'error',
          message: 'Invalid OTP.'
        });
      }

      if (otpRecord.status === 'USED') {
        return res.status(409).json({
          status:  'error',
          message: 'OTP has already been used.'
        });
      }

      if (otpRecord.status === 'EXPIRED') {
        return res.status(410).json({
          status:  'error',
          message: 'OTP has expired.'
        });
      }

      // Mark OTP as used
      await OtpModel.updateStatus(otpRecord.id, 'USED');

      // Fetch user
      const user = await UserModel.findOne({ email });
 

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // ✅ Now assign httpOnly cookie after OTP is verified
      res.cookie('access_token', token, {
        httpOnly: true,
        secure:   process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:   7 * 24 * 60 * 60 * 1000  // 7 days
      });

      return res.status(200).json({
        status:  'success',
        message: 'Login successful.',
        data: {
          id:    user.id,
          email: user.email,
          role:  user.role
        }
      });

    } catch (error) {
      console.error('Verify login OTP error:', error);
      return res.status(500).json({
        status:  'error',
        message: 'Internal server error.'
      });
    }
  }

}

module.exports = AuthController;
