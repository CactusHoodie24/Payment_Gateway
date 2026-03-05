// controllers/merchantsController.js
const merchantsService = require('../services/merchantsService');

const getMerchants = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    };

    const result = await merchantsService.getAllMerchants(filters, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const getMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.getMerchantById(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const createMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.createMerchant(req.body);
    res.status(201).json({ success: true, data: merchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const updateMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.updateMerchant(req.params.id, req.body);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const deleteMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.deleteMerchant(req.params.id);
    if (!merchant) return res.status(404).json({ success: false, message: 'Merchant not found' });
    res.json({ success: true, message: 'Merchant deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};