import prisma from './prisma'

interface AuditLogParams {
    action: string
    entityType: string
    entityId: string
    performedById: string
    oldValue?: string
    newValue?: string
}

export const createAuditLog = async (params: AuditLogParams) => {
    try {
        await prisma.auditLog.create({
            data: {
                action: params.action,
                entityType: params.entityType,
                entityId: params.entityId,
                performedById: params.performedById,
                oldValue: params.oldValue,
                newValue: params.newValue,
            }
        })
    } catch (error) {
        console.error('Failed to create audit log:', error)
    }
}