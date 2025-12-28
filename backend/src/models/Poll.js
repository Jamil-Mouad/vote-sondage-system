const { pool } = require('../config/database');

const Poll = {
  create: async (pollData) => {
    const { question, description, options, endTime, isPublic, createdBy, groupId, pollType, showResultsOnVote } = pollData;
    const [result] = await pool.execute(
      'INSERT INTO polls (question, description, options, end_time, is_public, created_by, group_id, poll_type, show_results_on_vote) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [question, description, JSON.stringify(options), endTime, isPublic, createdBy, groupId, pollType || 'poll', showResultsOnVote !== undefined ? showResultsOnVote : true]
    );
    return result.insertId;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM polls WHERE id = ?', [id]);
    return rows[0];
  },

  findByIdWithCreator: async (id) => {
    const [rows] = await pool.execute(
      `SELECT p.*, u.id as creatorId, u.username as creatorName, u.avatar_url as creatorAvatar 
       FROM polls p 
       LEFT JOIN users u ON p.created_by = u.id 
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  findPublic: async (filters, pagination) => {
    let query = `
      SELECT p.*, u.username as creatorName, u.avatar_url as creatorAvatar,
      (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as totalVotes
      FROM polls p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.is_public = 1`;
    const params = [];

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        query += ' AND p.status = ? AND p.end_time > UTC_TIMESTAMP()';
        params.push('active');
      } else if (filters.status === 'ended') {
        query += ' AND (p.status = ? OR p.end_time <= UTC_TIMESTAMP())';
        params.push('ended');
      } else {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
    }

    if (filters.search) {
      query += ' AND (p.question LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    query += ' ORDER BY p.created_at DESC';

    if (pagination.limit && pagination.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(pagination.limit), parseInt(pagination.offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  countPublic: async (filters) => {
    let query = 'SELECT COUNT(*) as total FROM polls p WHERE p.is_public = 1';
    const params = [];

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        query += ' AND p.status = ? AND p.end_time > UTC_TIMESTAMP()';
        params.push('active');
      } else if (filters.status === 'ended') {
        query += ' AND (p.status = ? OR p.end_time <= UTC_TIMESTAMP())';
        params.push('ended');
      } else {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
    }

    if (filters.search) {
      query += ' AND (p.question LIKE ? OR p.description LIKE ?)';
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  findByCreator: async (userId, filters) => {
    let query = `
      SELECT p.*, 
      (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as totalVotes
      FROM polls p 
      WHERE p.created_by = ?`;
    const params = [userId];

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        query += ' AND p.status = ? AND p.end_time > UTC_TIMESTAMP()';
        params.push('active');
      } else if (filters.status === 'ended') {
        query += ' AND (p.status = ? OR p.end_time <= UTC_TIMESTAMP())';
        params.push('ended');
      } else {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  countByCreator: async (userId, filters) => {
    let query = 'SELECT COUNT(*) as total FROM polls p WHERE p.created_by = ?';
    const params = [userId];

    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'active') {
        query += ' AND p.status = ? AND p.end_time > UTC_TIMESTAMP()';
        params.push('active');
      } else if (filters.status === 'ended') {
        query += ' AND (p.status = ? OR p.end_time <= UTC_TIMESTAMP())';
        params.push('ended');
      } else {
        query += ' AND p.status = ?';
        params.push(filters.status);
      }
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  },

  findByGroup: async (groupId, filters = {}) => {
    let query = `
      SELECT p.*, u.username as creatorName, u.avatar_url as creatorAvatar,
      (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as totalVotes
      FROM polls p 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.group_id = ?`;
    const params = [groupId];

    if (filters.status && filters.status !== 'all') {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];

    const fieldMapping = {
      question: 'question',
      description: 'description',
      endTime: 'end_time',
      end_time: 'end_time',
      status: 'status',
      isPublic: 'is_public',
      is_public: 'is_public',
    };

    for (const key in updates) {
      const dbField = fieldMapping[key] || key;
      fields.push(`${dbField} = ?`);
      values.push(updates[key]);
    }
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE polls SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  updateStatus: async (id, status) => {
    const [result] = await pool.execute(
      'UPDATE polls SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    // First delete all votes for this poll
    await pool.execute('DELETE FROM votes WHERE poll_id = ?', [id]);
    // Then delete the poll
    const [result] = await pool.execute('DELETE FROM polls WHERE id = ?', [id]);
    return result.affectedRows;
  },

  findActivePollsEndingSoon: async () => {
    const [rows] = await pool.execute(
      'SELECT id, question FROM polls WHERE status = ? AND end_time <= UTC_TIMESTAMP()',
      ['active']
    );
    return rows;
  },

  // Get user stats
  getUserStats: async (userId) => {
    const [created] = await pool.execute(
      'SELECT COUNT(*) as count FROM polls WHERE created_by = ?',
      [userId]
    );
    const [activeCreated] = await pool.execute(
      'SELECT COUNT(*) as count FROM polls WHERE created_by = ? AND status = ? AND end_time > UTC_TIMESTAMP()',
      [userId, 'active']
    );
    return {
      totalCreated: created[0].count,
      activeCreated: activeCreated[0].count,
    };
  },

  // Find votes where user participated
  findVotesByUser: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT p.*, u.username as creatorName, u.avatar_url as creatorAvatar,
       (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as totalVotes,
       v.option_selected as myVote, v.voted_at
       FROM polls p
       LEFT JOIN users u ON p.created_by = u.id
       JOIN votes v ON p.id = v.poll_id
       WHERE v.user_id = ? AND p.poll_type = 'vote'
       ORDER BY v.voted_at DESC`,
      [userId]
    );
    return rows;
  },

  // Find polls by type
  findByType: async (type, filters = {}) => {
    let query = `
      SELECT p.*, u.username as creatorName, u.avatar_url as creatorAvatar,
      (SELECT COUNT(*) FROM votes v WHERE v.poll_id = p.id) as totalVotes
      FROM polls p
      LEFT JOIN users u ON p.created_by = u.id
      WHERE p.poll_type = ?`;
    const params = [type];

    if (filters.status && filters.status !== 'all') {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.groupId) {
      query += ' AND p.group_id = ?';
      params.push(filters.groupId);
    }

    query += ' ORDER BY p.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },
};

module.exports = Poll;
