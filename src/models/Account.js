// src/models/Account.js
const { getConnection } = require('../db');

const AccountModel = {

  async findOne(fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const where = keys.map(k => `\`${k}\` = ?`).join(' AND ');
    const values = Object.values(fields);
    const [rows] = await db.query(`SELECT * FROM accounts WHERE ${where} LIMIT 1`, values);
    return rows[0] || null;
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM accounts WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        a.*,
        o.name         AS organization_name,
        o.short_code   AS organization_short_code,
        o.status       AS organization_status,
        o.contact_email AS organization_contact_email
       FROM accounts a
       LEFT JOIN organizations o ON a.organization_id = o.id
       WHERE a.id = ? LIMIT 1`,
      [id]
    );

    if (!rows[0]) return null;
    const row = rows[0];

    return {
      id:                  row.id,
      account_number:      row.account_number,
      account_name:        row.account_name,
      account_mnemonics:   row.account_mnemonics,
      account_type:        row.account_type,
      account_status:      row.account_status,
      available_balance:   row.available_balance,
      ledger_balance:      row.ledger_balance,
      reserved_balance:    row.reserved_balance,
      currency:            row.currency,
      daily_credit_limit:  row.daily_credit_limit,
      daily_debit_limit:   row.daily_debit_limit,
      description:         row.description,
      created_at:          row.created_at,
      last_modified_at:    row.last_modified_at,
      organization: row.organization_id ? {
        id:            row.organization_id,
        name:          row.organization_name,
        short_code:    row.organization_short_code,
        status:        row.organization_status,
        contact_email: row.organization_contact_email,
      } : null
    };
  },

  async find(fields = {}) {
    const db = getConnection();

    const baseQuery = `
      SELECT
        a.*,
        o.name       AS organization_name,
        o.short_code AS organization_short_code
      FROM accounts a
      LEFT JOIN organizations o ON a.organization_id = o.id`;

    const keys = Object.keys(fields);
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(baseQuery);
    } else {
      const where = keys.map(k => `a.\`${k}\` = ?`).join(' AND ');
      const values = Object.values(fields);
      [rows] = await db.query(`${baseQuery} WHERE ${where}`, values);
    }

    return rows.map(row => ({
      id:                 row.id,
      account_number:     row.account_number,
      account_name:       row.account_name,
      account_mnemonics:  row.account_mnemonics,
      account_type:       row.account_type,
      account_status:     row.account_status,
      available_balance:  row.available_balance,
      ledger_balance:     row.ledger_balance,
      reserved_balance:   row.reserved_balance,
      currency:           row.currency,
      daily_credit_limit: row.daily_credit_limit,
      daily_debit_limit:  row.daily_debit_limit,
      description:        row.description,
      created_at:         row.created_at,
      last_modified_at:   row.last_modified_at,
      organization: row.organization_id ? {
        id:         row.organization_id,
        name:       row.organization_name,
        short_code: row.organization_short_code,
      } : null
    }));
  },

  async create({
    account_number,
    account_name       = null,
    account_mnemonics  = null,
    account_type,
    account_status     = 'ACTIVE',
    available_balance  = 0,
    ledger_balance     = 0,
    reserved_balance   = 0,
    currency           = 'MWK',
    daily_credit_limit = 0,
    daily_debit_limit  = 0,
    description        = null,
    organization_id    = null
  }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO accounts (
        account_number, account_name, account_mnemonics, account_type,
        account_status, available_balance, ledger_balance, reserved_balance,
        currency, daily_credit_limit, daily_debit_limit, description,
        organization_id, created_at, last_modified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        account_number, account_name, account_mnemonics, account_type,
        account_status, available_balance, ledger_balance, reserved_balance,
        currency, daily_credit_limit, daily_debit_limit, description,
        organization_id
      ]
    );
    return this.findByIdWithDetails(result.insertId);
  },

  async findByIdAndUpdate(id, fields) {
    const db = getConnection();
    const keys = Object.keys(fields);
    const set = keys.map(k => `\`${k}\` = ?`).join(', ');
    const values = [...Object.values(fields), id];
    await db.query(
      `UPDATE accounts SET ${set}, last_modified_at = NOW() WHERE id = ?`,
      values
    );
    return this.findByIdWithDetails(id);
  },

  async updateStatus(id, status) {
    const db = getConnection();
    await db.query(
      'UPDATE accounts SET account_status = ?, last_modified_at = NOW() WHERE id = ?',
      [status, id]
    );
    return this.findByIdWithDetails(id);
  },

  async updateBalance(id, { available_balance, ledger_balance, reserved_balance }) {
    const db = getConnection();
    await db.query(
      `UPDATE accounts SET
        available_balance = ?,
        ledger_balance    = ?,
        reserved_balance  = ?,
        last_modified_at  = NOW()
       WHERE id = ?`,
      [available_balance, ledger_balance, reserved_balance, id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db = getConnection();
    const account = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM accounts WHERE id = ?', [id]);
    return account;
  }

};

module.exports = AccountModel;