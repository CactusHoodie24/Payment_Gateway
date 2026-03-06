// src/models/Organization.js
const { getConnection } = require('../db');

const OrganizationModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM organizations WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM organizations WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      const [rows] = await db.query('SELECT * FROM organizations');
      return rows;
    }
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM organizations WHERE ${where}`, values);
    return rows;
  },

  async findWithType(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT o.*, ot.name AS organization_type_name, ot.description AS organization_type_description
       FROM organizations o
       LEFT JOIN organization_types ot ON o.organization_type_id = ot.id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create({
    address_line1 = null,
    address_line2 = null,
    business_registration_number = null,
    city = null,
    contact_email,
    contact_phone,
    country = null,
    description,
    name,
    organization_website = null,
    region = null,
    short_code,
    status = 'PENDING_ACTIVE',
    tax_identification_number = null,
    organization_type_id = null
  }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO organizations (
        address_line1, address_line2, business_registration_number, city,
        contact_email, contact_phone, country, description, name,
        organization_website, region, short_code, status,
        tax_identification_number, organization_type_id,
        created_at, last_modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        address_line1, address_line2, business_registration_number, city,
        contact_email, contact_phone, country, description, name,
        organization_website, region, short_code, status,
        tax_identification_number, organization_type_id
      ]
    );
    return this.findById(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(
      `UPDATE organizations SET ${set}, last_modified_at = NOW() WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query(
      'UPDATE organizations SET status = ?, last_modified_at = NOW() WHERE id = ?',
      [status, id]
    );
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const org = await this.findById(id);
    await db.query('DELETE FROM organizations WHERE id = ?', [id]);
    return org;
  }

};

module.exports = OrganizationModel;