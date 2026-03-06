// src/repository/MerchantRepository.js
const Merchant = require('../models/MerchantsModel');

class MerchantRepository {
  /**
   * Find a merchant by their ID
   * @param {string} id - MongoDB ObjectId as string
   * @returns {Promise<Object|null>} - Returns the merchant document or null if not found
   */
  async findById(id) {
    const merchant = await Merchant.findOne({ _id: id});
    return merchant;
  }

  async findByEmail(email) {
    const merchant = await Merchant.findOne({email: email})
    return merchant
  }

  async updatePassword(email, password) {
  const merchant = await Merchant.updateOne(
    { email: email },          // filter (find the user)
    { $set: { password: password } }  // update operation
  );

  return merchant;
}

}

module.exports = MerchantRepository;