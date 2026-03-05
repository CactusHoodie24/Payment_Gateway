const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host:   process.env.MAIL_HOST,
  port:   parseInt(process.env.MAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const FROM = process.env.MAIL_FROM || 'FundMe Malawi <noreply@fundmemalawi.com>';

const emailService = {
  async sendOtp(email, name, otp) {
    await transporter.sendMail({
      from:    FROM,
      to:      email,
      subject: 'Verify your FundMe Malawi account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#e63946;">FundMe Malawi</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your email verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e63946; margin: 20px 0;">${otp}</div>
          <p>This code expires in <strong>15 minutes</strong>.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `,
    });
  },

  async sendPasswordResetOtp(email, name, otp) {
    await transporter.sendMail({
      from:    FROM,
      to:      email,
      subject: 'Reset your FundMe Malawi password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#e63946;">FundMe Malawi</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Your password reset code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e63946; margin: 20px 0;">${otp}</div>
          <p>This code expires in <strong>15 minutes</strong>.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      `,
    });
  },

  async sendDonationConfirmation(email, { donorName, campaignTitle, amount }) {
    await transporter.sendMail({
      from:    FROM,
      to:      email,
      subject: `Thank you for your donation to "${campaignTitle}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
          <h2 style="color:#e63946;">FundMe Malawi</h2>
          <p>Hi <strong>${donorName}</strong>,</p>
          <p>Your donation of <strong>MWK ${Number(amount).toLocaleString()}</strong> to <strong>${campaignTitle}</strong> was received successfully.</p>
          <p>Thank you for making a difference!</p>
        </div>
      `,
    });
  },
};

module.exports = emailService;
