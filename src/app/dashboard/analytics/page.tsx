'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Stats = {
  totalVisits: number
  totalClicks: number
  last30DaysVisits: { date: string; count: number }[]
  last30DaysClicks: { date: string; count: number }[]
  topLinks: { id: number; title: string; click_count: number }[]
  topReferrers: { source: string; count: number }[]
}

function BarChart({
  data,
  color,
  label,
}: {
  data: { date: string; count: number }[]
  color: string
  label: string
}) {
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
                <div
                  className="w-full rounded-t transition-all duration-200 cursor-pointer"
                  style={{
                    height: `${height}%`,
                    background: color,
                    minHeight: d.count > 0 ? '2px' : '0',
                  }}
                  title={`${d.date}: ${d.count}`}
                />
                {/* Tooltip */}
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

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const ctr = stats && stats.totalVisits >= 10
    ? ((stats.totalClicks / stats.totalVisits) * 100).toFixed(1) + '%'
    : '—'

  const mostClicked = stats?.topLinks?.[0]

  return (
    <div className="min-h-screen" style={{ background: '#0F0A1A' }}>
      {/* Nav */}
      <nav className="border-b border-purple-900/30 px-6 py-4 flex items-center justify-between"
        style={{ background: 'rgba(15, 10, 26, 0.95)' }}>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #EC4899)' }}>✨</div>
            <span className="text-white font-bold">Glimr</span>
          </Link>
        </div>
        <Link href="/dashboard" className="text-purple-300 hover:text-white text-sm transition-colors">
          ← Dashboard
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-purple-500 text-xs mb-4">Dashboard / Analytics</div>
        <h1 className="text-2xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-purple-400 text-sm mb-8">Full analytics — free. Because you deserve it.</p>

        {loading ? (
          <div className="text-center text-purple-400 py-20">
            <div className="text-4xl mb-4 animate-pulse">📊</div>
            <p>Loading your stats…</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Visits', value: stats?.totalVisits ?? 0, icon: '👁️', color: '#8B5CF6' },
                { label: 'Total Clicks', value: stats?.totalClicks ?? 0, icon: '👆', color: '#EC4899' },
                { label: 'Overall CTR', value: ctr, icon: '🎯', color: '#10b981' },
                { label: 'Top Link', value: mostClicked?.title ?? 'None yet', icon: '🏆', color: '#f59e0b' },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl border border-purple-900/50 p-5"
                  style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-white truncate">{stat.value}</div>
                  <div className="text-purple-400 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-purple-900/50 p-6"
                  style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <BarChart
                    data={stats.last30DaysVisits}
                    color="linear-gradient(to top, #8B5CF6, #a78bfa)"
                    label="Profile Visits — Last 30 Days"
                  />
                </div>

                <div className="rounded-2xl border border-purple-900/50 p-6"
                  style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                  <BarChart
                    data={stats.last30DaysClicks}
                    color="linear-gradient(to top, #EC4899, #f472b6)"
                    label="Link Clicks — Last 30 Days"
                  />
                </div>
              </div>
            )}

            {/* Top Links + Referrers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Links */}
              <div className="rounded-2xl border border-purple-900/50 p-6"
                style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                <h3 className="text-white font-semibold mb-4">🏆 Top Links</h3>
                {stats?.topLinks?.length === 0 ? (
                  <p className="text-purple-400 text-sm">No clicks yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.topLinks?.map((link, i) => {
                      const maxValue = Math.max(...stats.topLinks.map(l => l.click_count), 0)
                      const pct = maxValue > 0 ? ((link.click_count / maxValue) * 100).toFixed(0) : 0
                      return (
                        <div key={link.id} className="flex items-center gap-3">
                          <span className="text-purple-500 text-sm w-4">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm truncate">{link.title}</p>
                            <div className="w-full rounded-full mt-1" style={{ background: 'rgba(139, 92, 246, 0.15)', height: '4px' }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8B5CF6, #EC4899)' }} />
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-white text-sm font-medium">{link.click_count}</span>
                            <span className="text-purple-500 text-xs block">{pct}%</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Top Referrers */}
              <div className="rounded-2xl border border-purple-900/50 p-6"
                style={{ background: 'rgba(26, 16, 48, 0.8)' }}>
                <h3 className="text-white font-semibold mb-4">📡 Traffic Sources</h3>
                {stats?.topReferrers?.length === 0 ? (
                  <p className="text-purple-400 text-sm">No referrer data yet.</p>
                ) : (
                  <div className="space-y-3">
                    {stats?.topReferrers?.map((ref, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-white text-sm">{ref.source}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 rounded-full" style={{ background: 'rgba(236, 72, 153, 0.15)', height: '4px' }}>
                            <div className="h-full rounded-full" style={{
                              width: `${Math.min(100, (ref.count / (stats.topReferrers[0]?.count || 1)) * 100)}%`,
                              background: '#EC4899',
                            }} />
                          </div>
                          <span className="text-purple-300 text-sm font-medium w-6 text-right">{ref.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Free tier callout */}
            <div className="rounded-2xl p-4 text-center border border-purple-800/30"
              style={{ background: 'rgba(139, 92, 246, 0.05)' }}>
              <p className="text-purple-400 text-sm">
                💜 All analytics are <strong className="text-purple-300">100% free</strong> on Glimr. No upgrade needed.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
