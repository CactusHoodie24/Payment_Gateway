// src/services/chargeProfileService.js
const ChargeProfileModel = require('../models/ChargeProfile');

const chargeProfileService = {

  async createChargeProfile(data) {
    const { charge_type, charge_value, charge_item_id, transaction_type_id } = data;

    if (!charge_type || !['FIXED', 'RATE'].includes(charge_type)) {
      throw { status: 400, message: 'charge_type must be either FIXED or RATE.' };
    }

    if (charge_value === undefined || charge_value === null || isNaN(charge_value)) {
      throw { status: 400, message: 'charge_value must be a valid number.' };
    }

    if (charge_type === 'RATE' && (charge_value <= 0 || charge_value > 100)) {
      throw { status: 400, message: 'RATE charge_value must be between 0 and 100.' };
    }

    if (!charge_item_id) {
      throw { status: 400, message: 'charge_item_id is required.' };
    }

    if (!transaction_type_id) {
      throw { status: 400, message: 'transaction_type_id is required.' };
    }

    const profile = await ChargeProfileModel.create(data);
    return profile;
  },

  async getChargeProfileById(id) {
    const profile = await ChargeProfileModel.findByIdWithDetails(id);
    if (!profile) {
      throw { status: 404, message: 'Charge profile not found.' };
    }
    return profile;
  },

  async getAllChargeProfiles(filters = {}) {
    return await ChargeProfileModel.find(filters);
  },

  async updateChargeProfile(id, data) {
    const existing = await ChargeProfileModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Charge profile not found.' };
    }

    if (data.charge_type && !['FIXED', 'RATE'].includes(data.charge_type)) {
      throw { status: 400, message: 'charge_type must be either FIXED or RATE.' };
    }

    if (data.charge_value !== undefined && isNaN(data.charge_value)) {
      throw { status: 400, message: 'charge_value must be a valid number.' };
    }

    return await ChargeProfileModel.findByIdAndUpdate(id, data);
  },

  async deleteChargeProfile(id) {
    const existing = await ChargeProfileModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Charge profile not found.' };
    }
    await ChargeProfileModel.findByIdAndDelete(id);
    return { message: 'Charge profile deleted successfully.' };
  }

};

module.exports = chargeProfileService;