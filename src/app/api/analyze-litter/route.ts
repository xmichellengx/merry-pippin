import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function POST(request: NextRequest) {
  try {
    const { photoUrl, notes } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
    }

    if (!photoUrl) {
      return NextResponse.json({ error: 'No photo provided' }, { status: 400 })
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const systemPrompt = `You are an expert veterinary advisor specializing in cat health. The user has two Golden British Shorthair Munchkin kittens (Merry and Pippin) who share one litter box.

The user has scooped the litter box and taken a photo. Analyze what you see and provide:
- Stool consistency assessment (firm, soft, loose, watery)
- Color assessment and what it indicates
- Hydration indicators from urine clumps if visible
- Any health concerns or red flags
- Whether this looks normal and healthy

Keep your response to 3-4 short bullet points using dashes. Be specific about what you observe. Plain text only, no markdown formatting. If the image is unclear or not of litter box contents, say so briefly.`

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: photoUrl, detail: 'low' },
          },
          {
            type: 'text',
            text: notes ? `Additional notes from owner: ${notes}` : 'Please analyze this litter box photo.',
          },
        ],
      },
    ]

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 400,
      messages,
    })

    const text = response.choices[0]?.message?.content || ''
    return NextResponse.json({ analysis: text })
  } catch (error) {
    console.error('Litter analysis error:', error)
    return NextResponse.json({ error: 'Failed to analyze' }, { status: 500 })
  }
}
