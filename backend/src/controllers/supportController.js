require('dotenv').config();
const { success, error } = require('../utils/responseHandler');
const { sendSupportNotification } = require('../services/emailService');

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id; // User is authenticated
    const userEmail = req.user.email; // Assuming user email is available in req.user

    if (!message) {
      return error(res, 'Support message cannot be empty.', 400, 'EMPTY_MESSAGE');
    }

    // In a real application, you would save this message to a database
    // For now, we just send an email to the support team
    const userDetails = `User ID: ${userId}, Email: ${userEmail}`;
    const fullMessage = `From: ${userDetails}\nMessage: ${message}`;

    await sendSupportNotification(SUPPORT_EMAIL, fullMessage);

    success(res, null, 'Your support message has been sent.');
  } catch (err) {
    error(res, err.message, 500, 'SEND_SUPPORT_MESSAGE_FAILED');
  }
};

const getHelp = (req, res) => {
  try {
    const faq = [
      {
        question: 'How do I create a new poll?',
        answer: 'Navigate to the \'Create Poll\' section and fill out the poll details, including question, options, and end time.',
      },
      {
        question: 'Can I change my vote?',
        answer: 'No, currently votes cannot be changed after submission.',
      },
      {
        question: 'What are private groups?',
        answer: 'Private groups are groups where only approved members can see and participate in polls.',
      },
    ];

    success(res, faq, 'Help content retrieved successfully.');
  } catch (err) {
    error(res, err.message, 500, 'GET_HELP_FAILED');
  }
};

module.exports = {
  sendMessage,
  getHelp,
};
