'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setHasError(false)
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        setHasError(true)
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setHasError(true)
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    if (hasError) setHasError(false)
  }

  const inputBorder = hasError ? '#ef4444' : 'rgba(139, 92, 246, 0.3)'

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            ✨
          </div>
          <span className="text-white font-bold text-xl">Glimr</span>
        </Link>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-purple-300 text-sm mt-1">Log in to your Glimr account</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-purple-900/50 p-8"
        style={{ background: 'rgba(26, 16, 48, 0.8)', backdropFilter: 'blur(20px)' }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError() }}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none focus:ring-2 transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderColor: inputBorder,
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); clearError() }}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-purple-400/50 outline-none focus:ring-2 transition-all"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: inputBorder,
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors p-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="text-pink-400 text-sm bg-pink-500/10 border border-pink-500/20 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Logging in…</> : 'Log In'}
          </button>
        </form>
      </div>

      <p className="text-center text-purple-400 text-sm mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-purple-300 hover:text-white font-medium transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
