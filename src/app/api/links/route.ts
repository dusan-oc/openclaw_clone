import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { links } from '@/lib/db/schema'
import { eq, and, max } from 'drizzle-orm'

async function getAuthUserId(req: NextRequest): Promise<number | null> {
  const session = await auth()
  if (!session?.user?.id) return null
  return parseInt(session.user.id)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const userLinks = db
    .select()
    .from(links)
    .where(eq(links.user_id, userId))
    .orderBy(links.position)
    .all()

  return NextResponse.json(userLinks)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const body = await req.json()
  const { title, url, icon, thumbnail_url } = body

  if (!title || !url) {
    return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 })
  }

  // Get max position
  const maxResult = db
    .select({ maxPos: max(links.position) })
    .from(links)
    .where(eq(links.user_id, userId))
    .get()

  const position = (maxResult?.maxPos ?? -1) + 1

  const link = db
    .insert(links)
    .values({
      user_id: userId,
      title,
      url,
      icon: icon || '🔗',
      thumbnail_url: thumbnail_url || null,
      position,
      created_at: Math.floor(Date.now() / 1000),
    })
    .returning()
    .get()

  return NextResponse.json(link, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') ?? '')

  if (!id) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
  }

  // Verify ownership
  const link = db.select().from(links).where(eq(links.id, id)).get()
  if (!link || link.user_id !== userId) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  db.delete(links).where(and(eq(links.id, id), eq(links.user_id, userId))).run()

  return NextResponse.json({ success: true })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') ?? '')

  if (!id) {
    return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
  }

  // Verify ownership
  const link = db.select().from(links).where(eq(links.id, id)).get()
  if (!link || link.user_id !== userId) {
    return NextResponse.json({ error: 'Not found or not authorized' }, { status: 404 })
  }

  const body = await req.json()
  const { title, url, icon, enabled, position, thumbnail_url, card_size, show_in_header } = body

  const updates: Partial<typeof links.$inferInsert> = {}
  if (title !== undefined) updates.title = title
  if (url !== undefined) updates.url = url
  if (icon !== undefined) updates.icon = icon
  if (enabled !== undefined) updates.enabled = enabled
  if (position !== undefined) updates.position = position
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null
  if (card_size !== undefined) updates.card_size = card_size
  if (show_in_header !== undefined) updates.show_in_header = show_in_header

  const updated = db
    .update(links)
    .set(updates)
    .where(and(eq(links.id, id), eq(links.user_id, userId)))
    .returning()
    .get()

  return NextResponse.json(updated)
}
