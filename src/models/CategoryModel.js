const db = require('../db');

const CategoryModel = {
  async getAll() {
    const [rows] = await db.execute('SELECT * FROM campaign_categories ORDER BY name ASC');
    return rows;
  },

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM campaign_categories WHERE id = ?', [id]);
    return rows[0] || null;
  },
};

module.exports = CategoryModel;
