import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { exportToCSV } from '../lib/exportCsv'
import NotificationBell from '../components/NotificationBell'

interface AnalyticsData {
    totalRequests: number
    byStatus: { status: string; count: number }[]
    requestsByDay: { date: string; count: number }[]
    avgTurnaroundHours: number
    topRequesters: { name: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#EAB308',
    APPROVED: '#22C55E',
    REJECTED: '#EF4444',
    IN_PROGRESS: '#3B82F6',
    COMPLETED: '$6B7280',
}

const AnalyticsPage = () => {
    const { token, user, logout } = useAuth()
    const navigate = useNavigate()
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [requests, setRequests] = useState<any[]>([])

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics', {
                    headers: { Authorization: `Bearer ${token}`}
                })

                setData(response.data)

                const requestsResponse = await api.get('workflows', {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setRequests(requestsResponse.data.requests)
            } catch {
                setError('Failed to load analytics')
            } finally {
                setLoading(false)
            }
        }
        fetchAnalytics()
    }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading analytics...</p>
        </div>
    )

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <p className="text-red-500 text-sm">{error}</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">OpsFlow</h1>
                    <p className="text-xs text-gray-500">Internal Automation Suite</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Dashboard
                    </button>
                    <span className="text-sm text-gray-600">
                        {user?.name}
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {user?.role}
                        </span>
                    </span>
                    <NotificationBell />
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        Sign out
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">Analytics</h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Workflow request trends and performance
                        </p>
                    </div>
                    <button
                        onClick={() => exportToCSV(requests)}
                        disabled={requests.length === 0}
                        className="bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <span>↓</span>
                        Export CSV
                    </button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">Total Requests</p>
                        <p className="text-3xl font-semibold text-gray-800 mt-1">
                            {data?.totalRequests}
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">Avg Turnaround</p>
                        <p className="text-3xl font-semibold text-gray-800 mt-1">
                            {data?.avgTurnaroundHours}
                            <span className="text-sm font-normal text-gray-500 ml-1">hrs</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <p className="text-sm text-gray-500">Pending Review</p>
                        <p className="text-3xl font-semibold text-gray-800 mt-1">
                            {data?.byStatus.find(s => s.status === 'PENDING')?.count || 0}
                        </p>
                    </div>
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Requests over time */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Requests over time (last 30 days)
                        </h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={data?.requestsByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                                <XAxis 
                                    dataKey="date"
                                    tick={{ fontSize: 11 }}
                                    tickFormatter={(val) => val.slice(5)}
                                />
                                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* By status pie chart */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">
                            Requests by status
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={data?.byStatus}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                >
                                    {data?.byStatus.map((entry) => (
                                        <Cell 
                                            key={entry.status}
                                            fill={STATUS_COLORS[entry.status] || '#6B7280'}
                                        />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top requesters */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                        Top requesters
                    </h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                            data={data?.topRequesters}
                            layout="vertical"
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                            <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                            <Tooltip />
                            <Bar dataKey="count"  fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default AnalyticsPage