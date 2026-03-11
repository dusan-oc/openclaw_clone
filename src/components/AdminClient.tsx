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
      <h3 style={{ color: '#111827', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{label}</h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 112 }}>
        {data.map((d, i) => {
          const height = Math.max((d.count / max) * 100, d.count > 0 ? 2 : 0)
          const showLabel = i === 0 || i === 6 || i === 13 || i === 20 || i === 29
          return (
            <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, position: 'relative' }}>
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', height: '100%' }}>
                <div
                  style={{
                    width: '100%',
                    borderRadius: '3px 3px 0 0',
                    height: `${height}%`,
                    background: color,
                    minHeight: d.count > 0 ? 2 : 0,
                    transition: 'height 0.2s',
                    cursor: 'pointer',
                    opacity: 0.85,
                  }}
                  title={`${d.date}: ${d.count}`}
                />
              </div>
              {showLabel && (
                <span style={{ color: '#9CA3AF', fontSize: 9, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap' }}>
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

  const cardStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Nav */}
      <nav style={{
        borderBottom: '1px solid #E5E7EB',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#FFFFFF',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: '#6366F1',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700,
          }}>G</div>
          <span style={{ color: '#111827', fontWeight: 700, fontSize: 16 }}>Glimr Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/dashboard" style={{ color: '#6B7280', fontSize: 14, textDecoration: 'none' }}>
            Studio
          </Link>
          <button onClick={() => signOut({ callbackUrl: '/' })} style={{ color: '#6B7280', fontSize: 14, background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Overview</h1>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>Platform metrics and user management</p>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Users', value: totals.users },
            { label: 'Page Views', value: totals.views },
            { label: 'Link Clicks', value: totals.clicks },
          ].map(card => (
            <div key={card.label} style={{ ...cardStyle, padding: 24 }}>
              <div style={{ color: '#6B7280', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{card.label}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{card.value.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
          {(['users', 'analytics'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 500,
                background: 'none',
                border: 'none',
                borderBottom: tab === t ? '2px solid #6366F1' : '2px solid transparent',
                color: tab === t ? '#6366F1' : '#6B7280',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}>
              {t === 'users' ? 'Users' : 'Analytics'}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {tab === 'users' && (
          <div style={cardStyle}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ color: '#111827', fontWeight: 600, fontSize: 15 }}>All Users</h2>
              <span style={{ color: '#9CA3AF', fontSize: 13 }}>{adminUsers.length} total</span>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '48px 0' }}>Loading users…</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                      {['Username', 'Email', 'Visits', 'Clicks', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{
                          padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 500,
                          color: '#9CA3AF', textTransform: 'uppercase' as const, letterSpacing: '0.05em',
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user, idx) => (
                      <tr key={user.id} style={{
                        borderBottom: '1px solid #F9FAFB',
                        background: idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC',
                        transition: 'background 0.1s',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#F3F4F6')}
                        onMouseLeave={e => (e.currentTarget.style.background = idx % 2 === 0 ? '#FFFFFF' : '#FAFBFC')}>
                        <td style={{ padding: '12px 16px' }}>
                          <div>
                            <Link href={`/${user.username}`} target="_blank" style={{ color: '#111827', fontWeight: 500, fontSize: 14, textDecoration: 'none' }}>
                              {user.username}
                            </Link>
                            {user.role === 'admin' && (
                              <span style={{
                                marginLeft: 8, fontSize: 11, padding: '2px 6px', borderRadius: 4,
                                background: '#EEF2FF', color: '#6366F1', fontWeight: 500,
                              }}>admin</span>
                            )}
                            {user.display_name && <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>{user.display_name}</p>}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#6B7280', fontSize: 14 }}>{user.email}</td>
                        <td style={{ padding: '12px 16px', color: '#111827', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{user.total_visits.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', color: '#111827', fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{user.total_clicks.toLocaleString()}</td>
                        <td style={{ padding: '12px 16px', color: '#9CA3AF', fontSize: 13 }}>{formatDate(user.created_at)}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: 12, padding: '3px 10px', borderRadius: 9999, fontWeight: 500,
                            background: user.enabled ? '#ECFDF5' : '#F3F4F6',
                            color: user.enabled ? '#059669' : '#9CA3AF',
                          }}>
                            {user.enabled ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Link href={`/admin/user?id=${user.id}`}
                              style={{
                                fontSize: 13, padding: '5px 12px', borderRadius: 6, fontWeight: 500,
                                background: '#EEF2FF', color: '#6366F1', textDecoration: 'none',
                                transition: 'background 0.15s',
                              }}>
                              View
                            </Link>
                            <button onClick={() => toggleUser(user.id)} disabled={toggling === user.id}
                              style={{
                                fontSize: 13, padding: '5px 12px', borderRadius: 6, fontWeight: 500,
                                background: user.enabled ? '#FEF2F2' : '#ECFDF5',
                                color: user.enabled ? '#DC2626' : '#059669',
                                border: 'none', cursor: 'pointer',
                                opacity: toggling === user.id ? 0.5 : 1,
                              }}>
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
            <div style={{ textAlign: 'center', color: '#9CA3AF', padding: '80px 0' }}>Loading analytics…</div>
          ) : aggregate ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Totals */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                  { label: 'Users', value: aggregate.totals.users },
                  { label: 'Links', value: aggregate.totals.links },
                  { label: 'Views', value: aggregate.totals.views },
                  { label: 'Clicks', value: aggregate.totals.clicks },
                ].map(s => (
                  <div key={s.label} style={{ ...cardStyle, padding: 20 }}>
                    <div style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{s.value.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { data: aggregate.last30Days.signups, color: '#6366F1', label: 'Signups (30d)' },
                  { data: aggregate.last30Days.views, color: '#8B5CF6', label: 'Views (30d)' },
                  { data: aggregate.last30Days.clicks, color: '#06B6D4', label: 'Clicks (30d)' },
                ].map(c => (
                  <div key={c.label} style={{ ...cardStyle, padding: 24 }}>
                    <BarChart data={c.data} color={c.color} label={c.label} />
                  </div>
                ))}
              </div>

              {/* Leaderboards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[
                  { title: 'Top by Views', items: aggregate.topUsersByViews },
                  { title: 'Top by Clicks', items: aggregate.topUsersByClicks },
                ].map(section => (
                  <div key={section.title} style={{ ...cardStyle, padding: 24 }}>
                    <h3 style={{ color: '#111827', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{section.title}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {section.items.map((u, i) => (
                        <div key={u.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Link href={`/admin/user?id=${u.userId}`} style={{ color: '#111827', fontSize: 14, textDecoration: 'none' }}>
                            <span style={{ color: '#9CA3AF', marginRight: 8 }}>{i + 1}.</span>{u.username}
                          </Link>
                          <span style={{ color: '#6366F1', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{u.count.toLocaleString()}</span>
                        </div>
                      ))}
                      {section.items.length === 0 && <p style={{ color: '#9CA3AF', fontSize: 13 }}>No data yet</p>}
                    </div>
                  </div>
                ))}
                <div style={{ ...cardStyle, padding: 24 }}>
                  <h3 style={{ color: '#111827', fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Top Referrers</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {aggregate.topReferrers.map((r, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ color: '#111827', fontSize: 14 }}>{r.source}</span>
                        <span style={{ color: '#6366F1', fontSize: 13, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{r.count.toLocaleString()}</span>
                      </div>
                    ))}
                    {aggregate.topReferrers.length === 0 && <p style={{ color: '#9CA3AF', fontSize: 13 }}>No data yet</p>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#DC2626', padding: '48px 0' }}>Failed to load analytics</div>
          )
        )}
      </div>
    </div>
  )
}
