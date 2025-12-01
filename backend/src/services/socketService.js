let io;

const setIoInstance = (ioInstance) => {
  io = ioInstance;
};

const emitVoteUpdate = (pollId, results) => {
  if (io) {
    io.to(`poll-${pollId}`).emit('vote:new', { pollId, results });
  }
};

const emitPollEnded = (pollId, finalResults) => {
  if (io) {
    io.to(`poll-${pollId}`).emit('poll:ended', { pollId, finalResults });
  }
};

const notifyGroup = (groupId, event, data) => {
  if (io) {
    io.to(`group-${groupId}`).emit(event, { groupId, ...data });
  }
};

module.exports = {
  setIoInstance,
  emitVoteUpdate,
  emitPollEnded,
  notifyGroup,
};
