const rateLimit = require('express-rate-limit');
const { error } = require('../utils/responseHandler');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 login requests per 15 minutes
  message: (req, res) => {
    error(res, 'Too many login attempts from this IP, please try again after 15 minutes', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Max 5 registration attempts per hour
  message: (req, res) => {
    error(res, 'Too many registration attempts from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendCodeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 resend code requests per hour
  message: (req, res) => {
    error(res, 'Too many resend code requests from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Max 100 vote requests per hour
  message: (req, res) => {
    error(res, 'Too many vote requests from this IP, please try again after an hour', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per 15 minutes for general routes
  message: (req, res) => {
    error(res, 'Too many requests from this IP, please try again after 15 minutes', 429, 'TOO_MANY_REQUESTS');
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  loginLimiter,
  registerLimiter,
  resendCodeLimiter,
  voteLimiter,
  generalLimiter,
};
