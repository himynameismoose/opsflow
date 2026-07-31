import { AuthRequest } from '../middleware/authMiddleware'
import { Response } from 'express'
import prisma from '../lib/prisma'

// Get all notifications for the logged-in user
export const getNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        })

        const unreadCount = await prisma.notification.count({
            where: { userId, read: false }
        })

        res.status(200).json({ notifications, unreadCount })

    } catch (error) {
        console.error('Get notifications error:', error)
        res.status(500).json({ message: 'Server error fetching notifications'})
    }
}

// Mark a single notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const id = req.params.id as string
        const userId = req.user!.userId

        await prisma.notification.update({
            where: { id, userId },
            data: { read: true }
        })

        res.status(200).json({ message: 'Notification marked as read' })
    } catch (error) {
        console.error('Mark as read error:', error)
        res.status(500).json({ message: 'Server error updating notifications'})
    }
}

// Mark all notifications as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.userId

        await prisma.notification.updateMany({
            where: { userId, read: false },
            data: { read: true }
        })

        res.status(200).json({ message: 'All notifications marked as read' })

    } catch (error) {
        console.error('Mark all as read error:', error)
        res.status(500).json({ message: 'Server error updating notifications'})
    }
}