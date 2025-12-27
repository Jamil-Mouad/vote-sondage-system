const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Public routes
router.get('/public', groupController.listPublicGroups);

// Protected routes
router.post('/', authenticateToken, groupController.createGroup);
router.get('/my-groups', authenticateToken, groupController.getMyGroups);
router.get('/:id', authenticateToken, groupController.getGroupById);
router.post('/:id/join', authenticateToken, groupController.requestToJoinGroup);
router.delete('/:id/leave', authenticateToken, groupController.leaveGroup);
router.get('/:id/requests', authenticateToken, groupController.getPendingRequests);
router.put('/:id/requests/:requestId', authenticateToken, groupController.handleJoinRequest);
router.delete('/:id', authenticateToken, groupController.deleteGroup);
router.get('/:id/polls', authenticateToken, groupController.getGroupPolls);
router.get('/:id/statistics', authenticateToken, groupController.getGroupStatisticsController);

module.exports = router;
