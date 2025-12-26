const Notification = require('../models/Notification');
const { success, error } = require('../utils/responseHandler');

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findByUser(userId);
        success(res, notifications, 'Notifications retrieved successfully.');
    } catch (err) {
        error(res, err.message, 500, 'FETCH_NOTIFICATIONS_FAILED');
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await Notification.markAsRead(id, userId);
        success(res, null, 'Notification marked as read.');
    } catch (err) {
        error(res, err.message, 500, 'MARK_NOTIFICATION_READ_FAILED');
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await Notification.markAllAsRead(userId);
        success(res, null, 'All notifications marked as read.');
    } catch (err) {
        error(res, err.message, 500, 'MARK_ALL_NOTIFICATIONS_READ_FAILED');
    }
};

const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        await Notification.delete(id, userId);
        success(res, null, 'Notification deleted.');
    } catch (err) {
        error(res, err.message, 500, 'DELETE_NOTIFICATION_FAILED');
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
};
