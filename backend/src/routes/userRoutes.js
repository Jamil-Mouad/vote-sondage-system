const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);

// Password route
router.put('/change-password', userController.changePassword);

// Notification preferences routes
router.get('/notifications', userController.getNotificationPreferences);
router.put('/notifications', userController.updateNotificationPreferences);

// Account deletion
router.delete('/account', userController.deleteAccount);

module.exports = router;
