# SocialSphere — Social Media Platform

A full-stack social media platform built with **Vue.js** (frontend) and **Node.js/Express** (backend), deployed separately on Vercel.

## Project Structure

```
social-media-platform/
├── frontend/          # Vue 3 + Vite + Tailwind CSS
└── backend/           # Node.js + Express + MongoDB
```

---

## Frontend (`/frontend`)

Built with **Vue 3**, **Vite**, **Pinia**, **Vue Router**, and **Tailwind CSS**.

### Features
- Feed with infinite scroll
- Create posts (text + image)
- Like, comment, share posts
- User profiles with follow/unfollow
- Real-time notifications via WebSocket
- Direct messages
- Explore / search (users + posts)
- Auth (register, login, JWT)
- Settings (edit profile, change password)

### Local Setup
```bash
cd frontend
cp .env.example .env          # set VITE_API_URL
npm install
npm run dev                    # http://localhost:5173
```

### Vercel Deploy
```bash
cd frontend
vercel                         # or connect repo in Vercel dashboard
```

Set environment variable in Vercel:
| Variable | Value |
|---|---|
| `VITE_API_URL` | your backend Vercel URL |

---

## Backend (`/backend`)

Built with **Node.js**, **Express**, **Mongoose (MongoDB)**, **JWT auth**, **WebSocket**.

### Features
- REST API for posts, users, auth, notifications, messages, search
- JWT authentication
- Rate limiting & helmet security
- WebSocket for real-time events (notifications, messages)
- Image upload (stored as base64, swap for S3/Cloudinary in production)
- Full-text search on posts

### Local Setup
```bash
cd backend
cp .env.example .env          # fill in MONGODB_URI, JWT_SECRET
npm install
npm run dev                    # http://localhost:3001
```

### Vercel Deploy
```bash
cd backend
vercel                         # or connect repo in Vercel dashboard
```

Set these secrets in Vercel (use `vercel env add` or the dashboard):
| Secret | Description |
|---|---|
| `social-media-mongodb-uri` | MongoDB Atlas connection string |
| `social-media-jwt-secret` | Random 64-char secret |
| `social-media-frontend-url` | Frontend Vercel URL (for CORS) |

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Current user |
| PUT | `/api/auth/profile` | Update profile |
| GET | `/api/posts/feed` | Get feed |
| POST | `/api/posts` | Create post |
| POST | `/api/posts/:id/like` | Like/unlike |
| GET | `/api/posts/:id/comments` | Get comments |
| POST | `/api/posts/:id/comments` | Add comment |
| GET | `/api/posts/trending` | Trending hashtags |
| GET | `/api/users/suggested` | Suggested users |
| GET | `/api/users/:username` | User profile |
| POST | `/api/users/:id/follow` | Follow/unfollow |
| GET | `/api/notifications` | Get notifications |
| PUT | `/api/notifications/read-all` | Mark all read |
| GET | `/api/messages/conversations` | List conversations |
| POST | `/api/messages/conversations/:id/messages` | Send message |
| GET | `/api/search?q=` | Search users + posts |
| GET | `/health` | Health check |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Vue 3, Vite, Pinia, Vue Router, Tailwind CSS, Axios |
| Backend | Node.js, Express, Mongoose, JWT, Socket.io/WS |
| Database | MongoDB Atlas |
| Deployment | Vercel (frontend + backend, separate projects) |
