const User = require("../users.schema.js");
const { testConnection } = require("../../db/prisma.js");

async function getUserByEmail(email) {
  if (global.connectToDatabase) {
    try {
      await global.connectToDatabase();
    } catch (e) {
      // Handled in connectToDatabase
    }
  }

  return await User.findOne({ email: email });
}

module.exports = getUserByEmail;