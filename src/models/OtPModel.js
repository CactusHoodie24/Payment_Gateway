// src/models/Otp.js
const { getConnection } = require('../db');

const OtpModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM otps WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM otps WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query('SELECT * FROM otps ORDER BY created_at DESC');
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`SELECT * FROM otps WHERE ${where} ORDER BY created_at DESC`, values);
    }
    return rows;
  },

  async create({ channel, code, handle, metadata = null }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO otps (channel, code, handle, metadata, status, created_at, last_modified_at)
       VALUES (?, ?, ?, ?, 'ACTIVE', NOW(), NOW())`,
      [channel, code, handle, metadata ? JSON.stringify(metadata) : null]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query(
      'UPDATE otps SET status = ?, last_modified_at = NOW() WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const otp = await this.findById(id);
    await db.query('DELETE FROM otps WHERE id = ?', [id]);
    return otp;
  },

  async deleteExpired() {
    const db = getConnection();
    const [result] = await db.query(
      "DELETE FROM otps WHERE status = 'EXPIRED'"
    );
    return result.affectedRows;
  }

};

module.exports = OtpModel;