// src/repository/MongoUserRepository.js

const UserModel = require("../models/UserModel");

class MongoUserRepository {

  async save(user) {
    await UserModel.create({
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
      phoneNumber: user.phoneNumber,
    });
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email });
    return doc
  }

  async update(email, otp) {
    await UserModel.updateOne(
      { email: email },
      { $set: { otp } }
    );
  }

async verify(email, otp) {
  const user = await UserModel.findOne({ email });

  if (!user) return false; // email not found

  console.log("OTP in DB:   ", user.otp);
  console.log("OTP provided:", otp);

  // Check if OTP matches
  if (user.otp === otp) {
    // Optionally clear OTP after successful verification
    await UserModel.updateOne({ email }, { $set: { otp: null, verified: true } });
    return true;
  }

  return false; // OTP does not match
}

}

module.exports = MongoUserRepository;