import jwt from 'jsonwebtoken'
import { requireDB } from '../_db.js'
import User from '../_user.js'

export default requireDB(async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' })
    }

    const token = authHeader.slice(7)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-dev-secret-change-in-prod')
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'User not found' })

    res.json(user.toPublicJSON())
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' })
  }
})
