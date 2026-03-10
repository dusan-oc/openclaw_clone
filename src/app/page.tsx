'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const [claimUsername, setClaimUsername] = useState('')

  const handleClaim = (e: React.FormEvent) => {
    e.preventDefault()
    if (claimUsername.trim()) {
      router.push(`/register?username=${encodeURIComponent(claimUsername.trim().toLowerCase())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0F0A1A 0%, #1a0533 50%, #0a0010 100%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            ✨
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Glimr</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="text-purple-300 hover:text-white text-sm font-medium transition-colors px-4 py-2">
            Log In
          </Link>
          <Link href="/register" className="text-sm font-semibold px-4 py-2 rounded-full transition-all" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', color: 'white' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4 shadow-2xl" style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', boxShadow: '0 0 60px rgba(139, 92, 246, 0.5)' }}>
            ✨
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
          Your links.{' '}
          <span style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Your brand.
          </span>
          <br />
          One link.
        </h1>

        <p className="text-lg md:text-xl text-purple-200 mb-8 max-w-xl leading-relaxed">
          The link-in-bio platform built for creators.{' '}
          <strong className="text-white">No censorship. No paywalls.</strong>
        </p>

        {/* Username Claim Form (CR-027) */}
        <form onSubmit={handleClaim} className="flex items-center gap-2 mb-6 max-w-md w-full">
          <div className="flex-1 flex items-center rounded-full border border-purple-500/50 overflow-hidden"
            style={{ background: 'rgba(139, 92, 246, 0.1)' }}>
            <span className="text-purple-400 text-sm pl-4 whitespace-nowrap">glimr.io/</span>
            <input
              type="text"
              value={claimUsername}
              onChange={e => setClaimUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
              placeholder="yourname"
              className="flex-1 bg-transparent text-white placeholder-purple-400/50 outline-none py-3 px-1 text-sm"
            />
          </div>
          <button type="submit"
            className="px-5 py-3 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
            Claim My Page →
          </button>
        </form>

        {/* Example profiles (CR-026) */}
        <p className="text-purple-400 text-sm mb-16">
          See example pages:{' '}
          <Link href="/alexmucci" className="text-purple-300 hover:text-white underline">Alex ↗</Link>
          {', '}
          <Link href="/violetxo" className="text-purple-300 hover:text-white underline">Violet ↗</Link>
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full">
          <div className="rounded-2xl p-6 text-left border border-purple-900/50 hover:border-purple-500/50 transition-all"
            style={{ background: 'rgba(139, 92, 246, 0.08)', backdropFilter: 'blur(10px)' }}>
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-white font-bold text-lg mb-2">All themes free</h3>
            <p className="text-purple-300 text-sm leading-relaxed">
              Classic, Neon, Soft — all three themes available on every plan. No paywalls on looks.
            </p>
          </div>

          <div className="rounded-2xl p-6 text-left border border-purple-900/50 hover:border-purple-500/50 transition-all"
            style={{ background: 'rgba(139, 92, 246, 0.08)', backdropFilter: 'blur(10px)' }}>
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-white font-bold text-lg mb-2">Full analytics free</h3>
            <p className="text-purple-300 text-sm leading-relaxed">
              Visits, clicks, referrers, 30-day charts, top links — all free. No upgrade walls.
            </p>
          </div>

          <div className="rounded-2xl p-6 text-left border border-pink-900/50 hover:border-pink-500/50 transition-all"
            style={{ background: 'rgba(236, 72, 153, 0.08)', backdropFilter: 'blur(10px)' }}>
            <div className="text-3xl mb-3">🔓</div>
            <h3 className="text-white font-bold text-lg mb-2">No content restrictions</h3>
            <p className="text-purple-300 text-sm leading-relaxed">
              Link to OnlyFans, Fansly, Telegram — wherever your content lives. We don&apos;t judge.
            </p>
          </div>
        </div>

        {/* Comparison section (CR-027) */}
        <div className="mt-16 max-w-lg w-full rounded-2xl border border-purple-900/50 p-6 text-left"
          style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
          <h3 className="text-white font-bold text-lg mb-4 text-center">Glimr vs Linktree</h3>
          <div className="space-y-3 text-sm">
            {[
              ['All themes', 'Free', '$24/mo'],
              ['Full analytics', 'Free', '$24/mo'],
              ['Adult content links', '✅ Allowed', '❌ Banned'],
              ['Custom branding', 'Free', '$24/mo'],
              ['Unlimited links', 'Free', 'Free'],
            ].map(([feature, glimr, linktree]) => (
              <div key={feature} className="flex items-center gap-4">
                <span className="flex-1 text-purple-300">{feature}</span>
                <span className="text-green-400 font-medium w-20 text-center">{glimr}</span>
                <span className="text-purple-500 w-20 text-center">{linktree}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex items-center gap-8 text-purple-400 text-sm opacity-60 flex-wrap justify-center">
          <span>✅ 100% Free forever</span>
          <span>•</span>
          <span>✅ No credit card required</span>
          <span>•</span>
          <span>✅ Set up in 60 seconds</span>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-purple-600 text-sm">
        <p>© {new Date().getFullYear()} Glimr. Made with 💜 for creators who deserve better.</p>
      </footer>
    </div>
  )
}
