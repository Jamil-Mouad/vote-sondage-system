const initGroupSocket = (io) => {
  io.on('connection', (socket) => {
    // Join a group room
    socket.on('group:join', (groupId) => {
      socket.join(`group-${groupId}`);
      console.log(`User ${socket.user.id} joined group-${groupId}`);
    });

    // Leave a group room
    socket.on('group:leave', (groupId) => {
      socket.leave(`group-${groupId}`);
      console.log(`User ${socket.user.id} left group-${groupId}`);
    });
  });
};

module.exports = initGroupSocket;
