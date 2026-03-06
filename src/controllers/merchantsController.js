// controllers/merchantsController.js
const merchantsService = require("../services/merchantsService");
const bcrypt = require("bcryptjs");

const loginMerchant = async (req, res) => {
  try {
    console.log("Login request body:", req.body);

    const { email, password } = req.body;

    const user = await merchantsService.merchantByEmail(email);

    console.log("User from DB:", user);

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    console.log("Password match:", match);

    if (!match) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    return res.status(200).json({
      status: 200,
      message: "User is valid, user should reset the password.",
      data: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        verified: false,
      },
    });
  } catch (err) {
    console.error("Login error:", err);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

const getMerchants = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
    };
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      sortBy: req.query.sortBy || "createdAt",
      sortOrder: req.query.sortOrder || "desc",
    };

    const result = await merchantsService.getAllMerchants(filters, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.getMerchantById(req.params.id);
    if (!merchant)
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });
    res.json({ success: true, data: merchant });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const createMerchant = async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:4000/users",
      req.body,
      { headers: { "Content-Type": "application/json" } }
    );

    return res.status(201).json({
      success: true,
      message: "Merchant created successfully.",
      data:    response.data,
    });
  } catch (error) {
    console.error("Create merchant error:", error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        success: false,
        message: error.response.data?.message || "Upstream service error.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const updateMerchant = async (req, res) => {
  try {
    const { email, password } = req.body;

    const merchant = await merchantsService.updateMerchant(email, password);

    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Merchant not found",
      });
    }

    res.json({
      success: true,
      data: merchant,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const deleteMerchant = async (req, res) => {
  try {
    const merchant = await merchantsService.deleteMerchant(req.params.id);
    if (!merchant)
      return res
        .status(404)
        .json({ success: false, message: "Merchant not found" });
    res.json({ success: true, message: "Merchant deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  getMerchants,
  getMerchant,
  createMerchant,
  updateMerchant,
  deleteMerchant,
  loginMerchant,
};
