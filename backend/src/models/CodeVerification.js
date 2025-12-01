const { pool } = require('../config/database');

const CodeVerification = {
  create: async (userId, code, type, expiresAt) => {
    const [result] = await pool.execute(
      'INSERT INTO code_verification (user_id, code, type, expires_at, is_used) VALUES (?, ?, ?, ?, ?)',
      [userId, code, type, expiresAt, 0]
    );
    return result.insertId;
  },

  findByUserAndCode: async (userId, code, type) => {
    const [rows] = await pool.execute(
      'SELECT * FROM code_verification WHERE user_id = ? AND code = ? AND type = ? AND is_used = 0 AND expires_at > NOW()',
      [userId, code, type]
    );
    return rows[0];
  },

  markAsUsed: async (id) => {
    const [result] = await pool.execute(
      'UPDATE code_verification SET is_used = 1 WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  },

  deleteExpired: async () => {
    const [result] = await pool.execute(
      'DELETE FROM code_verification WHERE expires_at < NOW()'
    );
    return result.affectedRows;
  },
};

module.exports = CodeVerification;
