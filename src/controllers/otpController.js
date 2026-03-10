// src/controllers/otpController.js
const otpService = require('../services/otpService');

const otpController = {

  async generate(req, res) {
    try {
      const otp = await otpService.generateOtp(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'OTP generated successfully.',
        data:    otp
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async verify(req, res) {
    try {
      const { code } = req.body;
      const otp = await otpService.verifyOtp(code);
      return res.status(200).json({
        status:  'success',
        message: 'OTP verified successfully.',
        data:    otp
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getById(req, res) {
    try {
      const otp = await otpService.getOtpById(req.params.id);
      return res.status(200).json({ status: 'success', data: otp });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.status)  filters.status  = req.query.status;
      if (req.query.channel) filters.channel = req.query.channel;
      if (req.query.handle)  filters.handle  = req.query.handle;

      const otps = await otpService.getAllOtps(filters);
      return res.status(200).json({
        status: 'success',
        count:  otps.length,
        data:   otps
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const otp = await otpService.updateOtpStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'OTP status updated successfully.',
        data:    otp
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async remove(req, res) {
    try {
      const result = await otpService.deleteOtp(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async cleanup(req, res) {
    try {
      const result = await otpService.cleanupExpired();
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = otpController;