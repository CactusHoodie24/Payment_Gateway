// src/controllers/AuthController.js
const AuthService = require('../services/authService');
const auditService = require('../services/auditService');
const UserModel   = require('../models/User');
const bcrypt      = require('bcryptjs');
const jwt         = require('jsonwebtoken');
const OtpModel    = require('../models/OtpModel');
const OrganizationModel = require('../models/OrganizationModel');
const { logAudit } = require('../middleware/auditLogger');

// ── Cookie config helper ──────────────────────────────────────
function getCookieOptions(maxAge) {
  const isProduction  = process.env.NODE_ENV === 'production';
  const isNgrok       = process.env.USING_NGROK === 'true';
  const isCrossOrigin = isProduction || isNgrok;

  return {
    httpOnly: true,
    secure:   isCrossOrigin,              // true for ngrok/production
    sameSite: isCrossOrigin ? 'none' : 'lax',
    path:     '/',
    maxAge,
  };
}

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
      console.log('Sending OTP');
      const result = await AuthService.sendOtp({ email, phone, channel });
      res.status(200).json(result);
    } catch (err) {
      console.log(err);
      next(err);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const result = await AuthService.verifyOtp(req.body);
      console.log('Verifying otp');

      // Log successful admin login after OTP verification (fire-and-forget)
      if (result.data?.id && result.data?.email) {
        auditService.log({
          userId: result.data.id,
          userName: result.data.email,
          action: 'LOGIN',
          resourceType: 'admin',
          resourceId: result.data.id,
          description: `${result.data.email} logged in (admin)`,
          ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.connection?.remoteAddress || req.ip,
          userAgent: req.headers['user-agent'] || null
        });
      }

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

  // Step 1 — verify credentials and send OTP
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

      await OtpModel.create({
        channel:  'EMAIL',
        code,
        handle:   email,
        metadata: { purpose: 'user_login', user_id: user.id }
      });

      await AuthService.sendUserOtp({ email, code });

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

 // Step 2 — verify OTP and assign httpOnly cookies
  async verifyLoginOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          status:  'error',
          message: 'email and otp are required.'
        });
      }

      const otpRecord = await OtpModel.findOne({ code: otp, handle: email });

      if (!otpRecord) {
        return res.status(400).json({ status: 'error', message: 'Invalid OTP.' });
      }

      if (otpRecord.status === 'USED') {
        return res.status(409).json({ status: 'error', message: 'OTP has already been used.' });
      }

      if (otpRecord.status === 'EXPIRED') {
        return res.status(410).json({ status: 'error', message: 'OTP has expired.' });
      }

      await OtpModel.updateStatus(otpRecord.id, 'USED');

      const user = await UserModel.findOne({ email });

      // Find the organization linked to this user by matching contact_email
      const organization = await OrganizationModel.findOne({ contact_email: email });

      const payload = {
        id:              user.id,
        email:           user.email,
        role:            user.role,
        organization_id: organization ? organization.id : null
      };

      console.log('🏢 Organization found:', organization ? `${organization.name} (id: ${organization.id})` : 'NONE');

      const accessToken  = jwt.sign(payload, process.env.JWT_SECRET,        { expiresIn: '15m' });
      const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

      res.cookie('access_token',  accessToken,  getCookieOptions(15 * 60 * 1000));
      res.cookie('refresh_token', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

      console.log('🍪 Access token set for:',  user.email);
      console.log('🍪 Refresh token set for:', user.email);

      // Log successful organization user login
      logAudit(req, {
        action: 'LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        description: `${user.email} logged in (organization)`
      });

      return res.status(200).json({
        status:  'success',
        message: 'Login successful.',
        data: {
          id:              user.id,
          email:           user.email,
          role:            user.role,
          organization_id: organization ? organization.id : null,
          organization_name: o
        }
      });

    } catch (error) {
      console.error('Verify login OTP error:', error);
      return res.status(500).json({ status: 'error', message: 'Internal server error.' });
    }
  },
  // Step 3 — silently refresh access token using refresh token
  async refreshToken(req, res) {
    try {
      const token = req.cookies.refresh_token;

      console.log('🔄 Refresh token request');
      console.log('🍪 Refresh token:', token ? `${token.slice(0, 20)}...` : 'NOT PROVIDED');

      if (!token) {
        return res.status(401).json({ status: 'error', message: 'No refresh token provided.' });
      }

      const payload     = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const accessToken = jwt.sign(
        { id: payload.id, email: payload.email, role: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.cookie('access_token', accessToken, getCookieOptions(15 * 60 * 1000));

      console.log('✅ Access token refreshed for:', payload.email);

      return res.status(200).json({ status: 'success', message: 'Token refreshed successfully.' });

    } catch (err) {
      console.log('❌ Refresh token error:', err.message);
      return res.status(401).json({ status: 'error', message: 'Invalid or expired refresh token. Please log in again.' });
    }
  }

};

module.exports = AuthController;