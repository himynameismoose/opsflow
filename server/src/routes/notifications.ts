import { Router } from 'express'
import { authenticate } from '../middleware/authMiddleware'
import { getNotifications, markAllAsRead } from '../controllers/notificationController'

const router = Router()

router.get('/', authenticate, getNotifications)
router.patch('/:id/read', authenticate, markAllAsRead)
router.patch('/read-all', authenticate, markAllAsRead)

export default router