// src/services/userService.js
const UserModel = require('../models/User');
const bcrypt    = require('bcryptjs');
const OrganizationModel   = require('../models/OrganizationModel');
const organizationService = require('./organizationService');


const userService = {

async createUser({ email, password }) {
  const existing = await UserModel.findOne({ email });
  if (existing) throw { status: 409, message: 'User with this email already exists.' };

  const hashed = await bcrypt.hash(password, 12); // ← hash temp password

  return await UserModel.create({
    email,
    password:      'TEMP',
    temp_password: hashed  // ← store hashed not plain text
  });
},

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) throw { status: 404, message: 'User not found.' };
    return user;
  },

  async getAllUsers() {
    return await UserModel.find();
  },

  // Called when user sets their permanent password
 async activateUser(id, newPassword) {
    const user = await UserModel.findById(id);
    if (!user) throw { status: 404, message: 'User not found.' };

    if (user.is_activated) {
      throw { status: 409, message: 'User is already activated.' };
    }

    const hashed  = await bcrypt.hash(newPassword, 12);
    const updated = await UserModel.activate(id, hashed);

    // Find and activate the linked organization by matching email
    const organization = await OrganizationModel.findOne({ contact_email: user.email });
    if (organization) {
      await organizationService.updateOrganizationStatus(organization.id, 'ACTIVE');
    }

    // Strip sensitive fields from response
    const { password: _, temp_password: __, ...safeUser } = updated;
    return safeUser;
  },

  async updateUser(id, data) {
    const existing = await UserModel.findById(id);
    if (!existing) throw { status: 404, message: 'User not found.' };

    if (data.email && data.email !== existing.email) {
      const duplicate = await UserModel.findOne({ email: data.email });
      if (duplicate) throw { status: 409, message: 'A user with this email already exists.' };
    }

    // If updating password on an activated user — hash it
    if (data.password && existing.is_activated) {
      data.password      = await bcrypt.hash(data.password, 12);
      data.temp_password = null;
    }

    const updated = await UserModel.findByIdAndUpdate(id, data);
    const { password: _, temp_password: __, ...safeUser } = updated;
    return safeUser;
  },

  async deleteUser(id) {
    const existing = await UserModel.findById(id);
    if (!existing) throw { status: 404, message: 'User not found.' };
    await UserModel.findByIdAndDelete(id);
    return { message: 'User deleted successfully.' };
  },

  async getUserByEmail(email) {
  const user = await UserModel.findOne({ email });
  return user || null;
},

};

module.exports = userService;