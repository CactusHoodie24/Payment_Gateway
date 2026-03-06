// src/services/organizationService.js
const OrganizationModel = require('../models/OrganizationModel');

const organizationService = {

  async createOrganization(data) {
    // Check for duplicate email
    const existingEmail = await OrganizationModel.findOne({ contact_email: data.contact_email });
    if (existingEmail) {
      throw { status: 409, message: 'An organization with this email already exists' };
    }

    // Check for duplicate phone
    const existingPhone = await OrganizationModel.findOne({ contact_phone: data.contact_phone });
    if (existingPhone) {
      throw { status: 409, message: 'An organization with this phone number already exists' };
    }

    // Check for duplicate name
    const existingName = await OrganizationModel.findOne({ name: data.name });
    if (existingName) {
      throw { status: 409, message: 'An organization with this name already exists' };
    }

    // Check for duplicate short_code
    const existingCode = await OrganizationModel.findOne({ short_code: data.short_code });
    if (existingCode) {
      throw { status: 409, message: 'An organization with this short code already exists' };
    }

    const organization = await OrganizationModel.create(data);
    return organization;
  },

  async getOrganizationById(id) {
    const organization = await OrganizationModel.findWithType(id);
    if (!organization) {
      throw { status: 404, message: 'Organization not found' };
    }
    return organization;
  },

  async getAllOrganizations(filters = {}) {
    const organizations = await OrganizationModel.find(filters);
    return organizations;
  },

  async updateOrganization(id, data) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Organization not found' };
    }
    const updated = await OrganizationModel.findByIdAndUpdate(id, data);
    return updated;
  },

  async updateOrganizationStatus(id, status) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Organization not found' };
    }
    const updated = await OrganizationModel.updateStatus(id, status);
    return updated;
  },

  async deleteOrganization(id) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) {
      throw { status: 404, message: 'Organization not found' };
    }
    await OrganizationModel.findByIdAndDelete(id);
    return { message: 'Organization deleted successfully' };
  }

};

module.exports = organizationService;