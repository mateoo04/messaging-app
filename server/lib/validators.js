const { body } = require('express-validator');

const validateSignUp = [
  body('displayName')
    .trim()
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ min: 2 })
    .withMessage('Display name must be at least 2 characters.')
    .escape(),
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 2 })
    .withMessage('Username must be at least 2 characters.')
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase character')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .escape(),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .escape(),
];

const validateLogIn = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .escape(),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase character')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .escape(),
];

module.exports = { validateSignUp, validateLogIn };
