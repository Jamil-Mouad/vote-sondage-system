const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const CodeVerification = require('../models/CodeVerification');
const { sendVerificationCode, sendPasswordResetCode } = require('../services/emailService');
const generateCode = require('../utils/generateCode');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { success, error } = require('../utils/responseHandler');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Password already hashed in validator for simplicity, or here if not in validator
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await PendingUser.create({ username, email, password: hashedPassword }, verificationCode, codeExpiresAt);
    await sendVerificationCode(email, verificationCode, username);

    success(res, null, 'Registration successful. Please check your email for verification code.', 201);
  } catch (err) {
    error(res, err.message, 500, 'REGISTRATION_FAILED');
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const pendingUser = await PendingUser.findByEmail(email);
    if (!pendingUser || pendingUser.verification_code !== code || new Date(pendingUser.code_expires_at) < new Date()) {
      return error(res, 'Invalid or expired verification code.', 400, 'INVALID_CODE');
    }

    // Transfer to users table
    const userId = await User.create({
      username: pendingUser.username,
      email: pendingUser.email,
      password: pendingUser.password,
      // Add other default fields like firstName, lastName, avatarUrl if needed
    });

    // Delete from pending users
    await PendingUser.deleteByEmail(email);

    const accessToken = generateAccessToken({ id: userId, email: pendingUser.email, username: pendingUser.username, role: 'user' });
    const refreshToken = generateRefreshToken({ id: userId, email: pendingUser.email, username: pendingUser.username, role: 'user' });

    success(res, { userId, email: pendingUser.email, username: pendingUser.username, accessToken, refreshToken }, 'Email verified and user logged in.');
  } catch (err) {
    error(res, err.message, 500, 'EMAIL_VERIFICATION_FAILED');
  }
};

const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    const pendingUser = await PendingUser.findByEmail(email);

    if (!pendingUser) {
      return error(res, 'No pending registration found for this email.', 404, 'USER_NOT_FOUND');
    }

    const newCode = generateCode();
    const newCodeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await PendingUser.update(pendingUser.id, { verification_code: newCode, code_expires_at: newCodeExpiresAt }); // Assuming update function exists in PendingUser model
    await sendVerificationCode(email, newCode, pendingUser.username);

    success(res, null, 'New verification code sent to your email.');
  } catch (err) {
    error(res, err.message, 500, 'RESEND_CODE_FAILED');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return error(res, 'Invalid credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return error(res, 'Invalid credentials.', 401, 'INVALID_CREDENTIALS');
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, username: user.username, role: user.role });

    success(res, { userId: user.id, email: user.email, username: user.username, accessToken, refreshToken }, 'Login successful.');
  } catch (err) {
    error(res, err.message, 500, 'LOGIN_FAILED');
  }
};

const googleAuth = (req, res) => {
  // This function is mainly for initiating the Google OAuth flow, handled by Passport
  // The actual callback and token generation will be in googleAuthCallback
};

const googleAuthCallback = async (req, res) => {
  try {
    const profile = req.user; // User profile from Google, provided by Passport

    let user = await User.findByEmail(profile.emails[0].value);

    if (!user) {
      // Create user if they don't exist
      const username = profile.displayName.replace(/\s/g, '').toLowerCase() + Math.floor(Math.random() * 1000);
      const userId = await User.create({
        username: username,
        email: profile.emails[0].value,
        password: 'oauth_password', // Placeholder password, not used for OAuth login
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        avatarUrl: profile.photos[0].value,
        role: 'user',
      });
      user = await User.findById(userId);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email, username: user.username, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, email: user.email, username: user.username, role: user.role });

    // Redirect to frontend with tokens (or send via JSON if frontend handles it differently)
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);

  } catch (err) {
    error(res, err.message, 500, 'GOOGLE_AUTH_FAILED');
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return error(res, 'User with this email not found.', 404, 'USER_NOT_FOUND');
    }

    const resetCode = generateCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await CodeVerification.create(user.id, resetCode, 'password_reset', codeExpiresAt);
    await sendPasswordResetCode(email, resetCode, user.username);

    success(res, null, 'Password reset code sent to your email.');
  } catch (err) {
    error(res, err.message, 500, 'FORGOT_PASSWORD_FAILED');
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    const verification = await CodeVerification.findByUserAndCode(user.id, code, 'password_reset');
    if (!verification) {
      return error(res, 'Invalid or expired reset code.', 400, 'INVALID_CODE');
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.updatePassword(user.id, hashedPassword);
    await CodeVerification.markAsUsed(verification.id);

    success(res, null, 'Password has been reset successfully.');
  } catch (err) {
    error(res, err.message, 500, 'PASSWORD_RESET_FAILED');
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: oldRefreshToken } = req.body;

    if (!oldRefreshToken) {
      return error(res, 'Refresh token required.', 400, 'REFRESH_TOKEN_MISSING');
    }

    const decoded = verifyRefreshToken(oldRefreshToken);
    if (!decoded) {
      return error(res, 'Invalid or expired refresh token.', 403, 'REFRESH_TOKEN_INVALID');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    const newAccessToken = generateAccessToken({ id: user.id, email: user.email, username: user.username, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id, email: user.email, username: user.username, role: user.role });

    success(res, { accessToken: newAccessToken, refreshToken: newRefreshToken }, 'Tokens refreshed successfully.');
  } catch (err) {
    error(res, err.message, 500, 'TOKEN_REFRESH_FAILED');
  }
};

const logout = (req, res) => {
  // For JWT, logout is often client-side by deleting tokens.
  // If a blacklist mechanism is implemented, it would be called here.
  success(res, null, 'Logged out successfully.');
};

module.exports = {
  register,
  verifyEmail,
  resendVerificationCode,
  login,
  googleAuth,
  googleAuthCallback,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
};
