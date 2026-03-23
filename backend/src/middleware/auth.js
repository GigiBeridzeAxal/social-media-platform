import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authenticate(req, res, next) {
  // Check cookie first, then fall back to Bearer header
  let token = req.cookies?.token

  if (!token) {
    const header = req.headers.authorization
    if (header?.startsWith('Bearer ')) {
      token = header.split(' ')[1]
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}
