// src/models/User.js
const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["admin", "merchant"], default: "merchant" },
    verified: { type: Boolean, default: false },
    phoneNumber: { type: String },
    otp: { type: String, default: null }
  },
  { timestamps: true }
);

const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;