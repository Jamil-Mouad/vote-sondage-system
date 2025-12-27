const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const { success, error } = require('../utils/responseHandler');
const { calculateResults, checkPollAccess, checkResultsAccess, getPollStats: getPollStatsService } = require('../services/pollService');
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
    const { question, description, options, endTime, isPublic, groupId, pollType, isBinary } = req.body;
    const createdBy = req.user.id;

    // Déterminer le type de poll
    let finalPollType = pollType || 'poll';
    let finalOptions = options;

    // Si c'est un sondage binaire, auto-générer les options Oui/Non
    if (isBinary) {
      finalPollType = 'binary_poll';
      finalOptions = [{ text: 'Oui' }, { text: 'Non' }];
    }

    // Les votes DOIVENT être dans un groupe et l'utilisateur doit être admin
    if (finalPollType === 'vote') {
      if (!groupId) {
        return error(res, 'Les votes doivent être créés dans un groupe.', 400, 'GROUP_REQUIRED');
      }
      const groupMember = await GroupMember.findByGroupAndUser(groupId, createdBy);
      if (!groupMember || groupMember.status !== 'approved' || groupMember.role !== 'admin') {
        return error(res, 'Seuls les admins du groupe peuvent créer des votes.', 403, 'ADMIN_REQUIRED');
      }
    }

    // Pour les polls de groupe (non-vote), vérifier le rôle admin
    if (groupId && finalPollType !== 'vote') {
      const groupMember = await GroupMember.findByGroupAndUser(groupId, createdBy);
      if (!groupMember || groupMember.status !== 'approved' || groupMember.role !== 'admin') {
        return error(res, 'Seuls les admins du groupe peuvent créer des sondages dans ce groupe.', 403, 'GROUP_ADMIN_REQUIRED');
      }
    }

    // Définir show_results_on_vote selon le type
    const showResultsOnVote = finalPollType === 'vote' ? false : true;

    const pollId = await Poll.create({
      question,
      description,
      options: finalOptions.map(opt => opt.text || opt), // Pass raw array of strings
      endTime: new Date(endTime),
      isPublic: finalPollType === 'vote' ? false : (isPublic || false), // Les votes sont toujours privés
      createdBy,
      groupId: groupId || null,
      pollType: finalPollType,
      showResultsOnVote,
    });

    // If it's a group poll, notify the group
    if (groupId) {
      notifyGroup(groupId, 'group:new-poll', { pollId, question, pollType: finalPollType });
    }

    success(res, { pollId }, `${finalPollType === 'vote' ? 'Vote' : 'Sondage'} créé avec succès.`, 201);
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

      // Utiliser checkResultsAccess pour déterminer si on peut voir les résultats
      let results = null;
      const canSeeResults = await checkResultsAccess(poll.id, req.user ? req.user.id : null);
      if (canSeeResults) {
        results = await calculateResults(poll.id);
      }

      return { ...poll, totalVotes, hasVoted, myVote, results, canSeeResults };
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

    // Utiliser checkResultsAccess pour déterminer si on peut voir les résultats
    const canSeeResults = await checkResultsAccess(id, userId);

    if (canSeeResults) {
      results = await calculateResults(id);
    }

    // Parse options
    poll.options = parseOptions(poll.options);

    success(res, { ...poll, results, hasVoted: !!userVoted, canSeeResults }, 'Poll details retrieved successfully.');
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

const getEnhancedHistory = async (req, res) => {
  console.log('Fetching enhanced history for user:', req.user.id);
  try {
    const userId = req.user.id;

    // Get all votes (type='vote') where user participated
    const votedVotes = await Poll.findVotesByUser(userId);

    // Get all polls (type='poll' or 'binary_poll') where user participated
    const votedPolls = await Vote.findPollsByUser(userId);

    // Filter to only include polls and binary_polls (exclude votes)
    const filteredPolls = votedPolls.filter(v => {
      return v.poll_type === 'poll' || v.poll_type === 'binary_poll';
    });

    // Map and enhance data
    const votes = votedVotes.map(v => ({
      ...v,
      options: parseOptions(v.options),
      myVote: v.myVote,
      isEnded: new Date(v.end_time) <= new Date() || v.status === 'ended'
    }));

    const polls = filteredPolls.map(p => ({
      ...p,
      options: parseOptions(p.options),
      myVote: p.option_selected,
      isEnded: new Date(p.end_time) <= new Date() || p.status === 'ended'
    }));

    success(res, { votes, polls }, 'History retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_HISTORY_FAILED');
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
  getEnhancedHistory,
};