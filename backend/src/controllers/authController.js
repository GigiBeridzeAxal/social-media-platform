import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/'
}

function setAuthCookie(res, token) {
  res.cookie('token', token, COOKIE_OPTIONS)
}

export async function register(req, res, next) {
  try {
    const { username, email, password, firstName, lastName } = req.body
    const displayName = `${firstName} ${lastName}`.trim()
    const user = await User.create({ username, email, password, displayName, firstName, lastName })
    const token = signToken(user._id)
    setAuthCookie(res, token)
    res.status(201).json({ token, user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const token = signToken(user._id)
    setAuthCookie(res, token)
    res.json({ token, user: user.toPublicJSON() })
  } catch (err) {
    next(err)
  }
}

export async function logout(req, res) {
  res.clearCookie('token', { ...COOKIE_OPTIONS, maxAge: 0 })
  res.json({ message: 'Logged out successfully' })
}

export async function getMe(req, res) {
  res.json(req.user.toPublicJSON())
}

export async function updateProfile(req, res, next) {
  try {
    const { firstName, lastName, username, bio, website, location } = req.body
    const update = { firstName, lastName, username, bio, website, location }
    if (firstName || lastName) update.displayName = `${firstName || req.user.firstName} ${lastName || req.user.lastName}`.trim()
    if (req.file) update.avatar = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true, runValidators: true })
    res.json(user.toPublicJSON())
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body
    const user = await User.findById(req.user._id)
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' })
    }
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password changed successfully' })
  } catch (err) {
    next(err)
  }
}
