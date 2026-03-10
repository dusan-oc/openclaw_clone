'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    display_name: '',
    email: '',
    username: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

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
      const error = validateField(name, value)
      if (error) newErrors[name] = error
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
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error ?? 'Registration failed')
        return
      }

      // Auto-login after successful registration
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
        <h1 className="text-2xl font-bold text-white">Create your page</h1>
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
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="yourname"
              required
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderColor: errors.username ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
              }}
            />
            {errors.username ? (
              <p className="text-pink-400 text-xs mt-1">{errors.username}</p>
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
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 8 characters"
              required
              className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
              style={{
                background: 'rgba(139, 92, 246, 0.1)',
                borderColor: errors.password ? '#EC4899' : 'rgba(139, 92, 246, 0.3)',
              }}
            />
            {errors.password && <p className="text-pink-400 text-xs mt-1">{errors.password}</p>}
          </div>

          {serverError && (
            <div className="text-pink-400 text-sm bg-pink-500/10 border border-pink-500/20 rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}
          >
            {loading ? 'Creating account…' : 'Create My Page'}
          </button>
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
