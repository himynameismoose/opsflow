/// <reference types="node" />

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean existing data in correct order
    await prisma.notification.deleteMany()
    await prisma.auditLog.deleteMany()
    await prisma.workflowRequest.deleteMany()
    await prisma.user.deleteMany()

    console.log('✓ Cleared existing data')

    // Create users
    const hashedPassword = await bcrypt.hash('opsflow123', 10)

    const admin = await prisma.user.create({
        data: {
            name: 'Alex Rivera',
            email: 'admin@opsflow.com',
            password: hashedPassword,
            role: 'ADMIN',
        }
    })

    const manager = await prisma.user.create({
        data: {
            name: 'Jordan Lee',
            email: 'manager@opsflow.com',
            password: hashedPassword,
            role: 'MANAGER',
        }
    })

    const requester = await prisma.user.create({
        data: {
            name: 'Sam Chen',
            email: 'requester@opsflow.com',
            password: hashedPassword,
            role: 'REQUESTER',
        }
    })

    console.log('✓ Created 3 users (Admin, Manager, Requester)')

    // Create workflow requests
    const requests = await Promise.all([
        prisma.workflowRequest.create({
        data: {
            title: 'Ergonomic Standing Desk',
            description: 'Request for a height-adjustable standing desk to improve posture and reduce fatigue during long work sessions.',
            status: 'APPROVED',
            requesterId: requester.id,
            assignedToId: admin.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'MacBook Pro 16" Upgrade',
            description: 'Current laptop is 4 years old and struggling with build times. Requesting upgrade to support development workload.',
            status: 'IN_PROGRESS',
            requesterId: requester.id,
            assignedToId: manager.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'Slack Business Plan Upgrade',
            description: 'Team has hit the message history limit on the free plan. Requesting upgrade to Business+ for full history and integrations.',
            status: 'PENDING',
            requesterId: requester.id,
            assignedToId: admin.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'External Monitor — 27" 4K',
            description: 'Requesting dual monitor setup to improve productivity when working across multiple applications simultaneously.',
            status: 'PENDING',
            requesterId: requester.id,
            assignedToId: manager.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'Team Offsite — Q3 Planning',
            description: 'Budget request for a one-day team offsite to align on Q3 priorities and conduct retrospective.',
            status: 'REJECTED',
            requesterId: manager.id,
            assignedToId: admin.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'Adobe Creative Cloud License',
            description: 'Requesting license for design work on marketing materials and product documentation.',
            status: 'COMPLETED',
            requesterId: manager.id,
            assignedToId: admin.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'Noise-Cancelling Headphones',
            description: 'Open office environment makes it difficult to focus. Requesting Sony WH-1000XM5 for deep work sessions.',
            status: 'APPROVED',
            requesterId: requester.id,
            assignedToId: manager.id,
        }
        }),
        prisma.workflowRequest.create({
        data: {
            title: 'AWS Training & Certification',
            description: 'Requesting budget for AWS Solutions Architect certification to support cloud infrastructure work.',
            status: 'IN_PROGRESS',
            requesterId: requester.id,
            assignedToId: admin.id,
        }
        }),
    ])

    console.log(`✓ Created ${requests.length} workflow requests`)

    // Create audit logs
    await Promise.all(requests.map(async (request) => {
        await prisma.auditLog.create({
        data: {
            action: 'REQUEST_CREATED',
            entityType: 'WorkflowRequest',
            entityId: request.id,
            performedById: request.requesterId,
            newValue: 'PENDING',
        }
        })

        await prisma.auditLog.create({
        data: {
            action: 'REQUEST_ASSIGNED',
            entityType: 'WorkflowRequest',
            entityId: request.id,
            performedById: request.requesterId,
            newValue: request.assignedToId,
        }
        })

        if (request.status !== 'PENDING') {
        await prisma.auditLog.create({
            data: {
            action: 'STATUS_UPDATED',
            entityType: 'WorkflowRequest',
            entityId: request.id,
            performedById: request.assignedToId!,
            oldValue: 'PENDING',
            newValue: request.status,
            }
        })
        }
    }))

    console.log('✓ Created audit log entries')

    // Create notifications
    await Promise.all([
        prisma.notification.create({
        data: {
            userId: admin.id,
            message: 'New workflow request assigned to you: "Ergonomic Standing Desk"',
            read: false,
        }
        }),
        prisma.notification.create({
        data: {
            userId: manager.id,
            message: 'New workflow request assigned to you: "MacBook Pro 16\\" Upgrade"',
            read: false,
        }
        }),
        prisma.notification.create({
        data: {
            userId: requester.id,
            message: 'Your request "Ergonomic Standing Desk" has been updated to APPROVED',
            read: false,
        }
        }),
        prisma.notification.create({
        data: {
            userId: manager.id,
            message: 'Your request "Adobe Creative Cloud License" has been updated to COMPLETED',
            read: true,
        }
        }),
        prisma.notification.create({
        data: {
            userId: manager.id,
            message: 'Your request "Team Offsite — Q3 Planning" has been updated to REJECTED',
            read: false,
        }
        }),
    ])

    console.log('✓ Created notifications')

    console.log('\n✅ Seed complete!')
    console.log('\nDemo accounts:')
    console.log('  Admin:     admin@opsflow.com     / opsflow123')
    console.log('  Manager:   manager@opsflow.com   / opsflow123')
    console.log('  Requester: requester@opsflow.com / opsflow123')
}

main()
    .catch((e) => {
        console.error('Seed failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })