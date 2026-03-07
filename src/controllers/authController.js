const AuthService = require('../services/authService');
const UserModel   = require('../models/User');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');

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

      // Find user by email
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(401).json({
          status:  'error',
          message: 'Invalid email or password.'
        });
      }

      // Check if user is activated
      if (!user.is_activated) {
        return res.status(403).json({
          status:  'error',
          message: 'Account not activated. Please set your password first.',
          data: {
            id:    user.id,
            email: user.email
          }
        });
      }

      // Compare password against bcrypt hash
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({
          status:  'error',
          message: 'Invalid email or password.'
        });
      }

      // Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        status:  'success',
        message: 'Login successful.',
        data: {
          id:    user.id,
          email: user.email,
        },
        token
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        status:  'error',
        message: 'Internal server error.'
      });
    }
  }
};

module.exports = AuthController;
