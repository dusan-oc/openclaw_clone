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

export default function AdminClient({ totals }: { totals: Totals }) {
  const [adminUsers, setAdminUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [toggling, setToggling] = useState<number | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setAdminUsers(data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const toggleUser = async (id: number) => {
    setToggling(id)
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: 'PATCH' })
      if (res.ok) {
        await fetchUsers()
      }
    } finally {
      setToggling(null)
    }
  }

  const formatDate = (ts: number) => {
    return new Date(ts * 1000).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

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
          <Link href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">
            Dashboard
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-purple-400 hover:text-white text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-white mb-2">Glimr Admin</h1>
        <p className="text-purple-400 text-sm mb-8">Platform overview and user management</p>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Users', value: totals.users, icon: '👥', color: '#8B5CF6' },
            { label: 'Total Page Views', value: totals.views, icon: '👁️', color: '#EC4899' },
            { label: 'Total Link Clicks', value: totals.clicks, icon: '👆', color: '#10b981' },
          ].map(card => (
            <div key={card.label} className="rounded-2xl border border-purple-900/50 p-6"
              style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
              <div className="text-3xl mb-3">{card.icon}</div>
              <div className="text-3xl font-black text-white">{card.value.toLocaleString()}</div>
              <div className="text-purple-400 text-sm mt-1">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="rounded-2xl border border-purple-900/50 overflow-hidden"
          style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
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
                    {['Username', 'Email', 'Visits', 'Clicks', 'Joined', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-purple-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20">
                  {adminUsers.map(user => (
                    <tr key={user.id} className="hover:bg-purple-900/10 transition-colors">
                      <td className="px-4 py-4">
                        <div>
                          <Link
                            href={`/${user.username}`}
                            target="_blank"
                            className="text-white font-medium hover:text-purple-300 transition-colors"
                          >
                            {user.username}
                          </Link>
                          {user.role === 'admin' && (
                            <span className="ml-2 text-xs px-1.5 py-0.5 rounded text-pink-300 border border-pink-500/30"
                              style={{ background: 'rgba(236, 72, 153, 0.1)' }}>admin</span>
                          )}
                          {user.display_name && (
                            <p className="text-purple-400 text-xs">{user.display_name}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-purple-300 text-sm">{user.email}</td>
                      <td className="px-4 py-4 text-white text-sm">{user.total_visits.toLocaleString()}</td>
                      <td className="px-4 py-4 text-white text-sm">{user.total_clicks.toLocaleString()}</td>
                      <td className="px-4 py-4 text-purple-400 text-sm">{formatDate(user.created_at)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          user.enabled
                            ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/20'
                            : 'text-gray-400 bg-gray-500/10 border border-gray-500/20'
                        }`}>
                          {user.enabled ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => toggleUser(user.id)}
                          disabled={toggling === user.id}
                          className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all disabled:opacity-50"
                          style={user.enabled
                            ? { background: 'rgba(236, 72, 153, 0.1)', color: '#f472b6', border: '1px solid rgba(236, 72, 153, 0.3)' }
                            : { background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                        >
                          {toggling === user.id ? '…' : user.enabled ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
