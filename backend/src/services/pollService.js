const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const GroupMember = require('../models/GroupMember');

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
      option, // Assuming options are stored as an array of strings
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
      option,
      optionIndex: optionId,
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

module.exports = {
  calculateResults,
  checkPollAccess,
  getPollStats,
};
