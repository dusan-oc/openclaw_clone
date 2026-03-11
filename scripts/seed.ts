/**
 * Glimr Seed Script
 * Run with: npx tsx scripts/seed.ts
 *
 * Creates:
 *   - admin@glimr.io / Admin1234! / username: admin / role: admin
 *   - alex@demo.com / Demo1234! / username: alexmucci / theme: neon
 *   - violet@demo.com / Demo1234! / username: violetxo / theme: soft
 */

import bcrypt from 'bcryptjs'
import { db } from '../src/lib/db/index'
import { users, links } from '../src/lib/db/schema'
import { eq } from 'drizzle-orm'

async function hashPw(pw: string) {
  return bcrypt.hash(pw, 10)
}

async function upsertUser(data: {
  email: string
  username: string
  password: string
  display_name: string
  bio?: string
  avatar_url?: string
  role: 'user' | 'admin'
  theme: 'classic' | 'neon' | 'soft'
}) {
  const existing = db.select().from(users).where(eq(users.email, data.email)).get()
  if (existing) {
    console.log(`  ↳ Already exists: ${data.username} (skipping)`)
    return existing
  }

  const password_hash = await hashPw(data.password)
  const user = db.insert(users).values({
    email: data.email,
    username: data.username,
    password_hash,
    display_name: data.display_name,
    bio: data.bio ?? null,
    avatar_url: data.avatar_url ?? null,
    role: data.role,
    theme: data.theme,
    enabled: 1,
    created_at: Math.floor(Date.now() / 1000),
  }).returning().get()

  console.log(`  ✅ Created user: ${data.username} (${data.email})`)
  return user
}

async function addLinks(userId: number, linkList: { title: string; url: string; icon: string; thumbnail_url?: string }[]) {
  // Check if user already has links
  const existing = db.select().from(links).where(eq(links.user_id, userId)).all()
  if (existing.length > 0) {
    console.log(`  ↳ Links already exist for user ${userId} (skipping)`)
    return
  }

  for (let i = 0; i < linkList.length; i++) {
    const l = linkList[i]
    db.insert(links).values({
      user_id: userId,
      title: l.title,
      url: l.url,
      icon: l.icon,
      thumbnail_url: l.thumbnail_url ?? null,
      position: i,
      enabled: 1,
      click_count: 0,
      created_at: Math.floor(Date.now() / 1000),
    }).run()
    console.log(`  ↳ Added link: ${l.icon} ${l.title}`)
  }
}

async function main() {
  console.log('\n🌱 Glimr Seed Script\n')

  // ── Admin ────────────────────────────────────────────────────────────────────
  console.log('📌 Creating admin user...')
  await upsertUser({
    email: 'admin@glimr.io',
    username: 'pandaadmin',
    password: 'Admin1234!',
    display_name: 'Glimr Admin',
    bio: 'Platform administrator',
    role: 'admin',
    theme: 'classic',
  })

  // ── Demo User 1: Alex Mucci ──────────────────────────────────────────────────
  console.log('\n📌 Creating demo user: alexmucci...')
  const alex = await upsertUser({
    email: 'alex@demo.com',
    username: 'alexmucci',
    password: 'Demo1234!',
    display_name: 'Alex Mucci',
    bio: '🌟 Content creator | Subscribe for exclusive content 🔥',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    role: 'user',
    theme: 'classic',
  })

  if (alex) {
    await addLinks(alex.id, [
      { title: 'OnlyFans', url: 'https://onlyfans.com/alexmucci', icon: '🔥', thumbnail_url: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600&q=80' },
      { title: 'Instagram', url: 'https://instagram.com/alexmucci', icon: '📸' },
      { title: 'TikTok', url: 'https://tiktok.com/@alexmucci', icon: '🎵' },
      { title: 'Telegram VIP', url: 'https://t.me/alexmucci_vip', icon: '✈️' },
    ])
  }

  // ── Demo User 2: Violet XO ───────────────────────────────────────────────────
  console.log('\n📌 Creating demo user: violetxo...')
  const violet = await upsertUser({
    email: 'violet@demo.com',
    username: 'violetxo',
    password: 'Demo1234!',
    display_name: 'Violet ✨',
    bio: '💜 Your favorite creator. New content daily! Links below 👇',
    role: 'user',
    theme: 'soft',
  })

  if (violet) {
    await addLinks(violet.id, [
      { title: 'Fansly', url: 'https://fansly.com/violetxo', icon: '💜' },
      { title: 'Instagram', url: 'https://instagram.com/violetxo', icon: '📸' },
      { title: 'Twitter / X', url: 'https://x.com/violetxo', icon: '🐦' },
      { title: 'Linktree (lol)', url: 'https://linktr.ee/violetxo', icon: '🌲' },
    ])
  }

  console.log('\n✅ Seed complete!\n')
  console.log('Accounts:')
  console.log('  admin@glimr.io  / Admin1234!  (pandaadmin)')
  console.log('  alex@demo.com   / Demo1234!   (alexmucci, neon theme)')
  console.log('  violet@demo.com / Demo1234!   (violetxo, soft theme)')
  console.log('\nRun: npm run dev\n')

  process.exit(0)
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
