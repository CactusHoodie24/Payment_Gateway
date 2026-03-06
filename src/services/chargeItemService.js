// src/services/chargeItemService.js
const ChargeItemModel = require('../models/ChargeItem');

const chargeItemService = {

  async createChargeItem(data) {
    const { name, description } = data;

    if (!name || name.trim() === '') {
      throw { status: 400, message: 'name is required.' };
    }

    const existing = await ChargeItemModel.findOne({ name });
    if (existing) {
      throw { status: 409, message: `A charge item with the name "${name}" already exists.` };
    }

    return await ChargeItemModel.create({ name, description });
  },

  async getChargeItemById(id) {
    const item = await ChargeItemModel.findByIdWithProfiles(id);
    if (!item) {
      throw { status: 404, message: 'Charge item not found.' };
    }
    return item;
  },

  async getAllChargeItems() {
    return await ChargeItemModel.find();
  },

  async updateChargeItem(id, data) {
    const existing = await ChargeItemModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Charge item not found.' };
    }

    if (data.name) {
      const duplicate = await ChargeItemModel.findOne({ name: data.name });
      if (duplicate && duplicate.id !== parseInt(id)) {
        throw { status: 409, message: `A charge item with the name "${data.name}" already exists.` };
      }
    }

    return await ChargeItemModel.findByIdAndUpdate(id, data);
  },

  async deleteChargeItem(id) {
    const existing = await ChargeItemModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Charge item not found.' };
    }
    await ChargeItemModel.findByIdAndDelete(id);
    return { message: 'Charge item deleted successfully.' };
  }

};

module.exports = chargeItemService;