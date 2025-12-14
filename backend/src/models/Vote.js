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

  findPollsByUser: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT v.*, p.question, p.description, p.options, p.end_time, p.status, p.is_public, p.created_by, p.group_id, p.created_at
       FROM votes v 
       JOIN polls p ON v.poll_id = p.id 
       WHERE v.user_id = ? 
       ORDER BY v.voted_at DESC`,
      [userId]
    );
    return rows;
  },

  getVotersList: async (pollId) => {
    const [rows] = await pool.execute(
      `SELECT v.option_selected, v.voted_at, u.id, u.username, u.email, u.avatar_url
       FROM votes v 
       JOIN users u ON v.user_id = u.id 
       WHERE v.poll_id = ? 
       ORDER BY v.voted_at DESC`,
      [pollId]
    );
    return rows;
  },

  getVotesOverTime: async (pollId) => {
    const [rows] = await pool.execute(
      `SELECT DATE(voted_at) as date, COUNT(*) as count 
       FROM votes 
       WHERE poll_id = ? 
       GROUP BY DATE(voted_at) 
       ORDER BY date ASC`,
      [pollId]
    );
    return rows;
  },
};

module.exports = Vote;
