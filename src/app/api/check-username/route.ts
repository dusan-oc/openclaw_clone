import { NextRequest, NextResponse } from 'next/server'
import { getUserByUsername } from '@/lib/db/queries'

const RESERVED_USERNAMES = [
  'admin', 'dashboard', 'login', 'register', 'api', 'settings',
  'analytics', 'about', 'help', 'support', 'www', 'app',
  'forgot-password', 'not-found',
]

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')?.toLowerCase()

  if (!username || username.length < 3) {
    return NextResponse.json({ available: false })
  }

  if (RESERVED_USERNAMES.includes(username)) {
    return NextResponse.json({ available: false })
  }

  const existing = getUserByUsername(username)
  return NextResponse.json({ available: !existing })
}
