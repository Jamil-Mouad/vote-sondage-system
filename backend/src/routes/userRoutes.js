const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { passwordStrength, handleValidationErrors } = require('../middlewares/validators');
const multer = require('multer'); // Multer is configured in userController, but needs to be used here

const upload = multer(); // Initialize multer without disk storage for routes, as storage is handled in controller

// Protected routes
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, upload.single('avatar'), userController.updateProfile); // Multer handles multipart/form-data
router.put('/change-password', authenticateToken, passwordStrength(), handleValidationErrors, userController.changePassword);

module.exports = router;
