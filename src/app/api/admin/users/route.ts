import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users, page_views, link_clicks } from '@/lib/db/schema'
import { eq, count, desc } from 'drizzle-orm'

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

  // Get all users with visit/click counts
  const allUsers = db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      display_name: users.display_name,
      role: users.role,
      enabled: users.enabled,
      created_at: users.created_at,
    })
    .from(users)
    .orderBy(desc(users.created_at))
    .all()

  // Get visit counts per user
  const visitCounts = db
    .select({
      user_id: page_views.user_id,
      count: count(),
    })
    .from(page_views)
    .groupBy(page_views.user_id)
    .all()

  const visitMap = new Map(visitCounts.map(v => [v.user_id, v.count]))

  // Get click counts per user
  const clickCounts = db
    .select({
      user_id: link_clicks.user_id,
      count: count(),
    })
    .from(link_clicks)
    .groupBy(link_clicks.user_id)
    .all()

  const clickMap = new Map(clickCounts.map(c => [c.user_id, c.count]))

  const enriched = allUsers.map(u => ({
    ...u,
    total_visits: visitMap.get(u.id) ?? 0,
    total_clicks: clickMap.get(u.id) ?? 0,
  }))

  return NextResponse.json(enriched)
}

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const id = parseInt(searchParams.get('id') ?? '')

  if (!id || isNaN(id)) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 })
  }

  const user = db.select().from(users).where(eq(users.id, id)).get()
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Toggle enabled
  const newEnabled = user.enabled === 1 ? 0 : 1
  const updated = db
    .update(users)
    .set({ enabled: newEnabled })
    .where(eq(users.id, id))
    .returning()
    .get()

  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
