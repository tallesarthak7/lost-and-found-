const { param } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

const acceptMatchValidator = [
  param("id")
    .custom(isValidId)
    .withMessage("Invalid match ID"),
];

module.exports = acceptMatchValidator;