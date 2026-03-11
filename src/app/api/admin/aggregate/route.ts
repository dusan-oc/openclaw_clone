import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users, links, page_views, link_clicks } from '@/lib/db/schema'
import { sql, count, desc } from 'drizzle-orm'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin') return null
  return session
}

export async function GET(_req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 86400

  // Platform totals
  const totalUsers = db.select({ count: count() }).from(users).get()?.count ?? 0
  const totalLinks = db.select({ count: count() }).from(links).get()?.count ?? 0
  const totalViews = db.select({ count: count() }).from(page_views).get()?.count ?? 0
  const totalClicks = db.select({ count: count() }).from(link_clicks).get()?.count ?? 0

  // Signups last 30 days
  const signupRows = db
    .select({ date: sql<string>`date(${users.created_at}, 'unixepoch')`, count: count() })
    .from(users)
    .where(sql`${users.created_at} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${users.created_at}, 'unixepoch')`)
    .orderBy(sql`date(${users.created_at}, 'unixepoch')`)
    .all()

  // Views last 30 days
  const viewRows = db
    .select({ date: sql<string>`date(${page_views.timestamp}, 'unixepoch')`, count: count() })
    .from(page_views)
    .where(sql`${page_views.timestamp} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .all()

  // Clicks last 30 days
  const clickRows = db
    .select({ date: sql<string>`date(${link_clicks.timestamp}, 'unixepoch')`, count: count() })
    .from(link_clicks)
    .where(sql`${link_clicks.timestamp} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .all()

  // Top users by views
  const topByViews = db
    .select({ user_id: page_views.user_id, count: count() })
    .from(page_views)
    .groupBy(page_views.user_id)
    .orderBy(desc(count()))
    .limit(10)
    .all()

  // Top users by clicks
  const topByClicks = db
    .select({ user_id: link_clicks.user_id, count: count() })
    .from(link_clicks)
    .groupBy(link_clicks.user_id)
    .orderBy(desc(count()))
    .limit(10)
    .all()

  // Resolve usernames for top users
  const allTopIds = [...new Set([...topByViews.map(r => r.user_id), ...topByClicks.map(r => r.user_id)])]
  const userMap = new Map<number, string>()
  for (const uid of allTopIds) {
    const u = db.select({ username: users.username }).from(users).where(sql`${users.id} = ${uid}`).get()
    if (u) userMap.set(uid, u.username)
  }

  // Top referrers platform-wide
  const topReferrers = db
    .select({ referrer: page_views.referrer, count: count() })
    .from(page_views)
    .groupBy(page_views.referrer)
    .orderBy(desc(count()))
    .limit(10)
    .all()
    .map(r => ({ source: parseReferrer(r.referrer ?? ''), count: r.count }))

  return NextResponse.json({
    totals: { users: totalUsers, links: totalLinks, views: totalViews, clicks: totalClicks },
    last30Days: {
      signups: buildDateArray(signupRows, 30),
      views: buildDateArray(viewRows, 30),
      clicks: buildDateArray(clickRows, 30),
    },
    topUsersByViews: topByViews.map(r => ({ username: userMap.get(r.user_id) ?? `user#${r.user_id}`, userId: r.user_id, count: r.count })),
    topUsersByClicks: topByClicks.map(r => ({ username: userMap.get(r.user_id) ?? `user#${r.user_id}`, userId: r.user_id, count: r.count })),
    topReferrers,
  })
}

function buildDateArray(rows: { date: string; count: number }[], days: number) {
  const map = new Map(rows.map(r => [r.date, r.count]))
  const result: { date: string; count: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    result.push({ date: dateStr, count: map.get(dateStr) ?? 0 })
  }
  return result
}

function parseReferrer(referrer: string): string {
  if (!referrer) return 'Direct'
  try {
    const url = new URL(referrer)
    const host = url.hostname.replace(/^www\./, '')
    if (host.includes('instagram.com')) return 'Instagram'
    if (host.includes('tiktok.com')) return 'TikTok'
    if (host.includes('twitter.com') || host.includes('x.com')) return 'Twitter/X'
    if (host.includes('youtube.com')) return 'YouTube'
    if (host.includes('facebook.com')) return 'Facebook'
    if (host.includes('google.com')) return 'Google'
    if (host.includes('reddit.com')) return 'Reddit'
    if (host.includes('telegram.org') || host.includes('t.me')) return 'Telegram'
    return host
  } catch {
    return 'Direct'
  }
}
