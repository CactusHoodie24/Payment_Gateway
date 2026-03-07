// src/controllers/userController.js
const userService = require('../services/userService');

const userController = {

  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(201).json({
        status:  'success',
        message: 'User created successfully.',
        data:    user
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({ status: 'success', data: user });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        status: 'success',
        count:  users.length,
        data:   users
      });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  },

  async activate(req, res) {
    try {
      const { email, password, password_confirmation } = req.body;

      if (!email) {
        return res.status(400).json({
          status:  'error',
          message: 'email is required.'
        });
      }

      if (!password || !password_confirmation) {
        return res.status(400).json({
          status:  'error',
          message: 'password and password_confirmation are required.'
        });
      }

      if (password !== password_confirmation) {
        return res.status(400).json({
          status:  'error',
          message: 'Passwords do not match.'
        });
      }

      // Check email exists before activating
      const existing = await userService.getUserByEmail(email);
      if (!existing) {
        return res.status(404).json({
          status:  'error',
          message: 'No account found with this email.'
        });
      }

      const user = await userService.activateUser(existing.id, password);
      return res.status(200).json({
        status:  'success',
        message: 'User activated successfully.',
        data:    user
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
      const user = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        status:  'success',
        message: 'User updated successfully.',
        data:    user
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
      const result = await userService.deleteUser(req.params.id);
      return res.status(200).json({ status: 'success', message: result.message });
    } catch (error) {
      return res.status(error.status || 500).json({
        status:  'error',
        message: error.message || 'Internal server error.'
      });
    }
  }

};

module.exports = userController;