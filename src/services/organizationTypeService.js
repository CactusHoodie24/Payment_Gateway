// src/services/organizationTypeService.js
const OrganizationTypeModel = require('../models/OrganizationType');

const organizationTypeService = {

  async createOrganizationType(data) {
    const { name, description } = data;

    if (!name || name.trim() === '') {
      throw { status: 400, message: 'name is required.' };
    }

    if (!description || description.trim() === '') {
      throw { status: 400, message: 'description is required.' };
    }

    const existing = await OrganizationTypeModel.findOne({ name });
    if (existing) {
      throw { status: 409, message: `An organization type with the name "${name}" already exists.` };
    }

    return await OrganizationTypeModel.create({ name, description });
  },

  async getOrganizationTypeById(id) {
    const type = await OrganizationTypeModel.findByIdWithOrganizations(id);
    if (!type) {
      throw { status: 404, message: 'Organization type not found.' };
    }
    return type;
  },

  async getAllOrganizationTypes() {
    return await OrganizationTypeModel.find();
  },

  async updateOrganizationType(id, data) {
    const existing = await OrganizationTypeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Organization type not found.' };
    }

    if (data.name) {
      const duplicate = await OrganizationTypeModel.findOne({ name: data.name });
      if (duplicate && duplicate.id !== parseInt(id)) {
        throw { status: 409, message: `An organization type with the name "${data.name}" already exists.` };
      }
    }

    return await OrganizationTypeModel.findByIdAndUpdate(id, data);
  },

  async deleteOrganizationType(id) {
    const existing = await OrganizationTypeModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Organization type not found.' };
    }
    await OrganizationTypeModel.findByIdAndDelete(id);
    return { message: 'Organization type deleted successfully.' };
  }

};

module.exports = organizationTypeService;