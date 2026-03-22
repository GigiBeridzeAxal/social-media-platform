import mongoose from 'mongoose'

let cached = global._mongoConn

export async function connectDB() {
  if (cached && cached.readyState === 1) return cached

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set. Add it in Vercel project settings.')
  }

  cached = await mongoose.connect(uri, { dbName: process.env.DB_NAME || 'socialsphere' })
  global._mongoConn = mongoose.connection
  return mongoose.connection
}

export function requireDB(handler) {
  return async (req, res) => {
    try {
      await connectDB()
    } catch (err) {
      return res.status(503).json({
        message: err.message,
        action: 'Set MONGODB_URI in Vercel Environment Variables → Redeploy'
      })
    }
    return handler(req, res)
  }
}
