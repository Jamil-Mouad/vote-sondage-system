const { pool } = require('../config/database');

const Vote = {
  create: async (pollId, userId, optionSelected) => {
    const [result] = await pool.execute(
      'INSERT INTO votes (poll_id, user_id, option_selected) VALUES (?, ?, ?)',
      [pollId, userId, optionSelected]
    );
    return result.insertId;
  },

  findByPollAndUser: async (pollId, userId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM votes WHERE poll_id = ? AND user_id = ?',
      [pollId, userId]
    );
    return rows[0];
  },

  countByPoll: async (pollId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as totalVotes FROM votes WHERE poll_id = ?',
      [pollId]
    );
    return rows[0].totalVotes;
  },

  getVoteDistribution: async (pollId) => {
    const [rows] = await pool.execute(
      'SELECT option_selected, COUNT(*) as count FROM votes WHERE poll_id = ? GROUP BY option_selected',
      [pollId]
    );
    const distribution = {};
    rows.forEach(row => {
      distribution[row.option_selected] = row.count;
    });
    return distribution;
  },
};

module.exports = Vote;
