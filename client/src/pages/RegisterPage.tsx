import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import api from "../lib/api"
import { useTheme } from '../context/ThemeContext'
import WorkflowAnimation from '../components/WorkflowAnimation'


const RegisterPage = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { login } = useAuth()
    const { isDark, toggleTheme } = useTheme()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await api.post('/auth/register', {
                name,
                email,
                password,
            })

            login(response.data.user, response.data.token)
            navigate('/dashboard')

        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Registration failed')
            } else {
                setError('Something went wrong')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-[#07090e] text-white transition-colors duration-300 relative  overflow-hidden">

            {/* Theme toggle */}
            <button 
                onClick={toggleTheme}
                className="absolute top-6 right-6 z-30 p-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all text-sm shadow-sm"
                aria-label="Toggle theme"
            >
                {isDark ? '☀️' : '🌙'}
            </button>

            {/* Ambient glows */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/3 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Left panel */}
            <div className="hidden lg:flex flex-col justify-between w-7/12 p-12 relative z-10">
            
                {/* Brand */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30">
                        ⚡
                    </div>
                    <h1 className="text-white text-3xl font-extrabold tracking-tight">
                        Ops<span className="text-blue-500">Flow</span>
                    </h1>
                </div>

                {/* Animation */}
                <div className="flex-1 flex items-center justify-center my-8 scale-125 xl:scale-150">
                    <WorkflowAnimation />
                </div>

                {/* Tagline */}
                <div className="max-w-lg">
                    <p className="text-3xl font-semibold text-white tracking-tight leading-tight mb-3">
                        Operational clarity through
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                            intelligent workflows.
                        </span>
                    </p>
                    <p className="text-sm text-gray-400 leading-relaxed">
                        Automate approvals. Track requests in real time. Move faster together.
                    </p>
                </div>

                {/* Divider */}
                <div className="absolute right-0 top-16 bottom-16 w-[1px] bg-gradient-to-b from-transparent via-blue-500/25 to-transparent pointer-events-none" />
            </div>

            {/* Right panel */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-20">
                <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl dark:bg-[#111622]/90 bg-white/95 backdrop-blur-xl shadow-2xl dark:shadow-black/60 border dark:border-white/10 border-gray-200 transition-all">

                    {/* Mobile branding */}
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/30">
                            ⚡
                        </div>
                        <h1 className="text-2xl font-bold dark:text-white text-gray-900">
                            Ops<span className="text-blue-500">Flow</span>
                        </h1>
                    </div>

                    <div className="mb-6">
                        <h2 className="text-2xl font-bold dark:text-white text-gray-900 tracking-tight">
                            Create an account
                        </h2>
                        <p className="text-sm dark:text-gray-400 text-gray-500 mt-1">
                            Start managing your workflows today.
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 text-red-500 dark:text-red-400 text-sm p-3.5 rounded-xl mb-6">
                            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Name field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-2">
                                Full name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 dark:bg-[#182030] bg-gray-50 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:placeholder-gray-500 placeholder-gray-400 transition-all"
                                    placeholder="Mershelle Rivera"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 dark:bg-[#182030] bg-gray-50 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:placeholder-gray-500 placeholder-gray-400 transition-all"
                                    placeholder="you@company.com"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider dark:text-gray-300 text-gray-600 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2.5 dark:bg-[#182030] bg-gray-50 border dark:border-white/10 border-gray-200 dark:text-white text-gray-900 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:placeholder-gray-500 placeholder-gray-400 transition-all"
                                    placeholder="••••••••"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.002 10.002 0 015.682 1.937m4.008 4.008A9.957 9.957 0 0121.543 12c-1.275 4.057-5.065 7-9.543 7a9.96 9.96 0 01-3.134-.51M3 3l18 18" />
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Creating account...</span>
                                </>
                        ) : (
                            <span>Create account</span>
                        )}
                        </button>
                    </form>

                    <p className="text-center text-sm dark:text-gray-400 text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-blue-500 hover:text-blue-400 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterPage