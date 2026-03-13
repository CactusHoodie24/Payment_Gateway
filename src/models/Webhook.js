// src/models/Webhook.js
const { getConnection } = require('../db');

const WebhookModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM webhooks WHERE ${where} LIMIT 1`, values);
    if (!rows[0]) return null;
    const row = rows[0];
    return { ...row, events: JSON.parse(row.events) };
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM webhooks WHERE id = ? LIMIT 1', [id]);
    if (!rows[0]) return null;
    const row = rows[0];
    return { ...row, events: JSON.parse(row.events) };
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        w.*,
        o.name          AS organization_name,
        o.short_code    AS organization_short_code,
        o.status        AS organization_status,
        o.contact_email AS organization_contact_email
       FROM webhooks w
       LEFT JOIN organizations o ON w.organization_id = o.id
       WHERE w.id = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;
    const row = rows[0];

    return {
      id:               row.id,
      url:              row.url,
      events:           JSON.parse(row.events),
      description:      row.description,
      status:           row.status,
      created_at:       row.created_at,
      last_modified_at: row.last_modified_at,
      organization: {
        id:            row.organization_id,
        name:          row.organization_name,
        short_code:    row.organization_short_code,
        status:        row.organization_status,
        contact_email: row.organization_contact_email,
      }
    };
  },

  async find(fields = {}) {
    const db = getConnection();

    const baseQuery = `
      SELECT
        w.*,
        o.name       AS organization_name,
        o.short_code AS organization_short_code
      FROM webhooks w
      LEFT JOIN organizations o ON w.organization_id = o.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(`${baseQuery} ORDER BY w.created_at DESC`);
    } else {
      const where = keys.map(k => `w.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where} ORDER BY w.created_at DESC`, values);
    }

    return rows.map(row => ({
      id:               row.id,
      url:              row.url,
      events:           JSON.parse(row.events),
      description:      row.description,
      status:           row.status,
      created_at:       row.created_at,
      last_modified_at: row.last_modified_at,
      organization: {
        id:         row.organization_id,
        name:       row.organization_name,
        short_code: row.organization_short_code,
      }
    }));
  },

 async create({ organization_id, url, callback_url, secret, events, description = null, status = 'ACTIVE' }) {
  const db = getConnection();
  const [result] = await db.query(
    `INSERT INTO webhooks (organization_id, url, callback_url, secret, events, description, status, created_at, last_modified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [organization_id, url, callback_url, secret, JSON.stringify(events), description, status]
  );
  return this.findByIdWithDetails(result.insertId);
},

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const allowedFields = ['url', 'events', 'description', 'status'];
    const keys   = Object.keys(fields).filter(k => allowedFields.includes(k));
    const values = keys.map(k => k === 'events' ? JSON.stringify(fields[k]) : fields[k]);
    const set    = keys.map(k => `\`${k}\` = ?`).join(', ');
    await db.query(`UPDATE webhooks SET ${set}, last_modified_at = NOW() WHERE id = ?`, [...values, id]);
    return this.findByIdWithDetails(id);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query('UPDATE webhooks SET status = ?, last_modified_at = NOW() WHERE id = ?', [status, id]);
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const webhook = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM webhooks WHERE id = ?', [id]);
    return webhook;
  }

};

module.exports = WebhookModel;