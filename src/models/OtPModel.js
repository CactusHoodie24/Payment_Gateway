const db = require('../db');

const OtpModel = {

  // Save a new OTP for an email — clears any previous OTPs for that email first
  async save(email, otp, expiresAt) {
    await db.execute(
      'DELETE FROM otps WHERE email = ?',
      [email]
    );

    const [result] = await db.execute(
      'INSERT INTO otps (email, otp, expires_at) VALUES (?, ?, ?)',
      [email, otp, expiresAt]
    );
    return result.insertId;
  },

  // Find a valid (unexpired, unused) OTP by email + code
  async verify(email, otp) {
    const [rows] = await db.execute(
      `SELECT * FROM otps
       WHERE email = ?
         AND otp = ?
         AND expires_at > NOW()
         AND used = 0`,
      [email, otp]
    );
    return rows[0] || null;
  },

  // Delete OTP after use — keeps table clean
  async deleteByEmail(email) {
    await db.execute(
      'DELETE FROM otps WHERE email = ?',
      [email]
    );
  },
};

module.exports = OtpModel;