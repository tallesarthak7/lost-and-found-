const { body } = require("express-validator");

const createClaimValidator = [
  body("itemId")
    .isMongoId()
    .withMessage("Invalid itemId"),

  body("matchId")
    .optional({ values: "falsy" })
    .isMongoId()
    .withMessage("Invalid matchId"),

  body("message")
    .isString()
    .trim()
    .isLength({ min: 5 })
    .withMessage("Message must be at least 5 characters"),

  body("contactInfo")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Contact info is required"),

  body("proofImages")
    .optional({ values: "falsy" })
    .isArray()
    .withMessage("Proof images must be an array"),
];

module.exports = createClaimValidator;