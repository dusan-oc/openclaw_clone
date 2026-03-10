import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/AdminClient'
import { db } from '@/lib/db/index'
import { users, page_views, link_clicks } from '@/lib/db/schema'
import { count } from 'drizzle-orm'

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'admin') redirect('/dashboard')

  // Get platform totals
  const totalUsersResult = db.select({ count: count() }).from(users).get()
  const totalViewsResult = db.select({ count: count() }).from(page_views).get()
  const totalClicksResult = db.select({ count: count() }).from(link_clicks).get()

  const totals = {
    users: totalUsersResult?.count ?? 0,
    views: totalViewsResult?.count ?? 0,
    clicks: totalClicksResult?.count ?? 0,
  }

  return <AdminClient totals={totals} />
}
