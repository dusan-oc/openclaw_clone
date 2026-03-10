'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1a0533 50%, #0a0010 100%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
              ✨
            </div>
            <span className="text-white font-bold text-xl">Glimr</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Reset your password</h1>
          <p className="text-purple-300 text-sm mt-1">We&apos;ll help you get back in.</p>
        </div>

        <div className="rounded-2xl border border-purple-900/50 p-8"
          style={{ background: 'rgba(26, 16, 48, 0.8)', backdropFilter: 'blur(20px)' }}>
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <p className="text-white font-medium mb-2">Check your inbox</p>
              <p className="text-purple-300 text-sm">
                Password reset emails are coming soon. Contact support for help.
              </p>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border text-white placeholder-purple-400/50 outline-none transition-all"
                  style={{ background: 'rgba(139, 92, 246, 0.1)', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                />
              </div>
              <button type="submit"
                className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
                Send Reset Link
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-purple-400 text-sm mt-6">
          <Link href="/login" className="text-purple-300 hover:text-white font-medium transition-colors">
            ← Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}
