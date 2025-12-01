const { pool } = require('../config/database');

const User = {
  create: async (userData) => {
    const { username, email, password, firstName, lastName, avatarUrl } = userData;
    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, first_name, last_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password, firstName, lastName, avatarUrl]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  findByUsername: async (username) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  },

  update: async (id, updates) => {
    const fields = [];
    const values = [];
    for (const key in updates) {
      if (updates[key] !== undefined) { // Only add fields that are provided
        fields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    }
    values.push(id);
    const [result] = await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows;
  },

  updatePassword: async (id, hashedPassword) => {
    const [result] = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  },
};

module.exports = User;
