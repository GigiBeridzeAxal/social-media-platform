import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

// Generic image upload endpoint — returns base64 data URL
router.post('/image', authenticate, uploadImage, (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file provided' })
  const dataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
  res.json({ url: dataUrl })
})

export default router
