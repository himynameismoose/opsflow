import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../lib/api"

interface Notification {
    id: string
    message: string
    read: boolean
    createdAt: string
}

const NotificationBell = () => {
    const { token } = useAuth()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const panelRef = useRef<HTMLDivElement>(null)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        try {
            const response = await api.get('/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            })

            setNotifications(response.data.notifications)
            setUnreadCount(response.data.unreadCount)

        } catch {
            console.error('Failed to fetch notifications')
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000)

        return() => clearInterval(interval)
    }, [])

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all', {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch {
            console.error('Failed to mark all as read')
        }
    }

    const markAsRead = async (id: string) => {
        try {
            await api.patch(`/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, read: true } : n)
            )

            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch {
            console.error('Failed to mark as read')
            
        }
    }

    return (
        <div>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <>
                    {/* Invisible overlay */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-sm text-gray-400">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => !notification.read && markAsRead(notification.id)}
                                        className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            !notification.read ? 'bg-blue-50' : ''
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {!notification.read && (
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"/>
                                            )}
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default NotificationBell