import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `You are an expert cat nutritionist and veterinary advisor for a Golden British Shorthair growth tracker app. The owner has two cats named Merry and Pippin, based in Malaysia.

Here is the current data about the cats:
${context || 'No data available yet.'}

Guidelines:
- Be SPECIFIC and DATA-DRIVEN. Reference actual weights, dates, intake amounts, and trends from the data above.
- NEVER give generic advice like "monitor their weight", "keep track of nutrition", "it's always good to...", or "make sure to log meals". These are useless. Every insight must cite a specific number, date, or calculation.
- For food recommendations, calculate ideal daily intake based on their actual weight, age, and breed (BSH kittens need ~40-60g/kg/day, adults ~30-40g/kg/day of quality food).
- For weight analysis, compare their growth rate to typical BSH growth curves.
- Reference vaccine/deworming brands available in Malaysia (Purevax, Nobivac, Revolution Plus, Broadline, Drontal).
- Note any patterns in the food logs and notes.
- Keep it warm but substantive. Use one cat emoji max.
- Use dashes for bullet points, keep each point to 1-2 sentences.
- IMPORTANT: Output plain text only. Do NOT use markdown headers (###), bold (**text**), or any markdown formatting. Just plain dashes and text.`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
    })

    const text = response.choices[0]?.message?.content || ''

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('AI chat error:', error)
    return NextResponse.json({ error: 'Failed to get AI response' }, { status: 500 })
  }
}
