// src/models/ChargeItem.js
const { getConnection } = require('../db');

const ChargeItemModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM charge_items WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM charge_items WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  // Find charge item with all its associated charge profiles
  async findByIdWithProfiles(id) {
    const db = getConnection();

    const [itemRows] = await db.query('SELECT * FROM charge_items WHERE id = ? LIMIT 1', [id]);
    if (!itemRows[0]) return null;

    const [profileRows] = await db.query(
      `SELECT
        cp.id,
        cp.charge_type,
        cp.charge_value,
        ot.id   AS organization_type_id,
        ot.name AS organization_type_name,
        tt.id          AS transaction_type_id,
        tt.type_name   AS transaction_type_name,
        tt.description AS transaction_type_description,
        tt.status      AS transaction_type_status
       FROM charge_profiles cp
       LEFT JOIN organization_types ot ON cp.organization_type_id = ot.id
       LEFT JOIN transaction_types  tt ON cp.transaction_type_id  = tt.id
       WHERE cp.charge_item_id = ?`,
      [id]
    );

    return {
      id:          itemRows[0].id,
      name:        itemRows[0].name,
      description: itemRows[0].description,
      charge_profiles: profileRows.map(row => ({
        id:           row.id,
        charge_type:  row.charge_type,
        charge_value: row.charge_value,
        organization_type: row.organization_type_id ? {
          id:   row.organization_type_id,
          name: row.organization_type_name,
        } : null,
        transaction_type: {
          id:          row.transaction_type_id,
          name:        row.transaction_type_name,
          description: row.transaction_type_description,
          status:      row.transaction_type_status,
        }
      }))
    };
  },

  async find(fields = {}) {
    const db = getConnection();
    const keys = Object.keys(fields);
    let rows;
    if (keys.length === 0) {
      [rows] = await db.query('SELECT * FROM charge_items');
    } else {
      const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`SELECT * FROM charge_items WHERE ${where}`, values);
    }
    return rows;
  },

  async create({ name, description = null }) {
    const db = getConnection();
    const [result] = await db.query(
      'INSERT INTO charge_items (name, description) VALUES (?, ?)',
      [name, description]
    );
    return this.findById(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(`UPDATE charge_items SET ${set} WHERE id = ?`, values);
    return this.findById(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const item = await this.findById(id);
    await db.query('DELETE FROM charge_items WHERE id = ?', [id]);
    return item;
  }

};

module.exports = ChargeItemModel;