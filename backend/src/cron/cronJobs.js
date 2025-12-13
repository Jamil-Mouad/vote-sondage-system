const cron = require('node-cron');
const Poll = require('../models/Poll');
const PendingUser = require('../models/PendingUser');
const CodeVerification = require('../models/CodeVerification');
const { emitPollEnded } = require('../services/socketService');
const { calculateResults } = require('../services/pollService');

const startCronJobs = () => {
  // 1. Check for ended polls every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const endedPolls = await Poll.findActivePollsEndingSoon();
      if (endedPolls.length > 0) {
        console.log(`Found ${endedPolls.length} polls to end...`);
        for (const poll of endedPolls) {
          await Poll.updateStatus(poll.id, 'ended');
          const finalResults = await calculateResults(poll.id);
          emitPollEnded(poll.id, finalResults);
          console.log(`Poll ${poll.id} has ended.`);
        }
      }
    } catch (error) {
      console.error('Error in poll ending cron job:', error);
    }
  });

  // 2. Clean up expired pending users every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running cron job: Cleaning up expired pending users...');
    try {
      const affectedRows = await PendingUser.deleteExpired();
      console.log(`Cleaned up ${affectedRows} expired pending users.`);
    } catch (error) {
      console.error('Error in pending user cleanup cron job:', error);
    }
  });

  // 3. Clean up expired verification codes every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running cron job: Cleaning up expired verification codes...');
    try {
      const affectedRows = await CodeVerification.deleteExpired();
      console.log(`Cleaned up ${affectedRows} expired verification codes.`);
    } catch (error) {
      console.error('Error in code verification cleanup cron job:', error);
    }
  });

  console.log('Cron jobs started.');
};

module.exports = startCronJobs;
