// src/models/Transaction.js
const { getConnection } = require('../db');

const TransactionModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM transactions WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM transactions WHERE transaction_id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        t.transaction_id,
        t.merchant_reference,
        t.payment_channel,
        t.phone_number,
        t.status,
        t.third_party_reference,
        t.transaction_amount,
        t.transaction_fee,
        t.created_at,
        t.last_modified_at,

        tt.id          AS transaction_type_id,
        tt.type_name   AS transaction_type_name,
        tt.description AS transaction_type_description,
        tt.status      AS transaction_type_status

       FROM transactions t
       LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id
       WHERE t.transaction_id = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;
    const row = rows[0];

    return {
      transaction_id:        row.transaction_id,
      merchant_reference:    row.merchant_reference,
      payment_channel:       row.payment_channel,
      phone_number:          row.phone_number,
      status:                row.status,
      third_party_reference: row.third_party_reference,
      transaction_amount:    row.transaction_amount,
      transaction_fee:       row.transaction_fee,
      created_at:            row.created_at,
      last_modified_at:      row.last_modified_at,
      transaction_type: {
        id:          row.transaction_type_id,
        name:        row.transaction_type_name,
        description: row.transaction_type_description,
        status:      row.transaction_type_status,
      }
    };
  },

  async find(fields = {}) {
    const db = getConnection();

    const baseQuery = `
      SELECT
        t.transaction_id,
        t.merchant_reference,
        t.payment_channel,
        t.phone_number,
        t.status,
        t.third_party_reference,
        t.transaction_amount,
        t.transaction_fee,
        t.created_at,
        t.last_modified_at,

        tt.id          AS transaction_type_id,
        tt.type_name   AS transaction_type_name,
        tt.description AS transaction_type_description,
        tt.status      AS transaction_type_status

      FROM transactions t
      LEFT JOIN transaction_types tt ON t.transaction_type_id = tt.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(baseQuery);
    } else {
      const where = keys.map(k => `t.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where}`, values);
    }

    return rows.map(row => ({
      transaction_id:        row.transaction_id,
      merchant_reference:    row.merchant_reference,
      payment_channel:       row.payment_channel,
      phone_number:          row.phone_number,
      status:                row.status,
      third_party_reference: row.third_party_reference,
      transaction_amount:    row.transaction_amount,
      transaction_fee:       row.transaction_fee,
      created_at:            row.created_at,
      last_modified_at:      row.last_modified_at,
      transaction_type: {
        id:          row.transaction_type_id,
        name:        row.transaction_type_name,
        description: row.transaction_type_description,
        status:      row.transaction_type_status,
      }
    }));
  },

  async create({
    transaction_id,
    merchant_reference,
    payment_channel,
    phone_number = null,
    status = 'PENDING',
    third_party_reference = null,
    transaction_amount,
    transaction_fee,
    transaction_type_id
  }) {
    const db = getConnection();
    await db.query(
      `INSERT INTO transactions (
        transaction_id, merchant_reference, payment_channel, phone_number,
        status, third_party_reference, transaction_amount, transaction_fee,
        transaction_type_id, created_at, last_modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        transaction_id, merchant_reference, payment_channel, phone_number,
        status, third_party_reference, transaction_amount, transaction_fee,
        transaction_type_id
      ]
    );
    return this.findByIdWithDetails(transaction_id);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query(
      'UPDATE transactions SET status = ?, last_modified_at = NOW() WHERE transaction_id = ?',
      [status, id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(
      `UPDATE transactions SET ${set}, last_modified_at = NOW() WHERE transaction_id = ?`,
      values
    );
    return this.findByIdWithDetails(id);
  },

};

module.exports = TransactionModel;