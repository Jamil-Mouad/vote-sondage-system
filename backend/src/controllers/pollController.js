const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { success, error } = require('../utils/responseHandler');
const { calculateResults, checkPollAccess, getPollStats: getPollStatsService } = require('../services/pollService');
const { emitPollUpdated, emitPollEnded, notifyGroup } = require('../services/socketService'); // Assuming these exist in socketService

// Helper function to safely parse options (handles double-encoded JSON)
const parseOptions = (options) => {
  if (Array.isArray(options)) return options;
  if (typeof options === 'string') {
    let parsed = JSON.parse(options);
    // Check if it's still a string (double-encoded)
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return parsed;
  }
  return options;
};

const createPoll = async (req, res) => {
  try {
    const { question, description, options, endTime, isPublic, groupId } = req.body;
    const createdBy = req.user.id;

    if (groupId) {
      const groupMember = await GroupMember.findByGroupAndUser(groupId, createdBy);
      if (!groupMember || groupMember.status !== 'approved' || groupMember.role !== 'admin') {
        return error(res, 'Only group admins can create polls in this group.', 403, 'GROUP_ADMIN_REQUIRED');
      }
    }

    const pollId = await Poll.create({
      question,
      description,
      options: options.map(opt => opt.text), // Pass raw array of strings
      endTime: new Date(endTime),
      isPublic: isPublic || false,
      createdBy,
      groupId: groupId || null,
    });

    // If it's a group poll, notify the group
    if (groupId) {
      notifyGroup(groupId, 'group:new-poll', { pollId, question });
    }

    success(res, { pollId }, 'Poll created successfully.', 201);
  } catch (err) {
    error(res, err.message, 500, 'POLL_CREATION_FAILED');
  }
};

const listPublicPolls = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'active', search } = req.query;
    const offset = (page - 1) * limit;

    const filters = { status, search };
    const pagination = { limit: parseInt(limit), offset: parseInt(offset) };

    let polls = await Poll.findPublic(filters, pagination);

    // For each poll, include totalVotes, hasVoted, and myVote
    polls = await Promise.all(polls.map(async poll => {
      const totalVotes = await Vote.countByPoll(poll.id);
      let hasVoted = false;
      let myVote = null;

      if (req.user) { // Check if user is authenticated
        const userVote = await Vote.findByPollAndUser(poll.id, req.user.id);
        if (userVote) {
          hasVoted = true;
          myVote = userVote.option_selected;
        }
      }

      // Parse options from JSON string back to array
      poll.options = parseOptions(poll.options);

      // Get results if user has voted or poll ended
      let results = null;
      const isEnded = new Date(poll.end_time) <= new Date() || poll.status === 'ended';
      if (hasVoted || isEnded) {
        results = await calculateResults(poll.id);
      }

      return { ...poll, totalVotes, hasVoted, myVote, results };
    }));

    success(res, polls, 'Public polls retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_PUBLIC_POLLS_FAILED');
  }
};

const getPollById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const poll = await Poll.findById(id);
    if (!poll) {
      return error(res, 'Poll not found.', 404, 'POLL_NOT_FOUND');
    }

    // Check access for private polls
    const hasAccess = await checkPollAccess(userId, id);
    if (!hasAccess) {
      return error(res, 'Forbidden: You do not have access to this poll.', 403, 'POLL_ACCESS_DENIED');
    }

    let results = null;
    const userVoted = userId ? await Vote.findByPollAndUser(id, userId) : null;
    const isCreator = poll.created_by === userId;
    const isEnded = new Date(poll.end_time) <= new Date();

    if (isEnded || userVoted || isCreator) {
      results = await calculateResults(id);
    }

    // Parse options
    poll.options = parseOptions(poll.options);

    success(res, { ...poll, results, hasVoted: !!userVoted }, 'Poll details retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_POLL_DETAILS_FAILED');
  }
};

