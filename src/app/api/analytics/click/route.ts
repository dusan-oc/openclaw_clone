import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/index'
import { links, link_clicks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { hashIP, getClientIP } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const linkId = parseInt(searchParams.get('linkId') ?? '')
  const targetUrl = searchParams.get('url')

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  // Decode the URL
  let destination: string
  try {
    destination = decodeURIComponent(targetUrl)
    // Basic URL validation
    new URL(destination)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  // Log click if we have a valid linkId
  if (linkId && !isNaN(linkId)) {
    try {
      // Look up the link to get userId
      const link = db.select().from(links).where(eq(links.id, linkId)).get()

      if (link) {
        const ip = getClientIP(req.headers)
        const ua = req.headers.get('user-agent') ?? ''
        const date = new Date().toISOString().slice(0, 10)
        const ipHash = hashIP(`${ip}${ua}${date}`)
        const referrer = req.headers.get('referer') ?? req.headers.get('referrer') ?? ''

        // Insert click record
        db.insert(link_clicks).values({
          link_id: linkId,
          user_id: link.user_id,
          timestamp: Math.floor(Date.now() / 1000),
          ip_hash: ipHash,
          referrer,
        }).run()

        // Increment click_count
        db.update(links)
          .set({ click_count: link.click_count + 1 })
          .where(eq(links.id, linkId))
          .run()
      }
    } catch (err) {
      console.error('Click tracking error:', err)
      // Don't block the redirect on analytics failure
    }
  }

  // Use 302 (not 301) to ensure every click hits the server
  return NextResponse.redirect(destination, { status: 302 })
}
