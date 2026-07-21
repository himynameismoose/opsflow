import { useAuth } from '../context/AuthContext'
import api from "../lib/api"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'

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
}

const DashboardPage = () => {
    const { user, token, logout } = useAuth()
    const navigate = useNavigate()

    const [requests, setRequests] = useState<WorkflowRequest[]>([])
    const[loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    const fetchRequests = async () => {
        try {
            const response = await api.get('/workflows', {
                headers: { Authorization: `Bearer ${token}`}
            })

            setRequests(response.data.requests)
        } catch {
            setError('Failed to load requests')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

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

    const handleLogout = () => {
        logout()
        navigate('/login')
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

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-800',
        APPROVED: 'bg-green-100 text-green-800',
        REJECTED: 'bg-red-100 text-red-800',
        IN_PROGRESS: 'bg-blue-100 text-blue-800',
        COMPLETED: 'bg-gray-100 text-gray-100',
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <div className="big-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-semibold text-gray-800">OpsFlow</h1>
                    <p className="text-xs text-gray-500">Internal Automation Suite</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {user?.name}
                        <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {user?.role}
                        </span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-gray-500 hover-text-gray-800 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div>

                {/* Main content */}
                <div className="max-w-4xl mx-auto px-6 py-8">

                    {/* Header row */}
                    <div className="flex items-center justify-between mb-6">

                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Workflow Requests
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {user?.role === 'REQUESTER' ? 'Your submitted requests' : 'All team requests'}
                            </p>
                        </div>

                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"    
                        >
                            {showForm ? 'Cancel' : '+ New Request'}
                        </button>
                    </div>

                    {/* New Request form */}
                    {showForm && (
                        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">
                                New Workflow Request
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g. New laptop request"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Describe what you need and why"
                                        rows={3}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {/* Request list */}
                    {loading ? (
                        <div className="text-center text-gray-400 py-12 text-sm">
                            Loading requests...
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center text-gray-400 py-12 text-sm">
                            No requests yet. Create your first one above.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {requests.map((request) => (
                                <div
                                    key={request.id}
                                    className="bg-white rounded-xl border border-gray-200 p-5"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-800">
                                                {request.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {request.description}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Submitted by {request.requester.name} •{' '}
                                                {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        {user?.role === 'REQUESTER' ? (
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[request.status]}`}>
                                                {request.status.replace('_', ' ')}
                                            </span>
                                        ) : (
                                            <select
                                                value={request.status}
                                                onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                                                className={`text-sm font-medium px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusColors[request.status]}`}
                                            >
                                                <option value="PENDING">PENDING</option>
                                                <option value="APPROVED">APPROVED</option>
                                                <option value="REJECTED">REJECTED</option>
                                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        )}
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DashboardPage