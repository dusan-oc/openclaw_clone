'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

type UserData = {
  user: {
    id: number
    username: string
    email: string
    display_name: string | null
    bio: string | null
    avatar_url: string | null
    theme: string
    role: string
    enabled: number
    created_at: number
  }
  links: {
    id: number
    title: string
    url: string
    icon: string
    position: number
    enabled: number
    click_count: number
    created_at: number
  }[]
  analytics: {
    totalVisits: number
    totalClicks: number
    last30DaysVisits: { date: string; count: number }[]
    last30DaysClicks: { date: string; count: number }[]
    topLinks: { id: number; title: string; click_count: number }[]
    topReferrers: { source: string; count: number }[]
  }
}

function BarChart({ data, color, label }: { data: { date: string; count: number }[]; color: string; label: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">{label}</h3>
      <div className="flex items-end gap-0.5 h-32">
        {data.map((d, i) => {
          const height = Math.max((d.count / max) * 100, d.count > 0 ? 2 : 0)
          const showLabel = i === 0 || i === 6 || i === 13 || i === 20 || i === 29
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full flex items-end" style={{ height: '100%' }}>
                <div className="w-full rounded-t transition-all duration-200 cursor-pointer"
                  style={{ height: `${height}%`, background: color, minHeight: d.count > 0 ? '2px' : '0' }}
                  title={`${d.date}: ${d.count}`} />
                {d.count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none transition-opacity z-10">
                    {d.count}
                  </div>
                )}
              </div>
              {showLabel && (
                <span className="text-purple-500 text-xs transform -rotate-45 origin-top-left whitespace-nowrap" style={{ fontSize: '9px' }}>
                  {d.date.slice(5)}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function AdminUserDashboard() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')
  const [data, setData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!userId) { setError('No user ID'); setLoading(false); return }
    fetch(`/api/admin/user-dashboard?userId=${userId}`)
      .then(r => { if (!r.ok) throw new Error('Failed'); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load user data'); setLoading(false) })
  }, [userId])

  if (loading) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0A1A' }}><p className="text-purple-400">Loading…</p></div>
  if (error || !data) return <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F0A1A' }}><p className="text-red-400">{error}</p></div>

  const { user, links: userLinks, analytics } = data
  const ctr = analytics.totalVisits >= 10 ? ((analytics.totalClicks / analytics.totalVisits) * 100).toFixed(1) + '%' : '—'

  return (
    <div className="min-h-screen" style={{ background: '#0F0A1A' }}>
      <nav className="border-b border-purple-900/30 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(15, 10, 26, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>✨</div>
          <span className="text-white font-bold">Glimr Admin</span>
          <span className="text-xs px-2 py-0.5 rounded-full text-yellow-300 border border-yellow-500/30"
            style={{ background: 'rgba(234, 179, 8, 0.1)' }}>Viewing as Admin</span>
        </div>
        <Link href="/admin" className="text-purple-300 hover:text-white text-sm transition-colors">← Back to Admin</Link>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* User Header */}
        <div className="flex items-center gap-4 mb-8">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt={user.username} className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/40" />
          ) : (
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>
              {(user.display_name || user.username)[0].toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">{user.display_name || user.username}</h1>
            <p className="text-purple-400 text-sm">@{user.username} · {user.email}</p>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded-full ${user.enabled ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-red-300 border-red-500/30 bg-red-500/10'} border`}>
                {user.enabled ? 'Active' : 'Disabled'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full text-purple-300 border border-purple-500/30" style={{ background: 'rgba(139,92,246,0.1)' }}>
                Theme: {user.theme}
              </span>
              <Link href={`/${user.username}`} target="_blank" className="text-xs px-2 py-0.5 rounded-full text-blue-300 border border-blue-500/30 hover:bg-blue-500/10 transition-colors">
                View Public Profile ↗
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Visits', value: analytics.totalVisits, icon: '👁️' },
            { label: 'Total Clicks', value: analytics.totalClicks, icon: '👆' },
            { label: 'CTR', value: ctr, icon: '🎯' },
            { label: 'Links', value: userLinks.length, icon: '🔗' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-purple-900/50 p-5" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-white">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</div>
              <div className="text-purple-400 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <BarChart data={analytics.last30DaysVisits} color="linear-gradient(to top, #8B5CF6, #a78bfa)" label="Profile Visits — Last 30 Days" />
          </div>
          <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <BarChart data={analytics.last30DaysClicks} color="linear-gradient(to top, #EC4899, #f472b6)" label="Link Clicks — Last 30 Days" />
          </div>
        </div>

        {/* Links Table */}
        <div className="rounded-2xl border border-purple-900/50 overflow-hidden mb-8" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
          <div className="px-6 py-4 border-b border-purple-900/30">
            <h2 className="text-white font-semibold">Links ({userLinks.length})</h2>
          </div>
          {userLinks.length === 0 ? (
            <div className="text-center text-purple-400 py-8">No links yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-purple-900/30">
                    {['#', 'Title', 'URL', 'Clicks', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20">
                  {userLinks.map((link, i) => (
                    <tr key={link.id} className="hover:bg-purple-900/10">
                      <td className="px-4 py-3 text-purple-400 text-sm">{i + 1}</td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{link.title}</td>
                      <td className="px-4 py-3 text-purple-300 text-sm truncate max-w-[200px]">
                        <a href={link.url} target="_blank" className="hover:text-white transition-colors">{link.url}</a>
                      </td>
                      <td className="px-4 py-3 text-white text-sm font-medium">{link.click_count.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${link.enabled ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'}`}>
                          {link.enabled ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Referrers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <h3 className="text-white font-semibold mb-4">🏆 Top Links</h3>
            {analytics.topLinks.length === 0 ? <p className="text-purple-400 text-sm">No clicks yet</p> : (
              <div className="space-y-3">
                {analytics.topLinks.map((link, i) => {
                  const maxVal = Math.max(...analytics.topLinks.map(l => l.click_count), 1)
                  const pct = ((link.click_count / maxVal) * 100).toFixed(0)
                  return (
                    <div key={link.id} className="flex items-center gap-3">
                      <span className="text-purple-500 text-sm w-4">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{link.title}</p>
                        <div className="w-full rounded-full mt-1" style={{ background: 'rgba(139,92,246,0.15)', height: '4px' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
                        </div>
                      </div>
                      <span className="text-white text-sm font-medium">{link.click_count}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <h3 className="text-white font-semibold mb-4">📡 Traffic Sources</h3>
            {analytics.topReferrers.length === 0 ? <p className="text-purple-400 text-sm">No referrer data yet</p> : (
              <div className="space-y-3">
                {analytics.topReferrers.map((ref, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-white text-sm">{ref.source}</span>
                    <span className="text-purple-300 text-sm font-medium">{ref.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
