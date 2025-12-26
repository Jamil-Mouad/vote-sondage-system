const { pool } = require('../config/database');

const Group = {
  create: async (groupData) => {
    const { name, description, isPublic, createdBy } = groupData;
    const [result] = await pool.execute(
      'INSERT INTO groups (name, description, is_public, created_by) VALUES (?, ?, ?, ?)',
      [name, description, isPublic, createdBy]
    );
    return result.insertId;
  },

  findById: async (id) => {
    const [rows] = await pool.execute(
      `SELECT g.*, 
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'approved') as membersCount
       FROM groups g WHERE g.id = ?`,
      [id]
    );
    return rows[0];
  },

  findPublic: async (filters) => {
    let query = 'SELECT g.*, COUNT(gm.id) AS membersCount FROM groups g LEFT JOIN group_members gm ON g.id = gm.group_id AND gm.status = \'approved\' WHERE g.is_public = 1';
    const params = [];

    if (filters.search) {
      query += ' AND g.name LIKE ?';
      params.push(`%${filters.search}%`);
    }

    query += ' GROUP BY g.id ORDER BY g.created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  findByUser: async (userId) => {
    const [createdGroups] = await pool.execute(
      `SELECT g.*, 'admin' as role, 'approved' as status,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'pending') AS pendingRequests,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'approved') AS membersCount
       FROM groups g WHERE g.created_by = ?`,
      [userId]
    );
    const [joinedGroups] = await pool.execute(
      `SELECT g.*, gm.role, gm.status,
       (SELECT COUNT(*) FROM group_members WHERE group_id = g.id AND status = 'approved') AS membersCount
       FROM groups g JOIN group_members gm ON g.id = gm.group_id 
       WHERE gm.user_id = ? AND gm.status = 'approved' AND g.created_by != ?`,
      [userId, userId]
    );
    return { created: createdGroups, joined: joinedGroups };
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    for (const key in updates) {
      if (updates[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE groups SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  delete: async (id) => {
    // Note: Deleting a group should ideally cascade delete its members and update associated polls.
    // For polls, we set group_id to NULL as per prompt.
    await pool.execute('UPDATE polls SET group_id = NULL WHERE group_id = ?', [id]);
    const [result] = await pool.execute('DELETE FROM groups WHERE id = ?', [id]);
    return result.affectedRows; // Will also cascade delete from group_members if ON DELETE CASCADE is set up in DB.
  },
};

module.exports = Group;
