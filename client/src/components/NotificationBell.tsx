import { useEffect, useRef, useState } from "react"
import { useAuth } from "../context/AuthContext"
import api from "../lib/api"

interface Notification {
    id: string
    message: string
    read: boolean
    createdAt: string
}

// Dynamic status-icon parser based on notification text
const getNotificationIcon = (message: string) => {
    const msgUpper = message.toUpperCase()

    if (msgUpper.includes('APPROVED')) {
        return (
            <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0 text-xs font-bold">
                ✓
            </div>
        )
    }
    if (msgUpper.includes('REJECTED')) {
        return (
            <div className="w-7 h-7 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 text-xs font-bold">
                ✕
            </div>
        )
    }
    if (msgUpper.includes('ASSIGNED')) {
        return (
            <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 text-xs">
                👤
            </div>
        )
    }
    return (
        <div className="w-7 h-7 rounded-full bg-slate-500/10 border border-slate-500/20 text-slate-400 flex items-center justify-center shrink-0 text-xs">
            ⚡
        </div>
    )
}

// Helper to format timestamps into clean relative dates or short times
const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
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

        return () => clearInterval(interval)
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
        <div className="relative" ref={panelRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(!open)}
                className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100 transition-all"
                title="Notifications"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-haspopup="dialog"
                aria-expanded={open}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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

                {/* Animated Unread Badge */}
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 ring-2 dark:ring-[#0c1017] ring-white"></span>
                    </span>
                )}
            </button>

            {/* Dropdown panel */}
            {open && (
                <>
                    {/* Backdrop listener */}
                    <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    {/* Popover Card */}
                    <div className="absolute right-0 mt-2 w-80 sm:w-88 z-50">
                        
                        {/* Caret pointing to bell */}
                        <div className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 dark:bg-[#0c1017] bg-white border-t border-l dark:border-white/10 border-slate-200/90" />

                        {/* Panel itself keeps overflow-hidden for the rounded content */}
                        <div 
                            className="rounded-2xl dark:bg-[#0c1017] bg-white border dark:border-white/10 border-slate-200/90 shadow-2xl shadow-slate-950/20 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2"
                            role="dialog"
                            aria-label="Notifications"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b dark:border-white/5 border-slate-100">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-xs font-semibold dark:text-white text-slate-900">
                                        Notifications
                                    </h3>
                                    {unreadCount > 0 && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                                            {unreadCount} new
                                        </span>
                                    )}
                                </div>

                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllAsRead}
                                        className="text-[11px] font-medium text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                            </div>

                            {/* List items */}
                            <div className="max-h-[320px] overflow-y-auto divide-y dark:divide-white/5 divide-slate-100">
                                {notifications.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-xs dark:text-slate-500 text-slate-400">
                                        No notifications yet
                                    </div>
                                ) : (
                                    notifications.map(notification => (
                                        <div
                                            key={notification.id}
                                            onClick={() => !notification.read && markAsRead(notification.id)}
                                            onKeyDown={(e) => {
                                                if ((e.key === 'Enter' || e.key === ' ') && !notification.read) {
                                                    e.preventDefault()
                                                    markAsRead(notification.id)
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={notification.read ? notification.message : `${notification.message}, unread`}
                                            className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer dark:hover:bg-white/[0.03] hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset ${
                                                !notification.read ? 'dark:bg-blue-500/[0.03] bg-blue-50/50' : ''
                                            }`}
                                        >
                                            {/* Auto Status Badge Icon */}
                                            {getNotificationIcon(notification.message)}

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium dark:text-slate-200 text-slate-800 leading-snug">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                                                    {formatTimestamp(notification.createdAt)}
                                                </p>
                                            </div>

                                            {/* Unread Indicator Dot */}
                                            {!notification.read && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-2 bg-slate-50/50 dark:bg-white/[0.01] border-t dark:border-white/5 border-slate-100 text-center">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500"> 
                                    Workspace Notifications
                                </span>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default NotificationBell