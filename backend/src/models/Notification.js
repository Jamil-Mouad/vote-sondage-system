const { pool } = require('../config/database');

const Notification = {
    create: async (data) => {
        const { userId, title, message, type, link } = data;
        const [result] = await pool.execute(
            'INSERT INTO notifications (user_id, title, message, type, link) VALUES (?, ?, ?, ?, ?)',
            [userId, title, message, type || 'info', link || null]
        );
        return result.insertId;
    },

    findByUser: async (userId) => {
        const [rows] = await pool.execute(
            'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        return rows;
    },

    markAsRead: async (id, userId) => {
        const [result] = await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    },

    markAllAsRead: async (userId) => {
        const [result] = await pool.execute(
            'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
            [userId]
        );
        return result.affectedRows;
    },

    delete: async (id, userId) => {
        const [result] = await pool.execute(
            'DELETE FROM notifications WHERE id = ? AND user_id = ?',
            [id, userId]
        );
        return result.affectedRows;
    }
};

module.exports = Notification;
