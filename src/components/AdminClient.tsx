'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

type User = {
  id: number
  username: string
  email: string
  display_name: string | null
  role: 'user' | 'admin'
  enabled: number
  created_at: number
  total_visits: number
  total_clicks: number
}

type Totals = {
  users: number
  views: number
  clicks: number
}

type AggregateData = {
  totals: { users: number; links: number; views: number; clicks: number }
  last30Days: {
    signups: { date: string; count: number }[]
    views: { date: string; count: number }[]
    clicks: { date: string; count: number }[]
  }
  topUsersByViews: { username: string; userId: number; count: number }[]
  topUsersByClicks: { username: string; userId: number; count: number }[]
  topReferrers: { source: string; count: number }[]
}

function BarChart({ data, color, label }: { data: { date: string; count: number }[]; color: string; label: string }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div>
      <h3 className="text-white font-semibold mb-4 text-sm">{label}</h3>
      <div className="flex items-end gap-0.5 h-28">
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

export default function AdminClient({ totals }: { totals: Totals }) {
  const [tab, setTab] = useState<'users' | 'analytics'>('users')
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)
  const [aggregate, setAggregate] = useState<AggregateData | null>(null)
  const [aggLoading, setAggLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) setAdminUsers(await res.json())
    } finally {
      setLoading(false)
    }
  }

  const fetchAggregate = async () => {
    if (aggregate) return
    setAggLoading(true)
    try {
      const res = await fetch('/api/admin/aggregate')
      if (res.ok) setAggregate(await res.json())
    } finally {
      setAggLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])
  useEffect(() => { if (tab === 'analytics') fetchAggregate() }, [tab])

  const toggleUser = async (id: number) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'PATCH' })
      if (res.ok) await fetchUsers()
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (ts: number) => new Date(ts * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <div className="min-h-screen" style={{ background: '#0F0A1A' }}>
      {/* Nav */}
      <nav className="border-b border-purple-900/30 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(15, 10, 26, 0.95)', backdropFilter: 'blur(10px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
            style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>✨</div>
          <span className="text-white font-bold">Glimr Admin</span>
          <span className="text-xs px-2 py-0.5 rounded-full text-pink-300 border border-pink-500/30"
            style={{ background: 'rgba(236, 72, 153, 0.1)' }}>Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">Dashboard</Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-purple-400 hover:text-white text-sm transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">Glimr Admin</h1>
        <p className="text-purple-400 text-sm mb-6">Platform overview and user management</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Users', value: totals.users, icon: '👥', color: '#8B5CF6' },
            { label: 'Total Page Views', value: totals.views, icon: '👁️', color: '#EC4899' },
            { label: 'Total Link Clicks', value: totals.clicks, icon: '👆', color: '#10b981' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="text-3xl font-black text-white">{card.value.toLocaleString()}</div>
              <div className="text-purple-400 text-sm mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
          {(['users', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'text-white' : 'text-purple-400 hover:text-purple-200'}`}
              style={tab === t ? { background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(236,72,153,0.3))' } : {}}>
              {t === 'users' ? '👥 Users' : '📊 Platform Analytics'}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="rounded-2xl border border-purple-900/50 overflow-hidden" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
            <div className="px-6 py-4 border-b border-purple-900/30">
              <h2 className="text-white font-semibold">Users ({adminUsers.length})</h2>
            </div>
            {loading ? (
              <div className="text-center text-purple-400 py-12">Loading users…</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-900/30">
                      {['Username', 'Email', 'Visits', 'Clicks', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {adminUsers.map(user => (
                      <tr key={user.id} className="hover:bg-purple-900/10 transition-colors">
                        <td className="px-4 py-4">
                          <div>
                            <Link href={`/${user.username}`} target="_blank" className="text-white font-medium hover:text-purple-300 transition-colors">
                              {user.username}
                            </Link>
                            {user.role === 'admin' && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded text-pink-300 border border-pink-500/30" style={{ background: 'rgba(236, 72, 153, 0.1)' }}>admin</span>
                            )}
                            {user.display_name && <p className="text-purple-400 text-xs">{user.display_name}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-purple-300 text-sm">{user.email}</td>
                        <td className="px-4 py-4 text-white text-sm">{user.total_visits.toLocaleString()}</td>
                        <td className="px-4 py-4 text-white text-sm">{user.total_clicks.toLocaleString()}</td>
                        <td className="px-4 py-4 text-purple-400 text-sm">{formatDate(user.created_at)}</td>
                        <td className="px-4 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.enabled ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20' : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'}`}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/user?id=${user.id}`}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all text-blue-300 hover:text-white"
                              style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                              View Dashboard
                            </Link>
                            <button onClick={() => toggleUser(user.id)} disabled={toggling === user.id}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                              style={user.enabled
                                ? { background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' }
                                : { background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                              {toggling === user.id ? '…' : user.enabled ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {tab === 'analytics' && (
          aggLoading ? (
            <div className="text-center text-purple-400 py-20"><div className="text-4xl mb-4 animate-pulse">📊</div><p>Loading platform analytics…</p></div>
          ) : aggregate ? (
            <div className="space-y-6">
              {/* Totals */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Users', value: aggregate.totals.users, icon: '👥' },
                  { label: 'Total Links', value: aggregate.totals.links, icon: '🔗' },
                  { label: 'Total Views', value: aggregate.totals.views, icon: '👁️' },
                  { label: 'Total Clicks', value: aggregate.totals.clicks, icon: '👆' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl border border-purple-900/50 p-5" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="text-2xl font-bold text-white">{s.value.toLocaleString()}</div>
                    <div className="text-purple-400 text-xs mt-1">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <BarChart data={aggregate.last30Days.signups} color="#8B5CF6" label="New Signups — 30 Days" />
                </div>
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <BarChart data={aggregate.last30Days.views} color="#EC4899" label="Page Views — 30 Days" />
                </div>
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <BarChart data={aggregate.last30Days.clicks} color="#10b981" label="Link Clicks — 30 Days" />
                </div>
              </div>

              {/* Leaderboards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <h3 className="text-white font-semibold mb-4">🏆 Top by Views</h3>
                  <div className="space-y-3">
                    {aggregate.topUsersByViews.map((u, i) => (
                      <div key={u.userId} className="flex items-center justify-between">
                        <Link href={`/admin/user?id=${u.userId}`} className="text-white text-sm hover:text-purple-300 transition-colors">
                          <span className="text-purple-500 mr-2">{i + 1}.</span>{u.username}
                        </Link>
                        <span className="text-purple-300 text-sm font-medium">{u.count.toLocaleString()}</span>
                      </div>
                    ))}
                    {aggregate.topUsersByViews.length === 0 && <p className="text-purple-400 text-sm">No data yet</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <h3 className="text-white font-semibold mb-4">🔥 Top by Clicks</h3>
                  <div className="space-y-3">
                    {aggregate.topUsersByClicks.map((u, i) => (
                      <div key={u.userId} className="flex items-center justify-between">
                        <Link href={`/admin/user?id=${u.userId}`} className="text-white text-sm hover:text-purple-300 transition-colors">
                          <span className="text-purple-500 mr-2">{i + 1}.</span>{u.username}
                        </Link>
                        <span className="text-purple-300 text-sm font-medium">{u.count.toLocaleString()}</span>
                      </div>
                    ))}
                    {aggregate.topUsersByClicks.length === 0 && <p className="text-purple-400 text-sm">No data yet</p>}
                  </div>
                </div>
                <div className="rounded-2xl border border-purple-900/50 p-6" style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <h3 className="text-white font-semibold mb-4">📡 Top Referrers</h3>
                  <div className="space-y-3">
                    {aggregate.topReferrers.map((r, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white text-sm">{r.source}</span>
                        <span className="text-purple-300 text-sm font-medium">{r.count.toLocaleString()}</span>
                      </div>
                    ))}
                    {aggregate.topReferrers.length === 0 && <p className="text-purple-400 text-sm">No data yet</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-red-400 py-12">Failed to load analytics</div>
          )
        )}
      </div>
    </div>
  )
}
