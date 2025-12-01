const { Server } = require('socket.io');
const { verifyAccessToken } = require('./jwt');

const initSocketServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token not provided.'));
    }
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return next(new Error('Authentication error: Invalid token.'));
    }
    socket.user = decoded; // Attach user information to socket
    next();
  });

  // Basic connection event
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.id}`);
    });
  });

  return io;
};

module.exports = initSocketServer;
