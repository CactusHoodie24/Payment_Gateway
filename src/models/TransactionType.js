// src/models/TransactionType.js
const { getConnection } = require('../db');

const TransactionTypeModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM transaction_types WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM transaction_types WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  // Find transaction type with all its associated charge profiles nested
  async findByIdWithProfiles(id) {
    const db = getConnection();

    const [typeRows] = await db.query('SELECT * FROM transaction_types WHERE id = ? LIMIT 1', [id]);
    if (!typeRows[0]) return null;

    const [profileRows] = await db.query(
      `SELECT
        cp.id,
        cp.charge_type,
        cp.charge_value,
        ci.id          AS charge_item_id,
        ci.name        AS charge_item_name,
        ci.description AS charge_item_description,
        ot.id          AS organization_type_id,
        ot.name        AS organization_type_name
       FROM charge_profiles cp
       LEFT JOIN charge_items       ci ON cp.charge_item_id       = ci.id
       LEFT JOIN organization_types ot ON cp.organization_type_id = ot.id
       WHERE cp.transaction_type_id = ?`,
      [id]
    );

    return {
      id:          typeRows[0].id,
      type_name:   typeRows[0].type_name,
      description: typeRows[0].description,
      status:      typeRows[0].status,
      charge_profiles: profileRows.map(row => ({
        id:           row.id,
        charge_type:  row.charge_type,
        charge_value: row.charge_value,
        charge_item: {
          id:          row.charge_item_id,
          name:        row.charge_item_name,
          description: row.charge_item_description,
        },
        organization_type: row.organization_type_id ? {
          id:   row.organization_type_id,
          name: row.organization_type_name,
        } : null,
      }))
    };
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query('SELECT * FROM transaction_types');
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`SELECT * FROM transaction_types WHERE ${where}`, values);
    }
    return rows;
  },

  async create({ type_name, description = null, status = 'ACTIVE' }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO transaction_types (type_name, description, status) VALUES (?, ?, ?)',
      [type_name, description, status]
    );
    return this.findById(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(`UPDATE transaction_types SET ${set} WHERE id = ?`, values);
    return this.findById(id);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query('UPDATE transaction_types SET status = ? WHERE id = ?', [status, id]);
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const type = await this.findById(id);
    await db.query('DELETE FROM transaction_types WHERE id = ?', [id]);
    return type;
  }

};

module.exports = TransactionTypeModel;