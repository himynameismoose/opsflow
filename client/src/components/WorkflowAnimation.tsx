import { useEffect, useRef } from 'react'

interface Node {
    x: number
    y: number
    label: string
}

interface Edge {
    from: number
    to: number
}

interface Particle {
    edge: number
    progress: number
    speed: number
}

const NODES: Node[] = [
    { x: 120, y: 80,  label: 'REQUEST' },
    { x: 300, y: 80,  label: 'ROUTE'   },
    { x: 480, y: 80,  label: 'REVIEW'  },
    { x: 200, y: 220, label: 'NOTIFY'  },
    { x: 380, y: 220, label: 'APPROVE' },
    { x: 300, y: 340, label: 'COMPLETE'},
]

const EDGES: Edge[] = [
    { from: 0, to: 1 },
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
    { from: 4, to: 5 },
]

const WorkflowAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([
        { edge: 0, progress: 0,   speed: 0.004 },
        { edge: 1, progress: 0.3, speed: 0.003 },
        { edge: 2, progress: 0.6, speed: 0.005 },
        { edge: 3, progress: 0.1, speed: 0.004 },
        { edge: 4, progress: 0.5, speed: 0.003 },
        { edge: 5, progress: 0.8, speed: 0.004 },
    ])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animId: number

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw edges
            EDGES.forEach(edge => {
                const from = NODES[edge.from]
                const to = NODES[edge.to]
                ctx.beginPath()
                ctx.moveTo(from.x, from.y)
                ctx.lineTo(to.x, to.y)
                ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)'
                ctx.lineWidth = 1.5
                ctx.stroke()
            })

            // Draw nodes
            NODES.forEach(node => {
                // Outer glow ring
                ctx.beginPath()
                ctx.arc(node.x, node.y, 18, 0, Math.PI * 2)
                ctx.fillStyle = 'rgba(37, 99, 235, 0.08)'
                ctx.fill()

                // Node circle
                ctx.beginPath()
                ctx.arc(node.x, node.y, 10, 0, Math.PI * 2)
                ctx.fillStyle = '#0F1A2E'
                ctx.fill()
                ctx.strokeStyle = '#2563EB'
                ctx.lineWidth = 1.5
                ctx.stroke()

                // Node center dot
                ctx.beginPath()
                ctx.arc(node.x, node.y, 3, 0, Math.PI * 2)
                ctx.fillStyle = '#2563EB'
                ctx.fill()

                // Label
                ctx.fillStyle = 'rgba(156, 163, 175, 0.7)'
                ctx.font = '9px monospace'
                ctx.textAlign = 'center'
                ctx.fillText(node.label, node.x, node.y + 28)
            })

            // Draw and move particles
            particlesRef.current = particlesRef.current.map(particle => {
                const edge = EDGES[particle.edge]
                const from = NODES[edge.from]
                const to = NODES[edge.to]

                const x = from.x + (to.x - from.x) * particle.progress
                const y = from.y + (to.y - from.y) * particle.progress

                // Particle glow
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6)
                gradient.addColorStop(0, 'rgba(96, 165, 250, 0.9)')
                gradient.addColorStop(1, 'rgba(96, 165, 250, 0)')
                ctx.beginPath()
                ctx.arc(x, y, 6, 0, Math.PI * 2)
                ctx.fillStyle = gradient
                ctx.fill()

                // Particle core
                ctx.beginPath()
                ctx.arc(x, y, 2.5, 0, Math.PI * 2)
                ctx.fillStyle = '#93C5FD'
                ctx.fill()

                // Advance particle
                const newProgress = particle.progress + particle.speed
                return {
                    ...particle,
                    progress: newProgress >= 1 ? 0 : newProgress
                }
            })

            animId = requestAnimationFrame(draw)
        }

        draw()
        return () => cancelAnimationFrame(animId)
    }, [])

    return (
        <canvas
            ref={canvasRef}
            width={600}
            height={420}
            className="w-full max-w-lg opacity-90"
        />
    )
}

export default WorkflowAnimation