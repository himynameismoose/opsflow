import { Router } from 'express'
import {
    createRequest,
    getRequests,
    updateRequestStatus,
    getAuditLogs
} from '../controllers/workflowController'
import { authenticate } from '../middleware/authMiddleware'

const router = Router()

// All workflow routes require authentication
router.post('/', authenticate, createRequest)
router.get('/', authenticate, getRequests)
router.patch('/:id/status', authenticate, updateRequestStatus)
router.get('/:id/audit-logs', authenticate, getAuditLogs)

export default router