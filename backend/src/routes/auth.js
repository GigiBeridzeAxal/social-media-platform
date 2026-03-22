import { Router } from 'express'
import { register, login, logout, getMe, updateProfile, changePassword } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { authLimiter } from '../middleware/rateLimiter.js'
import { uploadAvatar } from '../middleware/upload.js'

const router = Router()

router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, getMe)
router.put('/profile', authenticate, uploadAvatar, updateProfile)
router.put('/password', authenticate, changePassword)

export default router
