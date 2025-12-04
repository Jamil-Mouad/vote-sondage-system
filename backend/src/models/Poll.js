const { pool } = require('../config/database');

const Poll = {
  create: async (pollData) => {
    const { question, description, options, endTime, isPublic, createdBy, groupId } = pollData;
    const [result] = await pool.execute(
      'INSERT INTO polls (question, description, options, end_time, is_public, created_by, group_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [question, description, JSON.stringify(options), endTime, isPublic, createdBy, groupId]
    );
    return result.insertId;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM polls WHERE id = ?', [id]);
    return rows[0];
  },

  findPublic: async (filters, pagination) => {
    let query = `SELECT p.*, u.username as created_by_username, u.avatar_url as created_by_avatar, COUNT(v.id) as totalVotes, (
      SELECT GROUP_CONCAT(CONCAT_WS(':', v2.option_selected, COUNT(v2.id)))
      FROM votes v2 WHERE v2.poll_id = p.id GROUP BY v2.option_selected
    ) as voteDistribution FROM polls p LEFT JOIN votes v ON p.id = v.poll_id LEFT JOIN users u ON p.created_by = u.id WHERE p.is_public = 1`;
    const params = [];

    if (filters.status && filters.status !== 'all') {
      query += ' AND p.status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND p.question LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' GROUP BY p.id ORDER BY p.created_at DESC';

    if (pagination.limit && pagination.offset !== undefined) {
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(pagination.limit), parseInt(pagination.offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  findByCreator: async (userId, filters) => {
    let query = 'SELECT * FROM polls WHERE created_by = ?';
    const params = [userId];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.page && filters.limit) {
      const offset = (filters.page - 1) * filters.limit;
      query += ' LIMIT ? OFFSET ?';
      params.push(parseInt(filters.limit), parseInt(offset));
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    for (const key in updates) {
      fields.push(`${key} = ?`);
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

  findActivePollsEndingSoon: async () => {
    const [rows] = await pool.execute(
      'SELECT id, question FROM polls WHERE status = ? AND end_time <= NOW()',
      ['active']
    );
    return rows;
  },
};

module.exports = Poll;
