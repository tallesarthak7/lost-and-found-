const { param, body } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

// Validator for PATCH /items/:id/verify
const verifyItemValidator = [
  param("id", "Valid item ID is required").notEmpty().custom(isValidId),

  body("action")
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["approved", "rejected"])
    .withMessage('Action must be "approved" or "rejected"'),

  body("reason").optional().isString().trim(),
];

module.exports = verifyItemValidator;