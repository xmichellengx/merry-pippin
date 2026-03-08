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

    const systemPrompt = `You are a friendly, knowledgeable cat care assistant for a Golden British Shorthair growth tracker app. The owner has two cats named Merry and Pippin.

Here is the current data about the cats:
${context || 'No data available yet.'}

Guidelines:
- Keep responses concise (2-4 sentences max) and warm/friendly
- Focus on cat health, nutrition, behavior, grooming, and growth for British Shorthairs
- If asked about vaccines or deworming, reference brands commonly available in Malaysia (Purevax, Felocell, Nobivac, Rabisin, Drontal, Milbemax, Broadline, etc.)
- Use simple language, no medical jargon
- Add a cat emoji occasionally to keep it cute`

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 300,
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
