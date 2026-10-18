const { param } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

const runMatchValidator = [
  param("itemId")
    .custom(isValidId)
    .withMessage("Invalid itemId"),
];

module.exports = runMatchValidator;