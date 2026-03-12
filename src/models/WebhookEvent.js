// src/models/WebhookEvent.js
const { getConnection } = require('../db');

const WebhookEventModel = {

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM webhook_events WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findOne(fields) {
    const db = getConnection();
    const keys  = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const [rows] = await db.query(`SELECT * FROM webhook_events WHERE ${where} LIMIT 1`, Object.values(fields));
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db   = getConnection();
    const base = 'SELECT * FROM webhook_events';
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query(`${base} ORDER BY category, event_name`);
    } else {
      const where  = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      [rows] = await db.query(`${base} WHERE ${where} ORDER BY category, event_name`, Object.values(fields));
    }
    return rows;
  },

  async findGroupedByCategory(status = 'ACTIVE') {
    const db = getConnection();
    const [rows] = await db.query(
      'SELECT * FROM webhook_events WHERE status = ? ORDER BY category, event_name',
      [status]
    );

    // Group by category
    return rows.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {});
  },

  async create({ event_name, category, description = null, status = 'ACTIVE' }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO webhook_events (event_name, category, description, status) VALUES (?, ?, ?, ?)',
      [event_name, category, description, status]
    );
    return this.findById(result.insertId);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query('UPDATE webhook_events SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db  = getConnection();
    const row = await this.findById(id);
    await db.query('DELETE FROM webhook_events WHERE id = ?', [id]);
    return row;
  }

};

module.exports = WebhookEventModel;