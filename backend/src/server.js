import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { connectDB } from './config/database.js'
import authRoutes from './routes/auth.js'
import postRoutes from './routes/posts.js'
import userRoutes from './routes/users.js'
import notificationRoutes from './routes/notifications.js'
import messageRoutes from './routes/messages.js'
import searchRoutes from './routes/search.js'
import uploadRoutes from './routes/upload.js'
import { errorHandler } from './middleware/errorHandler.js'
import { rateLimiter } from './middleware/rateLimiter.js'

const app = express()

// Middleware
app.use(helmet())
const allowedOrigins = (process.env.FRONTEND_URL || '*').split(',').map(s => s.trim())
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) cb(null, true)
    else cb(new Error('Not allowed by CORS'))
  },
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(rateLimiter)

// Lazy DB connection — connect once per serverless instance
let dbConnected = false
app.use(async (req, res, next) => {
  if (!dbConnected && process.env.MONGODB_URI) {
    try {
      await connectDB()
      dbConnected = true
    } catch (err) {
      console.error('DB connection error:', err.message)
      return res.status(503).json({ message: 'Database unavailable. Set MONGODB_URI in Vercel environment variables.' })
    }
  }
  next()
})

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString(), db: dbConnected }))
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/users', userRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/upload', uploadRoutes)

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Error handler
app.use(errorHandler)

// Local dev only — Vercel handles serverless, no listen() needed
if (process.env.NODE_ENV !== 'production') {
  const { createServer } = await import('http')
  const { setupWebSocket } = await import('./config/websocket.js')
  const httpServer = createServer(app)
  setupWebSocket(httpServer)
  const PORT = process.env.PORT || 3001
  connectDB().then(() => {
    dbConnected = true
    httpServer.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`))
  }).catch(err => {
    console.error('Failed to connect to database:', err)
    process.exit(1)
  })
}

export default app
