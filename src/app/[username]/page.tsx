import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { db } from '@/lib/db/index'
import { users, links, page_views } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { hashIP, getClientIP } from '@/lib/utils'
import ProfilePage from '@/components/ProfilePage'

type Props = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const user = db.select().from(users).where(eq(users.username, username.toLowerCase())).get()

  if (!user || !user.enabled) {
    return { title: 'Not Found | Glimr' }
  }

  return {
    title: `${user.display_name ?? user.username} | Glimr`,
    description: user.bio ?? `Check out ${user.display_name ?? user.username}'s links on Glimr.`,
    openGraph: {
      title: `${user.display_name ?? user.username}`,
      description: user.bio ?? `Check out ${user.display_name ?? user.username}'s links on Glimr.`,
      url: `https://glimr.io/${user.username}`,
      images: user.avatar_url ? [{ url: user.avatar_url }] : [],
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title: `${user.display_name ?? user.username} | Glimr`,
      description: user.bio ?? undefined,
      images: user.avatar_url ? [user.avatar_url] : undefined,
    },
    other: {
      // RTA label for adult content safety
      'rating': 'RTA-5042-1996-1400-1577-RTA',
    },
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params

  // Look up user
  const user = db
    .select()
    .from(users)
    .where(eq(users.username, username.toLowerCase()))
    .get()

  if (!user || !user.enabled) {
    notFound()
  }

  // Get enabled links sorted by position
  const userLinks = db
    .select()
    .from(links)
    .where(and(eq(links.user_id, user.id), eq(links.enabled, 1)))
    .orderBy(links.position)
    .all()

  // Log page view (fire-and-forget, don't block render)
  try {
    const headersList = await headers()
    const ip = getClientIP(headersList)
    const ua = headersList.get('user-agent') ?? ''
    const date = new Date().toISOString().slice(0, 10)
    const ipHash = hashIP(`${ip}${ua}${date}`)
    const referrer = headersList.get('referer') ?? headersList.get('referrer') ?? ''

    db.insert(page_views).values({
      user_id: user.id,
      timestamp: Math.floor(Date.now() / 1000),
      ip_hash: ipHash,
      user_agent: ua,
      referrer,
    }).run()
  } catch (err) {
    // Don't block page render on analytics failure
    console.error('Page view tracking error:', err)
  }

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

  const typedLinks = userLinks.map(l => ({
    ...l,
    card_size: (l.card_size === 'half' ? 'half' : 'full') as 'full' | 'half',
  }))

  return <ProfilePage user={safeUser} links={typedLinks} />
}
