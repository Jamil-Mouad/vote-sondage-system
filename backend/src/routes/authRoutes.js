const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerLimiter, loginLimiter, resendCodeLimiter } = require('../middlewares/rateLimiter');
const { validateRegistration, validateEmailVerification, validateLogin, validateForgotPassword, validateResetPassword, handleValidationErrors } = require('../middlewares/validators');
const passport = require('passport');

// Public routes
router.post('/register', registerLimiter, validateRegistration, handleValidationErrors, authController.register);
router.post('/verify-email', validateEmailVerification, handleValidationErrors, authController.verifyEmail);
router.post('/resend-code', resendCodeLimiter, validateEmailVerification[0], handleValidationErrors, authController.resendVerificationCode); // Only validate email for resend code
router.post('/login', loginLimiter, validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, handleValidationErrors, authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout); // Logout is often client-side, but a backend endpoint can be useful for token blacklisting if implemented

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Vérifier si Google OAuth est configuré
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      error: {
        code: 'OAUTH_NOT_CONFIGURED',
        message: 'Google OAuth n\'est pas configuré sur ce serveur. Veuillez utiliser l\'inscription par email.'
      }
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth_failed`,
    session: false
  })(req, res, next);
}, authController.googleAuthCallback);

module.exports = router;
