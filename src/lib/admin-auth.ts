import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const COOKIE_NAME = 'mp_admin'
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function getSecret() {
  const secret = process.env.ADMIN_COOKIE_SECRET
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_COOKIE_SECRET missing or too short')
  }
  return secret
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function buildAdminCookieValue() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000
  const payload = `v1.${expiresAt}`
  return `${payload}.${sign(payload)}`
}

export function verifyAdminCookieValue(value: string | undefined | null): boolean {
  if (!value) return false
  const parts = value.split('.')
  if (parts.length !== 3) return false
  const [version, expiresAtStr, providedSig] = parts
  if (version !== 'v1') return false
  const expiresAt = Number(expiresAtStr)
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false

  const expectedSig = sign(`${version}.${expiresAtStr}`)
  const a = Buffer.from(providedSig, 'hex')
  const b = Buffer.from(expectedSig, 'hex')
  if (a.length !== b.length || a.length === 0) return false
  try {
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export async function isAdminRequest(request?: NextRequest): Promise<boolean> {
  const value = request
    ? request.cookies.get(COOKIE_NAME)?.value
    : (await cookies()).get(COOKIE_NAME)?.value
  return verifyAdminCookieValue(value)
}

export const ADMIN_COOKIE = {
  name: COOKIE_NAME,
  maxAge: MAX_AGE_SECONDS,
} as const
