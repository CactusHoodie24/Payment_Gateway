// config/database.js
const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://Hoodie:qHftR8JbRYDbpZc0@hoodiecluster.djymejy.mongodb.net/malipo?retryWrites=true&w=majority&appName=HoodieCluster");

    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

module.exports = connectDB;