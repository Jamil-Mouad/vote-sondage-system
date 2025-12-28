const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const GroupMember = require('../models/GroupMember');
const { pool } = require('../config/database');

const calculateResults = async (pollId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Poll not found.');
  }

  const voteDistribution = await Vote.getVoteDistribution(pollId);
  const totalVotes = await Vote.countByPoll(pollId);

  // Handle double-encoded JSON or already parsed options
  let options = poll.options;
  if (typeof options === 'string') {
    options = JSON.parse(options);
    // Check if it's still a string (double-encoded)
    if (typeof options === 'string') {
      options = JSON.parse(options);
    }
  }

  const results = options.map((option, index) => {
    const optionId = index + 1;
    const votes = voteDistribution[optionId] || 0;
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    return {
      index: optionId,
      text: option,
      votes,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  return {
    totalVotes,
    results,
  };
};

const checkPollAccess = async (userId, pollId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Poll not found.');
  }

  // Public polls are accessible to everyone
  if (poll.is_public) {
    return true;
  }

  // If it's a group poll, check if the user is a member of the group
  if (poll.group_id) {
    const groupMember = await GroupMember.findByGroupAndUser(poll.group_id, userId);
    if (groupMember && groupMember.status === 'approved') {
      return true;
    }
  }

  // If the user created the poll, they have access
  if (poll.created_by === userId) {
    return true;
  }

  return false;
};

const getPollStats = async (pollId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Poll not found.');
  }

  const totalVotes = await Vote.countByPoll(pollId);
  const voteDistribution = await Vote.getVoteDistribution(pollId);

  // Handle double-encoded JSON or already parsed options
  let options = poll.options;
  if (typeof options === 'string') {
    options = JSON.parse(options);
    // Check if it's still a string (double-encoded)
    if (typeof options === 'string') {
      options = JSON.parse(options);
    }
  }

  const votersList = await Vote.getVotersList(pollId);
  const votesOverTime = await Vote.getVotesOverTime(pollId);

  // Calculate participation rate based on group members if it's a group poll
  let participationRate = 0;
  if (poll.group_id) {
    const groupMembers = await GroupMember.findByGroup(poll.group_id);
    const approvedMembers = groupMembers.filter(m => m.status === 'approved').length;
    participationRate = approvedMembers > 0 ? (totalVotes / approvedMembers) * 100 : 0;
  }

  const optionStats = options.map((option, index) => {
    const optionId = index + 1;
    const votes = voteDistribution[optionId] || 0;
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    return {
      index: optionId,
      text: option,
      votes,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  // Format voters list by option
  const votersByOption = {};
  votersList.forEach(voter => {
    if (!votersByOption[voter.option_selected]) {
      votersByOption[voter.option_selected] = [];
    }
    votersByOption[voter.option_selected].push({
      id: voter.id,
      name: voter.username,
      email: voter.email,
      avatar: voter.avatar_url,
      votedAt: voter.voted_at,
    });
  });

  return {
    poll: {
      id: poll.id,
      question: poll.question,
      description: poll.description,
      options: options,
      endTime: poll.end_time,
      status: poll.status,
      isPublic: poll.is_public,
      createdAt: poll.created_at,
    },
    totalVotes,
    participationRate: parseFloat(participationRate.toFixed(2)),
    optionStats,
    votesOverTime,
    votersByOption,
  };
};

const checkResultsAccess = async (pollId, userId) => {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Poll not found');
  }

  const isEnded = new Date(poll.end_time) <= new Date() || poll.status === 'ended';
  const userVote = userId ? await Vote.findByPollAndUser(pollId, userId) : null;
  const isCreator = poll.created_by === userId;

  // Type 'vote': résultats uniquement après la fin ET si l'utilisateur a voté
  if (poll.poll_type === 'vote') {
    return isEnded && (userVote || isCreator);
  }

  // Type 'binary_poll' privé: temps réel pour les votants uniquement
  if (poll.poll_type === 'binary_poll' && !poll.is_public) {
    return userVote || isCreator || isEnded;
  }

  // Polls standards: afficher les résultats si voté ou terminé
  return poll.show_results_on_vote && (userVote || isCreator || isEnded);
};

const getGroupStatistics = async (groupId) => {
  // Get all approved members count
  const totalMembers = await GroupMember.countByGroup(groupId);

  // Get all polls for this group
  const [polls] = await pool.execute(
    'SELECT * FROM polls WHERE group_id = ? ORDER BY created_at DESC',
    [groupId]
  );

  // For each poll, get statistics
  const pollStats = await Promise.all(polls.map(async (poll) => {
    const totalVotes = await Vote.countByPoll(poll.id);
    const participationRate = totalMembers > 0 ? (totalVotes / totalMembers) * 100 : 0;

    // Get top 5 earliest voters
    const [topVoters] = await pool.execute(
      `SELECT v.voted_at, u.id, u.username, u.email, u.avatar_url
       FROM votes v
       JOIN users u ON v.user_id = u.id
       WHERE v.poll_id = ?
       ORDER BY v.voted_at ASC
       LIMIT 5`,
      [poll.id]
    );

    // Parse options
    let options = poll.options;
    if (typeof options === 'string') {
      options = JSON.parse(options);
      if (typeof options === 'string') {
        options = JSON.parse(options);
      }
    }

    return {
      pollId: poll.id,
      question: poll.question,
      pollType: poll.poll_type,
      status: poll.status,
      endTime: poll.end_time,
      totalVotes,
      totalMembers,
      participationRate: parseFloat(participationRate.toFixed(2)),
      topVoters: topVoters.map(v => ({
        id: v.id,
        name: v.username,
        email: v.email,
        avatar: v.avatar_url,
        votedAt: v.voted_at
      }))
    };
  }));

  return {
    groupId,
    totalMembers,
    polls: pollStats
  };
};

module.exports = {
  calculateResults,
  checkPollAccess,
  checkResultsAccess,
  getPollStats,
  getGroupStatistics,
};
