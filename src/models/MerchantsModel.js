const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subdocument for contact person
const ContactPersonSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  position: { type: String },
});

// Subdocument for address
const MerchantAddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  postalCode: { type: String },
});

// Main merchant schema
const MerchantSchema = new Schema(
  {
    businessName: { type: String, required: true },
    tradingName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    address: { type: MerchantAddressSchema, required: true },
    contactPerson: { type: ContactPersonSchema, required: true },
    status: {
      type: String,
      enum: ['pending', 'active', 'suspended', 'inactive', 'rejected'],
      default: 'pending',
    },
    registrationNumber: { type: String },
    taxId: { type: String },
    onboardedBy: { type: String }, // optional: can store user ID
  },
  { timestamps: true } // auto adds createdAt and updatedAt
);

const Merchant = mongoose.model('Merchant', MerchantSchema);

module.exports = Merchant;