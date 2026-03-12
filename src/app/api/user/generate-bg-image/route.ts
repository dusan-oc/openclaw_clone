import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

const SYSTEM_CONTEXT = `You are generating a background IMAGE for a link-in-bio profile page with this layout:
- A dark rounded card (~560px wide) sits CENTERED on this background, covering most of the center
- The visible background areas are mainly the LEFT and RIGHT sides, plus a strip at the TOP
- On mobile, the card fills nearly the full width so background is barely visible
- On desktop, there's significant space on both sides of the card

IMPORTANT RULES for the image:
- Do NOT put important details in the CENTER — they will be hidden behind the dark card
- Place interesting visual elements on the LEFT and RIGHT edges
- Make the image atmospheric, ambient, and slightly darker toward the center
- The overall mood should be premium, polished, and complement a dark UI
- Keep it abstract/atmospheric unless the user specifically asks for concrete objects
- If the user asks for specific objects/characters, place them on the LEFT and RIGHT sides
- The image should work as a background — not too busy, not competing with foreground content
- Dark/moody tones work best since the card overlay is dark (#0a0a0a)`

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
