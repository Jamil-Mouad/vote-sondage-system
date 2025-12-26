const Group = require('../models/Group');
const GroupMember = require('../models/GroupMember');
const Poll = require('../models/Poll');
const Notification = require('../models/Notification');
const Vote = require('../models/Vote');
const { calculateResults } = require('../services/pollService');
const { success, error } = require('../utils/responseHandler');
const { notifyGroup } = require('../services/socketService');

const createGroup = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const createdBy = req.user.id;

    const groupId = await Group.create({ name, description, isPublic: isPublic || false, createdBy });

    // Add creator as admin and approved member
    await GroupMember.addMember(groupId, createdBy, 'admin', 'approved');

    success(res, { groupId }, 'Group created successfully.', 201);
  } catch (err) {
    error(res, err.message, 500, 'GROUP_CREATION_FAILED');
  }
};

const listPublicGroups = async (req, res) => {
  try {
    const { search } = req.query;
    const filters = { search };

    let groups = await Group.findPublic(filters);

    groups = await Promise.all(groups.map(async group => {
      const activePolls = await Poll.findByGroup(group.id, { status: 'active' });
      let membershipStatus = 'none';
      if (req.user) {
        const member = await GroupMember.findByGroupAndUser(group.id, req.user.id);
        if (member) {
          membershipStatus = member.status;
        }
      }
      return { ...group, activePollsCount: activePolls.length, membershipStatus };
    }));

    success(res, groups, 'Public groups retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_PUBLIC_GROUPS_FAILED');
  }
};

const getMyGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    const groups = await Group.findByUser(userId);

    success(res, groups, 'My groups retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_MY_GROUPS_FAILED');
  }
};

const getGroupById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    let myRole = 'none';
    const member = await GroupMember.findByGroupAndUser(id, userId);
    if (member) {
      myRole = member.role;
    }

    // Check membership for private groups
    if (!group.is_public && (!member || member.status !== 'approved')) {
      return error(res, 'Forbidden: You do not have access to this private group.', 403, 'GROUP_ACCESS_DENIED');
    }

    const activePolls = await Poll.findByGroup(id); // Assuming findByGroup returns polls for a group

    success(res, { ...group, myRole, activePolls }, 'Group details retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_GROUP_DETAILS_FAILED');
  }
};

const requestToJoinGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    const existingMember = await GroupMember.findByGroupAndUser(id, userId);
    if (existingMember) {
      return error(res, 'Conflict: You are already a member or have a pending request for this group.', 409, 'ALREADY_GROUP_MEMBER');
    }

    await GroupMember.addMember(id, userId, 'member', 'pending');

    // Create notification for group admin
    await Notification.create({
      userId: group.created_by,
      title: 'Nouvelle demande d\'adhésion',
      message: `${req.user.username} souhaite rejoindre votre groupe "${group.name}".`,
      type: 'group_request',
      link: `/dashboard/groups/${id}`
    });

    success(res, null, 'Request to join group sent successfully.');
  } catch (err) {
    error(res, err.message, 500, 'JOIN_GROUP_FAILED');
  }
};

const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    const affectedRows = await GroupMember.removeMember(id, userId);

    if (affectedRows === 0) {
      return error(res, 'You are not a member of this group.', 400, 'NOT_GROUP_MEMBER');
    }

    success(res, null, 'Left group successfully.');
  } catch (err) {
    error(res, err.message, 500, 'LEAVE_GROUP_FAILED');
  }
};

const getPendingRequests = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    const member = await GroupMember.findByGroupAndUser(id, userId);
    if (!member || member.role !== 'admin') {
      return error(res, 'Forbidden: Only group admins can view pending requests.', 403, 'FORBIDDEN');
    }

    const pendingRequests = await GroupMember.getPendingRequests(id);

    success(res, pendingRequests, 'Pending group join requests retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_PENDING_REQUESTS_FAILED');
  }
};

