import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  const { prompt } = await req.json()
  if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
    return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 })
  }

  const userId = parseInt(session.user.id)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: `You are a CSS background generator for a link-in-bio profile page. The user describes the vibe they want, and you output ONLY a JSON object with CSS properties for the background.

Rules:
- Output ONLY valid JSON, no markdown, no explanation
- The JSON keys are CSS property names in camelCase (e.g. "background", "backgroundSize", "animation")
- You can use: CSS gradients, radial gradients, conic gradients, AND inline SVG patterns
- For shapes (hearts, stars, flowers, butterflies, sparkles, etc.), use inline SVG as data URIs in the background property: url("data:image/svg+xml,%3Csvg...%3C/svg%3E")
- Layer multiple backgrounds: SVG patterns on top, gradients underneath. Example: background: url("data:image/svg+xml,...") repeat, linear-gradient(...)
- SVGs should be URL-encoded (use %23 for #, %3C for <, %3E for >, etc.)
- Make SVG patterns semi-transparent so the gradient shows through
- Scatter/repeat patterns at various sizes for depth — use backgroundSize with multiple values
- If you use animations, include a "@keyframes" key with the raw CSS keyframes string
- The background sits behind a dark profile card, so make it atmospheric and premium
- Be creative! Hearts, flowers, sparkles, geometric shapes, constellations, waves — whatever fits the vibe
- Always make the result look premium, polished, and visually rich — not flat or boring
- ONLY output the JSON object, nothing else

Example with SVG pattern + gradient:
{"background":"url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 15 C30 5,20 0,15 5 C5 15,15 25,30 40 C45 25,55 15,45 5 C40 0,30 5,30 15Z' fill='rgba(255,105,180,0.08)'/%3E%3C/svg%3E\") repeat, linear-gradient(135deg, #0c0015 0%, #2d1b69 50%, #0c0015 100%)","backgroundSize":"60px 60px, 400% 400%","animation":"bgMove 20s ease infinite","@keyframes":"bgMove { 0% { background-position: 0px 0px, 0% 50% } 50% { background-position: 30px 30px, 100% 50% } 100% { background-position: 0px 0px, 0% 50% } }"}`,
        messages: [
          { role: 'user', content: `Generate a beautiful CSS background for this description: "${prompt}"` },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Anthropic API error:', err)
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
    }

    const data = await response.json()
    const text = data.content?.[0]?.text?.trim()

    // Parse the JSON response
    let cssObj: Record<string, string>
    try {
      // Strip any markdown fencing if present
      const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim()
      cssObj = JSON.parse(cleaned)
    } catch {
      console.error('Failed to parse AI response:', text)
      return NextResponse.json({ error: 'AI returned invalid format' }, { status: 500 })
    }

    // Store as JSON string in bg_value
    const bgValue = JSON.stringify(cssObj)

    db.update(users)
      .set({ bg_mode: 'ai', bg_value: bgValue, bg_prompt: prompt })
      .where(eq(users.id, userId))
      .run()

    return NextResponse.json({ css: cssObj, bg_value: bgValue, bg_prompt: prompt })
  } catch (err) {
    console.error('Generate bg error:', err)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
