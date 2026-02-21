# NeoVote — Backend API

REST API server for the NeoVote voting and polling platform, built with Express.js and Socket.IO for real-time communication.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Runtime** | Node.js, Express.js |
| **Database** | MySQL 2 (connection pooling) |
| **Authentication** | JWT (jsonwebtoken), Bcrypt, Passport.js + Google OAuth 2.0 |
| **Real-time** | Socket.IO |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, CORS, express-rate-limit |
| **Validation** | express-validator |
| **File Uploads** | Multer |
| **Scheduling** | node-cron |

## Prerequisites

- Node.js >= 18
- MySQL >= 8.0
- npm

## Installation

```bash
cd backend
npm install
```

## Database Setup

1. Create the database:

```bash
mysql -u root -p -e "CREATE DATABASE neoVote;"
```

2. Run the schema:

```bash
mysql -u root -p neoVote < database.sql
```

3. Run any additional migrations from `migrations/` if present:

```bash
mysql -u root -p neoVote < migrations/add_poll_type_fields.sql
```

### Database Schema

| Table | Description |
|-------|-------------|
| `users` | User accounts (id, username, email, password, role, avatar, timestamps) |
| `pending_users` | Unverified registrations awaiting email confirmation |
| `code_verifications` | Email verification and password reset codes |
| `groups` | Poll groups/communities (public or private) |
| `group_members` | Membership with roles (admin/member) and approval status |
| `polls` | Poll definitions (question, options, type, visibility, end time) |
| `poll_options` | Answer choices for each poll |
| `votes` | Cast votes (one per user per poll) |
| `notifications` | User notifications |
| `support_messages` | Support tickets |

## Environment Variables

Create a `.env` file in the `backend/` directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment | `development` / `production` |
| `DB_HOST` | MySQL host | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `root` |
| `DB_PASSWORD` | MySQL password | `your_password` |
| `DB_NAME` | Database name | `neoVote` |
| `JWT_ACCESS_SECRET` | Access token secret | Random string |
| `JWT_REFRESH_SECRET` | Refresh token secret | Random string |
| `JWT_ACCESS_EXPIRATION` | Access token TTL | `24h` |
| `JWT_REFRESH_EXPIRATION` | Refresh token TTL | `7d` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret (optional) | `GOCSPX-xxx` |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:5000/api/auth/google/callback` |
| `SMTP_HOST` | Mail server host | `smtp.gmail.com` |
| `SMTP_PORT` | Mail server port | `587` |
| `SMTP_USER` | Mail account | `your_email@gmail.com` |
| `SMTP_PASS` | Mail password / app password | `your_app_password` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:3000` |

## Running the Server

```bash
# Development (with auto-reload via nodemon)
npm run dev

# Production
npm start
```

The server runs at `http://localhost:5000` by default.

## API Endpoints

Base URL: `/api`

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health status |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register a new user |
| POST | `/auth/verify-email` | No | Verify email with 6-digit code |
| POST | `/auth/resend-code` | No | Resend verification code |
| POST | `/auth/login` | No | Login with email and password |
| POST | `/auth/forgot-password` | No | Request password reset code |
| POST | `/auth/reset-password` | No | Reset password with code |
| POST | `/auth/refresh-token` | No | Refresh JWT access token |
| POST | `/auth/logout` | No | Logout |
| GET | `/auth/google` | No | Initiate Google OAuth |
| GET | `/auth/google/callback` | No | Google OAuth callback |

### Users (`/api/users`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | Yes | Get current user profile |
| PUT | `/users/profile` | Yes | Update profile |
| PUT | `/users/change-password` | Yes | Change password |
| GET | `/users/notifications` | Yes | Get notification preferences |
| PUT | `/users/notifications` | Yes | Update notification preferences |
| DELETE | `/users/account` | Yes | Delete account |

### Polls (`/api/polls`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/polls` | Yes | Create a new poll |
| GET | `/polls/public` | Optional | List public polls |
| GET | `/polls/my-polls` | Yes | Get user's created polls |
| GET | `/polls/history` | Yes | Get voting history |
| GET | `/polls/history/enhanced` | Yes | Get enhanced voting history |
| GET | `/polls/:id` | Yes | Get poll details |
| GET | `/polls/:id/stats` | Yes | Get poll statistics |
| PUT | `/polls/:id` | Yes | Update a poll |
| DELETE | `/polls/:id` | Yes | Cancel/delete a poll |

### Votes (`/api/votes`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/votes` | Yes | Submit a vote |
| GET | `/votes/check/:pollId` | Yes | Check if user already voted |

