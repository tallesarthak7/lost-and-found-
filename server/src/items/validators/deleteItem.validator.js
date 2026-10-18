const { body } = require("express-validator");
const isValidId = require("../../helpers/idValidator.helper.js");

const deleteItemValidator = [
  body("id", "Valid document Id not optional").notEmpty().custom(isValidId),
];

module.exports = deleteItemValidator;