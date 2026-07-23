import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'
import { createAuditLog } from '../lib/auditLog'

// Create a new workflow request
export const createRequest = async (req: AuthRequest, res: Response) => {
    try {
        const { title, description } = req.body
        const requesterId = req.user!.userId

        const workflowRequest = await prisma.workflowRequest.create({
            data: {
                title,
                description,
                requesterId,
            }
        })

        // Record creation in audit log
        await createAuditLog({
            action: 'REQUEST_CREATED',
            entityType: 'WorkflowRequest',
            entityId: workflowRequest.id,
            performedById: requesterId,
            newValue: 'PENDING',
        })

        res.status(201).json({
            message: 'Workflow request created successfully',
            workflowRequest
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error creating workflow request' })
    }
}

// Get all workflow requests (admin/manager sees all, requester sees only theirs)
export const getRequests = async (req: AuthRequest, res: Response) => {
    try {
        const { userId, role } = req.user!

        const requests = await prisma.workflowRequest.findMany({
            where: role === 'REQUESTER' ? { requesterId: userId } : {},
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        res.status(200).json({ requests })
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching requests' })
    }
}

// Update request status (admin/manager only)
export const updateRequestStatus = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string
        const { status } = req.body
        const { userId, role } = req.user!

        if (role === 'REQUESTER') {
            return res.status(403).json({ message: 'Not authorized to update status' })
        }

        // Fetch current status before updating
        const existing = await prisma.workflowRequest.findUnique({
            where: { id }
        })

        const updated = await prisma.workflowRequest.update({
            where: { id },
            data: { status }
        })

        // Record status change in audit log
        await createAuditLog({
            action: 'STATUS_UPDATED',
            entityType: 'WorkflowRequest',
            entityId: id,
            performedById: userId,
            oldValue: existing?.status,
            newValue: status,
        })

        res.status(200).json({
            message: 'Status updated successfully',
            workflowRequest: updated
        })
    } catch (error) {
        console.error('Update status error:', error)
        res.status(500).json({ message: 'Server error updating request' })
    }
}

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string

        const logs = await prisma.auditLog.findMany({
            where: { entityId: id },
            include: {
                performedBy: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            },
            orderBy: { createdAt: 'asc' }
        })

        res.status(200).json({ logs })
    } catch (error) {
        console.error('Get audit logs error:', error)
        res.status(500).json({ message: 'Server error fetching audit logs' })
    }
}