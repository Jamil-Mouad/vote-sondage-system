const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html: htmlContent,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    throw new Error('Failed to send email.');
  }
};

const sendVerificationCode = async (email, code, username) => {
  const subject = 'Your Email Verification Code';
  const htmlContent = `
    <p>Hello ${username},</p>
    <p>Thank you for registering with our platform. Please use the following code to verify your email address:</p>
    <h3>${code}</h3>
    <p>This code is valid for 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, subject, htmlContent);
};

const sendPasswordResetCode = async (email, code, username) => {
  const subject = 'Your Password Reset Code';
  const htmlContent = `
    <p>Hello ${username},</p>
    <p>You have requested a password reset. Please use the following code to reset your password:</p>
    <h3>${code}</h3>
    <p>This code is valid for 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(email, subject, htmlContent);
};

const sendSupportNotification = async (adminEmail, userMessage) => {
  const subject = 'New Support Message Received';
  const htmlContent = `
    <p>Hello Admin,</p>
    <p>A new support message has been received:</p>
    <p><strong>User Message:</strong> ${userMessage}</p>
    <p>Please respond as soon as possible.</p>
  `;
  await sendEmail(adminEmail, subject, htmlContent);
};

module.exports = {
  sendVerificationCode,
  sendPasswordResetCode,
  sendSupportNotification,
};
