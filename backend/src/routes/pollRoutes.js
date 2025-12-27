const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { authenticateToken, optionalAuth } = require('../middlewares/authMiddleware');
const { validatePollCreation, handleValidationErrors } = require('../middlewares/validators');

// Protected routes for poll management
router.post('/', authenticateToken, validatePollCreation, handleValidationErrors, pollController.createPoll);
router.get('/my-polls', authenticateToken, pollController.getMyPolls);
router.get('/:id/stats', authenticateToken, pollController.getPollStats);
router.put('/:id', authenticateToken, pollController.updatePoll);
router.delete('/:id', authenticateToken, pollController.cancelPoll);
router.get('/history/enhanced', authenticateToken, pollController.getEnhancedHistory);
router.get('/history', authenticateToken, pollController.getPollHistory);

// Public routes with optional auth (to check if user has voted)
router.get('/public', optionalAuth, pollController.listPublicPolls);
router.get('/:id', authenticateToken, pollController.getPollById); // Access depends on poll privacy and user membership

module.exports = router;
