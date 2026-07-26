import app from '..'
import prisma from './prisma'

export const assignApprover = async (): Promise<string | null> => {
    // Find all admins and managers
    const approvers = await prisma.user.findMany({
        where: {
            role: {
                in: ['ADMIN', 'MANAGER']
            }
        },
        select: {
            id: true,
            assignedWork: {
                where: {
                    status: {
                        in: ['PENDING', 'IN_PROGRESS']
                    }
                },
                select: { id: true }
            }
        }
    })

    if (approvers.length === 0) return null

    // Sort by current workload: assign to whoever has the fewest active requests
    const sorted = approvers.sort(
        (a, b) => a.assignedWork.length - b.assignedWork.length
    )

    return sorted[0].id
}