const { createModel } = require("../db/modelAdapter.js");

const User = createModel("User");

module.exports = User;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstname
 *         - email
 *         - password
 *       properties:
 *         firstName:
 *           type: string
 *           description: The first name of the user
 *           maxLength: 100
 *         lastName:
 *           type: string
 *           description: The last name of the user
 *           maxLength: 500
 *         email:
 *           type: string
 *           description: A valid email address
 *         password:
 *           type: string
 *           description: Must be atleast 8 chars and contain a number, Capital letter and a special character
 *       example:
 *         firstname: John
 *         lastname: Doe
 *         email: john@doe.com
 *         password: Password123#
 */