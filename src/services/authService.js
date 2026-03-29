// src/services/authService.js
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { Resend } = require('resend');
const AdminModel = require('../models/Admin');
const OtPModel   = require('../models/OtPModel');
const UserModel = require('../models/User');

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

  async sendUserOtp({ email, code }) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw { status: 404, message: 'User not found.' };
    }

    await dispatchOtpEmail(email, code);

    return { status: 200, message: 'OTP sent to your email address.' };
  },

  // POST /api/auth/otp/verify
 async verifyOtp({ email, otp }) {
    const admin = await AdminModel.findOne({ email });
    if (!admin) {
      throw { status: 404, message: 'User not found.' };
    }

    // Find the OTP in the otps table by code and handle (email)
    const otpRecord = await OtPModel.findOne({ code: otp, handle: email });

    if (!otpRecord) {
      throw { status: 400, message: 'Invalid OTP.' };
    }

    if (otpRecord.status === 'USED') {
      throw { status: 409, message: 'OTP has already been used.' };
    }

    if (otpRecord.status === 'EXPIRED') {
      throw { status: 410, message: 'OTP has expired.' };
    }

    // Mark OTP as used
    await OtPModel.updateStatus(otpRecord.id, 'USED');

    // Mark admin as verified
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

  // Generate unique 6-digit code
  let code;
  let exists;
  do {
    code   = Math.floor(100000 + Math.random() * 900000).toString();
    exists = await OtPModel.findOne({ code });
  } while (exists);

  // Save OTP to otps table
  await OtPModel.create({
    channel:  'EMAIL',
    code,
    handle:   email,
    metadata: { purpose: 'admin_login', admin_id: admin.id }
  });

  await dispatchOtpEmail(email, code);

  return {
    status:  200,
    message: 'OTP sent to your email for verification.',
    data: {
      id:           admin.id,
      name:         admin.name,
      email:        admin.email,
      phone_number: admin.phone_number,
      role:         admin.role
    }
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
