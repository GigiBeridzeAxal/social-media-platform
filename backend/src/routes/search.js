import { Router } from 'express'
import { search } from '../controllers/searchController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', authenticate, search)

export default router
