const User = require("../users.schema.js");

const mongoose = require("mongoose");

async function getUserByEmail(email) {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("Database is not connected. Please check server configuration or DATABASE_URL.");
  }
  return await User.findOne({ email: email });
}

module.exports = getUserByEmail;