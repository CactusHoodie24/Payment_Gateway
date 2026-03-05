// services/merchantsService.js
const Merchant = require('../models/MerchantsModel.js'); // adjust path if needed

const getAllMerchants = async (filters = {}, options = {}) => {
  const { status, search } = filters;
  const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = options;

  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { businessName: { $regex: search, $options: 'i' } },
      { tradingName: { $regex: search, $options: 'i' } },
      { 'contactPerson.firstName': { $regex: search, $options: 'i' } },
      { 'contactPerson.lastName': { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const skip = (page - 1) * limit;

  const merchants = await Merchant.find(query)
    .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
    .skip(skip)
    .limit(limit);

  const total = await Merchant.countDocuments(query);
  const totalPages = Math.ceil(total / limit);

  return { merchants, total, page, limit, totalPages };
};

const getMerchantById = async (id) => {
  return await Merchant.findById(id);
};

const createMerchant = async (data) => {
  const merchant = new Merchant(data);
  return await merchant.save();
};

const updateMerchant = async (id, data) => {
  return await Merchant.findByIdAndUpdate(id, data, { new: true });
};

const deleteMerchant = async (id) => {
  return await Merchant.findByIdAndDelete(id);
};

module.exports = {
  getAllMerchants,
  getMerchantById,
  createMerchant,
  updateMerchant,
  deleteMerchant,
};