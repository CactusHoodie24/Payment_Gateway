const db = require('../db');

const WithdrawalModel = {
  async create({ campaign_id, user_id, amount, account_number, account_name, bank_or_wallet }) {
    const [result] = await db.execute(`
      INSERT INTO withdrawals (campaign_id, user_id, amount, account_number, account_name, bank_or_wallet, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `, [campaign_id, user_id, amount, account_number, account_name, bank_or_wallet]);
    return result.insertId;
  },

  async getByUser(userId) {
    const [rows] = await db.execute(`
      SELECT w.*, c.title AS campaign_title, c.campaign_code
      FROM withdrawals w
      JOIN campaigns c ON w.campaign_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `, [userId]);
    return rows;
  },

  async getByCampaign(campaignId) {
    const [rows] = await db.execute(
      'SELECT * FROM withdrawals WHERE campaign_id = ? ORDER BY created_at DESC',
      [campaignId]
    );
    return rows;
  },

  async getTotalWithdrawn(campaignId) {
    const [rows] = await db.execute(
      "SELECT SUM(amount) AS total FROM withdrawals WHERE campaign_id = ? AND status IN ('approved','processed')",
      [campaignId]
    );
    return rows[0].total || 0;
  },
};

module.exports = WithdrawalModel;
