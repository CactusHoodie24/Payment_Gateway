const db = require('../db');

// ─── Reusable SELECT base ──────────────────────────────────────────────────────
// Returns every field the frontend consumes across all views
const BASE_SELECT = `
  SELECT
    c.*,

    -- alias campaign_code as 'code' so frontend can use item.code everywhere
    c.campaign_code                          AS code,

    cc.name                                  AS category_name,

    u.name                                   AS owner_name,
    u.phone                                  AS owner_phone,

    -- donation count (frontend uses contributions_count)
    (
      SELECT COUNT(*)
      FROM donations d
      WHERE d.campaign_id = c.id
        AND d.payment_status = 'Completed'
    ) AS contributions_count,

    -- donation count alias for backwards compat
    (
      SELECT COUNT(*)
      FROM donations d
      WHERE d.campaign_id = c.id
        AND d.payment_status = 'Completed'
    ) AS donation_count,

    -- total raised as a number
    (
      SELECT IFNULL(SUM(d.amount), 0)
      FROM donations d
      WHERE d.campaign_id = c.id
        AND d.payment_status = 'Completed'
    ) AS amount_raised,

    -- total raised formatted as MK 1,234.00 string
    CONCAT(
      'MK ',
      FORMAT(
        IFNULL((
          SELECT SUM(d.amount)
          FROM donations d
          WHERE d.campaign_id = c.id
            AND d.payment_status = 'Completed'
        ), 0),
        2
      )
    )                                        AS received_amount_fmt,

    -- raw received amount (unformatted) for calculations
    IFNULL((
      SELECT SUM(d.amount)
      FROM donations d
      WHERE d.campaign_id = c.id
        AND d.payment_status = 'Completed'
    ), 0)                                    AS received_amount,

    -- cover photo (first thumbnail image, or any image if no thumbnail set)
    IFNULL(
      (SELECT image_url FROM campaign_images ci
       WHERE ci.campaign_id = c.id AND ci.is_thumbnail = 1
       LIMIT 1),
      (SELECT image_url FROM campaign_images ci
       WHERE ci.campaign_id = c.id
       LIMIT 1)
    )                                        AS cover_photo,

    -- withdrawal id — NULL means no withdrawal has been made yet
    -- frontend uses item.withdrawal == null to decide if campaign is withdrawable
    (
      SELECT w.id FROM withdrawals w
      WHERE w.campaign_id = c.id
      LIMIT 1
    )                                        AS withdrawal

  FROM campaigns c
  JOIN campaign_categories cc ON c.campaign_category_id = cc.id
  JOIN users u ON c.created_by = u.id
`;

const CampaignModel = {

  // GET /api/campaigns  (supports ?query= search)
  async getAll({ query = null } = {}) {
    let sql      = BASE_SELECT + ` WHERE c.status != 'Pending'`;
    const params = [];

    if (query) {
      sql += ' AND (c.title LIKE ? OR c.description LIKE ?)';
      params.push(`%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY c.created_at DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  },

  // GET /api/campaigns/featured
  async getFeatured() {
    const [rows] = await db.execute(BASE_SELECT + `
      WHERE c.is_featured = 1
        AND c.status = 'Active'
      ORDER BY c.created_at DESC
    `);
    return rows;
  },

  // POST /api/campaigns/get-by-code  { campaign_code }
  async getByCode(code) {
    const [rows] = await db.execute(BASE_SELECT + `
      WHERE c.campaign_code = ?
    `, [code]);

    if (!rows[0]) return null;

    const campaign = rows[0];

    // Fetch 10 most recent completed donations
    const [donations] = await db.execute(`
      SELECT id, user_id, amount, created_at
      FROM donations
      WHERE campaign_id = ?
        AND payment_status = 'Completed'
      ORDER BY created_at DESC
      LIMIT 10
    `, [campaign.id]);

    campaign.recent_donations = donations;
    return campaign;
  },

  // GET /api/campaigns/get-by-category/:id
  async getByCategory(categoryId) {
    const [rows] = await db.execute(BASE_SELECT + `
      WHERE c.campaign_category_id = ?
        AND c.status != 'Pending'
      ORDER BY c.created_at DESC
    `, [categoryId]);
    return rows;
  },

  // GET /api/campaigns/fetch  (authenticated user's own campaigns)
  async getByUser(userId) {
    const [rows] = await db.execute(BASE_SELECT + `
      WHERE c.created_by = ?
      ORDER BY c.created_at DESC
    `, [userId]);
    return rows;
  },

  // POST /api/campaigns
  async create({ campaign_code, created_by, campaign_category_id, title, description, target_amount, closing_date, donation_mode, third_party_donation_url }) {
    const [result] = await db.execute(`
      INSERT INTO campaigns
        (campaign_code, created_by, campaign_category_id, title, description, target_amount, closing_date, donation_mode, third_party_donation_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      campaign_code,
      created_by,
      campaign_category_id,
      title,
      description,
      target_amount,
      closing_date,
      donation_mode  || 'system',
      third_party_donation_url || null,
    ]);

    return result.insertId;
  },

  // PUT/PATCH /api/campaigns/:code
  async update(code, userId, { title, description, target_amount, closing_date, campaign_category_id, donation_mode, third_party_donation_url }) {
    const [result] = await db.execute(`
      UPDATE campaigns SET
        title                    = ?,
        description              = ?,
        target_amount            = ?,
        closing_date             = ?,
        campaign_category_id     = ?,
        donation_mode            = ?,
        third_party_donation_url = ?
      WHERE campaign_code = ?
        AND created_by    = ?
    `, [
      title,
      description,
      target_amount,
      closing_date,
      campaign_category_id,
      donation_mode || 'system',
      third_party_donation_url || null,
      code,
      userId,
    ]);

    return result.affectedRows;
  },

  async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM campaigns WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async findByCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM campaigns WHERE campaign_code = ?',
      [code]
    );
    return rows[0] || null;
  },

  // Called on successful donation callback
  async incrementAmountRaised(campaignId, amount) {
    await db.execute(
      'UPDATE campaigns SET amount_raised = amount_raised + ? WHERE id = ?',
      [amount, campaignId]
    );
  },
};

module.exports = CampaignModel;