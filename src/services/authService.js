// src/services/authService.js
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { Resend } = require('resend');
const AdminModel = require('../models/Admin');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = 'Malipo Gateway Malawi <onboarding@resend.dev>';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken(user) {
  return jwt.sign(
    {
      id:    user.id,
      name:  user.name,
      email: user.email,
      phone: user.phone_number,
      role:  user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Email dispatchers ─────────────────────────────────────────────────────────
async function dispatchOtpEmail(email, otp) {
  try {
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: 'Your Malipo Verification Code',
      html:    `<p>Your OTP is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    });
  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
}

async function dispatchPasswordResetEmail(email, name, otp) {
  try {
    await resend.emails.send({
      from:    FROM,
      to:      email,
      subject: 'Your Malipo Password Reset Code',
      html:    `<p>Hi ${name},</p><p>Your password reset OTP is: <strong>${otp}</strong>. It expires in 15 minutes.</p>`,
    });
  } catch (err) {
    console.error('Failed to send password reset email:', err);
  }
}

// ─── AuthService ───────────────────────────────────────────────────────────────
const AuthService = {

  // POST /api/auth/signup
  async signup({ name, email, phone_number, password }) {
    const existing = await AdminModel.findOne({ email });
    if (existing) {
      throw { status: 422, message: 'Email already in use.' };
    }

    const hashed = await bcrypt.hash(password, 12);
    await AdminModel.create({ name, email, password: hashed, phone_number });

    return { status: 200, message: 'Account created. Please verify your account.' };
  },

  // POST /api/auth/otp/generate
  async sendOtp({ email }) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw { status: 404, message: 'User not found.' };
    }

    const otp = generateOtp();
    console.log('Generated OTP:', otp);

    // Store OTP on the admin record
    await AdminModel.setOtp(admin.id, otp);
    await dispatchOtpEmail(email, otp);

    return { status: 200, message: 'OTP sent to your email address.' };
  },

  // POST /api/auth/otp/verify
  async verifyOtp({ email, otp }) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw { status: 404, message: 'User not found.' };
    }

    if (!admin.otp || admin.otp !== otp) {
      throw { status: 400, message: 'Invalid or expired OTP.' };
    }

    // Mark verified and clear OTP
    const verified = await AdminModel.verify(admin.id);

    const token = generateToken(verified);

    return {
      status:  200,
      message: 'User is authenticated.',
      data: {
        id:    verified.id,
        name:  verified.name,
        email: verified.email,
        role:  verified.role,
      },
      token,
    };
  },

  // POST /api/auth/login
  async login({ email, password }) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    // Verified — issue token immediately
    if (admin.verified) {
      const token = generateToken(admin);
      return {
        status:  200,
        message: 'Login successful.',
        data: {
          id:           admin.id,
          name:         admin.name,
          email:        admin.email,
          phone_number: admin.phone_number,
          role:         admin.role,
          verified:     !!admin.verified,
        },
        token,
      };
    }

    // Not verified — send OTP and prompt verification
    const otp = generateOtp();
    await AdminModel.setOtp(admin.id, otp);
    await dispatchOtpEmail(email, otp);

    return {
      status:  200,
      message: 'We have sent an OTP to your email. Please verify.',
      data: {
        id:           admin.id,
        name:         admin.name,
        email:        admin.email,
        phone_number: admin.phone_number,
        role:         admin.role,
        verified:     false,
      },
    };
  },

  // POST /api/auth/reset-password
  async sendResetOtp({ email }) {
    const admin = await AdminModel.findOne({ email });
    // Always return the same message to avoid user enumeration
    if (!admin) {
      return { message: 'If that email exists, a reset code has been sent.' };
    }

    const otp = generateOtp();
    await AdminModel.setOtp(admin.id, otp);
    await dispatchPasswordResetEmail(admin.email, admin.name, otp);

    return { message: 'If that email exists, a reset code has been sent.' };
  },

  // POST /api/auth/reset-password/confirm
  async resetPassword({ email, otp, password, password_confirmation }) {
    if (password !== password_confirmation) {
      throw { status: 422, message: 'Passwords do not match.' };
    }

    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw { status: 400, message: 'Invalid or expired OTP.' };
    }

    if (!admin.otp || admin.otp !== otp) {
      throw { status: 400, message: 'Invalid or expired OTP.' };
    }

    const hashed = await bcrypt.hash(password, 12);

    // Update password and clear OTP
    await AdminModel.findByIdAndUpdate(admin.id, { password: hashed, otp: null });

    return { message: 'Password reset successfully. Please log in.' };
  },

};

module.exports = AuthService;