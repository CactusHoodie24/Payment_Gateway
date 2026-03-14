// src/models/ServiceType.js
const { getConnection } = require('../db');

const ServiceTypeModel = {

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM service_types WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findOne(fields) {
    const db    = getConnection();
    const keys  = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const [rows] = await db.query(`SELECT * FROM service_types WHERE ${where} LIMIT 1`, Object.values(fields));
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db   = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query('SELECT * FROM service_types ORDER BY name');
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      [rows] = await db.query(`SELECT * FROM service_types WHERE ${where} ORDER BY name`, Object.values(fields));
    }
    return rows;
  },

  async create({ name, description = null, status = 'ACTIVE' }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO service_types (name, description, status) VALUES (?, ?, ?)',
      [name, description, status]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query('UPDATE service_types SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db  = getConnection();
    const row = await this.findById(id);
    await db.query('DELETE FROM service_types WHERE id = ?', [id]);
    return row;
  }
};

module.exports = ServiceTypeModel;