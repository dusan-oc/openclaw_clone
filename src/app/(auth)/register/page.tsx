'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-purple-400">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  )
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    username: searchParams.get('username') ?? '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const [checkingUsername, setCheckingUsername] = useState(false)

  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'username':
        if (value.length < 3) return 'Username must be at least 3 characters'
        if (value.length > 20) return 'Username must be 20 characters or less'
        if (!/^[a-z0-9_]+$/i.test(value)) return 'Only letters, numbers, and underscores'
        return ''
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format'
        return ''
      case 'password':
        if (value.length < 8) return 'Password must be at least 8 characters'
        return ''
      case 'display_name':
        if (value.trim().length < 1) return 'Display name is required'
        return ''
      default:
        return ''
    }
  }

  // Debounced username availability check (CR-008)
  const checkUsername = useCallback(async (username: string) => {
    if (username.length < 3 || !/^[a-z0-9_]+$/i.test(username)) {
      setUsernameAvailable(null)
      return
    }
    setCheckingUsername(true)
    try {
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(username)}`)
      const data = await res.json()
      setUsernameAvailable(data.available)
    } catch {
      setUsernameAvailable(null)
    } finally {
      setCheckingUsername(false)
    }
  }, [])

  useEffect(() => {
    if (!form.username || form.username.length < 3) {
      setUsernameAvailable(null)
      return
    }
    const timer = setTimeout(() => checkUsername(form.username), 600)
    return () => clearTimeout(timer)
  }, [form.username, checkUsername])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError('')

    // Validate all fields
    const newErrors: Record<string, string> = {}
    for (const [name, value] of Object.entries(form)) {
      if (name === 'confirmPassword') continue
      const error = validateField(name, value)
      if (error) newErrors[name] = error
    }

    // CR-006: Confirm password
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords don\'t match'
    }

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: form.display_name,
          email: form.email,
          username: form.username,
          password: form.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? 'Registration failed')
        return
      }

      // Auto-login after successful registration (CR-001)
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        router.push('/login')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setServerError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const usernamePreview = form.username
    ? `glimr.io/${form.username.toLowerCase()}`
    : 'glimr.io/yourname'

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
        <h1 className="text-2xl font-bold text-white">Create My Page</h1>
        <p className="text-purple-300 text-sm mt-1">Free forever. No credit card needed.</p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-purple-900/50 p-8"
        style={{ background: 'rgba(26, 16, 48, 0.8)', backdropFilter: 'blur(20px)' }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Display Name</label>
            <input
              type="text"
              name="display_name"
              value={form.display_name}
              onChange={handleChange}
              placeholder="Your Name"
              required
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderColor: errors.display_name ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
              }}
            />
            {errors.display_name && <p className="text-pink-400 text-xs mt-1">{errors.display_name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderColor: errors.email ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
              }}
            />
            {errors.email && <p className="text-pink-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Username</label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="yourname"
                required
                className="w-full px-4 py-3 pr-10 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: errors.username ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
                }}
              />
              {form.username.length >= 3 && !errors.username && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">
                  {checkingUsername ? '⏳' : usernameAvailable === true ? '✅' : usernameAvailable === false ? '❌' : ''}
                </span>
              )}
            </div>
            {errors.username ? (
              <p className="text-pink-400 text-xs mt-1">{errors.username}</p>
            ) : usernameAvailable === false ? (
              <p className="text-pink-400 text-xs mt-1">Username is taken</p>
            ) : (
              <p className="text-purple-400 text-xs mt-1">
                🔗 Your page:{' '}
                <span className={form.username ? 'text-purple-300 font-medium' : 'text-purple-500'}>
                  {usernamePreview}
                </span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 8 characters"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: errors.password ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
                }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors p-1">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-pink-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-200 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                required
                className="w-full px-4 py-3 pr-12 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
                style={{
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderColor: errors.confirmPassword ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
                }}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white transition-colors p-1">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-pink-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          {serverError && (
            <div className="text-pink-400 text-sm bg-pink-500/10 border border-pink-500/20 rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          >
            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating…</> : 'Create My Page'}
          </button>

          <p className="text-purple-500 text-xs text-center mt-2">
            By creating an account you agree to our{' '}
            <Link href="/terms" className="text-purple-400 hover:text-purple-300 underline">Terms of Service</Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-purple-400 hover:text-purple-300 underline">Privacy Policy</Link>.
          </p>
        </form>
      </div>

      <p className="text-center text-purple-400 text-sm mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-purple-300 hover:text-white font-medium transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}
