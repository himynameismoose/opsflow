import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

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
        const role = req.user!.role

        if (role === 'REQUESTER') {
            return res.status(403).json({ message: 'Not authorized to update status' })
        }

        const updated = await prisma.workflowRequest.update({
            where: { id },
            data: { status }
        })

        res.status(200).json({
            message: 'Status updated successfully',
            workflowRequest: updated
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error updating request' })
    }
}