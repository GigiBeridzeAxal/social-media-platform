import jwt from 'jsonwebtoken'
import { requireDB } from '../_db.js'
import User from '../_user.js'

const signToken = (id) => jwt.sign(
  { id },
  process.env.JWT_SECRET || 'fallback-dev-secret-change-in-prod',
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
)

export default requireDB(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { username, email, password, firstName, lastName } = req.body
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'username, email and password are required' })
    }

    const displayName = [firstName, lastName].filter(Boolean).join(' ') || username
    const user = await User.create({ username, email, password, displayName, firstName, lastName })
    const token = signToken(user._id)

    res.status(201).json({ token, user: user.toPublicJSON() })
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0]
      return res.status(409).json({ message: `${field} already taken` })
    }
    console.error('register error:', err)
    res.status(500).json({ message: err.message })
  }
})
