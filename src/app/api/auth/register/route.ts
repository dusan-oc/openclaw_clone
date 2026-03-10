import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getUserByEmail, getUserByUsername, createUser } from '@/lib/db/queries'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { display_name, email, username, password } = body

    // Validate required fields
    if (!display_name || !email || !username || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate username
    const usernameRegex = /^[a-z0-9_]+$/i
    if (!usernameRegex.test(username) || username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be 3–20 characters (letters, numbers, underscores only)' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    // Check uniqueness
    if (getUserByEmail(email)) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }
    if (getUserByUsername(username.toLowerCase())) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10)

    // Create user
    const user = createUser({
      email,
      username: username.toLowerCase(),
      password_hash,
      display_name,
    })

    return NextResponse.json({ success: true, username: user?.username })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
