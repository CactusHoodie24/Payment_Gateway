const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserModel  = require('../models/UserModel');
const OtpModel = require('../models/OtPModel');
const MongoUserRepository = require('../repository/userRepository')
const userRepository = new MongoUserRepository();
const usermodel = new UserModel()
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Temporarily add this right after require('dotenv').config()

// ─── Nodemailer transporter ────────────────────────────────────────────────────


const FROM = 'Malipo Gateway Malawi <onboarding@resend.dev>';

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
      phone: user.phone,
      title: user.title,
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// ─── Internal email dispatchers ────────────────────────────────────────────────
async function dispatchOtpEmail(email, otp) {
  try {
    const result = await resend.emails.send({
      from: FROM,
      to: email,
      subject: 'Your For Malipo Verification Code',
      html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
    });

  } catch (err) {
    console.error('Failed to send OTP email:', err);
  }
}


// ─── AuthService ───────────────────────────────────────────────────────────────
const AuthService = {

  // POST /api/signup
  // Creates user → frontend opens channel picker → calls sendOtp
  async signup({ name, email, phoneNumber, password, }) {

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw { status: 422, message: 'Email already in use.' };
    }

    const hashed = await bcrypt.hash(password, 12);
    await userRepository.save({ name, email, phoneNumber, password: hashed });

    return { status: 200, message: 'Account created. Please verify your account.' };
  },

  // POST /api/otp/generate
  // Controller passes { email, phone, channel } — we only need email
  async sendOtp({ email }) {
    console.log(email)
    if (!email) {
      throw { status: 404, message: 'User not found.' };
    }

    const otp       = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    console.log(otp)
    await OtpModel.save(email, otp, expiresAt)

    await dispatchOtpEmail(email, otp);

    return { status: 200, message: 'OTP sent to your email address.' };
  },

  // POST /api/otp
  // Verifies OTP, issues JWT
  async verifyOtp({ email, otp }) {
    const user = await userRepository.verify(email, otp);
    console.log(user)
    if (!user) {
      throw { status: 400, message: 'Invalid or expired OTP.' };
    }

     // Generate JWT token
  const token = jwt.sign(
    {
      id: user._id,           // or user.id if using domain object
      email: user.email,
      name: user.name,
      role: user.role,
    },
    process.env.JWT_SECRET,    // Make sure this is defined
    { expiresIn: '7d' }
  );

    return {
    status: 200,
    message: 'User is authenticated.',
    data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
  };
  },

  // POST /api/login
  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw { status: 401, message: 'Invalid email or password.' };
    }

     // ── Generate OTP ─────────────────────
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Save OTP
  await userRepository.update(email, otp);

  // Send OTP email
  await dispatchOtpEmail(email, otp);


    return {
      message: 'We have sent an otp to your email please verify.', 
      data: {
        user: user.name,
        verified: user.verified,
        phoneNumber: user.phoneNumber,
        role: user.role
      },
    };
  },

  // POST /api/reset-password
  async sendResetOtp({ email }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      return { message: 'If that email exists, a reset code has been sent.' };
    }

    const otp       = generateOtp();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await UserModel.saveOtp(user.id, otp, expiresAt);
    await dispatchPasswordResetEmail(user.email, user.name, otp);

    return { message: 'If that email exists, a reset code has been sent.' };
  },

  // POST /api/reset-password-confirm
  async resetPassword({ email, otp, password, password_confirmation }) {
    if (password !== password_confirmation) {
      throw { status: 422, message: 'Passwords do not match.' };
    }

    const user = await UserModel.verifyOtp(email, otp);
    if (!user) {
      throw { status: 400, message: 'Invalid or expired OTP.' };
    }

    const hashed = await bcrypt.hash(password, 12);
    await UserModel.updatePassword(user.id, hashed);

    return { message: 'Password reset successfully. Please log in.' };
  },
};

module.exports = AuthService;