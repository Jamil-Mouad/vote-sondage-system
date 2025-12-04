const { pool } = require('../config/database');

const CodeVerification = {
  create: async (userId, code, type, expiresAt) => {
    const [result] = await pool.execute(
      'INSERT INTO code_verifications (user_id, code, type, expires_at, used) VALUES (?, ?, ?, ?, ?)',
      [userId, code, type, expiresAt, 0]
    );
    return result.insertId;
  },

  findByUserAndCode: async (userId, code, type) => {
    const [rows] = await pool.execute(
      'SELECT * FROM code_verifications WHERE user_id = ? AND code = ? AND type = ? AND used = 0 AND expires_at > UTC_TIMESTAMP()',
      [userId, code, type]
    );
    return rows[0];
  },

  markAsUsed: async (id) => {
    const [result] = await pool.execute(
      'UPDATE code_verifications SET used = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  },

  deleteExpired: async () => {
    const [result] = await pool.execute(
      'DELETE FROM code_verifications WHERE expires_at < UTC_TIMESTAMP()'
    );
    return result.affectedRows;
  },
};

module.exports = CodeVerification;
