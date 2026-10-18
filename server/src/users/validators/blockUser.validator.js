const { param } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

const blockUserValidator = [
  param("id")
    .notEmpty()
    .withMessage("User ID is required")
    .custom(isValidId)
    .withMessage("Invalid user ID"),
];

module.exports = blockUserValidator;