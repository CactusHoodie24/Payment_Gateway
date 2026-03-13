// src/models/AuditLog.js
const { getConnection } = require('../db');

const AuditLogModel = {

  async create({
    user_id,
    user_name = null,
    action,
    resource_type,
    resource_id = null,
    description = null,
    previous_value = null,
    new_value = null,
    ip_address = null,
    user_agent = null
  }) {
    const db = getConnection();
    const [result] = await db.query(
      `INSERT INTO audit_logs (
        timestamp, user_id, user_name, action, resource_type, resource_id,
        description, previous_value, new_value, ip_address, user_agent
      ) VALUES (NOW(6), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id,
        user_name,
        action,
        resource_type,
        resource_id,
        description,
        previous_value ? JSON.stringify(previous_value) : null,
        new_value ? JSON.stringify(new_value) : null,
        ip_address,
        user_agent
      ]
    );
    return this.findById(result.insertId);
  },

  async findById(id) {
    const db = getConnection();
    const [rows] = await db.query('SELECT * FROM audit_logs WHERE id = ? LIMIT 1', [id]);
    return rows[0] ? this.formatRow(rows[0]) : null;
  },

  async find({ action, user_id, resource_type, startDate, endDate, search, page = 0, size = 25 } = {}) {
    const db = getConnection();
    const conditions = [];
    const values = [];

    if (action) {
      conditions.push('al.action = ?');
      values.push(action);
    }
    if (user_id) {
      conditions.push('al.user_id = ?');
      values.push(user_id);
    }
    if (resource_type) {
      conditions.push('al.resource_type = ?');
      values.push(resource_type);
    }
    if (startDate) {
      conditions.push('al.timestamp >= ?');
      values.push(startDate);
    }
    if (endDate) {
      conditions.push('al.timestamp <= ?');
      values.push(endDate);
    }
    if (search) {
      conditions.push('(al.description LIKE ? OR al.user_name LIKE ? OR al.resource_id LIKE ?)');
      const searchTerm = `%${search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const [countResult] = await db.query(
      `SELECT COUNT(*) as total FROM audit_logs al ${where}`,
      values
    );
    const total = countResult[0].total;

    // Get paginated results
    const offset = page * size;
    const [rows] = await db.query(
      `SELECT al.* FROM audit_logs al ${where} ORDER BY al.timestamp DESC LIMIT ? OFFSET ?`,
      [...values, size, offset]
    );

    return { data: rows.map(this.formatRow), count: total };
  },

  formatRow(row) {
    return {
      ...row,
      previous_value: row.previous_value ? (typeof row.previous_value === 'string' ? JSON.parse(row.previous_value) : row.previous_value) : null,
      new_value: row.new_value ? (typeof row.new_value === 'string' ? JSON.parse(row.new_value) : row.new_value) : null,
    };
  }

};

module.exports = AuditLogModel;
