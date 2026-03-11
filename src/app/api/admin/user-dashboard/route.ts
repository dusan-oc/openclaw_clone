import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users, links, page_views, link_clicks } from '@/lib/db/schema'
import { eq, desc, sql, count } from 'drizzle-orm'

async function requireAdmin() {
  const session = await auth()
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin') return null
  return session
}

export async function GET(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const userId = parseInt(searchParams.get('userId') ?? '')
  if (!userId || isNaN(userId)) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const user = db.select({
    id: users.id,
    username: users.username,
    email: users.email,
    display_name: users.display_name,
    bio: users.bio,
    avatar_url: users.avatar_url,
    theme: users.theme,
    role: users.role,
    enabled: users.enabled,
    created_at: users.created_at,
  }).from(users).where(eq(users.id, userId)).get()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Links
  const userLinks = db.select().from(links).where(eq(links.user_id, userId)).orderBy(links.position).all()

  // Analytics
  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 86400

  const totalVisits = db.select({ count: count() }).from(page_views).where(eq(page_views.user_id, userId)).get()?.count ?? 0
  const totalClicks = db.select({ count: count() }).from(link_clicks).where(eq(link_clicks.user_id, userId)).get()?.count ?? 0

  const visitsRows = db
    .select({ date: sql<string>`date(${page_views.timestamp}, 'unixepoch')`, count: count() })
    .from(page_views)
    .where(sql`${page_views.user_id} = ${userId} AND ${page_views.timestamp} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .all()

  const clicksRows = db
    .select({ date: sql<string>`date(${link_clicks.timestamp}, 'unixepoch')`, count: count() })
    .from(link_clicks)
    .where(sql`${link_clicks.user_id} = ${userId} AND ${link_clicks.timestamp} >= ${thirtyDaysAgo}`)
    .groupBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .all()

  const referrerRows = db
    .select({ referrer: page_views.referrer, count: count() })
    .from(page_views)
    .where(eq(page_views.user_id, userId))
    .groupBy(page_views.referrer)
    .orderBy(desc(count()))
    .limit(5)
    .all()

  return NextResponse.json({
    user,
    links: userLinks,
    analytics: {
      totalVisits,
      totalClicks,
      last30DaysVisits: buildDateArray(visitsRows, 30),
      last30DaysClicks: buildDateArray(clicksRows, 30),
      topLinks: userLinks.sort((a, b) => b.click_count - a.click_count).slice(0, 5).map(l => ({ id: l.id, title: l.title, click_count: l.click_count })),
      topReferrers: referrerRows.map(r => ({ source: parseReferrer(r.referrer ?? ''), count: r.count })),
    },
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
