const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const GroupMember = require('../models/GroupMember');
const { success, error } = require('../utils/responseHandler');
const { calculateResults, checkPollAccess } = require('../services/pollService');
const { emitVoteUpdate } = require('../services/socketService');

const vote = async (req, res) => {
  try {
    const { pollId, optionSelected } = req.body;
    const userId = req.user.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return error(res, 'Poll not found.', 404, 'POLL_NOT_FOUND');
    }

    if (poll.created_by === userId) {
      return error(res, 'Forbidden: Poll creator cannot vote on their own poll.', 403, 'CREATOR_CANNOT_VOTE');
    }

    const existingVote = await Vote.findByPollAndUser(pollId, userId);
    if (existingVote) {
      return error(res, 'Conflict: User has already voted on this poll.', 409, 'ALREADY_VOTED');
    }

    if (poll.status !== 'active' || new Date(poll.end_time) <= new Date()) {
      return error(res, 'Bad Request: Poll is not active or has ended.', 400, 'POLL_NOT_ACTIVE');
    }

    if (poll.group_id) {
      const groupMember = await GroupMember.findByGroupAndUser(poll.group_id, userId);
      if (!groupMember || groupMember.status !== 'approved') {
        return error(res, 'Forbidden: You are not an approved member of this group.', 403, 'GROUP_MEMBERSHIP_REQUIRED');
      }
    }

    await Vote.create(pollId, userId, optionSelected);

    const updatedResults = await calculateResults(pollId);
    emitVoteUpdate(pollId, updatedResults); // Emit Socket.IO event

    success(res, { results: updatedResults }, 'Vote cast successfully.', 201);
  } catch (err) {
    error(res, err.message, 500, 'VOTE_FAILED');
  }
};

const checkIfVoted = async (req, res) => {
  try {
    const { pollId } = req.params;
    const userId = req.user.id;

    const vote = await Vote.findByPollAndUser(pollId, userId);

    if (vote) {
      success(res, { hasVoted: true, optionSelected: vote.option_selected, votedAt: vote.voted_at }, 'User has voted on this poll.');
    } else {
      success(res, { hasVoted: false }, 'User has not voted on this poll.');
    }
  } catch (err) {
    error(res, err.message, 500, 'CHECK_VOTE_FAILED');
  }
};

module.exports = {
  vote,
  checkIfVoted,
};
