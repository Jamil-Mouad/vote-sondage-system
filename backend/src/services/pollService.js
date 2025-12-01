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
  const options = JSON.parse(poll.options);

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
  const options = JSON.parse(poll.options);

  const participationRate = totalVotes > 0 ? (totalVotes / 100) * 100 : 0; // Assuming 100 is max potential voters for simplicity for now

  const optionStats = options.map((option, index) => {
    const optionId = index + 1;
    const votes = voteDistribution[optionId] || 0;
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    return {
      option,
      votes,
      percentage: parseFloat(percentage.toFixed(2)),
    };
  });

  // For simplicity, votes over time and list of voters are not implemented here
  // as they would require more complex database queries and potentially a separate model for vote history.

  return {
    totalVotes,
    participationRate: parseFloat(participationRate.toFixed(2)),
    optionStats,
    // votesOverTime: [], // Placeholder
    // listOfVoters: [], // Placeholder
  };
};

module.exports = {
  calculateResults,
  checkPollAccess,
  getPollStats,
};
