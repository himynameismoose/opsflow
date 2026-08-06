import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import NotificationBell from '../components/NotificationBell'
import { exportToCSV } from '../lib/exportCsv'

interface AnalyticsData {
  totalRequests: number
  byStatus: { status: string; count: number }[]
  requestsByDay: { date: string; count: number }[]
  avgTurnaroundHours: number
  topRequesters: { name: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:     '#EAB308',
  APPROVED:    '#10B981',
  REJECTED:    '#EF4444',
  IN_PROGRESS: '#3B82F6',
  COMPLETED:   '#6B7280',
}

const AnalyticsPage = () => {
  const { token, user, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, requestsRes] = await Promise.all([
          api.get('/analytics', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/workflows', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setData(analyticsRes.data)
        setRequests(requestsRes.data.requests)
      } catch {
        setError('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9'
  const tickColor = isDark ? '#64748B' : '#94A3B8'
  const tooltipStyle = isDark
    ? { backgroundColor: '#0c1017', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }
    : { backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '12px', color: '#0F172A' }

  if (loading) return (
    <div className="min-h-screen dark:bg-[#07090e] bg-slate-50 flex items-center justify-center">
      <p className="text-sm dark:text-slate-500 text-slate-400">Loading analytics...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen dark:bg-[#07090e] bg-slate-50 flex items-center justify-center">
      <p className="text-sm text-red-400">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen dark:bg-[#07090e] bg-slate-50 transition-colors duration-300">

      {isDark && (
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      )}

      {/* Navbar */}
      <div className="sticky top-0 z-40 dark:bg-[#0a0d14]/80 bg-white/80 backdrop-blur-xl border-b dark:border-white/5 border-slate-200 px-6 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              ⚡
            </div>
            <div>
              <h1 className="text-sm font-bold dark:text-white text-slate-900">
                Ops<span className="text-blue-500">Flow</span>
              </h1>
              <p className="text-xs dark:text-slate-500 text-slate-400 leading-none">
                Internal Automation Suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-xs font-medium dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors px-3 py-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-slate-100"
            >
              Dashboard
            </button>
            <NotificationBell />
            <div className="h-4 w-px dark:bg-white/10 bg-slate-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium dark:text-white text-slate-900 leading-none">{user?.name}</p>
                <p className="text-[10px] font-semibold dark:text-slate-400 text-slate-500 uppercase tracking-wider leading-none mt-0.5">{user?.role}</p>
              </div>
            </div>
            <div className="h-4 w-px dark:bg-white/10 bg-slate-200" />
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg dark:text-slate-400 text-slate-500 dark:hover:bg-white/5 hover:bg-slate-100 transition-colors text-sm"
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs font-medium dark:text-slate-400 text-slate-500 dark:hover:text-white hover:text-slate-900 transition-colors px-2.5 py-1.5 rounded-lg dark:hover:bg-white/5 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-semibold dark:text-white text-slate-900">Analytics</h2>
            <p className="text-sm dark:text-slate-400 text-slate-500 mt-0.5">
              Workflow request trends and performance
            </p>
          </div>
          <button
            onClick={() => exportToCSV(requests)}
            disabled={requests.length === 0}
            className="flex items-center gap-2 dark:bg-[#0f1420] bg-white border dark:border-white/5 border-slate-200 dark:text-slate-300 text-slate-600 text-xs font-medium px-4 py-2 rounded-xl transition-all dark:hover:border-white/10 hover:border-slate-300 disabled:opacity-50 shadow-sm"
          >
            <span>↓</span>
            Export CSV
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Requests', value: data?.totalRequests, unit: '' },
            { label: 'Avg Turnaround', value: data?.avgTurnaroundHours, unit: 'hrs' },
            { label: 'Pending Review', value: data?.byStatus.find(s => s.status === 'PENDING')?.count ?? 0, unit: '' },
          ].map(({ label, value, unit }) => (
            <div
              key={label}
              className="dark:bg-[#0f1420] bg-white rounded-2xl border dark:border-white/5 border-slate-200 p-5 shadow-sm"
            >
              <p className="text-xs font-medium dark:text-slate-400 text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="text-3xl font-bold dark:text-white text-slate-900 mt-2 tracking-tight">
                {value}
                {unit && <span className="text-sm font-normal dark:text-slate-400 text-slate-500 ml-1">{unit}</span>}
              </p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Requests over time */}
          <div className="dark:bg-[#0f1420] bg-white rounded-2xl border dark:border-white/5 border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500 mb-5">
              Requests over time (last 30 days)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data?.requestsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: tickColor }} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* By status */}
          <div className="dark:bg-[#0f1420] bg-white rounded-2xl border dark:border-white/5 border-slate-200 p-5 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500 mb-5">
              Requests by status
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={data?.byStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80}>
                  {data?.byStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#6B7280'} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => (
                    <span style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: '11px' }}>{value}</span>
                  )}
                />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top requesters */}
        <div className="dark:bg-[#0f1420] bg-white rounded-2xl border dark:border-white/5 border-slate-200 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider dark:text-slate-400 text-slate-500 mb-5">
            Top requesters
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.topRequesters} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis type="number" tick={{ fontSize: 10, fill: tickColor }} allowDecimals={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: tickColor }} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage