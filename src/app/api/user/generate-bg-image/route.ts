import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_CONTEXT = `You are generating a LANDSCAPE background IMAGE for a link-in-bio profile page.

The image will be used as a full-screen wallpaper behind a dark UI card. Generate a complete, cohesive image that fills the entire frame — do NOT leave the center empty or dark. The entire image should be visually interesting and atmospheric.

RULES:
- Fill the ENTIRE image with content — no blank/empty areas
- The image should work as a beautiful wallpaper at any crop
- Dark/moody tones work best but the image should be rich and detailed throughout
- Keep it atmospheric — this is a background, not a focal-point illustration
- The overall mood should be premium, polished, and contemporary

STYLE:
- Modern digital art style — clean, sharp, polished
- NOT oil painting, NOT watercolor, NOT classical art, NOT renaissance
- Think: concept art, digital illustration, 3D renders, neon-lit scenes, cinematic CGI
- High contrast, vibrant where appropriate, with clean edges
- Premium and contemporary — like something you'd see on Dribbble or Behance`

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
  }

  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  const userId = parseInt(session.user.id)

  try {
    const fullPrompt = `${SYSTEM_CONTEXT}\n\nUser's description: "${prompt}"\n\nGenerate this as a beautiful, atmospheric background image.`

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: fullPrompt,
        n: 1,
        size: '1536x1024',
        quality: 'medium',
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('OpenAI API error:', err)
      return NextResponse.json({ error: 'Image generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const b64 = data.data?.[0]?.b64_json
    if (!b64) {
      return NextResponse.json({ error: 'No image returned' }, { status: 500 })
    }

    // Save to public/backgrounds/
    const bgDir = join(process.cwd(), 'public', 'backgrounds')
    mkdirSync(bgDir, { recursive: true })
    const filename = `${userId}-${Date.now()}.png`
    const filepath = join(bgDir, filename)
    writeFileSync(filepath, Buffer.from(b64, 'base64'))

    const bgPath = `/backgrounds/${filename}`

    // Update user
    db.update(users)
      .set({ bg_mode: 'ai', bg_value: JSON.stringify({ type: 'image', url: bgPath }), bg_prompt: prompt })
      .where(eq(users.id, userId))
      .run()

    return NextResponse.json({ bg_value: JSON.stringify({ type: 'image', url: bgPath }), bg_prompt: prompt, url: bgPath })
  } catch (err) {
    console.error('Generate bg image error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
