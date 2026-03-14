// src/models/ServiceRequest.js
const { getConnection } = require('../db');

const ServiceRequestModel = {

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM service_requests WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  },

  async findByIdWithDetails(id) {
  const db = getConnection();
  const [rows] = await db.query(
    `SELECT
      sr.*,
      st.name           AS service_type_name,
      st.description    AS service_type_description,
      ai.name           AS initiator_name,
      ai.email          AS initiator_email,
      aa.name           AS approver_name,
      aa.email          AS approver_email,
      a.account_number  AS account_number,
      a.account_name    AS account_name,
      a.account_type    AS account_type
     FROM service_requests sr
     LEFT JOIN service_types st ON sr.service_type_id = st.id
     LEFT JOIN admins        ai ON sr.initiator_id    = ai.id
     LEFT JOIN admins        aa ON sr.approver_id     = aa.id
     LEFT JOIN accounts       a ON sr.account_id      = a.id
     WHERE sr.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const row = rows[0];
  return {
    id:               row.id,
    state:            row.state,
    denial_reason:    row.denial_reason,
    amount:           row.amount,
    description:      row.description,
    created_at:       row.created_at,
    approved_at:      row.approved_at,
    last_modified_at: row.last_modified_at,
    service_type: {
      id:          row.service_type_id,
      name:        row.service_type_name,
      description: row.service_type_description
    },
    account: row.account_id ? {
      id:             row.account_id,
      account_number: row.account_number,
      account_name:   row.account_name,
      account_type:   row.account_type
    } : null,
    initiator: {
      id:    row.initiator_id,
      name:  row.initiator_name,
      email: row.initiator_email
    },
    approver: row.approver_id ? {
      id:    row.approver_id,
      name:  row.approver_name,
      email: row.approver_email
    } : null
  };
},

  async find(filters = {}) {
  const db = getConnection();
  const base = `
    SELECT
      sr.*,
      st.name        AS service_type_name,
      ai.name        AS initiator_name,
      ai.email       AS initiator_email,
      aa.name        AS approver_name,
      aa.email       AS approver_email,
      a.account_number,
      a.account_name,
      a.account_type
    FROM service_requests sr
    LEFT JOIN service_types st ON sr.service_type_id = st.id
    LEFT JOIN admins        ai ON sr.initiator_id    = ai.id
    LEFT JOIN admins        aa ON sr.approver_id     = aa.id
    LEFT JOIN accounts      a  ON sr.account_id      = a.id`;

  const allowed = ['state', 'service_type_id', 'initiator_id', 'approver_id'];
  const keys    = Object.keys(filters).filter(k => allowed.includes(k));
  let rows;

  if (keys.length === 0) {
    [rows] = await db.query(`${base} ORDER BY sr.created_at DESC`);
  } else {
    const where = keys.map(k => `sr.\`${k}\` = ?`).join(' AND ');
    [rows] = await db.query(`${base} WHERE ${where} ORDER BY sr.created_at DESC`, keys.map(k => filters[k]));
  }

  return rows.map(row => ({
    id:               row.id,
    state:            row.state,
    denial_reason:    row.denial_reason,
    amount:           row.amount,
    description:      row.description,
    created_at:       row.created_at,
    approved_at:      row.approved_at,
    last_modified_at: row.last_modified_at,
    service_type: { id: row.service_type_id, name: row.service_type_name },
    account: row.account_id ? {
      id:             row.account_id,
      account_number: row.account_number,
      account_name:   row.account_name,
      account_type:   row.account_type
    } : null,
    initiator: { id: row.initiator_id, name: row.initiator_name, email: row.initiator_email },
    approver:  row.approver_id ? { id: row.approver_id, name: row.approver_name, email: row.approver_email } : null
  }));
},

async create({ service_type_id, initiator_id, account_id, amount, description }) {
  const db = getConnection();
  const [result] = await db.query(
    `INSERT INTO service_requests 
      (service_type_id, initiator_id, account_id, amount, description)
     VALUES (?, ?, ?, ?, ?)`,
    [service_type_id, initiator_id, account_id, amount, description]
  );
  return this.findByIdWithDetails(result.insertId);
},

  async approve(id, approver_id) {
    const db = getConnection();
    await db.query(
      `UPDATE service_requests SET state = 'APPROVED', approver_id = ?, approved_at = NOW(6), last_modified_at = NOW(6) WHERE id = ?`,
      [approver_id, id]
    );
    return this.findByIdWithDetails(id);
  },

  async deny(id, approver_id, denial_reason) {
    const db = getConnection();
    await db.query(
      `UPDATE service_requests SET state = 'DENIED', approver_id = ?, denial_reason = ?, last_modified_at = NOW(6) WHERE id = ?`,
      [approver_id, denial_reason, id]
    );
    return this.findByIdWithDetails(id);
  },

  async findByIdAndDelete(id) {
    const db  = getConnection();
    const row = await this.findByIdWithDetails(id);
    await db.query('DELETE FROM service_requests WHERE id = ?', [id]);
    return row;
  }
};

module.exports = ServiceRequestModel;