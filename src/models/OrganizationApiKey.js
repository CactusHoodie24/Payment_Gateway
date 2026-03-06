// src/models/OrganizationApiKey.js
const { getConnection } = require('../db');

const OrganizationApiKeyModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM organization_api_keys WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM organization_api_keys WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        k.id,
        k.status,
        k.created_at,
        k.last_modified_at,
        o.id           AS organization_id,
        o.name         AS organization_name,
        o.short_code   AS organization_short_code,
        o.status       AS organization_status,
        o.contact_email AS organization_contact_email
       FROM organization_api_keys k
       LEFT JOIN organizations o ON k.organization_id = o.id
       WHERE k.id = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;
    const row = rows[0];

    // NOTE: api_key_hash is intentionally excluded from responses for security
    return {
      id:               row.id,
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
        k.id,
        k.status,
        k.created_at,
        k.last_modified_at,
        o.id         AS organization_id,
        o.name       AS organization_name,
        o.short_code AS organization_short_code
      FROM organization_api_keys k
      LEFT JOIN organizations o ON k.organization_id = o.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(baseQuery);
    } else {
      const where = keys.map(k => `k.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where}`, values);
    }

    return rows.map(row => ({
      id:               row.id,
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

  async create({ api_key_hash, organization_id, status = 'ACTIVE' }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO organization_api_keys (api_key_hash, organization_id, status, created_at, last_modified_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [api_key_hash, organization_id, status]
    );
    return this.findByIdWithDetails(result.insertId);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query(
      'UPDATE organization_api_keys SET status = ?, last_modified_at = NOW() WHERE id = ?',
      [status, id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const key = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM organization_api_keys WHERE id = ?', [id]);
    return key;
  }

};

module.exports = OrganizationApiKeyModel;