import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { ADMIN_COOKIE, buildAdminCookieValue } from '@/lib/admin-auth'

// Best-effort per-instance rate limit. Lambdas may not share state across cold
// starts; the cookie gate is the real protection — this is just a polite throttle.
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

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

  const pinBuf = Buffer.from(String(pin).trim().padEnd(32))
  const adminBuf = Buffer.from(String(adminPin).trim().padEnd(32))
  const match = pinBuf.length === adminBuf.length && timingSafeEqual(pinBuf, adminBuf)

  if (!match) {
    return NextResponse.json({ success: false }, { status: 401 })
  }

  attempts.delete(ip)

  const res = NextResponse.json({ success: true })
  res.cookies.set({
    name: ADMIN_COOKIE.name,
    value: buildAdminCookieValue(),
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE.maxAge,
  })
  return res
}
