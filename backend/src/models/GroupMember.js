const { pool } = require('../config/database');

const GroupMember = {
  addMember: async (groupId, userId, role, status) => {
    const [result] = await pool.execute(
      'INSERT INTO group_members (group_id, user_id, role, status) VALUES (?, ?, ?, ?)',
      [groupId, userId, role, status]
    );
    return result.insertId;
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM group_members WHERE id = ?', [id]);
    return rows[0];
  },

  findByGroupAndUser: async (groupId, userId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return rows[0];
  },

  findByGroup: async (groupId) => {
    const [rows] = await pool.execute(
      `SELECT gm.*, u.id as userId, u.username, u.email, u.avatar_url 
       FROM group_members gm 
       JOIN users u ON gm.user_id = u.id 
       WHERE gm.group_id = ?`,
      [groupId]
    );
    return rows;
  },

  findByUser: async (userId) => {
    const [rows] = await pool.execute(
      `SELECT gm.*, g.name as groupName, g.description, g.is_public 
       FROM group_members gm 
       JOIN \`groups\` g ON gm.group_id = g.id 
       WHERE gm.user_id = ? AND gm.status = 'approved'`,
      [userId]
    );
    return rows;
  },

  getPendingRequests: async (groupId) => {
    const [rows] = await pool.execute(
      `SELECT gm.id, gm.user_id, u.username, u.email, u.avatar_url, gm.joined_at 
       FROM group_members gm 
       JOIN users u ON gm.user_id = u.id 
       WHERE gm.group_id = ? AND gm.status = 'pending'`,
      [groupId]
    );
    return rows;
  },

  updateStatus: async (id, status) => {
    const [result] = await pool.execute(
      'UPDATE group_members SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows;
  },

  removeMember: async (groupId, userId) => {
    const [result] = await pool.execute(
      'DELETE FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return result.affectedRows;
  },

  countByGroup: async (groupId) => {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM group_members WHERE group_id = ? AND status = ?',
      [groupId, 'approved']
    );
    return rows[0].count;
  },
};

module.exports = GroupMember;
