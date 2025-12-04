const rateLimit = require('express-rate-limit');
const { error } = require('../utils/responseHandler');

// Désactiver rate limiting en développement
const isDevelopment = process.env.NODE_ENV === 'development';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 1000 : 10, // En dev: 1000, en prod: 10 tentatives
  message: (req, res) => {
    error(res, 'Too many login attempts from this IP, please try again after 15 minutes', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: () => isDevelopment, // Skip complètement en développement
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 5, // En dev: 1000, en prod: 5 tentatives
  message: (req, res) => {
    error(res, 'Too many registration attempts from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Skip complètement en développement
});

const resendCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 1000 : 3, // En dev: 1000, en prod: 3 tentatives
  message: (req, res) => {
    error(res, 'Too many resend code requests from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Skip complètement en développement
});

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: isDevelopment ? 10000 : 100, // En dev: 10000, en prod: 100 votes
  message: (req, res) => {
    error(res, 'Too many vote requests from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Skip complètement en développement
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDevelopment ? 10000 : 100, // En dev: 10000, en prod: 100 requêtes
  message: (req, res) => {
    error(res, 'Too many requests from this IP, please try again after 15 minutes', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDevelopment, // Skip complètement en développement
});

module.exports = {
  loginLimiter,
  registerLimiter,
  resendCodeLimiter,
  voteLimiter,
  generalLimiter,
};
