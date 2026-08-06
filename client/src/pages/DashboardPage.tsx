import { useAuth } from '../context/AuthContext'
import api from "../lib/api"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import NotificationBell from '../components/NotificationBell'
import { useTheme } from '../context/ThemeContext'

interface AuditLog {
    id: string
    action: string
    oldValue: string | null
    newValue: string | null
    createdAt: string
    performedBy: {
        name: string
        role: string
    }
}

interface WorkflowRequest {
    id: string
    title: string
    description: string
    status: string
    createdAt: string
    requester: {
        name: string
        email: string
        role: string
    }
    assignedTo: {
        id: string
        name: string
        role: string
    } | null
}

// Modern soft-tint status badge styling with dot indicators
const statusStyles: Record<string, { badge: string; dot: string }> = {
    PENDING: {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500'
    },
    APPROVED: {
        badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        dot: 'bg-emerald-500'
    },
    REJECTED: {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500'
    },
    IN_PROGRESS: {
        badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
        dot: 'bg-indigo-500'
    },
    COMPLETED: {
        badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        dot: 'bg-slate-400'
    },
}

const DashboardPage = () => {
    const { user, token, logout } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const [requests, setRequests] = useState<WorkflowRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [auditLogs, setAuditLogs] = useState<Record<string, AuditLog[]>>({})

    const fetchRequests = async () => {
        try {
            const response = await api.get('/workflows', {
                headers: { Authorization: `Bearer ${token}` }
            })
            setRequests(response.data.requests)
        } catch {
            setError('Failed to load requests')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchRequests() }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        try {
            await api.post(
                '/workflows',
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setTitle('')
            setDescription('')
            setShowForm(false)
            fetchRequests()
        } catch {
            setError('Failed to create request')
        } finally {
            setSubmitting(false)
        }
    }

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await api.patch(
                `/workflows/${id}/status`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            )
            fetchRequests()
        } catch {
            setError('Failed to update status')
        }
    }

    const fetchAuditLogs = async (requestId: string) => {
        if (auditLogs[requestId]) {
            setExpandedId(expandedId === requestId ? null : requestId)
            return
        }

        try {
            const response = await api.get(`/workflows/${requestId}/audit-logs`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            setAuditLogs(prev => ({ ...prev, [requestId]: response.data.logs }))
            setExpandedId(requestId)
        } catch {
            setError('Failed to load history')
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen dark:bg-[#080b11] bg-slate-100/70 text-slate-800 dark:text-slate-100 transition-colors duration-200">

            {/* Ambient Background Glow (Dark Mode) */}
            {isDark && (
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
            )}

            {/* Navbar */}
            <div className="sticky top-0 z-40 dark:bg-[#0c1017]/80 bg-white/80 backdrop-blur-md border-b dark:border-white/5 border-slate-200/80 px-6 py-3.5">
                <div className="max-w-5xl mx-auto flex items-center justify-between">

                    {/* Brand Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white text-sm shadow-md shadow-blue-500/20">
                            ⚡
                        </div>
                        <div>
                            <h1 className="text-sm font-semibold tracking-tight dark:text-white text-slate-900">
                                Ops<span className="text-blue-500 font-bold">Flow</span>
                            </h1>
                            <p className="text-[11px] dark:text-slate-400 text-slate-500 leading-none mt-0.5">
                                Internal Automation Suite
                            </p>
                        </div>
                    </div>

                    {/* Right Navigation */}
                    <div className="flex items-center gap-3">
                        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                            <button
                                onClick={() => navigate('/analytics')}
                                className="text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors px-3 py-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-slate-100"
                            >
                                Analytics
                            </button>
                        )}
                        
                        <NotificationBell />

                        <div className="h-4 w-px dark:bg-white/10 bg-slate-200" />

                        {/* User Profile Pill */}
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold shadow-inner">
                                {user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden sm:block">
                                <p className="text-xs font-medium dark:text-white text-slate-900 leading-none">{user?.name}</p>
                                <p className="text-[10px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider leading-none mt-0.5">{user?.role}</p>
                            </div>
                        </div>

                        <div className="h-4 w-px dark:bg-white/10 bg-slate-200" />

                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 dark:hover:bg-white/5 hover:bg-slate-100 transition-colors text-sm"
                            title="Toggle Theme"
                        >
                            {isDark ? '☀️' : '🌙'}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors px-2.5 py-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-slate-100"
                        >
                            Sign out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="max-w-5xl mx-auto px-6 py-8">

                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight dark:text-white text-slate-900">
                            Workflow Requests
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {user?.role === 'REQUESTER' ? 'Your submitted requests' : 'All team requests'}
                        </p>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-md shadow-blue-500/15 hover:shadow-blue-500/25 active:scale-[0.98] flex items-center gap-1.5"
                    >
                        <span>{showForm ? 'Cancel' : '+ New Request'}</span>
                    </button>
                </div>

                {/* New Request Modal / Form Overlay */}
                {showForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="w-full max-w-lg dark:bg-[#0c1017] bg-white rounded-2xl border dark:border-white/10 border-slate-200 p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            
                            {/* Modal Header */}
                            <div className="flex items-center justify-between pb-4 mb-4 border-b dark:border-white/5 border-slate-100">
                                <h3 className="text-sm font-semibold dark:text-white text-slate-900">
                                    New Workflow Request
                                </h3>
                                <button 
                                    onClick={() => setShowForm(false)}
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1.5">
                                        Title
                                    </label>
                                    <input 
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full dark:bg-[#121824] bg-slate-50 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:placeholder-slate-500 placeholder-slate-400 transition-all"
                                        placeholder="e.g. Ergonomic Standing Desk Upgrade"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium dark:text-slate-300 text-slate-700 mb-1.5">
                                        Description
                                    </label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full dark:bg-[#121824] bg-slate-50 border dark:border-white/10 border-slate-200 dark:text-white text-slate-900 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:placeholder-slate-500 placeholder-slate-400 transition-all"
                                        placeholder="Provide context for the team..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                {/* Footer Buttons */}
                                <div className="flex justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* Request Cards Container */}
                {loading ? (
                    <div className="text-center text-slate-400 dark:text-slate-500 py-20 text-xs">
                        Loading workspace activity...
                    </div>
                ) : requests.length === 0 ? (
                    <div className="text-center dark:bg-[#0c1017] bg-white rounded-2xl border dark:border-white/5 border-slate-200/80 py-16 px-4 shadow-sm">
                        <p className="text-xs text-slate-500 dark:text-slate-400">No active workflow requests.</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Get started by creating one above.</p>
                    </div>
                ) : (
                    <div className="space-y-3.5">
                        {requests.map((request) => {
                            const currentStatus = statusStyles[request.status] || statusStyles.COMPLETED

                            return (
                                <div
                                    key={request.id}
                                    className="dark:bg-[#0c1017] bg-white rounded-2xl border dark:border-white/5 border-slate-200/80 p-5 transition-all dark:hover:border-white/15 hover:border-slate-300 shadow-sm hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-none"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            
                                            {/* Request Title */}
                                            <h3 className="text-sm font-semibold tracking-tight dark:text-white text-slate-900">
                                                {request.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                                                {request.description}
                                            </p>

                                            {/* Meta Details */}
                                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1.5 mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                                                <div className="flex items-center gap-1.5">
                                                    <span>Submitted by</span>
                                                    <span className="font-medium text-slate-700 dark:text-slate-300">
                                                        {request.requester.name}
                                                    </span>
                                                    <span>·</span>
                                                    <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                                                </div>

                                                {request.assignedTo && (
                                                    <div className="flex items-center gap-1.5 border-l dark:border-white/10 border-slate-200 pl-4">
                                                        <span>Assigned to</span>
                                                        <span className="font-medium text-slate-700 dark:text-slate-300">
                                                            {request.assignedTo.name}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Audit History Toggle */}
                                            <button
                                                onClick={() => fetchAuditLogs(request.id)}
                                                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2.5 transition-colors"
                                            >
                                                <span>{expandedId === request.id ? 'Hide history' : 'View history'}</span>
                                                <svg className={`w-3 h-3 transition-transform ${expandedId === request.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Audit History Panel */}
                                            {expandedId === request.id && auditLogs[request.id] && (
                                                <div className="mt-4 pt-4 border-t dark:border-white/5 border-slate-100">

                                                    {/* Timeline Container */}
                                                    <div className="rounded-xl dark:bg-[#121824]/60 bg-slate-50/80 p-4 border dark:border-white/5 border-slate-200/60">
                                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                                                            Audit Trail
                                                        </p>

                                                        <div className="relative pl-3 space-y-4">
                                                            {/* Continuous Vertical Connecting Line */}
                                                            <div className="absolute left-[17px] top-2 bottom-2 w-px dark:bg-slate-700/60 bg-slate-300/80" />

                                                            {auditLogs[request.id].map((log, idx) => (
                                                                <div key={log.id || idx} className="relative flex items-start gap-3.5 group">

                                                                    {/* Timeline Node Icon/Dot */}
                                                                    <div className="relative z-10 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 dark:ring-[#121824] ring-slate-50 shrink-0 mt-1 transition-transform group-hover:scale-125" />

                                                                    {/* Event Content */}
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs dark:text-slate-200 text-slate-700 font-medium leading-tight">
                                                                            {log.action === 'REQUEST_CREATED' ? (
                                                                                <>Created by <span className="font-semibold text-slate-900 dark:text-white">{log.performedBy.name}</span></>
                                                                            ) : log.action === 'REQUEST_ASSIGNED' ? (
                                                                                <>Assigned to an approver by <span className="font-semibold text-slate-900 dark:text-white">{log.performedBy.name}</span></>
                                                                            ) : (
                                                                                <>
                                                                                    Status updated to{' '}
                                                                                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                                                        {log.newValue?.replace('_', ' ')}
                                                                                    </span>{' '}
                                                                                    by <span className="font-semibold text-slate-900 dark:text-white">{log.performedBy.name}</span>
                                                                                </>
                                                                            )}
                                                                        </p>

                                                                        {/* Timestamp */}
                                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                                            {new Date(log.createdAt).toLocaleString(undefined, {
                                                                                dateStyle: 'short',
                                                                                timeStyle: 'medium'
                                                                            })}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status Tag / Action Droplist */}
                                        <div className="shrink-0">
                                            {user?.role === 'REQUESTER' ? (
                                                <div className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${currentStatus.badge}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                                                    <span>{request.status.replace('_', ' ')}</span>
                                                </div>
                                            ) : (
                                                <div className="relative inline-block">
                                                    <select
                                                        value={request.status}
                                                        onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                                                        className={`appearance-none text-[11px] font-semibold pl-6 pr-7 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all ${currentStatus.badge} dark:bg-[#0c1017] bg-white`}
                                                    >
                                                        <option value="PENDING">PENDING</option>
                                                        <option value="APPROVED">APPROVED</option>
                                                        <option value="REJECTED">REJECTED</option>
                                                        <option value="IN_PROGRESS">IN PROGRESS</option>
                                                        <option value="COMPLETED">COMPLETED</option>
                                                    </select>
                                                    
                                                    {/* Status Dot */}
                                                    <span className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${currentStatus.dot}`} />
                                                    
                                                    {/* Arrow icon */}
                                                    <svg className="w-3 h-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default DashboardPage