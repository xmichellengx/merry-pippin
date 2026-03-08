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
- Never give generic advice like "monitor their weight" or "regular playtime helps". Every insight must cite specific data.
- For food recommendations, calculate ideal daily intake based on their actual weight, age, and breed (BSH kittens need ~40-60g/kg/day, adults ~30-40g/kg/day of quality food).
- For weight analysis, compare their growth rate to typical BSH growth curves.
- Reference vaccine/deworming brands available in Malaysia (Purevax, Nobivac, Revolution Plus, Broadline, Drontal).
- Note any patterns in the food logs and notes.
- Keep it warm but substantive. Use one cat emoji max.
- Use dashes for bullet points, keep each point to 1-2 sentences.`

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
