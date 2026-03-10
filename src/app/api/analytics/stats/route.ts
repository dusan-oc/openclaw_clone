import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { links, page_views, link_clicks } from '@/lib/db/schema'
import { eq, desc, sql, count } from 'drizzle-orm'

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const now = Math.floor(Date.now() / 1000)
  const thirtyDaysAgo = now - 30 * 86400

  // Total visits
  const totalVisitsResult = db
    .select({ count: count() })
    .from(page_views)
    .where(eq(page_views.user_id, userId))
    .get()
  const totalVisits = totalVisitsResult?.count ?? 0

  // Total clicks
  const totalClicksResult = db
    .select({ count: count() })
    .from(link_clicks)
    .where(eq(link_clicks.user_id, userId))
    .get()
  const totalClicks = totalClicksResult?.count ?? 0

  // Last 30 days visits by day
  const visitsRows = db
    .select({
      date: sql<string>`date(${page_views.timestamp}, 'unixepoch')`,
      count: count(),
    })
    .from(page_views)
    .where(
      sql`${page_views.user_id} = ${userId} AND ${page_views.timestamp} >= ${thirtyDaysAgo}`
    )
    .groupBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${page_views.timestamp}, 'unixepoch')`)
    .all()

  // Last 30 days clicks by day
  const clicksRows = db
    .select({
      date: sql<string>`date(${link_clicks.timestamp}, 'unixepoch')`,
      count: count(),
    })
    .from(link_clicks)
    .where(
      sql`${link_clicks.user_id} = ${userId} AND ${link_clicks.timestamp} >= ${thirtyDaysAgo}`
    )
    .groupBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .orderBy(sql`date(${link_clicks.timestamp}, 'unixepoch')`)
    .all()

  // Build full 30-day arrays (fill in missing dates with 0)
  const last30DaysVisits = buildDateArray(visitsRows, 30)
  const last30DaysClicks = buildDateArray(clicksRows, 30)

  // Top links by clicks
  const topLinks = db
    .select({
      id: links.id,
      title: links.title,
      click_count: links.click_count,
    })
    .from(links)
    .where(eq(links.user_id, userId))
    .orderBy(desc(links.click_count))
    .limit(5)
    .all()

  // Top referrers (from page_views)
  const referrerRows = db
    .select({
      referrer: page_views.referrer,
      count: count(),
    })
    .from(page_views)
    .where(eq(page_views.user_id, userId))
    .groupBy(page_views.referrer)
    .orderBy(desc(count()))
    .limit(5)
    .all()

  const topReferrers = referrerRows.map(r => ({
    source: parseReferrer(r.referrer ?? ''),
    count: r.count,
  }))

  return NextResponse.json({
    totalVisits,
    totalClicks,
    last30DaysVisits,
    last30DaysClicks,
    topLinks,
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
    // Map known platforms
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
