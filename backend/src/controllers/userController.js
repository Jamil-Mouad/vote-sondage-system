const User = require('../models/User');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const GroupMember = require('../models/GroupMember');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const { success, error } = require('../utils/responseHandler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer configuration for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/avatars');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, .png files are allowed!'), false);
  }
};

const uploadAvatar = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 2MB limit
  },
  fileFilter: fileFilter
}).single('avatar');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    // Get user statistics
    const createdPolls = await Poll.findByCreator(userId, {});
    const votedPolls = await Vote.findByUser(userId);
    const joinedGroups = await GroupMember.findGroupsByUser(userId);

    success(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role,
        phone: user.phone,
        bio: user.bio,
      },
      stats: {
        pollsCreated: createdPolls ? createdPolls.length : 0,
        votesSubmitted: votedPolls ? votedPolls.length : 0,
        groupsJoined: joinedGroups ? joinedGroups.length : 0,
      },
    }, 'User profile retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'GET_PROFILE_FAILED');
  }
};

const updateProfile = async (req, res) => {
  try {
    uploadAvatar(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        return error(res, err.message, 400, 'UPLOAD_ERROR');
      } else if (err) {
        return error(res, err.message, 400, 'UPLOAD_ERROR');
      }

      const userId = req.user.id;
      const { username, firstName, lastName, phone, bio } = req.body;
      let avatarUrl = null;

      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
        // Delete old avatar if exists
        const oldUser = await User.findById(userId);
        if (oldUser && oldUser.avatar_url) {
          const oldAvatarPath = path.join(__dirname, '../..', oldUser.avatar_url);
          if (fs.existsSync(oldAvatarPath)) {
            try {
              fs.unlinkSync(oldAvatarPath);
            } catch (e) {
              console.error('Failed to delete old avatar:', e);
            }
          }
        }
      }

      const updates = {};
      if (username) updates.username = username;
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
      if (phone !== undefined) updates.phone = phone;
      if (bio !== undefined) updates.bio = bio;
      if (avatarUrl) updates.avatar_url = avatarUrl;

      if (Object.keys(updates).length === 0) {
        return error(res, 'No update data provided.', 400, 'NO_DATA_PROVIDED');
      }

      const affectedRows = await User.update(userId, updates);

      if (affectedRows === 0) {
        return error(res, 'User not found or no changes made.', 404, 'UPDATE_PROFILE_FAILED');
      }

      const updatedUser = await User.findById(userId);
      success(res, {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.first_name,
          lastName: updatedUser.last_name,
          avatarUrl: updatedUser.avatar_url,
          role: updatedUser.role,
          phone: updatedUser.phone,
          bio: updatedUser.bio,
        },
      }, 'User profile updated successfully.');
    });
  } catch (err) {
    error(res, err.message, 500, 'UPDATE_PROFILE_FAILED');
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return error(res, 'Current password and new password are required.', 400, 'MISSING_FIELDS');
    }

    if (newPassword.length < 8) {
      return error(res, 'New password must be at least 8 characters.', 400, 'PASSWORD_TOO_SHORT');
    }

    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return error(res, 'Current password is incorrect.', 401, 'INVALID_CURRENT_PASSWORD');
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.updatePassword(userId, hashedPassword);

    success(res, null, 'Password changed successfully.');
  } catch (err) {
    error(res, err.message, 500, 'CHANGE_PASSWORD_FAILED');
  }
};

const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    // Default preferences if not set
    const preferences = user.notification_preferences ? 
      JSON.parse(user.notification_preferences) : 
      {
        emailPolls: true,
        emailResults: true,
        emailGroups: false,
        pushPolls: true,
        pushResults: true,
      };

    success(res, preferences, 'Notification preferences retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'GET_NOTIFICATIONS_FAILED');
  }
};

const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    await User.update(userId, {
      notification_preferences: JSON.stringify(preferences)
    });

    success(res, preferences, 'Notification preferences updated successfully.');
  } catch (err) {
    error(res, err.message, 500, 'UPDATE_NOTIFICATIONS_FAILED');
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    // Delete avatar if exists
    if (user.avatar_url) {
      const avatarPath = path.join(__dirname, '../..', user.avatar_url);
      if (fs.existsSync(avatarPath)) {
        try {
          fs.unlinkSync(avatarPath);
        } catch (e) {
          console.error('Failed to delete avatar:', e);
        }
      }
    }

    // Delete user (cascade should handle related data)
    await User.delete(userId);

    success(res, null, 'Account deleted successfully.');
  } catch (err) {
    error(res, err.message, 500, 'DELETE_ACCOUNT_FAILED');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  getNotificationPreferences,
  updateNotificationPreferences,
  deleteAccount,
};
