require('dotenv').config();
const { success, error } = require('../utils/responseHandler');
const { sendSupportNotification } = require('../services/emailService');

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL;

const sendMessage = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.name || req.user.firstName || 'Utilisateur';

    if (!message) {
      return error(res, 'Le message ne peut pas être vide.', 400, 'EMPTY_MESSAGE');
    }

    if (!subject) {
      return error(res, 'Le sujet ne peut pas être vide.', 400, 'EMPTY_SUBJECT');
    }

    await sendSupportNotification(SUPPORT_EMAIL, {
      subject,
      message,
      userId,
      userEmail,
      userName
    });

    success(res, null, 'Votre message a été envoyé avec succès.');
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
