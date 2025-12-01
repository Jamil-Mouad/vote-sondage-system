const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { voteLimiter } = require('../middlewares/rateLimiter');
const { validateVote, handleValidationErrors } = require('../middlewares/validators');

// Protected routes for voting
router.post('/', authenticateToken, voteLimiter, validateVote, handleValidationErrors, voteController.vote);
router.get('/check/:pollId', authenticateToken, voteController.checkIfVoted);

module.exports = router;
