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
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)
    res.json({ token, user: user.toPublicJSON() })
  } catch (err) {
    console.error('login error:', err)
    res.status(500).json({ message: err.message })
  }
})
