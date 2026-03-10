import { eq, desc, count, sql } from 'drizzle-orm'
import { db } from './index'
import { users, links, page_views, link_clicks } from './schema'

// ── Users ────────────────────────────────────────────────────────────────────

export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email)).get()
}

export function getUserByUsername(username: string) {
  return db.select().from(users).where(eq(users.username, username)).get()
}

export function createUser(data: {
  email: string
  username: string
  password_hash: string
  display_name?: string
}) {
  return db.insert(users).values({
    email: data.email,
    username: data.username,
    password_hash: data.password_hash,
    display_name: data.display_name ?? data.username,
    created_at: Math.floor(Date.now() / 1000),
  }).returning().get()
}

// ── Links ────────────────────────────────────────────────────────────────────

export function getLinksByUserId(userId: number) {
  return db
    .select()
    .from(links)
    .where(eq(links.user_id, userId))
    .orderBy(links.position)
    .all()
}

export function createLink(data: {
  user_id: number
  title: string
  url: string
  icon?: string
  position?: number
}) {
  return db.insert(links).values({
    user_id: data.user_id,
    title: data.title,
    url: data.url,
    icon: data.icon ?? '🔗',
    position: data.position ?? 0,
    created_at: Math.floor(Date.now() / 1000),
  }).returning().get()
}

export function deleteLink(linkId: number, userId: number) {
  return db
    .delete(links)
    .where(eq(links.id, linkId))
    .returning()
    .get()
}

export function updateLinkPosition(linkId: number, position: number) {
  return db
    .update(links)
    .set({ position })
    .where(eq(links.id, linkId))
    .returning()
    .get()
}

export function updateLink(linkId: number, data: Partial<{
  title: string
  url: string
  icon: string
  position: number
  enabled: number
}>) {
  return db
    .update(links)
    .set(data)
    .where(eq(links.id, linkId))
    .returning()
    .get()
}

// ── Analytics ────────────────────────────────────────────────────────────────

export function getPageViewStats(userId: number) {
  const total = db
    .select({ count: count() })
    .from(page_views)
    .where(eq(page_views.user_id, userId))
    .get()

  const last7days = db
    .select({ count: count() })
    .from(page_views)
    .where(
      sql`${page_views.user_id} = ${userId} AND ${page_views.timestamp} > ${Math.floor(Date.now() / 1000) - 7 * 86400}`
    )
    .get()

  return {
    total: total?.count ?? 0,
    last7days: last7days?.count ?? 0,
  }
}

export function getLinkClickStats(userId: number) {
  return db
    .select({
      link_id: link_clicks.link_id,
      count: count(),
    })
    .from(link_clicks)
    .where(eq(link_clicks.user_id, userId))
    .groupBy(link_clicks.link_id)
    .all()
}

// ── Admin ────────────────────────────────────────────────────────────────────

export function getAllUsersWithStats() {
  return db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      display_name: users.display_name,
      role: users.role,
      enabled: users.enabled,
      created_at: users.created_at,
      link_count: count(links.id),
    })
    .from(users)
    .leftJoin(links, eq(users.id, links.user_id))
    .groupBy(users.id)
    .orderBy(desc(users.created_at))
    .all()
}
