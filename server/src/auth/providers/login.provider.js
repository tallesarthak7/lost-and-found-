const{matchedData} = require("express-validator");
const { StatusCodes } = require("http-status-codes");
const errorLogger = require("../../helpers/errorLogger.helper.js");
const getUserByEmail = require("../../users/providers/getUserByEmail.provider.js");
const bcrypt = require("bcrypt");
const generateTokenProvider = require("./generateToken.provider.js");

async function loginProvider(req, res) {

   const validatedData = matchedData(req);
 try {
     // Get the user from the database
    const user = await getUserByEmail(validatedData.email);

    if (!user || !user.password) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
    }

    // Compare password to hash
    const result = await bcrypt.compare(validatedData.password, user.password);

    if (!result) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Invalid email or password." });
    }

    // Generate Access token
    const token = generateTokenProvider(user);

    return res.status(StatusCodes.OK).json({
      accessToken: token,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    errorLogger("Error while trying to login: ", req, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message && error.message.includes("Database")
        ? "Database is connecting or unavailable. Please try again shortly."
        : "Unable to process your request at the moment, please try later.",
    });
  }
}
module.exports = loginProvider;
