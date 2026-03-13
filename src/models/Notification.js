// src/models/Notification.js
const { getConnection } = require('../db');

const NotificationModel = {

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        n.*,
        a.email        AS sent_by_email,
        a.name         AS sent_by_name,
        o.name         AS organization_name,
        o.short_code   AS organization_short_code
       FROM notifications n
       LEFT JOIN admins        a ON n.sent_by         = a.id
       LEFT JOIN organizations o ON n.organization_id = o.id
       WHERE n.id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:                row.id,
      type:              row.type,
      recipient:         row.recipient,
      subject:           row.subject,
      message:           row.message,
      status:            row.status,
      provider_response: row.provider_response,
      created_at:        row.created_at,
      sent_by: row.sent_by ? {
        id:    row.sent_by,
        email: row.sent_by_email,
        name:  row.sent_by_name,
      } : null,
      organization: row.organization_id ? {
        id:         row.organization_id,
        name:       row.organization_name,
        short_code: row.organization_short_code,
      } : null
    };
  },

  async find(filters = {}, options = {}) {
    const db = getConnection();
    const { limit = 50, offset = 0 } = options;

    const baseQuery = `
      SELECT
        n.*,
        a.email      AS sent_by_email,
        a.name       AS sent_by_name,
        o.name       AS organization_name,
        o.short_code AS organization_short_code
      FROM notifications n
      LEFT JOIN admins        a ON n.sent_by         = a.id
      LEFT JOIN organizations o ON n.organization_id = o.id`;

    const allowed = ['type', 'status', 'organization_id', 'sent_by'];
    const keys    = Object.keys(filters).filter(k => allowed.includes(k));
    const values  = keys.map(k => filters[k]);

    let query = baseQuery;
    if (keys.length) {
      query += ' WHERE ' + keys.map(k => `n.\`${k}\` = ?`).join(' AND ');
    }
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';

    const [rows] = await db.query(query, [...values, limit, offset]);

    return rows.map(row => ({
      id:                row.id,
      type:              row.type,
      recipient:         row.recipient,
      subject:           row.subject,
      message:           row.message,
      status:            row.status,
      provider_response: row.provider_response,
      created_at:        row.created_at,
      sent_by: row.sent_by ? {
        id:    row.sent_by,
        email: row.sent_by_email,
        name:  row.sent_by_name,
      } : null,
      organization: row.organization_id ? {
        id:         row.organization_id,
        name:       row.organization_name,
        short_code: row.organization_short_code,
      } : null
    }));
  },

  async count(filters = {}) {
    const db      = getConnection();
    const allowed = ['type', 'status', 'organization_id', 'sent_by'];
    const keys    = Object.keys(filters).filter(k => allowed.includes(k));
    const values  = keys.map(k => filters[k]);

    let query = 'SELECT COUNT(*) AS total FROM notifications';
    if (keys.length) {
      query += ' WHERE ' + keys.map(k => `\`${k}\` = ?`).join(' AND ');
    }

    const [rows] = await db.query(query, values);
    return rows[0].total;
  },

  async create({ type, recipient, subject = null, message, status = 'PENDING', provider_response = null, sent_by = null, organization_id = null }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO notifications
        (created_at, type, recipient, subject, message, status, provider_response, sent_by, organization_id)
       VALUES (NOW(6), ?, ?, ?, ?, ?, ?, ?, ?)`,
      [type, recipient, subject, message, status, provider_response, sent_by, organization_id]
    );
    return this.findByIdWithDetails(result.insertId);
  },

  async updateStatus(id, status, provider_response = null) {
    const db = getConnection();
    await db.query(
      'UPDATE notifications SET status = ?, provider_response = ? WHERE id = ?',
      [status, provider_response, id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db           = getConnection();
    const notification = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM notifications WHERE id = ?', [id]);
    return notification;
  }

};

module.exports = NotificationModel;