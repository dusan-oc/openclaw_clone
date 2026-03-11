import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import DashboardClient from '@/components/DashboardClient'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userId = parseInt(session.user.id)
  const user = db.select().from(users).where(eq(users.id, userId)).get()

  if (!user) {
    redirect('/login')
  }

  // Don't pass password hash to client
  const safeUser = {
    id: user.id,
    username: user.username,
    display_name: user.display_name,
    bio: user.bio,
    avatar_url: user.avatar_url,
    theme: user.theme,
    link_style: user.link_style ?? 'overlay' as const,
    layout: user.layout ?? 'list' as const,
    show_blurred_bg: user.show_blurred_bg ?? 1,
    show_bio: user.show_bio ?? 1,
    bg_mode: (user.bg_mode ?? 'blur') as 'blur' | 'color' | 'ai',
    bg_value: user.bg_value ?? null,
    bg_prompt: user.bg_prompt ?? null,
  }

  return <DashboardClient user={safeUser} />
}
