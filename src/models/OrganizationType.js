// src/models/OrganizationType.js
const { getConnection } = require('../db');

const OrganizationTypeModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM organization_types WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM organization_types WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  // Find organization type with all its linked organizations nested
  async findByIdWithOrganizations(id) {
    const db = getConnection();

    const [typeRows] = await db.query('SELECT * FROM organization_types WHERE id = ? LIMIT 1', [id]);
    if (!typeRows[0]) return null;

    const [orgRows] = await db.query(
      `SELECT
        id, name, short_code, contact_email,
        contact_phone, city, country, status,
        organization_website, created_at, last_modified_at
       FROM organizations
       WHERE organization_type_id = ?`,
      [id]
    );

    return {
      id:          typeRows[0].id,
      name:        typeRows[0].name,
      description: typeRows[0].description,
      created_at:        typeRows[0].created_at,
      last_modified_at:  typeRows[0].last_modified_at,
      organizations: orgRows
    };
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query('SELECT * FROM organization_types');
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`SELECT * FROM organization_types WHERE ${where}`, values);
    }
    return rows;
  },

  async create({ name, description }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO organization_types (name, description, created_at, last_modified_at) VALUES (?, ?, NOW(), NOW())',
      [name, description]
    );
    return this.findById(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(
      `UPDATE organization_types SET ${set}, last_modified_at = NOW() WHERE id = ?`,
      values
    );
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const type = await this.findById(id);
    await db.query('DELETE FROM organization_types WHERE id = ?', [id]);
    return type;
  }

};

module.exports = OrganizationTypeModel;