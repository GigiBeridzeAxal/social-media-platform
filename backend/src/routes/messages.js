import { Router } from 'express'
import { getConversations, getMessages, sendMessage, startConversation } from '../controllers/messageController.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.use(authenticate)

router.get('/conversations', getConversations)
router.post('/conversations', startConversation)
router.get('/conversations/:convId/messages', getMessages)
router.post('/conversations/:convId/messages', sendMessage)

export default router
