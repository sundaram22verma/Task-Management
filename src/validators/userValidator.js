const { body, param, query } = require('express-validator');

const createUserValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['super-admin', 'admin', 'user'])
    .withMessage('Role must be one of: super-admin, admin, user'),
];

const updateUserValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format in URL parameter'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty if provided')
    .isLength({ max: 50 })
    .withMessage('Name cannot exceed 50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

const updateRoleValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format in URL parameter'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['super-admin', 'admin', 'user'])
    .withMessage('Role must be one of: super-admin, admin, user'),
];

const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format in URL parameter'),
  body('isActive')
    .notEmpty()
    .withMessage('isActive is required')
    .isBoolean()
    .withMessage('isActive must be a boolean value (true/false)'),
];

const userIdParamValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID format in URL parameter'),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  updateRoleValidator,
  updateStatusValidator,
  userIdParamValidator,
};
