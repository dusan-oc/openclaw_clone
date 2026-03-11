import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const body = await req.json()
  const { display_name, bio, avatar_url, theme, link_style, layout, show_blurred_bg, show_bio } = body

  const updates: Partial<typeof users.$inferInsert> = {}
  if (display_name !== undefined) updates.display_name = display_name
  if (bio !== undefined) updates.bio = bio
  if (avatar_url !== undefined) updates.avatar_url = avatar_url
  if (theme !== undefined) {
    const validThemes = ['classic', 'neon', 'soft'] as const
    if (!validThemes.includes(theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 })
    }
    updates.theme = theme
  }
  if (link_style !== undefined) {
    if (!['default', 'overlay'].includes(link_style)) {
      return NextResponse.json({ error: 'Invalid link_style' }, { status: 400 })
    }
    updates.link_style = link_style
  }
  if (layout !== undefined) {
    if (!['list', 'grid'].includes(layout)) {
      return NextResponse.json({ error: 'Invalid layout' }, { status: 400 })
    }
    updates.layout = layout
  }
  if (show_blurred_bg !== undefined) updates.show_blurred_bg = show_blurred_bg ? 1 : 0
  if (show_bio !== undefined) updates.show_bio = show_bio ? 1 : 0

  const updated = db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning()
    .get()

  return NextResponse.json(updated)
}

export async function GET(_req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = parseInt(session.user.id)

  const user = db.select().from(users).where(eq(users.id, userId)).get()
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Don't return password hash
  const { password_hash: _, ...safeUser } = user
  return NextResponse.json(safeUser)
}
