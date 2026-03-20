// src/controllers/organizationController.js
const organizationService = require('../services/organizationService');
const userService         = require('../services/userService');
const camelToSnake        = require('../middleware/camelToSnake');
const snakeToCamel = require('../middleware/snakeToCamel')
const UserModel = require('../models/User');
const OtpModel = require('../models/OtPModel');
const AuthService = require('../services/authService');

const organizationController = {

async create(req, res) {
  try {
    console.log('📨 Request body:', req.body);

    const email    = req.body.contactEmail;
    const password = req.body.password;

    // Step 1 — Register organization
    const orgResponse = await fetch(`${process.env.BASE_URL}/api/organizations/register`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': req.headers['authorization']
      },
      body: JSON.stringify(req.body)
    });

    const organization = await orgResponse.json();
    console.log('📬 Register status:', orgResponse.status);
    console.log('📬 Register response:', JSON.stringify(organization, null, 2));

    // ← check BEFORE doing anything else
    if (!orgResponse.ok) {
      return res.status(orgResponse.status).json({
        status:  'error',
        message: organization.message || 'Failed to create organization.',
        data:    organization  // ← return full response so you can see what went wrong
      });
    }

    // Step 2 — Create user locally
    const user = await userService.createUser({
  email,
  password,
  organization_id:   organization.id,
  organization_name: organization.name
});
    console.log('👤 User created:', user);

    // Step 3 — Generate unique OTP
    let code;
    let exists;
    do {
      code   = Math.floor(100000 + Math.random() * 900000).toString();
      exists = await OtpModel.findOne({ code });
    } while (exists);
    console.log('🔑 OTP:', code);

    // Step 4 — Save OTP
    await OtpModel.create({
      channel:  'EMAIL',
      code,
      handle:   email,
      metadata: { purpose: 'account_activation', user_id: user.id }
    });

    // Step 5 — Send OTP email
    await AuthService.sendUserOtp({ email, code });
    console.log('✅ OTP sent to:', email);

    return res.status(201).json({
      status:  'success',
      message: 'Organization created successfully. OTP sent to email.',
      data: {
        organization,
        user: { id: user.id, email: user.email, role: user.role }
      }
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return res.status(error.status || 500).json({
      status:  'error',
      message: error.message || 'Internal server error.'
    });
  }
},
  
  async getById(req, res) {
    try {
      const organization = await organizationService.getOrganizationById(req.params.id);
      return res.status(200).json({ status: 'success', data: organization });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getAll(req, res) {
    try {
      const filters = {};
      if (req.query.status)               filters.status               = req.query.status;
      if (req.query.organization_type_id) filters.organization_type_id = req.query.organization_type_id;

      const organizations = await organizationService.getAllOrganizations(filters);
      return res.status(200).json({
        status: 'success',
        count:  organizations.length,
        data:   organizations
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async update(req, res) {
    try {
      const updateData = camelToSnake(req.body); // ← normalize once

      const organization = await organizationService.updateOrganization(req.params.id, updateData);
      return res.status(200).json({
        status:  'success',
        message: 'Organization updated successfully.',
        data:    organization
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async updateStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DORMANT', 'DELETED', 'PENDING_ACTIVE'];

      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          status:  'error',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        });
      }

      const organization = await organizationService.updateOrganizationStatus(req.params.id, status);
      return res.status(200).json({
        status:  'success',
        message: 'Organization status updated successfully.',
        data:    organization
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async remove(req, res) {
    try {
      const result = await organizationService.deleteOrganization(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = organizationController;