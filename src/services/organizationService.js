// src/services/organizationService.js
const OrganizationModel = require('../models/OrganizationModel');

const organizationService = {

  async createOrganization(data) {
    const { contactEmail, contactPhone, organizationTypeId, name, description, ...rest } = data;

    // Map camelCase → snake_case
    const organizationData = {
      ...rest,
      name,
      description,
      contact_email:        contactEmail        || data.contact_email,
      contact_phone:        contactPhone        || data.contact_phone,
      organization_type_id: organizationTypeId  || data.organization_type_id
    };

    // Check for duplicate email
    const existingEmail = await OrganizationModel.findOne({ contact_email: organizationData.contact_email });
    if (existingEmail) throw { status: 409, message: 'An organization with this email already exists.' };

    // Check for duplicate phone
    const existingPhone = await OrganizationModel.findOne({ contact_phone: organizationData.contact_phone });
    if (existingPhone) throw { status: 409, message: 'An organization with this phone number already exists.' };

    // Check for duplicate name
    const existingName = await OrganizationModel.findOne({ name: organizationData.name });
    if (existingName) throw { status: 409, message: 'An organization with this name already exists.' };

    // Check for duplicate short_code only if provided
    if (organizationData.short_code) {
      const existingCode = await OrganizationModel.findOne({ short_code: organizationData.short_code });
      if (existingCode) throw { status: 409, message: 'An organization with this short code already exists.' };
    }

    return await OrganizationModel.create(organizationData);
  },

  async getOrganizationById(id) {
    const organization = await OrganizationModel.findWithType(id);
    if (!organization) throw { status: 404, message: 'Organization not found.' };
    return organization;
  },

  async getAllOrganizations(filters = {}) {
    return await OrganizationModel.find(filters);
  },

  async updateOrganization(id, data) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) throw { status: 404, message: 'Organization not found.' };

    const { contactEmail, contactPhone, organizationTypeId, ...rest } = data;

    // Map camelCase → snake_case only for provided fields
    const updateData = {
      ...rest,
      ...(contactEmail       && { contact_email:        contactEmail }),
      ...(contactPhone       && { contact_phone:        contactPhone }),
      ...(organizationTypeId && { organization_type_id: organizationTypeId })
    };

    return await OrganizationModel.findByIdAndUpdate(id, updateData);
  },

  async updateOrganizationStatus(id, status) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) throw { status: 404, message: 'Organization not found.' };
    return await OrganizationModel.updateStatus(id, status);
  },

  async deleteOrganization(id) {
    const existing = await OrganizationModel.findById(id);
    if (!existing) throw { status: 404, message: 'Organization not found.' };
    await OrganizationModel.findByIdAndDelete(id);
    return { message: 'Organization deleted successfully.' };
  }

};

module.exports = organizationService;