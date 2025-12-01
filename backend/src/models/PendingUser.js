const { pool } = require('../config/database');

const PendingUser = {
  create: async (userData, code, expiresAt) => {
    const { username, email, password } = userData;
    const [result] = await pool.execute(
      'INSERT INTO pending_users (username, email, password, verification_code, code_expires_at) VALUES (?, ?, ?, ?, ?)',
      [username, email, password, code, expiresAt]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute('SELECT * FROM pending_users WHERE email = ?', [email]);
    return rows[0];
  },

  deleteByEmail: async (email) => {
    const [result] = await pool.execute('DELETE FROM pending_users WHERE email = ?', [email]);
    return result.affectedRows;
  },

  deleteExpired: async () => {
    const [result] = await pool.execute('DELETE FROM pending_users WHERE code_expires_at < NOW()');
    return result.affectedRows;
  },
};

module.exports = PendingUser;
