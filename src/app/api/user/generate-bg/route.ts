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
        model: 'claude-opus-4-20250514',
        max_tokens: 1024,
        system: `You are a CSS background generator for a link-in-bio profile page. The user describes the vibe they want, and you output ONLY a JSON object with CSS properties for the background.

Rules:
- Output ONLY valid JSON, no markdown, no explanation
- The JSON keys are CSS property names in camelCase (e.g. "background", "backgroundSize", "animation")
- Use CSS gradients, colors, and patterns. Be creative and make it beautiful.
- If you use animations, include a "@keyframes" key with the raw CSS keyframes string (e.g. "@keyframes": "bgMove { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }")
- The background sits behind a dark profile card, so make it atmospheric and moody
- Keep it performant — no heavy effects, prefer gradients and subtle animations
- Always make the result look premium and polished
- ONLY output the JSON object, nothing else

Example output:
{"background":"linear-gradient(135deg, #0c0015 0%, #1a0533 25%, #2d1b69 50%, #1a0533 75%, #0c0015 100%)","backgroundSize":"400% 400%","animation":"bgMove 15s ease infinite","@keyframes":"bgMove { 0% { background-position: 0% 50% } 50% { background-position: 100% 50% } 100% { background-position: 0% 50% } }"}`,
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
