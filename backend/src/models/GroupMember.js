const { pool } = require('../config/database');

const GroupMember = {
  addMember: async (groupId, userId, role, status) => {
    const [result] = await pool.execute(
      'INSERT INTO group_members (group_id, user_id, role, status) VALUES (?, ?, ?, ?)',
      [groupId, userId, role, status]
    );
    return result.insertId;
  },

  findByGroupAndUser: async (groupId, userId) => {
    const [rows] = await pool.execute(
      'SELECT * FROM group_members WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    return rows[0];
  },

  getPendingRequests: async (groupId) => {
    const [rows] = await pool.execute(
      'SELECT gm.id, u.username, u.email FROM group_members gm JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ? AND gm.status = \'pending\'',
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
};

module.exports = GroupMember;
