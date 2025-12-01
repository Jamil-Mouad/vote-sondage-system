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
    const uploadPath = path.join(__dirname, '../uploads/avatars');
    fs.mkdirSync(uploadPath, { recursive: true }); // Ensure directory exists
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
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
    const createdPolls = await Poll.findByCreator(userId, {}); // Get all polls created by user
    const votedPolls = await Vote.findByUser(userId); // Assuming a findByUser method exists in Vote model
    const joinedGroups = await GroupMember.findGroupsByUser(userId); // Assuming a findGroupsByUser method exists in GroupMember model

    success(res, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url,
        role: user.role,
      },
      stats: {
        pollsCreated: createdPolls.length,
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
      const { username, firstName, lastName } = req.body;
      let avatarUrl = null;

      if (req.file) {
        avatarUrl = `/uploads/avatars/${req.file.filename}`;
        // Delete old avatar if exists
        const oldUser = await User.findById(userId);
        if (oldUser && oldUser.avatar_url && oldUser.avatar_url !== avatarUrl) {
          const oldAvatarPath = path.join(__dirname, '..', oldUser.avatar_url);
          if (fs.existsSync(oldAvatarPath)) {
            fs.unlinkSync(oldAvatarPath);
          }
        }
      }

      const updates = {};
      if (username) updates.username = username;
      if (firstName) updates.first_name = firstName;
      if (lastName) updates.last_name = lastName;
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

    const user = await User.findById(userId);
    if (!user) {
      return error(res, 'User not found.', 404, 'USER_NOT_FOUND');
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return error(res, 'Current password incorrect.', 401, 'INVALID_CURRENT_PASSWORD');
    }

    const hashedPassword = await hashPassword(newPassword);
    await User.updatePassword(userId, hashedPassword);

    success(res, null, 'Password changed successfully.');
  } catch (err) {
    error(res, err.message, 500, 'CHANGE_PASSWORD_FAILED');
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
};
