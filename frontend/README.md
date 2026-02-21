# NeoVote — Frontend

Modern web application for the NeoVote voting and polling platform, built with Next.js 16 and React 19.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS 4, Radix UI, shadcn/ui |
| **State Management** | Zustand (with persistence) |
| **Forms** | React Hook Form, Zod validation |
| **Real-time** | Socket.IO Client |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Theming** | next-themes (light/dark mode) |
| **Notifications** | Sonner (toast notifications) |

## Prerequisites

- Node.js >= 18
- pnpm

## Installation

```bash
cd frontend
pnpm install
```

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.IO server URL | `http://localhost:5000` |
| `NEXT_PUBLIC_API_MODE` | API mode: `real` (backend) or `mock` (demo data) | `real` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | `xxx.apps.googleusercontent.com` |

## Running the App

```bash
# Development
pnpm dev

# Production build
pnpm build

# Production server
pnpm start

# Linting
pnpm lint
```

The app runs at `http://localhost:3000` by default.

## Project Structure

```
frontend/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout (providers, fonts, metadata)
│   ├── page.tsx                    # Landing page with public polls
│   ├── globals.css                 # Global styles and CSS variables
│   ├── (auth)/                     # Authentication pages (unprotected)
│   │   ├── login/
│   │   ├── register/
│   │   ├── verify-email/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   └── verify-reset-code/
│   ├── (dashboard)/                # Dashboard pages (protected)
│   │   ├── layout.tsx              # Auth guard + sidebar layout
│   │   ├── dashboard/              # Main dashboard
│   │   ├── my-polls/               # User's created polls
│   │   ├── polls/                  # Browse public polls
│   │   ├── groups/                 # Group management
│   │   ├── notifications/          # Notification center
│   │   ├── profile/                # User profile
│   │   ├── settings/               # App settings
│   │   ├── history/                # Voting history
│   │   └── help/                   # Help page
│   └── auth/callback/              # OAuth callback handler
├── components/                     # Reusable components (~77 files)
│   ├── auth/                       # Auth components
│   │   ├── auth-layout.tsx         # Shared auth page layout
│   │   ├── code-input.tsx          # OTP code input
│   │   ├── login-required-modal.tsx
│   │   └── password-strength.tsx   # Password strength indicator
│   ├── layout/                     # Layout components
│   │   ├── header.tsx              # App header with navigation
│   │   └── sidebar.tsx             # Dashboard sidebar
│   ├── polls/                      # Poll components
│   │   ├── poll-card.tsx           # Poll display card
│   │   ├── create-poll-modal.tsx   # Poll creation form
│   │   ├── poll-type-badge.tsx     # Poll type indicator
│   │   └── poll-card-skeleton.tsx  # Loading skeleton
│   ├── groups/                     # Group components
│   │   ├── group-card.tsx          # Group display card
│   │   ├── create-group-modal.tsx  # Group creation form
│   │   ├── join-group-modal.tsx    # Join group dialog
│   │   ├── invite-member-modal.tsx # Member invitation
│   │   └── pending-requests-card.tsx
│   ├── providers/                  # Context providers
│   │   ├── theme-provider.tsx      # Dark/light theme
│   │   └── socket-provider.tsx     # WebSocket connection
│   └── ui/                         # shadcn/ui primitives (~40 files)
├── store/                          # Zustand state stores
│   ├── auth-store.ts               # Authentication & user session
│   ├── poll-store.ts               # Poll CRUD & voting
│   ├── group-store.ts              # Group management
│   ├── notification-store.ts       # Notifications
│   └── theme-store.ts              # Theme preferences
├── hooks/                          # Custom React hooks
│   ├── use-countdown.ts            # Poll countdown timer
│   ├── use-mobile.ts               # Mobile device detection
│   └── use-toast.ts                # Toast notification hook
├── lib/                            # Utilities and services
│   ├── api-client.ts               # Fetch wrapper with auth headers
│   ├── api.ts                      # API abstraction (mock/real switch)
│   ├── mock-data.ts                # Demo data for mock mode
│   ├── socket.ts                   # Socket.IO client setup
│   ├── theme-config.ts             # Theme configuration
│   └── utils.ts                    # General utilities (cn, etc.)
├── styles/                         # Additional stylesheets
│   └── globals.css                 # OKLch color system variables
├── public/                         # Static assets
├── package.json
├── tsconfig.json
├── next.config.mjs
├── postcss.config.mjs
├── components.json                 # shadcn/ui configuration
└── .env.local                      # Environment variables (not committed)
```

## Key Features

### Authentication
- Email/password registration with 6-digit email verification
- Login with "Remember Me" option
- Password reset via email code
- Google OAuth integration (optional)
- Protected routes with automatic redirect to login

### Poll Management
- Create polls with 2-4 options and scheduled end times
- Three poll types: standard poll, group vote, binary (Yes/No)
- Real-time vote counts and result visualization
- Poll search and filtering
- Voting history with statistics

### Groups
- Create public or private groups
- Join request workflow with admin approval for private groups
- Group-specific polls
- Member management and group statistics

### Real-time Updates
- Live vote count updates via Socket.IO
- Toast notifications for new votes and poll endings
- Automatic connection management tied to auth state

### Theming
- Light and dark mode with `next-themes`
- OKLch color space for accessible color palette
- Persistent theme preference

## State Management

The app uses five Zustand stores with `localStorage` persistence:

| Store | Key | Manages |
|-------|-----|---------|
| `auth-store` | `auth-storage` | User session, tokens, profile |
| `poll-store` | `poll-storage` | Polls, voting, statistics |
| `group-store` | `group-storage` | Groups, membership, requests |
| `notification-store` | `notification-storage` | Notifications, read status |
| `theme-store` | `theme-storage` | Theme preferences |

## API Integration

The frontend supports two API modes controlled by `NEXT_PUBLIC_API_MODE`:

- **`real`** — Connects to the backend API at `NEXT_PUBLIC_API_URL`. The API client (`lib/api-client.ts`) automatically attaches JWT tokens from the auth store.
- **`mock`** — Uses in-memory demo data from `lib/mock-data.ts` for development and demonstration without a running backend.

The abstraction layer in `lib/api.ts` switches between modes transparently.

## Styling

- **Tailwind CSS 4** for utility-first styling
- **shadcn/ui** components built on **Radix UI** primitives for accessible, unstyled base components
- **CSS variables** with OKLch color space for theme-aware colors
- **Class Variance Authority** for component variant management
- Responsive design with Tailwind breakpoints