const getMyPolls = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const filters = { status, page: parseInt(page), limit: parseInt(limit) };
    let polls = await Poll.findByCreator(userId, filters);

    polls = await Promise.all(polls.map(async poll => {
      const totalVotes = await Vote.countByPoll(poll.id);
      poll.options = parseOptions(poll.options);
      return { ...poll, totalVotes };
    }));

    success(res, polls, 'My polls retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_MY_POLLS_FAILED');
  }
};

const getPollStats = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const poll = await Poll.findById(id);
    if (!poll) {
      return error(res, 'Poll not found.', 404, 'POLL_NOT_FOUND');
    }

    if (poll.created_by !== userId) {
      return error(res, 'Forbidden: Only the creator can view poll statistics.', 403, 'FORBIDDEN');
    }

    const stats = await getPollStatsService(id);

    success(res, stats, 'Poll statistics retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_POLL_STATS_FAILED');
  }
};

const updatePoll = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { question, description, endTime } = req.body;

    const poll = await Poll.findById(id);
    if (!poll) {
      return error(res, 'Poll not found.', 404, 'POLL_NOT_FOUND');
    }

    if (poll.created_by !== userId) {
      return error(res, 'Forbidden: Only the creator can update this poll.', 403, 'FORBIDDEN');
    }

    const updates = {};
    if (question) updates.question = question;
    if (description) updates.description = description;
    if (endTime) {
      // Allow prolonging endTime only
      if (new Date(endTime) <= new Date(poll.end_time)) {
        return error(res, 'New end time must be after the current end time.', 400, 'INVALID_END_TIME');
      }
      updates.end_time = new Date(endTime);
    }

    // Do not allow modification of options if votes exist
    const totalVotes = await Vote.countByPoll(id);
    if (totalVotes > 0 && req.body.options) {
      return error(res, 'Cannot modify poll options after votes have been cast.', 400, 'OPTIONS_MODIFICATION_DENIED');
    }

    if (Object.keys(updates).length === 0) {
      return error(res, 'No update data provided.', 400, 'NO_DATA_PROVIDED');
    }

    await Poll.update(id, updates);

    // Emit socket event if poll is updated
    emitPollUpdated(id, updates); // Assuming emitPollUpdated exists in socketService

    success(res, null, 'Poll updated successfully.');
  } catch (err) {
    error(res, err.message, 500, 'POLL_UPDATE_FAILED');
  }
};

const cancelPoll = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const poll = await Poll.findById(id);
    if (!poll) {
      return error(res, 'Poll not found.', 404, 'POLL_NOT_FOUND');
    }

    if (poll.created_by !== userId) {
      return error(res, 'Forbidden: Only the creator can cancel this poll.', 403, 'FORBIDDEN');
    }

    await Poll.updateStatus(id, 'cancelled');

    success(res, null, 'Poll cancelled successfully.');
  } catch (err) {
    error(res, err.message, 500, 'POLL_CANCELLATION_FAILED');
  }
};

const getPollHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const votedPolls = await Vote.findPollsByUser(userId); // Assuming findPollsByUser returns poll details with vote info

    const activePolls = [];
    const endedPolls = [];

    for (const vote of votedPolls) {
      const poll = await Poll.findById(vote.poll_id);
      if (poll) {
        const isEnded = new Date(poll.end_time) <= new Date();
        const myVote = vote.option_selected;
        const myVoteText = parseOptions(poll.options)[myVote - 1]; // Assuming option_selected is 1-indexed

        let results = null;
        if (isEnded) {
          results = await calculateResults(poll.id);
        }

        const pollWithVoteInfo = {
          ...poll,
          myVote,
          myVoteText,
          results,
        };

        if (isEnded) {
          endedPolls.push(pollWithVoteInfo);
        } else {
          activePolls.push(pollWithVoteInfo);
        }
      }
    }

    success(res, { activePolls, endedPolls }, 'Poll history retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_POLL_HISTORY_FAILED');
  }
};

module.exports = {
  createPoll,
  listPublicPolls,
  getPollById,
  getMyPolls,
  getPollStats,
  updatePoll,
  cancelPoll,
  getPollHistory,
};
