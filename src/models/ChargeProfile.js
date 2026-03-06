// src/models/ChargeProfile.js
const { getConnection } = require('../db');

const ChargeProfileModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM charge_profiles WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM charge_profiles WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  // Find with charge_item, organization_type and transaction_type joined
  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        cp.*,
        ci.name        AS charge_item_name,
        ci.description AS charge_item_description,
        ot.name        AS organization_type_name,
        tt.type_name   AS transaction_type_name,
        tt.description AS transaction_type_description
       FROM charge_profiles cp
       LEFT JOIN charge_items       ci ON cp.charge_item_id       = ci.id
       LEFT JOIN organization_types ot ON cp.organization_type_id = ot.id
       LEFT JOIN transaction_types  tt ON cp.transaction_type_id  = tt.id
       WHERE cp.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  },

  async find(fields = {}) {
    const db = getConnection();

    const baseQuery = `
      SELECT
        cp.id,
        cp.charge_type,
        cp.charge_value,

        ci.id          AS charge_item_id,
        ci.name        AS charge_item_name,
        ci.description AS charge_item_description,

        ot.id          AS organization_type_id,
        ot.name        AS organization_type_name,
        ot.description AS organization_type_description,

        tt.id          AS transaction_type_id,
        tt.type_name   AS transaction_type_name,
        tt.description AS transaction_type_description,
        tt.status      AS transaction_type_status

      FROM charge_profiles cp
      LEFT JOIN charge_items       ci ON cp.charge_item_id       = ci.id
      LEFT JOIN organization_types ot ON cp.organization_type_id = ot.id
      LEFT JOIN transaction_types  tt ON cp.transaction_type_id  = tt.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(baseQuery);
    } else {
      const where = keys.map(k => `cp.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where}`, values);
    }

    // Shape into clean nested objects — no raw FK ids exposed at top level
    return rows.map(row => ({
      id:           row.id,
      charge_type:  row.charge_type,
      charge_value: row.charge_value,
      charge_item: {
        id:          row.charge_item_id,
        name:        row.charge_item_name,
        description: row.charge_item_description,
      },
      organization_type: row.organization_type_id ? {
        id:          row.organization_type_id,
        name:        row.organization_type_name,
        description: row.organization_type_description,
      } : null,
      transaction_type: {
        id:          row.transaction_type_id,
        name:        row.transaction_type_name,
        description: row.transaction_type_description,
        status:      row.transaction_type_status,
      }
    }));
  },


  async create({ charge_type, charge_value, charge_item_id, organization_type_id = null, transaction_type_id }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO charge_profiles (charge_type, charge_value, charge_item_id, organization_type_id, transaction_type_id)
       VALUES (?, ?, ?, ?, ?)`,
      [charge_type, charge_value, charge_item_id, organization_type_id, transaction_type_id]
    );
    return this.findByIdWithDetails(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(`UPDATE charge_profiles SET ${set} WHERE id = ?`, values);
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const profile = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM charge_profiles WHERE id = ?', [id]);
    return profile;
  }

};

module.exports = ChargeProfileModel;