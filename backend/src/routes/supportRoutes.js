const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Protected routes
router.post('/message', authenticateToken, supportController.sendMessage);

// Public routes
router.get('/help', supportController.getHelp);

module.exports = router;
