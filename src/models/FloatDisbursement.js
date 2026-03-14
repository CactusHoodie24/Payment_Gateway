// src/models/FloatDisbursement.js
const { getConnection } = require('../db');

const FloatDisbursementModel = {

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM float_disbursements WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
    const db = getConnection();
    const [rows] = await db.query(
      `SELECT
        fd.*,
        sr.state          AS request_state,
        st.name           AS service_type_name,
        af.account_number AS account_from_number,
        af.account_name   AS account_from_name,
        at2.account_number AS account_to_number,
        at2.account_name   AS account_to_name
       FROM float_disbursements fd
       LEFT JOIN service_requests sr ON fd.service_request_id = sr.id
       LEFT JOIN service_types    st ON sr.service_type_id    = st.id
       LEFT JOIN accounts         af ON fd.account_id_from    = af.id
       LEFT JOIN accounts         at2 ON fd.account_id_to     = at2.id
       WHERE fd.id = ? LIMIT 1`,
      [id]
    );
    if (!rows[0]) return null;
    const row = rows[0];
    return {
      id:           row.id,
      amount:       row.amount,
      description:  row.description,
      created_at:   row.created_at,
      completed_at: row.completed_at,
      service_request: {
        id:           row.service_request_id,
        state:        row.request_state,
        service_type: row.service_type_name
      },
      account_from: { id: row.account_id_from, number: row.account_from_number, name: row.account_from_name },
      account_to:   { id: row.account_id_to,   number: row.account_to_number,   name: row.account_to_name }
    };
  },

  async find(filters = {}) {
    const db = getConnection();
    const base = `
      SELECT
        fd.*,
        sr.state           AS request_state,
        st.name            AS service_type_name,
        af.account_number  AS account_from_number,
        af.account_name    AS account_from_name,
        at2.account_number AS account_to_number,
        at2.account_name   AS account_to_name
      FROM float_disbursements fd
      LEFT JOIN service_requests sr ON fd.service_request_id = sr.id
      LEFT JOIN service_types    st ON sr.service_type_id    = st.id
      LEFT JOIN accounts         af ON fd.account_id_from    = af.id
      LEFT JOIN accounts         at2 ON fd.account_id_to     = at2.id`;

    const allowed = ['service_request_id', 'account_id_from', 'account_id_to'];
    const keys    = Object.keys(filters).filter(k => allowed.includes(k));
    let rows;

    if (keys.length === 0) {
      [rows] = await db.query(`${base} ORDER BY fd.created_at DESC`);
    } else {
      const where = keys.map(k => `fd.\`${k}\` = ?`).join(' AND ');
      [rows] = await db.query(`${base} WHERE ${where} ORDER BY fd.created_at DESC`, keys.map(k => filters[k]));
    }

    return rows.map(row => ({
      id:           row.id,
      amount:       row.amount,
      description:  row.description,
      created_at:   row.created_at,
      completed_at: row.completed_at,
      service_request: { id: row.service_request_id, state: row.request_state, service_type: row.service_type_name },
      account_from: { id: row.account_id_from, number: row.account_from_number, name: row.account_from_name },
      account_to:   { id: row.account_id_to,   number: row.account_to_number,   name: row.account_to_name }
    }));
  },

  async create({ service_request_id, account_id_from, account_id_to, amount, description = null }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO float_disbursements (service_request_id, account_id_from, account_id_to, amount, description)
       VALUES (?, ?, ?, ?, ?)`,
      [service_request_id, account_id_from, account_id_to, amount, description]
    );
    return this.findByIdWithDetails(result.insertId);
  },

  async complete(id) {
    const db = getConnection();
    await db.query(
      'UPDATE float_disbursements SET completed_at = NOW(6), last_modified_at = NOW(6) WHERE id = ?',
      [id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db  = getConnection();
    const row = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM float_disbursements WHERE id = ?', [id]);
    return row;
  }
};

module.exports = FloatDisbursementModel;