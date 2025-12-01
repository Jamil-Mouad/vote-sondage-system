const initPollSocket = (io) => {
  io.on('connection', (socket) => {
    // Join a poll room
    socket.on('poll:join', (pollId) => {
      socket.join(`poll-${pollId}`);
      console.log(`User ${socket.user.id} joined poll-${pollId}`);
    });

    // Leave a poll room
    socket.on('poll:leave', (pollId) => {
      socket.leave(`poll-${pollId}`);
      console.log(`User ${socket.user.id} left poll-${pollId}`);
    });

    // Other poll-related events (vote:new, poll:ended, poll:updated) will be emitted from socketService.js
  });
};

module.exports = initPollSocket;
