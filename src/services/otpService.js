// src/services/otpService.js
const OtpModel = require('../models/OtpModel');

const VALID_CHANNELS = ['EMAIL', 'SMS'];
const VALID_STATUSES = ['ACTIVE', 'USED', 'EXPIRED'];

const otpService = {

  async generateOtp({ channel, handle, metadata = null }) {
    if (!channel) throw { status: 400, message: 'channel is required.' };
    if (!handle)  throw { status: 400, message: 'handle is required.' };

    if (!VALID_CHANNELS.includes(channel)) {
      throw { status: 400, message: `channel must be one of: ${VALID_CHANNELS.join(', ')}.` };
    }

    // Generate unique 6-digit code
    let code;
    let exists;
    do {
      code   = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await OtpModel.findOne({ code });
    } while (exists);

    return await OtpModel.create({ channel, code, handle, metadata });
  },

  async verifyOtp(code) {
    if (!code) throw { status: 400, message: 'code is required.' };

    const otp = await OtpModel.findOne({ code });
    if (!otp) throw { status: 404, message: 'Invalid OTP.' };

    if (otp.status === 'USED') {
      throw { status: 409, message: 'OTP has already been used.' };
    }

    if (otp.status === 'EXPIRED') {
      throw { status: 410, message: 'OTP has expired.' };
    }

    return await OtpModel.updateStatus(otp.id, 'USED');
  },

  async getOtpById(id) {
    const otp = await OtpModel.findById(id);
    if (!otp) throw { status: 404, message: 'OTP not found.' };
    return otp;
  },

  async getAllOtps(filters = {}) {
    if (filters.status && !VALID_STATUSES.includes(filters.status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }
    if (filters.channel && !VALID_CHANNELS.includes(filters.channel)) {
      throw { status: 400, message: `channel must be one of: ${VALID_CHANNELS.join(', ')}.` };
    }
    return await OtpModel.find(filters);
  },

  async updateOtpStatus(id, status) {
    const existing = await OtpModel.findById(id);
    if (!existing) throw { status: 404, message: 'OTP not found.' };

    if (!VALID_STATUSES.includes(status)) {
      throw { status: 400, message: `status must be one of: ${VALID_STATUSES.join(', ')}.` };
    }

    return await OtpModel.updateStatus(id, status);
  },

  async deleteOtp(id) {
    const existing = await OtpModel.findById(id);
    if (!existing) throw { status: 404, message: 'OTP not found.' };
    await OtpModel.findByIdAndDelete(id);
    return { message: 'OTP deleted successfully.' };
  },

  async cleanupExpired() {
    const count = await OtpModel.deleteExpired();
    return { message: `${count} expired OTP(s) deleted.` };
  }

};

module.exports = otpService;