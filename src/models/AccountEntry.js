// src/models/AccountEntry.js
const { getConnection } = require('../db');

const AccountEntryModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM account_entries WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(entry_reference) {
    const db = getConnection();
    const [rows] = await db.query(
      'SELECT * FROM account_entries WHERE entry_reference = ? LIMIT 1',
      [entry_reference]
    );
    return rows[0] || null;
  },

  async findByIdWithDetails(entry_reference) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        e.*,
        a.account_number,
        a.account_name,
        a.account_type,
        a.organization_id,
        o.name         AS organization_name,
        o.short_code   AS organization_short_code,
        o.status       AS organization_status,
        o.contact_email AS organization_contact_email,
        t.transaction_id AS txn_id,
        t.status         AS txn_status
       FROM account_entries e
       LEFT JOIN accounts     a ON e.account_id     = a.id
       LEFT JOIN organizations o ON a.organization_id = o.id
       LEFT JOIN transactions t ON e.transaction_id = t.transaction_id
       WHERE e.entry_reference = ? LIMIT 1`,
      [entry_reference]
    );

    if (!rows[0]) return null;
    const row = rows[0];

    return {
      entry_reference:  row.entry_reference,
      entry_type:       row.entry_type,
      amount:           row.amount,
      balance_before:   row.balance_before,
      balance_after:    row.balance_after,
      description:      row.description,
      created_at:       row.created_at,
      last_modified_at: row.last_modified_at,
      account: {
        id:             row.account_id,
        account_number: row.account_number,
        account_name:   row.account_name,
        account_type:   row.account_type,
        organization: row.organization_id ? {
          id:            row.organization_id,
          name:          row.organization_name,
          short_code:    row.organization_short_code,
          status:        row.organization_status,
          contact_email: row.organization_contact_email,
        } : null
      },
      transaction: row.transaction_id ? {
        id:     row.txn_id,
        status: row.txn_status,
      } : null
    };
  },

  async find(fields = {}) {
    const db = getConnection();

    const baseQuery = `
      SELECT
        e.*,
        a.account_number,
        a.account_name,
        a.account_type,
        a.organization_id,
        o.name       AS organization_name,
        o.short_code AS organization_short_code,
        o.status     AS organization_status
      FROM account_entries e
      LEFT JOIN accounts      a ON e.account_id      = a.id
      LEFT JOIN organizations o ON a.organization_id = o.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(`${baseQuery} ORDER BY e.created_at DESC`);
    } else {
      const where = keys.map(k => `e.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where} ORDER BY e.created_at DESC`, values);
    }

    return rows.map(row => ({
      entry_reference:  row.entry_reference,
      entry_type:       row.entry_type,
      amount:           row.amount,
      balance_before:   row.balance_before,
      balance_after:    row.balance_after,
      description:      row.description,
      created_at:       row.created_at,
      last_modified_at: row.last_modified_at,
      account: {
        id:             row.account_id,
        account_number: row.account_number,
        account_name:   row.account_name,
        account_type:   row.account_type,
        organization: row.organization_id ? {
          id:         row.organization_id,
          name:       row.organization_name,
          short_code: row.organization_short_code,
          status:     row.organization_status,
        } : null
      }
    }));
  },

  async create({ entry_reference, account_id, transaction_id = null, entry_type, amount, balance_before, balance_after, description = null }) {
    const db = getConnection();
    await db.query(
      `INSERT INTO account_entries
        (entry_reference, account_id, transaction_id, entry_type, amount, balance_before, balance_after, description, created_at, last_modified_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [entry_reference, account_id, transaction_id, entry_type, amount, balance_before, balance_after, description]
    );
    return this.findByIdWithDetails(entry_reference);
  },

  async findByIdAndDelete(entry_reference) {
    const db = getConnection();
    const entry = await this.findByIdWithDetails(entry_reference);
    await db.query('DELETE FROM account_entries WHERE entry_reference = ?', [entry_reference]);
    return entry;
  }

};

module.exports = AccountEntryModel;