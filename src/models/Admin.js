// src/models/Admin.js
const { getConnection } = require('../db');

const AdminModel = {

  // Find a single admin by any field e.g. { email: 'a@b.com' }
  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM admins WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  // Find an admin by primary key
  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM admins WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  // Find all admins with optional filters e.g. { role: 'admin', verified: 1 }
  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      const [rows] = await db.query('SELECT * FROM admins');
      return rows;
    }
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM admins WHERE ${where}`, values);
    return rows;
  },

  // Create a new admin
  async create({
    name,
    email,
    password,
    role = 'admin',
    verified = false,
    phone_number = null,
    otp = null
  }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO admins (name, email, password, role, verified, phone_number, otp, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [name, email, password, role, verified ? 1 : 0, phone_number, otp]
    );
    return this.findById(result.insertId);
  },

  // Update fields on an admin by id
  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(
      `UPDATE admins SET ${set}, updated_at = NOW() WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  // Mark admin as verified
  async verify(id) {
    const db = getConnection();
    await db.query(
      'UPDATE admins SET verified = 1, otp = NULL, updated_at = NOW() WHERE id = ?',
      [id]
    );
    return this.findById(id);
  },

  // Save or clear OTP
  async setOtp(id, otp = null) {
    const db = getConnection();
    await db.query(
      'UPDATE admins SET otp = ?, updated_at = NOW() WHERE id = ?',
      [otp, id]
    );
    return this.findById(id);
  },

  // Delete an admin by id
  async findByIdAndDelete(id) {
    const db = getConnection();
    const admin = await this.findById(id);
    await db.query('DELETE FROM admins WHERE id = ?', [id]);
    return admin;
  }

};

module.exports = AdminModel;