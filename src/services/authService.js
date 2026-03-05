const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const UserModel  = require('../models/UserModel');
const OtpModel = require('../models/OtPModel');
const MongoUserRepository = require('../repository/userRepository')
const userRepository = new MongoUserRepository();
const usermodel = new UserModel()

// Temporarily add this right after require('dotenv').config()
console.log({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASSWORD ? '✅ set' : '❌ MISSING',
});

// ─── Nodemailer transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_SERVER_HOST,
  port:   parseInt(process.env.EMAIL_SERVER_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const FROM = process.env.EMAIL_FROM || 'FundMe Malawi <noreply@fundmemalawi.com>';

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
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Your FundMe Malawi Verification Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <div style="background:#e63946;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">FundMe Malawi</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 12px;">Hi <strong>${email}</strong>,</p>
          <p style="margin:0 0 24px;color:#444;">
            Use the verification code below to complete your account setup.
            It expires in <strong>15 minutes</strong>.
          </p>
          <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#e63946;">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">
            If you didn't create a FundMe Malawi account, you can safely ignore this email.
          </p>
        </div>
      </div>
    `,
  });
}

async function dispatchPasswordResetEmail(email, otp) {
  await transporter.sendMail({
    from:    FROM,
    to:      email,
    subject: 'Reset Your FundMe Malawi Password',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #eee;border-radius:8px;overflow:hidden;">
        <div style="background:#e63946;padding:24px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:22px;">FundMe Malawi</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 12px;">Hi <strong>${email}</strong>,</p>
          <p style="margin:0 0 24px;color:#444;">
            Use the code below to reset your password. It expires in <strong>15 minutes</strong>.
          </p>
          <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin-bottom:24px;">
            <span style="font-size:42px;font-weight:bold;letter-spacing:12px;color:#e63946;">${otp}</span>
          </div>
          <p style="color:#888;font-size:13px;margin:0;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
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