const handleJoinRequest = async (req, res) => {
  try {
    const { id, requestId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    const adminMember = await GroupMember.findByGroupAndUser(id, userId);
    if (!adminMember || adminMember.role !== 'admin') {
      return error(res, 'Forbidden: Only group admins can manage join requests.', 403, 'FORBIDDEN');
    }

    const targetMember = await GroupMember.findById(requestId); // Assuming findById exists for GroupMember
    if (!targetMember || targetMember.group_id !== parseInt(id) || targetMember.status !== 'pending') {
      return error(res, 'Invalid or non-pending request.', 400, 'INVALID_REQUEST');
    }

    if (action === 'approve') {
      await GroupMember.updateStatus(requestId, 'approved');

      // Notify the user who joined
      await Notification.create({
        userId: targetMember.user_id,
        title: 'Demande acceptée',
        message: `Votre demande pour rejoindre le groupe "${group.name}" a été acceptée.`,
        type: 'join_approved',
        link: `/dashboard/groups/${id}`
      });

      success(res, null, 'Group join request approved.');
    } else if (action === 'reject') {
      await GroupMember.removeMember(id, targetMember.user_id);

      // Notify the user who was rejected
      await Notification.create({
        userId: targetMember.user_id,
        title: 'Demande refusée',
        message: `Votre demande pour rejoindre le groupe "${group.name}" a été refusée.`,
        type: 'join_rejected'
      });

      success(res, null, 'Group join request rejected.');
    } else {
      return error(res, "Invalid action. Must be 'approve' or 'reject'.", 400, 'INVALID_ACTION');
    }

  } catch (err) {
    error(res, err.message, 500, 'HANDLE_JOIN_REQUEST_FAILED');
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    if (group.created_by !== userId) {
      return error(res, 'Forbidden: Only the group creator can delete this group.', 403, 'FORBIDDEN');
    }

    await Group.delete(id); // This should cascade to group_members and update polls

    success(res, null, 'Group deleted successfully.');
  } catch (err) {
    error(res, err.message, 500, 'GROUP_DELETION_FAILED');
  }
};

const getGroupPolls = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const group = await Group.findById(id);
    if (!group) {
      return error(res, 'Group not found.', 404, 'GROUP_NOT_FOUND');
    }

    const member = await GroupMember.findByGroupAndUser(id, userId);
    if (!member || member.status !== 'approved') {
      return error(res, 'Forbidden: You are not an approved member of this group.', 403, 'GROUP_ACCESS_DENIED');
    }

    let polls = await Poll.findByGroup(id);

    // For each poll, include totalVotes, hasVoted, and myVote
    polls = await Promise.all(polls.map(async poll => {
      const totalVotes = await Vote.countByPoll(poll.id);
      let hasVoted = false;
      let myVote = null;

      if (req.user) {
        const userVote = await Vote.findByPollAndUser(poll.id, req.user.id);
        if (userVote) {
          hasVoted = true;
          myVote = userVote.option_selected;
        }
      }

      // Parse options
      if (typeof poll.options === 'string') {
        try {
          poll.options = JSON.parse(poll.options);
          if (typeof poll.options === 'string') poll.options = JSON.parse(poll.options);
        } catch (e) {
          console.error("Error parsing options", e);
        }
      }

      // Get results if user has voted or poll ended
      let results = null;
      const isEnded = new Date(poll.end_time) <= new Date() || poll.status === 'ended';
      const isCreator = poll.created_by === userId;

      if (hasVoted || isEnded || isCreator) {
        results = await calculateResults(poll.id);
      }

      return { ...poll, totalVotes, hasVoted, myVote, results };
    }));

    success(res, polls, 'Group polls retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'FETCH_GROUP_POLLS_FAILED');
  }
};

module.exports = {
  createGroup,
  listPublicGroups,
  getMyGroups,
  getGroupById,
  requestToJoinGroup,
  leaveGroup,
  getPendingRequests,
  handleJoinRequest,
  deleteGroup,
  getGroupPolls,
};
