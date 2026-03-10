import { NextRequest } from 'next/server'
import OpenAI from 'openai'

export const maxDuration = 15

export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
    }

    // Input validation
    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    if (context && context.length > 15000) {
      return new Response(JSON.stringify({ error: 'Context too large' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
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

    // Build messages array with conversation history
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Include up to last 10 messages of history for conversational context
    if (Array.isArray(history)) {
      const recentHistory = history.slice(-10)
      for (const msg of recentHistory) {
        if (msg.role === 'user' && msg.text) {
          messages.push({ role: 'user', content: msg.text })
        } else if (msg.role === 'assistant' && msg.text) {
          messages.push({ role: 'assistant', content: msg.text })
        }
      }
    }

    // Add current message
    messages.push({ role: 'user', content: message })

    // Use streaming for faster perceived response
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 600,
      temperature: 0.7,
      stream: true,
      messages,
    })

    // Return a streaming response
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content
            if (text) {
              controller.enqueue(encoder.encode(text))
            }
          }
          controller.close()
        } catch (err) {
          console.error('Stream error:', err)
          controller.error(err)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    return new Response(JSON.stringify({ error: 'Failed to get AI response' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
