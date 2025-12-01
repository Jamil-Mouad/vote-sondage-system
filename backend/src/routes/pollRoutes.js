const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { validatePollCreation, handleValidationErrors } = require('../middlewares/validators');

// Protected routes for poll management
router.post('/', authenticateToken, validatePollCreation, handleValidationErrors, pollController.createPoll);
router.get('/my-polls', authenticateToken, pollController.getMyPolls);
router.get('/:id/stats', authenticateToken, pollController.getPollStats);
router.put('/:id', authenticateToken, pollController.updatePoll);
router.delete('/:id', authenticateToken, pollController.cancelPoll);
router.get('/history', authenticateToken, pollController.getPollHistory);

// Public and Protected (depending on poll status) routes
router.get('/public', pollController.listPublicPolls);
router.get('/:id', authenticateToken, pollController.getPollById); // Access depends on poll privacy and user membership

module.exports = router;
