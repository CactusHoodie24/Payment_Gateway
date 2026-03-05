const AuthService = require('../services/authService');

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
};

module.exports = AuthController;
