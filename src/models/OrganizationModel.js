// src/models/Organization.js
const { getConnection } = require('../db'); // ← fixed import

const OrganizationModel = {

  async findOne(fields) {
    const db    = getConnection();
    const keys  = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const [rows] = await db.query(`SELECT * FROM organizations WHERE ${where} LIMIT 1`, Object.values(fields));
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM organizations WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db   = getConnection();
    const keys = Object.keys(fields);
    if (keys.length === 0) {
      const [rows] = await db.query('SELECT * FROM organizations ORDER BY created_at DESC');
      return rows;
    }
    const where  = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const [rows] = await db.query(`SELECT * FROM organizations WHERE ${where} ORDER BY created_at DESC`, Object.values(fields));
    return rows;
  },

  async findWithType(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        o.*,
        ot.name        AS organization_type_name,
        ot.description AS organization_type_description
       FROM organizations o
       LEFT JOIN organization_types ot ON o.organization_type_id = ot.id
       WHERE o.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data) {
    const db = getConnection();

    // Accept both camelCase and snake_case
    const contact_email        = data.contactEmail        || data.contact_email;
    const contact_phone        = data.contactPhone        || data.contact_phone;
    const organization_type_id = data.organizationTypeId  || data.organization_type_id  || null;
    const name                 = data.name;
    const description          = data.description                                        || null;
    const short_code           = data.short_code                                         || null;
    const address_line1        = data.address_line1                                      || null;
    const address_line2        = data.address_line2                                      || null;
    const city                 = data.city                                               || null;
    const country              = data.country                                            || null;
    const region               = data.region                                             || null;
    const organization_website = data.organization_website                               || null;
    const business_registration_number = data.business_registration_number              || null;
    const tax_identification_number     = data.tax_identification_number                || null;
    const status               = data.status                                             || 'PENDING_ACTIVE';

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
    const db   = getConnection();
    const keys = Object.keys(fields);
    const set  = keys.map(k => `\`${k}\` = ?`).join(', ');
    await db.query(
      `UPDATE organizations SET ${set}, last_modified_at = NOW() WHERE id = ?`,
      [...Object.values(fields), id]
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
    const db  = getConnection();
    const org = await this.findById(id);
    await db.query('DELETE FROM organizations WHERE id = ?', [id]);
    return org;
  }

};

module.exports = OrganizationModel;