import { Response } from 'express'
import prisma from '../lib/prisma'
import { AuthRequest } from '../middleware/authMiddleware'

export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { role } = req.user!

        if (role === 'REQUESTER') {
            return res.status(403).json({ message: 'Not authorized to view analytics' })
        }

        // Total requests
        const totalRequests = await prisma.workflowRequest.count()

        // Requests by status
        const byStatus = await prisma.workflowRequest.groupBy({
            by: ['status'],
            _count: { status: true }
        })

        // Requests by day (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const recentRequests = await prisma.workflowRequest.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            select: {
                createdAt: true,
                status: true,
            },
            orderBy: { createdAt: 'asc' }
        })

        // Group by date
        const byDay: Record<string, number> = {}
        recentRequests.forEach(req => {
            const day = req.createdAt.toISOString().split('T')[0]
            byDay[day] = (byDay[day] || 0) + 1
        })

        const requestsByDay = Object.entries(byDay).map(([date, count]) => ({
            date,
            count
        }))

        // Average turnaround time (completed requests only)
        const completedRequests = await prisma.workflowRequest.findMany({
            where: { status: 'COMPLETED' },
            select: {
                createdAt: true,
                updatedAt: true,
            }
        })

        const avgTurnaround = completedRequests.length > 0
            ? completedRequests.reduce((sum, req) => {
                const hours = (req.updatedAt.getTime() - req.createdAt.getTime()) / (1000 * 60 * 60)
                return sum + hours
              }, 0) / completedRequests.length
            : 0

        // Top requesters
        const topRequesters = await prisma.workflowRequest.groupBy({
            by: ['requesterId'],
            _count: { requesterId: true },
            orderBy: { _count: { requesterId: 'desc' } },
            take: 5
        })

        const requesterIds = topRequesters.map(r => r.requesterId)
        const requesterUsers = await prisma.user.findMany({
            where: { id: { in: requesterIds } },
            select: { id: true, name: true }
        })

        const topRequestersList = topRequesters.map(r => ({
            name: requesterUsers.find(u => u.id === r.requesterId)?.name || 'Unknown',
            count: r._count.requesterId
        }))

        res.status(200).json({
            totalRequests,
            byStatus: byStatus.map(s => ({
                status: s.status,
                count: s._count.status
            })),
            requestsByDay,
            avgTurnaroundHours: Math.round(avgTurnaround * 10) / 10,
            topRequesters: topRequestersList,
        })
    } catch (error) {
        console.error('Analytics error:', error)
        res.status(500).json({ message: 'Server error fetching analytics' })
    }
}