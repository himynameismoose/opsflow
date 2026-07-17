import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Extend Expresss Request type to include our user payload
export interface AuthRequest extends Request {
    user?: {
        userId: string
        role: string
    }
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided' })
        }

        // Pull the token out of "Bearer <token>"
        const token = authHeader.split(' ')[1]

        // Verify the token is valid and not expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string
            role: string
        }

        // Attach the user info to the request for downstream use
        req.user = decoded

        next()
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' })
    }
}