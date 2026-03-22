import { Router } from 'express'
import { getFeed, createPost, getPost, deletePost, likePost, getComments, addComment, getTrending } from '../controllers/postController.js'
import { authenticate } from '../middleware/auth.js'
import { uploadImage } from '../middleware/upload.js'

const router = Router()

router.use(authenticate)

router.get('/feed', getFeed)
router.get('/trending', getTrending)
router.post('/', uploadImage, createPost)
router.get('/:id', getPost)
router.delete('/:id', deletePost)
router.post('/:id/like', likePost)
router.get('/:id/comments', getComments)
router.post('/:id/comments', addComment)

export default router
