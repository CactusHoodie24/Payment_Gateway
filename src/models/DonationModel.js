const db = require('../db');

const DonationModel = {
  async create({ campaign_id, donor_name, donor_phone, donor_email, amount, payment_method, transaction_ref }) {
    const [result] = await db.execute(`
      INSERT INTO donations (campaign_id, donor_name, donor_phone, donor_email, amount, payment_method, transaction_ref, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [campaign_id, donor_name || null, donor_phone || null, donor_email || null, amount, payment_method, transaction_ref || null]);
    return result.insertId;
  },

  async updateStatus(transactionRef, status) {
    await db.execute(
      'UPDATE donations SET status = ? WHERE transaction_ref = ?',
      [status, transactionRef]
    );
  },

  async updateStatusById(donationId, status) {
    await db.execute(
      'UPDATE donations SET status = ? WHERE id = ?',
      [status, donationId]
    );
  },

  async findByTransactionRef(ref) {
    const [rows] = await db.execute(
      'SELECT * FROM donations WHERE transaction_ref = ?',
      [ref]
    );
    return rows[0] || null;
  },

  async getByCampaign(campaignId) {
    const [rows] = await db.execute(`
      SELECT id, donor_name, amount, payment_method, status, created_at
      FROM donations WHERE campaign_id = ? ORDER BY created_at DESC
    `, [campaignId]);
    return rows;
  },

  async getTotalRaised(campaignId) {
    const [rows] = await db.execute(
      "SELECT SUM(amount) AS total FROM donations WHERE campaign_id = ? AND status = 'success'",
      [campaignId]
    );
    return rows[0].total || 0;
  },
};

module.exports = DonationModel;
