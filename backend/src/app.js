require('dotenv').config();
const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const passport = require('passport');
const { connectDB } = require('./config/database');
const initSocketServer = require('./config/socket');
const { setIoInstance } = require('./services/socketService');
const startCronJobs = require('./cron/cronJobs');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const pollRoutes = require('./routes/pollRoutes');
const voteRoutes = require('./routes/voteRoutes');
const groupRoutes = require('./routes/groupRoutes');
const supportRoutes = require('./routes/supportRoutes');

const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.IO
const io = initSocketServer(server);
setIoInstance(io); // Make io instance available to other services

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Standard Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for avatars (before other routes, with CORS headers)
const path = require('path');
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(path.join(__dirname, '../uploads')));

// Passport Middleware for OAuth
app.use(passport.initialize());
require('./config/oauth'); // Load Passport Google OAuth config

// Rate Limiting for all requests (apply before routes)
app.use(generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/support', supportRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'Backend is running.' });
});

// Global Error Handler (must be last middleware)
app.use(errorHandler);

// Start Cron Jobs
startCronJobs();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
});
