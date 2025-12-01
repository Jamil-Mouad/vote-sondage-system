const { body, param, validationResult } = require('express-validator');
const { error } = require('../utils/responseHandler');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');

const passwordStrength = () =>
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain at least one special character');

const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters')
    .isAlphanumeric().withMessage('Username must be alphanumeric')
    .custom(async (username) => {
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        throw new Error('Username already taken');
      }
    }),
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail()
    .custom(async (email) => {
      const existingUser = await User.findByEmail(email);
      const pendingUser = await PendingUser.findByEmail(email);
      if (existingUser || pendingUser) {
        throw new Error('Email already registered');
      }
    }),
  passwordStrength(),
];

const validateEmailVerification = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits').isNumeric().withMessage('Verification code must be numeric'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
];

const validateResetPassword = [
  body('email').isEmail().withMessage('Invalid email address').normalizeEmail(),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Reset code must be 6 digits').isNumeric().withMessage('Reset code must be numeric'),
  passwordStrength(),
];

const validatePollCreation = [
  body('question').trim().notEmpty().withMessage('Poll question is required').isLength({ min: 5, max: 255 }).withMessage('Question must be between 5 and 255 characters'),
  body('options').isArray({ min: 2, max: 4 }).withMessage('Poll must have between 2 and 4 options'),
  body('options.*.text').trim().notEmpty().withMessage('Option text cannot be empty').isLength({ min: 1, max: 100 }).withMessage('Option text must be between 1 and 100 characters'),
  body('endTime').isISO8601().toDate().withMessage('Invalid end time format')
    .custom((value) => {
      if (new Date(value) <= new Date()) {
        throw new Error('End time must be in the future');
      }
      return true;
    }),
  body('isPublic').isBoolean().withMessage('isPublic must be a boolean').optional(),
  body('groupId').optional().isInt().withMessage('Group ID must be an integer'),
];

const validateVote = [
  body('pollId').isInt().withMessage('Poll ID must be an integer'),
  body('optionSelected').isInt({ min: 1, max: 4 }).withMessage('Selected option must be between 1 and 4'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return error(res, 'Validation Error', 400, 'VALIDATION_ERROR', errors.array());
  }
  next();
};

module.exports = {
  validateRegistration,
  validateEmailVerification,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validatePollCreation,
  validateVote,
  handleValidationErrors,
};
