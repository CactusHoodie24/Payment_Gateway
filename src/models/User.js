// src/models/User.js
const { getConnection } = require('../db');

const UserModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM users WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query(
        'SELECT id, email, is_activated, created_at, updated_at FROM users'
      );
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(
        `SELECT id, email, is_activated, created_at, updated_at FROM users WHERE ${where}`,
        values
      );
    }
    return rows;
  },

  async create({ email, password, temp_password = null }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO users (email, password, temp_password) VALUES (?, ?, ?)',
      [email, password, temp_password]
    );
    return this.findById(result.insertId);
  },

  async activate(id, hashedPassword) {
    const db = getConnection();
    await db.query(
      `UPDATE users SET
        password      = ?,
        temp_password = NULL,
        is_activated  = 1,
        updated_at    = NOW()
       WHERE id = ?`,
      [hashedPassword, id]
    );
    return this.findById(id);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(`UPDATE users SET ${set}, updated_at = NOW() WHERE id = ?`, values);
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const user = await this.findById(id);
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    return user;
  }

};

module.exports = UserModel;