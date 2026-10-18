const { param } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

const rejectMatchValidator = [
  param("id")
    .custom(isValidId)
    .withMessage("Invalid match ID"),
];

module.exports = rejectMatchValidator;