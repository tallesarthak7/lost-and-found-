const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // Extract Bearer <token>
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (token == null)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "You are not Authorized to perform this request" }); // No token present

  const secret = process.env.JWT_SECRET || "supersecretkey_campus_lf_jwt_token_2026";
  jwt.verify(token, secret, (err, user) => {
    if (err)
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ message: "Your token is either expired or invalid." });

    req.user = user;
    next();
  });
};

module.exports = authenticateToken;