### Groups (`/api/groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/groups/public` | No | List public groups |
| POST | `/groups` | Yes | Create a group |
| GET | `/groups/my-groups` | Yes | Get user's groups |
| GET | `/groups/:id` | Yes | Get group details |
| POST | `/groups/:id/join` | Yes | Request to join a group |
| DELETE | `/groups/:id/leave` | Yes | Leave a group |
| GET | `/groups/:id/requests` | Yes | Get pending join requests (admin) |
| PUT | `/groups/:id/requests/:requestId` | Yes | Approve/reject join request (admin) |
| GET | `/groups/:id/polls` | Yes | Get group's polls |
| GET | `/groups/:id/statistics` | Yes | Get group statistics |
| DELETE | `/groups/:id` | Yes | Delete group (admin) |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Yes | Get user's notifications |
| PUT | `/notifications/mark-all-read` | Yes | Mark all as read |
| PUT | `/notifications/:id/read` | Yes | Mark one as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |

### Support (`/api/support`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/support/message` | Yes | Send support message |
| GET | `/support/help` | No | Get help information |

## Authentication

### JWT Flow

1. User logs in via `/auth/login` and receives an `accessToken` (24h) and `refreshToken` (7d)
2. Include the access token in requests: `Authorization: Bearer <accessToken>`
3. When the access token expires, call `/auth/refresh-token` with the refresh token to get a new pair

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

### Google OAuth

Google OAuth is optional. To enable it, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in the `.env` file. See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for a detailed configuration guide.

## WebSocket Events

The server uses Socket.IO for real-time updates. Clients must authenticate with a JWT token on connection.

### Client-to-Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join:poll` | `{ pollId }` | Join a poll room for live updates |
| `leave:poll` | `{ pollId }` | Leave a poll room |
| `join:group` | `{ groupId }` | Join a group room |

### Server-to-Client

| Event | Payload | Description |
|-------|---------|-------------|
| `vote:new` | Vote data + updated results | Broadcast when a new vote is cast |
| `poll:ended` | Poll data + final results | Broadcast when a poll ends |

## Rate Limiting

Rate limits are relaxed in development and strict in production:

| Endpoint | Development | Production | Window |
|----------|------------|------------|--------|
| Login | 1,000 req | 10 req | 15 min |
| Registration | 1,000 req | 5 req | 1 hour |
| Resend Code | 1,000 req | 3 req | 1 hour |
| Voting | 10,000 req | 100 req | 1 hour |
| General API | 10,000 req | 100 req | 15 min |

## Cron Jobs

| Job | Frequency | Description |
|-----|-----------|-------------|
| Poll expiration | Every 5 minutes | Ends active polls past their `end_time` and emits final results via Socket.IO |
| Cleanup pending users | Every hour | Removes unverified registrations past expiration |
| Cleanup verification codes | Every hour | Removes expired reset/verification codes |

## Email Service

The server sends HTML emails via Gmail SMTP using Nodemailer:

| Template | Trigger | Details |
|----------|---------|---------|
| Email Verification | User registration | 6-digit code, expires in 10 minutes |
| Password Reset | Forgot password request | 6-digit code, expires in 30 minutes |
| Support Notification | Support message submitted | Forwarded to admin email with user details |

## Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app setup and server initialization
│   ├── config/
│   │   ├── database.js     # MySQL connection pool
│   │   ├── jwt.js          # Token generation and verification
│   │   ├── oauth.js        # Google OAuth Passport strategy
│   │   └── socket.js       # Socket.IO initialization
│   ├── controllers/        # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── pollController.js
│   │   ├── voteController.js
│   │   ├── groupController.js
│   │   ├── notificationController.js
│   │   └── supportController.js
│   ├── models/             # Database query layer
│   │   ├── userModel.js
│   │   ├── pollModel.js
│   │   ├── voteModel.js
│   │   ├── groupModel.js
│   │   ├── notificationModel.js
│   │   └── supportModel.js
│   ├── routes/             # Route definitions
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── pollRoutes.js
│   │   ├── voteRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── supportRoutes.js
│   ├── services/
│   │   ├── emailService.js   # Email sending with HTML templates
│   │   ├── socketService.js  # Socket.IO event emissions
│   │   └── pollService.js    # Poll statistics calculations
│   ├── middlewares/
│   │   ├── authMiddleware.js # JWT verification and role authorization
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── rateLimiter.js    # Rate limiting configuration
│   │   └── validators.js     # Input validation rules
│   ├── sockets/              # Socket.IO event handlers
│   ├── cron/                 # Scheduled job definitions
│   └── utils/                # Utility functions
├── migrations/               # SQL migration files
├── database.sql              # Full database schema
├── OAUTH_SETUP.md            # Google OAuth configuration guide
├── package.json
└── .env                      # Environment configuration (not committed)
```
