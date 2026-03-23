import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'

// Simple in-memory rate limiting per IP
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  // Rate limiting
  const now = Date.now()
  const record = attempts.get(ip)
  if (record && now < record.resetAt) {
    if (record.count >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 })
    }
    record.count++
  } else {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  }

  // Input validation
  let body: { pin?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { pin } = body
  if (!pin || typeof pin !== 'string' || pin.length > 20) {
    return NextResponse.json({ error: 'Invalid PIN' }, { status: 400 })
  }

  const adminPin = process.env.ADMIN_PIN
  if (!adminPin) {
    return NextResponse.json({ error: 'Admin PIN not configured' }, { status: 500 })
  }

  // Timing-safe comparison
  const pinBuf = Buffer.from(String(pin).trim().padEnd(32))
  const adminBuf = Buffer.from(String(adminPin).trim().padEnd(32))
  const match = pinBuf.length === adminBuf.length && timingSafeEqual(pinBuf, adminBuf)

  if (match) {
    // Clear rate limit on success
    attempts.delete(ip)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ success: false }, { status: 401 })
}
