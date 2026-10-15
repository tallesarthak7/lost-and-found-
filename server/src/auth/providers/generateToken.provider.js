const jwt = require("jsonwebtoken");

function generateTokenProvider(user) {
  const secret = process.env.JWT_SECRET || "supersecretkey_campus_lf_jwt_token_2026";
  const ttl = parseInt(process.env.JWT_ACCESS_EXPIRATION_TTL, 10) || 86400;

  const payload = {
    sub: user["_id"],
    email: user.email,
    role:  user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + ttl,
  };

  return jwt.sign(payload, secret);
}

module.exports = generateTokenProvider; 