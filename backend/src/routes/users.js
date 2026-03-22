import { Router } from 'express'
import { getUser, getUserPosts, followUser, getSuggestedUsers } from '../controllers/userController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/suggested', getSuggestedUsers)
router.get('/:username', getUser)
router.get('/:username/posts', getUserPosts)
router.post('/:id/follow', followUser)

export default router
